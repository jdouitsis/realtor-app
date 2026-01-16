# Feature 03: Client Creation Flow

> **Epic:** [Client Management](epic-client-management.md) > **Status:** Pending
> **Estimated Effort:** L

## Summary

Implement the realtor-facing flow for creating new clients. Realtors enter a client's email and name, the system creates the user account (or links to existing), sends a magic link email to the client, and creates the realtor-client relationship with pending status.

## Prerequisites

- [ ] Feature 01 (Database Schema) must be complete
- [ ] Feature 02 (File Upload Infrastructure) must be complete

## User Stories

- As a realtor, I want to add new clients by email so I can start managing their applications
- As a realtor, I want clients to receive an invitation email so they can complete their onboarding
- As a realtor, I want to add existing users as clients without creating duplicate accounts

## Acceptance Criteria

- [ ] AC1: `/clients/new` route exists and is accessible to authenticated realtors
- [ ] AC2: Form validates email format and requires name
- [ ] AC3: Submitting creates user if email doesn't exist, or uses existing user
- [ ] AC4: Submitting creates `realtor_clients` record with pending status
- [ ] AC5: Submitting creates empty `client_onboarding` record
- [ ] AC6: Magic link email is sent to client with redirect to onboarding
- [ ] AC7: Submitting shows success message and offers navigation options
- [ ] AC8: Duplicate client (same realtor + email) is prevented with clear error
- [ ] AC9: "Clients" menu item added to sidebar navigation

## Technical Specification

### Data Model Changes

None - uses schema from Feature 01.

### API Changes

#### New Procedure: `createClient`

Create `apps/server/src/domains/clients/procedures/createClient.ts`:

```typescript
import { realtorClients, clientOnboarding } from "@server/db/schema";
import { users } from "@server/db/schema";
import { alreadyExists } from "@server/lib/errors";
import { protectedProcedure } from "@server/trpc";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

const createClientInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(255),
});

const createClientOutput = z.object({
  clientId: z.string().uuid(),
  realtorClientId: z.string().uuid(),
  isNewUser: z.boolean(),
});

/**
 * Create a new client relationship for the authenticated realtor.
 * Creates user account if email doesn't exist, otherwise links existing user.
 * Does NOT send invitation email - use `inviteClient` separately.
 *
 * @example
 * const { clientId } = await trpc.clients.create.mutate({
 *   email: 'client@example.com',
 *   name: 'John Doe',
 * })
 */
export const createClient = protectedProcedure
  .input(createClientInput)
  .output(createClientOutput)
  .mutation(async ({ input, ctx: { db, user: realtor } }) => {
    const normalizedEmail = input.email.toLowerCase().trim();

    // Check if relationship already exists (including soft-deleted)
    const [existingRelationship] = await db
      .select()
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(
        and(
          eq(realtorClients.realtorId, realtor.id),
          eq(users.email, normalizedEmail),
          isNull(realtorClients.deletedAt)
        )
      )
      .limit(1);

    if (existingRelationship) {
      throw alreadyExists("Client relationship", normalizedEmail);
    }

    // Find or create user
    let [client] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    const isNewUser = !client;

    if (!client) {
      // Create new user (not a realtor)
      [client] = await db
        .insert(users)
        .values({
          email: normalizedEmail,
          name: input.name,
          isRealtor: false,
        })
        .returning();
    }

    // Create realtor-client relationship
    const [realtorClient] = await db
      .insert(realtorClients)
      .values({
        realtorId: realtor.id,
        clientId: client.id,
        status: "pending",
      })
      .returning();

    // Create empty onboarding record
    await db.insert(clientOnboarding).values({
      clientId: client.id,
      realtorId: realtor.id,
    });

    return {
      clientId: client.id,
      realtorClientId: realtorClient.id,
      isNewUser,
    };
  });
```

#### New Procedure: `inviteClient`

Create `apps/server/src/domains/clients/procedures/inviteClient.ts`:

```typescript
import { realtorClients } from "@server/db/schema";
import { users } from "@server/db/schema";
import { notFound } from "@server/lib/errors";
import { protectedProcedure } from "@server/trpc";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

import { sendClientInviteEmail } from "../services/email";

const inviteClientInput = z.object({
  clientId: z.string().uuid(),
  redirectUrl: z.string().min(1).max(2048),
});

const inviteClientOutput = z.object({
  success: z.boolean(),
  message: z.string(),
});

/**
 * Send invitation email to an existing client with a magic link.
 * The redirect URL determines where the client lands after verifying.
 *
 * @example
 * await trpc.clients.invite.mutate({
 *   clientId: 'abc-123',
 *   redirectUrl: '/clients/onboarding?realtorId=def-456',
 * })
 */
export const inviteClient = protectedProcedure
  .input(inviteClientInput)
  .output(inviteClientOutput)
  .mutation(async ({ input, ctx: { db, user: realtor } }) => {
    // Verify the client relationship exists and belongs to this realtor
    const [relationship] = await db
      .select({
        client: users,
        realtorClient: realtorClients,
      })
      .from(realtorClients)
      .innerJoin(users, eq(realtorClients.clientId, users.id))
      .where(
        and(
          eq(realtorClients.realtorId, realtor.id),
          eq(realtorClients.clientId, input.clientId),
          isNull(realtorClients.deletedAt)
        )
      )
      .limit(1);

    if (!relationship) {
      throw notFound("Client");
    }

    // Send magic link email with the provided redirect URL
    await sendClientInviteEmail(db, {
      clientEmail: relationship.client.email,
      clientName: relationship.client.name,
      realtorName: realtor.name,
      clientId: relationship.client.id,
      redirectUrl: input.redirectUrl,
    });

    return {
      success: true,
      message: `Invitation sent to ${relationship.client.email}`,
    };
  });
```

#### New Service: Email (`services/email.ts`)

Create `apps/server/src/domains/clients/services/email.ts`:

```typescript
import type { Database } from "@server/db";
import { emailService } from "@server/infra/email";
import { renderEmail } from "@server/infra/email/render";

import { magicLinkService } from "../../auth/services/magicLink";

export interface SendClientInviteOptions {
  clientEmail: string;
  clientName: string;
  realtorName: string;
  clientId: string;
  redirectUrl: string;
}

/**
 * Send invitation email to client with magic link.
 * The redirect URL is stored with the magic link and used after verification.
 *
 * @example
 * await sendClientInviteEmail(db, {
 *   clientEmail: 'tenant@example.com',
 *   clientName: 'John Doe',
 *   realtorName: 'Jane Realtor',
 *   clientId: 'abc-123',
 *   redirectUrl: '/clients/onboarding?realtorId=def-456',
 * })
 */
export async function sendClientInviteEmail(
  db: Database,
  options: SendClientInviteOptions
): Promise<void> {
  // Create magic link with the provided redirect URL
  const { magicUrl } = await magicLinkService.create(db, {
    userId: options.clientId,
    redirectUrl: options.redirectUrl,
  });

  const { html, text } = await renderEmail({
    type: "clientInvite",
    clientName: options.clientName,
    realtorName: options.realtorName,
    magicUrl,
  });

  await emailService.send({
    to: options.clientEmail,
    subject: `${options.realtorName} has invited you to complete your rental application`,
    html,
    text,
    dev: {
      type: "client_invite",
      to: options.clientEmail,
      realtorName: options.realtorName,
      magicUrl,
    },
  });
}
```

#### New Email Template: ClientInviteEmail

Create `apps/server/src/infra/email/templates/ClientInviteEmail.tsx`:

```tsx
import { Section, Text } from "@react-email/components";

import { Button } from "./components/Button";
import { EmailLayout } from "./components/EmailLayout";
import { layout, text as textStyles } from "../styles";

export interface ClientInviteEmailProps {
  clientName: string;
  realtorName: string;
  magicUrl: string;
}

export function ClientInviteEmail({
  clientName,
  realtorName,
  magicUrl,
}: ClientInviteEmailProps) {
  return (
    <EmailLayout
      preview={`${realtorName} invited you to complete your rental application`}
    >
      <Text style={textStyles.heading}>Hi {clientName},</Text>

      <Text style={textStyles.description}>
        {realtorName} has invited you to complete your rental application. This
        information will help them find you the perfect rental property.
      </Text>

      <Text style={textStyles.description}>
        Click the button below to get started. You'll need to provide some
        personal information and upload a few documents.
      </Text>

      <Section style={layout.center}>
        <Button href={magicUrl}>Complete Application</Button>
      </Section>

      <Text style={textStyles.fallback}>
        Or copy and paste this link: {magicUrl}
      </Text>

      <Text style={textStyles.footer}>
        This link will expire in 24 hours. If you did not expect this email, you
        can safely ignore it.
      </Text>
    </EmailLayout>
  );
}
```

Update `apps/server/src/infra/email/templates/index.ts`:

```typescript
import ms from "ms";

import {
  ClientInviteEmail,
  type ClientInviteEmailProps,
} from "./ClientInviteEmail";
import { MagicLinkEmail, type MagicLinkEmailProps } from "./MagicLinkEmail";
import { OtpEmail, type OtpEmailProps } from "./OtpEmail";

export {
  ClientInviteEmail,
  type ClientInviteEmailProps,
} from "./ClientInviteEmail";
export { MagicLinkEmail, type MagicLinkEmailProps } from "./MagicLinkEmail";
export { OtpEmail, type OtpEmailProps } from "./OtpEmail";

export const emailTemplates = {
  otp: {
    component: OtpEmail,
    name: "OTP Verification",
    description: "Sent when user needs to verify with a 6-digit code",
    defaultProps: {
      code: "123456",
      expiresInMinutes: 15,
    } satisfies OtpEmailProps,
  },
  magicLink: {
    component: MagicLinkEmail,
    name: "Magic Link",
    description: "Passwordless sign-in link",
    defaultProps: {
      url: "https://example.com/auth/magic?token=abc123",
      expiresAt: new Date(Date.now() + ms("24 hours")),
    } satisfies MagicLinkEmailProps,
  },
  clientInvite: {
    component: ClientInviteEmail,
    name: "Client Invitation",
    description: "Sent when a realtor invites a client to complete onboarding",
    defaultProps: {
      clientName: "John Doe",
      realtorName: "Jane Realtor",
      magicUrl:
        "https://example.com/login/magic?token=abc123&redirect=/clients/onboarding",
    } satisfies ClientInviteEmailProps,
  },
} as const;
```

Update `apps/server/src/infra/email/render.tsx`:

```typescript
// Add to imports
import { ClientInviteEmail, type ClientInviteEmailProps } from './templates/ClientInviteEmail'

// Add to EmailTemplatePropsMap
type EmailTemplatePropsMap = {
  otp: OtpEmailProps
  magicLink: MagicLinkEmailProps
  clientInvite: ClientInviteEmailProps
}

// Add to match expression in renderEmail
.with({ type: 'clientInvite' }, (data) => (
  <ClientInviteEmail
    clientName={data.clientName}
    realtorName={data.realtorName}
    magicUrl={data.magicUrl}
  />
))
```

#### Update Router

Update `apps/server/src/domains/clients/router.ts`:

```typescript
import { router } from "../../trpc";
import { createClient } from "./procedures/createClient";
import { inviteClient } from "./procedures/inviteClient";
import { getUploadUrl } from "./procedures/getUploadUrl";
import { getDownloadUrl } from "./procedures/getDownloadUrl";

export const clientsRouter = router({
  create: createClient,
  invite: inviteClient,
  getUploadUrl,
  getDownloadUrl,
});
```

### UI Components

#### Route: `/clients/new`

Create `apps/web/src/routes/_authenticated/clients/new.tsx`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

import { NewClientPage } from "@/features/clients";

export const Route = createFileRoute("/_authenticated/clients/new")({
  component: NewClientPage,
});
```

#### Feature: clients

Create directory structure:

```
apps/web/src/features/clients/
├── pages/
│   └── NewClientPage/
│       ├── index.tsx
│       └── components/
│           └── NewClientForm.tsx
└── index.ts
```

#### NewClientPage (`pages/NewClientPage/index.tsx`)

```tsx
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui";

import { NewClientForm } from "./components/NewClientForm";

export function NewClientPage() {
  return (
    <div className="container max-w-2xl py-8">
      <div className="mb-8">
        <Link to="/clients">
          <Button variant="ghost" size="sm">
            &larr; Back to Clients
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Add New Client</h1>
          <p className="text-muted-foreground mt-2">
            Enter your client's details. They'll receive an email invitation to
            complete their rental application.
          </p>
        </div>

        <NewClientForm />
      </div>
    </div>
  );
}
```

#### NewClientForm (`pages/NewClientPage/components/NewClientForm.tsx`)

```tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Alert,
  AlertDescription,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { parseError } from "@/lib/errors";
import { trpc } from "@/lib/trpc";

const newClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email"),
});

type NewClientFormData = z.infer<typeof newClientSchema>;

export function NewClientForm() {
  const { user } = useAuth();
  const [successData, setSuccessData] = useState<{
    clientId: string;
    email: string;
  } | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const createClient = trpc.clients.create.useMutation();
  const inviteClient = trpc.clients.invite.useMutation();

  const isPending = createClient.isPending || inviteClient.isPending;

  const form = useForm<NewClientFormData>({
    resolver: zodResolver(newClientSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const handleSubmit = async (data: NewClientFormData) => {
    setError(null);

    try {
      // Step 1: Create the client
      const { clientId } = await createClient.mutateAsync(data);

      // Step 2: Send the invitation with redirect URL
      await inviteClient.mutateAsync({
        clientId,
        redirectUrl: `/clients/onboarding?realtorId=${user.id}`,
      });

      setSuccessData({
        clientId,
        email: data.email,
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An error occurred"));
    }
  };

  if (successData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-green-600">Invitation Sent!</CardTitle>
          <CardDescription>
            We've sent an email to <strong>{successData.email}</strong> with
            instructions to complete their rental application.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button onClick={() => setSuccessData(null)}>
            Add Another Client
          </Button>
          <Link to="/clients">
            <Button variant="outline">View All Clients</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Client Details</CardTitle>
        <CardDescription>
          Enter your client's name and email address. They'll receive an
          invitation to complete their profile.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              aria-invalid={!!form.formState.errors.name}
              {...form.register("name")}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-destructive">
                {form.formState.errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="client@example.com"
              aria-invalid={!!form.formState.errors.email}
              {...form.register("email")}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-destructive">
                {form.formState.errors.email.message}
              </p>
            )}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {parseError(error).userMessage}
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? "Sending Invitation..." : "Send Invitation"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

#### Barrel Export (`index.ts`)

```typescript
export { NewClientPage } from "./pages/NewClientPage";
```

#### Update Shell Config

Update `apps/web/src/features/shell/config.ts`:

```typescript
import { LayoutDashboard, Users } from "lucide-react";
import type { ComponentType } from "react";

export const sideBarTransition = "width 0.15s linear";

export interface MenuItem {
  label: string;
  icon: ComponentType<{ className?: string }>;
  to: string;
}

export const MenuItems: MenuItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, to: "/dashboard" },
  { label: "Clients", icon: Users, to: "/clients" },
];
```

### Business Logic

**createClient procedure:**

1. **Email normalization**: Convert email to lowercase and trim whitespace
2. **Existing user handling**: If email exists, link to existing user instead of creating new
3. **Relationship uniqueness**: Prevent duplicate realtor-client pairs (soft-deleted excluded)

**inviteClient procedure:**

4. **Relationship verification**: Verify the client belongs to the calling realtor
5. **Redirect URL passthrough**: Store the provided redirect URL with the magic link
6. **Magic link redirect**: After verification, client navigates to the stored redirect URL

## Edge Cases & Error Handling

| Scenario                                | Expected Behavior                                   |
| --------------------------------------- | --------------------------------------------------- |
| Email already exists as client for user | Return ALREADY_EXISTS error with clear message      |
| Email exists as different user's client | Create relationship (valid - shared client)         |
| Email exists as a realtor               | Create relationship (valid - realtor can be client) |
| Realtor tries to add themselves         | Allow it (edge case but not harmful)                |
| Invalid email format                    | Client-side validation prevents submission          |
| Email service failure                   | Transaction rolls back, return error                |

## Testing Requirements

- [ ] Unit test: Form validation rejects invalid emails
- [ ] Unit test: Form validation requires name
- [ ] Integration test: `createClient` creates user when email doesn't exist
- [ ] Integration test: `createClient` reuses user when email exists
- [ ] Integration test: `createClient` creates realtor_clients record
- [ ] Integration test: `createClient` creates client_onboarding record
- [ ] Integration test: `createClient` throws ALREADY_EXISTS for duplicate
- [ ] Integration test: `inviteClient` sends email with provided redirect URL
- [ ] Integration test: `inviteClient` throws NOT_FOUND for non-existent client
- [ ] Integration test: `inviteClient` throws NOT_FOUND for client belonging to different realtor
- [ ] E2E test: Full flow from form submission to success message

## Implementation Notes

### 1. Add Error Code

Update `packages/shared/src/errors.ts`:

```typescript
export const AppErrorCode = {
  // ... existing codes
  ALREADY_EXISTS: "ALREADY_EXISTS",
} as const;
```

Update `apps/web/src/lib/errors.ts`:

```typescript
const APP_ERROR_MESSAGES: Record<AppErrorCode, string> = {
  // ... existing messages
  ALREADY_EXISTS: "This record already exists.",
};
```

### 2. Route File Location

The route file should be at:

- `apps/web/src/routes/_authenticated/clients/new.tsx`

This creates the URL `/clients/new` under the authenticated layout.

### 3. Create Placeholder List Route

Create a placeholder for the clients list (Feature 05):

`apps/web/src/routes/_authenticated/clients/index.tsx`:

```tsx
import { createFileRoute, Link } from "@tanstack/react-router";

import { Button } from "@/components/ui";

export const Route = createFileRoute("/_authenticated/clients/")({
  component: ClientsListPlaceholder,
});

function ClientsListPlaceholder() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Clients</h1>
        <Link to="/clients/new">
          <Button>Add Client</Button>
        </Link>
      </div>
      <p className="text-muted-foreground">Client list coming soon...</p>
    </div>
  );
}
```

## Files to Create/Modify

| File                                                                             | Action | Description                        |
| -------------------------------------------------------------------------------- | ------ | ---------------------------------- |
| `apps/server/src/domains/clients/procedures/createClient.ts`                     | Create | Create client procedure            |
| `apps/server/src/domains/clients/procedures/inviteClient.ts`                     | Create | Invite client procedure            |
| `apps/server/src/domains/clients/services/email.ts`                              | Create | Client email service               |
| `apps/server/src/domains/clients/router.ts`                                      | Modify | Add create and invite procedures   |
| `apps/server/src/infra/email/templates/ClientInviteEmail.tsx`                    | Create | Invitation email template          |
| `apps/server/src/infra/email/templates/index.ts`                                 | Modify | Export new template                |
| `apps/server/src/infra/email/render.tsx`                                         | Modify | Add template to render function    |
| `apps/web/src/routes/_authenticated/clients/new.tsx`                             | Create | New client route                   |
| `apps/web/src/routes/_authenticated/clients/index.tsx`                           | Create | Clients list placeholder           |
| `apps/web/src/features/clients/pages/NewClientPage/index.tsx`                    | Create | New client page component          |
| `apps/web/src/features/clients/pages/NewClientPage/components/NewClientForm.tsx` | Create | Form component                     |
| `apps/web/src/features/clients/index.ts`                                         | Create | Feature barrel export              |
| `apps/web/src/features/shell/config.ts`                                          | Modify | Add Clients menu item              |
| `packages/shared/src/errors.ts`                                                  | Modify | Add ALREADY_EXISTS code            |
| `apps/web/src/lib/errors.ts`                                                     | Modify | Add ALREADY_EXISTS message         |

## Out of Scope

- Client list view (Feature 05)
- Client onboarding form (Feature 04)
- Editing client details
- Deleting/archiving clients
- Resending invitation email
