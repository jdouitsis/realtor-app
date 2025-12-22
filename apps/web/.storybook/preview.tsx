import type { Preview } from '@storybook/react-vite'
import { createMemoryHistory, createRouter, RouterContextProvider } from '@tanstack/react-router'
import { routeTree } from '../src/routeTree.gen'
import { AuthProvider } from '../src/features/auth'
import type { RouterContext } from '../src/lib/router-context'
import '../src/index.css'

// Mock auth context for Storybook
const mockAuthContext: RouterContext['auth'] = {
  user: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
}

// Create a Storybook-specific router with memory history
const createStorybookRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
    context: {
      auth: mockAuthContext,
    },
  })

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo'
    }
  },
  decorators: [
    (Story) => {
      const router = createStorybookRouter()
      return (
        <AuthProvider>
          <RouterContextProvider router={router}>
            <div className="min-w-80 p-4 flex flex-col items-center">
              <Story />
            </div>
          </RouterContextProvider>
        </AuthProvider>
      )
    },
  ],
};

export default preview;
