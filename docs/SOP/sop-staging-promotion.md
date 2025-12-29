# SOP: Staging Promotion

This document explains how the staging branch is automatically updated from main.

## Architecture

```
PR merged to main
    ↓
promote-staging.yml triggers
    ↓
Validate (typecheck, lint, test, build)
    ↓
Pass? → Force push main to staging
    ↓
staging branch matches main
```

## Key Files

| File                                    | Purpose                     |
| --------------------------------------- | --------------------------- |
| `.github/workflows/promote-staging.yml` | Workflow that runs on merge |

## How It Works

1. When code is merged to `main`, the workflow triggers
2. Runs typecheck, lint, tests, and build
3. If all pass, staging is updated to match main exactly
4. staging branch is auto-created if it doesn't exist

## Manual Promotion

If you need to manually sync staging:

```bash
git fetch origin
git push origin main:staging --force
```

## Troubleshooting

### "Workflow failed on validate step"

**Cause:** Typecheck, lint, or tests failed.

**Fix:** Fix the failing checks in main, push a fix commit.

### "staging has diverged"

**Cause:** Someone committed directly to staging.

**Fix:** The workflow force pushes, so this is auto-corrected.

**Prevention:** Never commit directly to staging.

### "Permission denied pushing to staging"

**Cause:** Branch protection rules on staging.

**Fix:** Either disable branch protection on staging, or use a PAT/GitHub App token with bypass permissions.

## Best Practices

1. **Never commit to staging directly** - It's a deployment target only
2. **Fix failing checks quickly** - Staging won't update until checks pass
3. **Monitor workflow runs** - Check GitHub Actions for failures
