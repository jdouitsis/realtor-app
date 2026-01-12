# SOP: Environment Variables

How to add and configure environment variables for web and server apps, including Railway deployment.

## Architecture

```
.env.example          → Template for local development
.env                  → Local values (git-ignored)
apps/server/src/env.ts → Server runtime validation (Zod)
apps/web/Dockerfile   → Build-time args for Vite
Railway Dashboard     → Production/staging values
```

## Key Files

| File                         | Purpose                                          |
| ---------------------------- | ------------------------------------------------ |
| `.env.example`               | Template listing all required env vars           |
| `.env`                       | Local values (not committed)                     |
| `apps/server/src/env.ts`     | Server env validation with Zod                   |
| `apps/web/Dockerfile`        | Build args for VITE_* variables                  |
| `apps/web/railway.json`      | Railway build configuration                      |
| `apps/server/railway.json`   | Railway build configuration                      |

## Web vs Server Environment Variables

| Type   | Prefix   | Available At | Example          |
| ------ | -------- | ------------ | ---------------- |
| Server | None     | Runtime      | `DATABASE_URL`   |
| Web    | `VITE_`  | Build time   | `VITE_API_URL`   |

**Important:** Web (Vite) environment variables are baked into the static bundle at build time. They are NOT available at runtime.

## Workflow

### Adding a Server Environment Variable

#### Step 1: Add to `.env.example`

```bash
# .env.example
MY_NEW_VAR=example_value
```

#### Step 2: Add validation in `apps/server/src/env.ts`

```typescript
const envSchema = z.object({
  // ... existing vars
  MY_NEW_VAR: z.string(),
})
```

#### Step 3: Add to Railway

1. Go to Railway Dashboard → Server service → Variables
2. Add `MY_NEW_VAR` with the production value
3. Redeploy the service

### Adding a Web Environment Variable

Web variables require additional steps because they must be available at Docker build time.

#### Step 1: Add to `.env.example`

```bash
# .env.example
VITE_MY_NEW_VAR=example_value
```

#### Step 2: Add build arg to `apps/web/Dockerfile`

In the builder stage, add the ARG and ENV:

```dockerfile
# Build the app
FROM deps AS builder

# Vite env vars must be available at build time
ARG VITE_API_URL
ARG VITE_MY_NEW_VAR          # ← Add new ARG
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_MY_NEW_VAR=$VITE_MY_NEW_VAR  # ← Add new ENV

COPY . .
RUN pnpm turbo build --filter=@app/web
```

#### Step 3: Add to Railway

1. Go to Railway Dashboard → Web service → Variables
2. Add `VITE_MY_NEW_VAR` with the production value
3. **Important:** Railway automatically passes environment variables as build args for Dockerfile builds
4. Redeploy the service

#### Step 4: Use in code

```typescript
// Access in web app code
const myVar = import.meta.env.VITE_MY_NEW_VAR
```

## Railway Configuration

### How Railway Passes Build Args

When using Dockerfile builds, Railway automatically passes all service environment variables as build arguments. This means:

1. Set `VITE_*` variables in Railway's Variables tab
2. Declare matching `ARG` in the Dockerfile
3. Set `ENV` from the `ARG` to make it available during build

### Service-Specific Variables

| Service | Variables Tab Location          |
| ------- | ------------------------------- |
| Web     | Railway → web service → Variables |
| Server  | Railway → server service → Variables |

### Variable References

Railway supports referencing variables from other services:

```
# In web service, reference server's domain
VITE_API_URL=https://${{server.RAILWAY_PUBLIC_DOMAIN}}
```

## Examples

### Example: Adding a Feature Flag

1. Add to `.env.example`:
   ```bash
   VITE_FEATURE_DARK_MODE=true
   ```

2. Add to `apps/web/Dockerfile`:
   ```dockerfile
   ARG VITE_FEATURE_DARK_MODE
   ENV VITE_FEATURE_DARK_MODE=$VITE_FEATURE_DARK_MODE
   ```

3. Add to Railway web service variables

4. Use in code:
   ```typescript
   if (import.meta.env.VITE_FEATURE_DARK_MODE === 'true') {
     // Enable dark mode
   }
   ```

### Example: Adding an API Key (Server)

1. Add to `.env.example`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_xxx
   ```

2. Add to `apps/server/src/env.ts`:
   ```typescript
   const envSchema = z.object({
     // ...
     STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
   })
   ```

3. Add to Railway server service variables

4. Use in code:
   ```typescript
   import { env } from '@server/env'
   const stripe = new Stripe(env.STRIPE_SECRET_KEY)
   ```

## Troubleshooting

### Web: `import.meta.env.VITE_*` is undefined

**Cause:** The variable wasn't available at build time.

**Fix:**
1. Ensure `ARG` and `ENV` are declared in `apps/web/Dockerfile`
2. Ensure the variable is set in Railway before building
3. Trigger a new deployment (Railway caches builds)

### Server: "Missing environment variable" error

**Cause:** The variable isn't set or doesn't pass Zod validation.

**Fix:**
1. Check Railway Variables tab for the server service
2. Verify the value matches the Zod schema in `apps/server/src/env.ts`

### Railway: Variable not updating after change

**Cause:** Railway caches Docker builds.

**Fix:** Trigger a new deployment. For build-time variables, you may need to clear the build cache or make a code change to force a rebuild.

## Best Practices

1. **Always add to `.env.example`** - Documents required variables for other developers
2. **Use descriptive names** - `VITE_API_URL` not `VITE_URL`
3. **Validate server vars with Zod** - Fail fast on missing/invalid config
4. **Don't commit secrets** - `.env` is gitignored for a reason
5. **Prefix web vars with VITE_** - Required for Vite to expose them
6. **Remember build vs runtime** - Web vars are build-time only
