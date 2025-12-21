import type { Meta, StoryObj } from '@storybook/react-vite'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { Header } from './Header'

// Create a minimal router for Storybook with Header as the root component
const rootRoute = createRootRoute({
  component: Header,
})
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => null,
})

const createStoryRouter = () =>
  createRouter({
    routeTree: rootRoute.addChildren([indexRoute]),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })

const meta: Meta<typeof Header> = {
  title: 'Components/Header',
  component: Header,
  tags: ['autodocs'],
  decorators: [
    () => <RouterProvider router={createStoryRouter()} />,
  ],
}

export default meta
type Story = StoryObj<typeof Header>

export const Default: Story = {}
