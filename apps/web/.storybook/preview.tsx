import type { Preview } from '@storybook/react-vite'
import { createMemoryHistory, createRouter, RouterContextProvider } from '@tanstack/react-router'
import { routeTree } from '../src/routeTree.gen'
import '../src/index.css'

// Create a Storybook-specific router with memory history
const createStorybookRouter = () =>
  createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: ['/'] }),
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
        <RouterContextProvider router={router}>
          <div className="min-w-80 p-4 flex flex-col items-center">
            <Story />
          </div>
        </RouterContextProvider>
      )
    },
  ],
};

export default preview;