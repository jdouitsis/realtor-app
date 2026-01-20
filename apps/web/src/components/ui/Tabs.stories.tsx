import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tabs>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4 p-4 rounded-lg border">
        <h3 className="font-semibold">Account Settings</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Make changes to your account here. Click save when you are done.
        </p>
      </TabsContent>
      <TabsContent value="password" className="mt-4 p-4 rounded-lg border">
        <h3 className="font-semibold">Password Settings</h3>
        <p className="text-sm text-muted-foreground mt-2">
          Change your password here. After saving, you will be logged out.
        </p>
      </TabsContent>
    </Tabs>
  ),
}

export const ThreeTabs: Story = {
  render: () => (
    <Tabs defaultValue="general" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="general">General</TabsTrigger>
        <TabsTrigger value="security">Security</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
      </TabsList>
      <TabsContent value="general" className="mt-4 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">General settings content.</p>
      </TabsContent>
      <TabsContent value="security" className="mt-4 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">Security settings content.</p>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">Notification settings content.</p>
      </TabsContent>
    </Tabs>
  ),
}

export const Disabled: Story = {
  render: () => (
    <Tabs defaultValue="enabled" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="enabled">Enabled</TabsTrigger>
        <TabsTrigger value="disabled" disabled>
          Disabled
        </TabsTrigger>
      </TabsList>
      <TabsContent value="enabled" className="mt-4 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">This tab is enabled.</p>
      </TabsContent>
      <TabsContent value="disabled" className="mt-4 p-4 rounded-lg border">
        <p className="text-sm text-muted-foreground">This tab is disabled.</p>
      </TabsContent>
    </Tabs>
  ),
}
