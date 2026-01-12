# Feature 02: File Upload Infrastructure

> **Epic:** [Client Management](epic-client-management.md)
> **Status:** Pending
> **Estimated Effort:** L

## Summary

Implement file upload infrastructure using presigned URLs for direct browser-to-storage uploads. Production uses AWS S3; development uses MinIO (S3-compatible) running in Docker. This feature provides the upload/download utilities that Feature 04 (Client Onboarding Form) will use.

## Prerequisites

- [ ] Feature 01 (Database Schema) must be complete

## User Stories

- As a client, I want to upload documents directly to storage so large files don't timeout
- As a developer, I want local development to work without AWS credentials so I can test uploads offline
- As a realtor, I want to securely download client documents so I can review their applications

## Acceptance Criteria

- [ ] AC1: MinIO container added to docker-compose.yml and documented
- [ ] AC2: S3 client configured with environment variable switching (S3 vs MinIO)
- [ ] AC3: tRPC procedure to generate presigned upload URL exists and works
- [ ] AC4: tRPC procedure to generate presigned download URL exists and works
- [ ] AC5: File validation (size, type) enforced before generating upload URL
- [ ] AC6: Upload path follows convention: `{clientId}/{uuid}`
- [ ] AC7: Environment variables documented in `.env.example`
- [ ] AC8: README documents local MinIO setup

## Technical Specification

### Infrastructure Changes

#### Docker Compose Update

Add MinIO service to `docker-compose.yml`:

```yaml
version: "3.8"
services:
  postgres:
    # ... existing config ...

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    ports:
      - "9000:9000"   # API
      - "9001:9001"   # Console
    volumes:
      - minio_data:/data

volumes:
  postgres_data:
  minio_data:
```

#### Environment Variables

Add to `.env.example`:

```bash
# File Storage (S3/MinIO)
S3_BUCKET=realtor-app-documents
S3_REGION=us-east-1

# Production: Use real AWS credentials
# S3_ACCESS_KEY_ID=AKIA...
# S3_SECRET_ACCESS_KEY=...
# S3_ENDPOINT= (omit for real S3)

# Development: Use MinIO
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
S3_ENDPOINT=http://localhost:9000

# Max file size in bytes (10MB)
MAX_FILE_SIZE_BYTES=10485760
```

### Data Model Changes

None - uses schema from Feature 01.

### API Changes

#### Shared Infrastructure

Create shared S3/storage infrastructure that any domain can use:

```
apps/server/src/
├── lib/
│   └── s3.ts              # S3 client configuration
├── services/
│   └── storage.ts         # Storage service for presigned URLs
└── domains/clients/
    ├── procedures/
    │   ├── getUploadUrl.ts
    │   └── getDownloadUrl.ts
    └── router.ts
```

#### S3 Client (`apps/server/src/lib/s3.ts`)

```typescript
import { S3Client } from '@aws-sdk/client-s3'
import { env } from '@server/env'

/**
 * S3 client configured for either AWS S3 or MinIO based on environment.
 *
 * @example
 * import { s3Client } from '@server/lib/s3'
 */
export const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT, // undefined for real S3, URL for MinIO
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: !!env.S3_ENDPOINT, // Required for MinIO
})
```

#### Storage Service (`apps/server/src/services/storage.ts`)

```typescript
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { env } from '@server/env'
import ms from 'ms'
import { s3Client } from '../lib/s3'

const UPLOAD_EXPIRY = ms('15 minutes')
const DOWNLOAD_EXPIRY = ms('1 hour')

export interface GenerateUploadUrlOptions {
  s3Key: string
  contentType: string
  contentLength: number
}

export interface GenerateUploadUrlResult {
  uploadUrl: string
  expiresAt: Date
}

export interface GenerateDownloadUrlOptions {
  s3Key: string
  filename: string
}

export interface GenerateDownloadUrlResult {
  downloadUrl: string
  expiresAt: Date
}

/**
 * Generic service for generating presigned S3 URLs for file uploads and downloads.
 * Callers are responsible for constructing S3 keys according to their domain conventions.
 *
 * @example
 * const { uploadUrl } = await storageService.generateUploadUrl({
 *   s3Key: 'abc-123/a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 *   contentType: 'application/pdf',
 *   contentLength: 1024000,
 * })
 */
export const storageService = {
  async generateUploadUrl(options: GenerateUploadUrlOptions): Promise<GenerateUploadUrlResult> {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: options.s3Key,
      ContentType: options.contentType,
      ContentLength: options.contentLength,
    })

    const uploadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: UPLOAD_EXPIRY / 1000, // SDK expects seconds
    })

    return {
      uploadUrl,
      expiresAt: new Date(Date.now() + UPLOAD_EXPIRY),
    }
  },

  async generateDownloadUrl(options: GenerateDownloadUrlOptions): Promise<GenerateDownloadUrlResult> {
    const command = new GetObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: options.s3Key,
      ResponseContentDisposition: `attachment; filename="${options.filename}"`,
    })

    const downloadUrl = await getSignedUrl(s3Client, command, {
      expiresIn: DOWNLOAD_EXPIRY / 1000,
    })

    return {
      downloadUrl,
      expiresAt: new Date(Date.now() + DOWNLOAD_EXPIRY),
    }
  },
}
```

#### Get Upload URL Procedure (`procedures/getUploadUrl.ts`)

```typescript
import { randomUUID } from 'crypto'

import { z } from 'zod'
import { protectedProcedure } from '@server/trpc'
import { env } from '@server/env'
import { storageService } from '@server/services/storage'

const ALLOWED_MIME_TYPES = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']

const getUploadUrlInput = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1).max(255),
  filename: z.string().min(1).max(255),
  contentType: z.string().refine(
    (type) => ALLOWED_MIME_TYPES.includes(type),
    { message: `File type must be one of: ${ALLOWED_MIME_TYPES.join(', ')}` }
  ),
  contentLength: z.number().int().positive().max(env.MAX_FILE_SIZE_BYTES, {
    message: `File size must be less than ${env.MAX_FILE_SIZE_BYTES / 1024 / 1024}MB`,
  }),
})

const getUploadUrlOutput = z.object({
  uploadUrl: z.string().url(),
  s3Key: z.string(),
  expiresAt: z.string().datetime(),
})

/**
 * Generate a presigned URL for uploading a document.
 * Client uploads directly to S3/MinIO using this URL.
 */
export const getUploadUrl = protectedProcedure
  .input(getUploadUrlInput)
  .output(getUploadUrlOutput)
  .mutation(async ({ input }) => {
    const s3Key = `${input.clientId}/${randomUUID()}`

    const result = await storageService.generateUploadUrl({
      s3Key,
      contentType: input.contentType,
      contentLength: input.contentLength,
    })

    return {
      uploadUrl: result.uploadUrl,
      s3Key,
      expiresAt: result.expiresAt.toISOString(),
    }
  })
```

#### Get Download URL Procedure (`procedures/getDownloadUrl.ts`)

```typescript
import { z } from 'zod'
import { protectedProcedure } from '@server/trpc'
import { clientDocuments } from '@server/db/schema'
import { notFound } from '@server/lib/errors'
import { eq } from 'drizzle-orm'
import { storageService } from '@server/services/storage'

const getDownloadUrlInput = z.object({
  documentId: z.string().uuid(),
})

const getDownloadUrlOutput = z.object({
  downloadUrl: z.string().url(),
  filename: z.string(),
  expiresAt: z.string().datetime(),
})

/**
 * Generate a presigned URL for downloading a document.
 * Only the realtor who owns the client relationship can download.
 */
export const getDownloadUrl = protectedProcedure
  .input(getDownloadUrlInput)
  .output(getDownloadUrlOutput)
  .query(async ({ input, ctx: { db, user } }) => {
    // TODO: In Feature 06, add authorization check that user owns this document's client
    const [doc] = await db
      .select()
      .from(clientDocuments)
      .where(eq(clientDocuments.id, input.documentId))
      .limit(1)

    if (!doc) {
      throw notFound('Document', input.documentId)
    }

    const result = await storageService.generateDownloadUrl({
      s3Key: doc.s3Key,
      filename: doc.filename,
    })

    return {
      downloadUrl: result.downloadUrl,
      filename: doc.filename,
      expiresAt: result.expiresAt.toISOString(),
    }
  })
```

#### Router (`router.ts`)

```typescript
import { router } from '../../trpc'
import { getUploadUrl } from './procedures/getUploadUrl'
import { getDownloadUrl } from './procedures/getDownloadUrl'

export const clientsRouter = router({
  getUploadUrl,
  getDownloadUrl,
})
```

#### Register Router

Update `apps/server/src/routers/index.ts`:

```typescript
import { authRouter } from '../domains/auth/router'
import { userRouter } from '../domains/user/router'
import { clientsRouter } from '../domains/clients/router'
import { router } from '../trpc'

export const appRouter = router({
  auth: authRouter,
  user: userRouter,
  clients: clientsRouter,
})
```

### Environment Variable Schema

Update `apps/server/src/env.ts`:

```typescript
import { cleanEnv, num, port, str, url } from 'envalid'

export const env = cleanEnv(process.env, {
  // ... existing vars ...

  // S3/MinIO Configuration
  S3_BUCKET: str({ default: 'realtor-app-documents' }),
  S3_REGION: str({ default: 'us-east-1' }),
  S3_ACCESS_KEY_ID: str(),
  S3_SECRET_ACCESS_KEY: str(),
  S3_ENDPOINT: str({ default: '' }), // Empty for real S3
  MAX_FILE_SIZE_BYTES: num({ default: 10 * 1024 * 1024 }), // 10MB
})
```

### UI Components

None - this feature only provides backend infrastructure. Frontend upload components are in Feature 04.

### Business Logic

File path convention:
- Pattern: `{clientId}/{uuid}`
- Example: `550e8400-e29b-41d4-a716-446655440000/a1b2c3d4-e5f6-7890-abcd-ef1234567890`

Document metadata (title, original filename, mime type) is stored in the database (`client_documents`), not in the S3 key. When generating download URLs, the `ResponseContentDisposition` header is set so the file downloads with its original filename.

## Edge Cases & Error Handling

| Scenario                       | Expected Behavior                                       |
| ------------------------------ | ------------------------------------------------------- |
| File exceeds MAX_FILE_SIZE     | Reject with 400 and message                             |
| Invalid MIME type              | Reject with 400 and allowed types list                  |
| MinIO not running              | Connection error - documented in troubleshooting        |
| S3 bucket doesn't exist        | Error - must create bucket first                        |
| Presigned URL expired          | S3 returns 403 - client should request new URL          |
| Upload interrupted             | Partial upload - no DB record created (handled in F04)  |

## Testing Requirements

- [ ] Unit test: `storageService.generateUploadUrl` returns valid structure
- [ ] Unit test: `storageService.generateDownloadUrl` returns valid structure
- [ ] Integration test: `getUploadUrl` procedure validates file size
- [ ] Integration test: `getUploadUrl` procedure validates MIME type
- [ ] Integration test: `getDownloadUrl` returns 404 for missing document
- [ ] Manual test: Upload file to MinIO using presigned URL
- [ ] Manual test: Download file from MinIO using presigned URL

## Implementation Notes

### 1. MinIO Local Setup

After adding MinIO to docker-compose:

```bash
# Start services
docker-compose up -d

# Create bucket (first time only)
# Option A: MinIO Console at http://localhost:9001
# Option B: AWS CLI
aws --endpoint-url http://localhost:9000 s3 mb s3://realtor-app-documents
```

### 2. AWS SDK Dependencies

Install required packages:

```bash
pnpm --filter @app/server add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

### 3. CORS Configuration for MinIO

MinIO needs CORS configured for browser uploads. Create `minio-cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedOrigins": ["http://localhost:5173", "http://localhost:5174"],
      "ExposeHeaders": ["ETag"]
    }
  ]
}
```

Apply via MinIO Console or mc CLI.

### 4. Production S3 Setup

For AWS S3:
1. Create bucket with private ACL
2. Configure CORS for your production domain
3. Create IAM user with S3 access policy
4. Set environment variables (omit S3_ENDPOINT)

### 5. Reference Existing Patterns

- Error handling: `apps/server/src/lib/errors.ts`
- Environment config: `apps/server/src/env.ts`
- Service pattern: `apps/server/src/domains/auth/services/magicLink.ts`

## Files to Create/Modify

| File                                                         | Action | Description                           |
| ------------------------------------------------------------ | ------ | ------------------------------------- |
| `docker-compose.yml`                                         | Modify | Add MinIO service                     |
| `.env.example`                                               | Modify | Add S3/MinIO variables                |
| `apps/server/src/env.ts`                                     | Modify | Add S3 environment validation         |
| `apps/server/src/lib/s3.ts`                                  | Create | S3 client configuration (shared)      |
| `apps/server/src/services/storage.ts`                        | Create | Storage service (shared)              |
| `apps/server/src/domains/clients/procedures/getUploadUrl.ts` | Create | Upload URL procedure                  |
| `apps/server/src/domains/clients/procedures/getDownloadUrl.ts` | Create | Download URL procedure              |
| `apps/server/src/domains/clients/router.ts`                  | Create | Clients domain router                 |
| `apps/server/src/routers/index.ts`                           | Modify | Register clients router               |
| `apps/server/package.json`                                   | Modify | Add AWS SDK dependencies              |

## Out of Scope

- Frontend upload components (Feature 04)
- Document record creation in database (Feature 04)
- Authorization checks for document access (Feature 06)
- Document deletion
- Document versioning
