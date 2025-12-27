# SOP: Local Storage

Type-safe localStorage access using the `useStorage` hook with cross-tab synchronization.

## Architecture

```
StorageRegistry (type definitions)
         ↓
    useStorage(key)
         ↓
  [value, set, clear]
         ↓
  localStorage + React state + cross-tab sync
```

## Key Files

| File                        | Purpose                                       |
| --------------------------- | --------------------------------------------- |
| `apps/web/src/lib/storage.ts` | `useStorage` hook and `StorageRegistry` types |
| `apps/web/eslint.config.js` | ESLint rule blocking raw `localStorage`       |

## How It Works

The `useStorage` hook provides:

1. **Type-safe keys** - Only keys defined in `StorageRegistry` are allowed
2. **Reactive state** - Changes trigger React re-renders
3. **Cross-tab sync** - Updates in one tab propagate to all tabs via `storage` event
4. **useState-like API** - Returns `[value, set, clear]` tuple

## Workflow

### Adding a New Storage Key

#### Step 1: Define the type in StorageRegistry

Open `apps/web/src/lib/storage.ts` and add your key to the interface:

```typescript
interface StorageRegistry {
  auth_user: User
  theme: 'light' | 'dark'        // ← add new key here
  preferences: UserPreferences   // ← or a complex type
}
```

#### Step 2: Use the hook in your component

```typescript
import { useStorage } from '@/lib/storage'

function ThemeToggle() {
  const [theme, setTheme, clearTheme] = useStorage('theme')

  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current: {theme ?? 'system'}
    </button>
  )
}
```

## Examples

### Example: Persisting User Preferences

1. Define the type:

```typescript
interface UserPreferences {
  sidebarCollapsed: boolean
  itemsPerPage: number
}

interface StorageRegistry {
  auth_user: User
  preferences: UserPreferences  // ← add here
}
```

2. Use in component:

```typescript
function Sidebar() {
  const [prefs, setPrefs] = useStorage('preferences')

  const toggleSidebar = () => {
    setPrefs({
      ...prefs,
      sidebarCollapsed: !prefs?.sidebarCollapsed
    })
  }

  return <aside className={prefs?.sidebarCollapsed ? 'collapsed' : ''}>...</aside>
}
```

### Example: Cross-Tab Logout

When using `useStorage` for auth, logging out in one tab automatically clears the user in all tabs:

```typescript
// Tab 1: User logs out
const [user, setUser, clearUser] = useStorage('auth_user')
clearUser()  // ← This triggers storage event

// Tab 2: Automatically receives the update
// user becomes null, triggering redirect to login
```

## Troubleshooting

### "Unexpected use of 'localStorage'" ESLint error

**Cause:** Direct `localStorage` access is blocked by ESLint.

**Fix:** Use `useStorage` from `@/lib/storage` instead:

```typescript
// ❌ Don't do this
localStorage.setItem('theme', 'dark')

// ✅ Do this
const [theme, setTheme] = useStorage('theme')
setTheme('dark')
```

### TypeScript error: "Argument of type 'x' is not assignable"

**Cause:** The key doesn't exist in `StorageRegistry`.

**Fix:** Add the key and its type to `StorageRegistry` in `apps/web/src/lib/storage.ts`.

### Value not updating across tabs

**Cause:** The `storage` event only fires for changes from *other* tabs, not the current tab.

**Fix:** This is expected behavior. The hook handles same-tab updates via `setValue()`. Cross-tab sync only applies to changes made in other tabs.

## Best Practices

1. **Keep keys descriptive** - Use snake_case like `auth_user`, `user_preferences`
2. **Don't store sensitive data** - localStorage is accessible to any script on the page
3. **Define explicit types** - Avoid `any` or loose types in `StorageRegistry`
4. **Handle null values** - Initial value is `null` if key doesn't exist
5. **Use clear() for logout flows** - Ensures both state and storage are cleared
