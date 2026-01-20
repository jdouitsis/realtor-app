import type { Meta, StoryObj } from '@storybook/react-vite'

import { FileUpload } from './FileUpload'

const meta: Meta<typeof FileUpload> = {
  title: 'Composed/FileUpload',
  component: FileUpload,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-96">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof FileUpload>

export const Default: Story = {
  args: {
    onUpload: (files) => console.log('Uploaded files:', files),
  },
}

export const ImageOnly: Story = {
  args: {
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.gif'] },
    onUpload: (files) => console.log('Uploaded images:', files),
  },
}

export const MultipleFiles: Story = {
  args: {
    maxFiles: 5,
    onUpload: (files) => console.log('Uploaded files:', files),
  },
}

export const PDFOnly: Story = {
  args: {
    accept: { 'application/pdf': ['.pdf'] },
    onUpload: (files) => console.log('Uploaded PDFs:', files),
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
    onUpload: (files) => console.log('Uploaded files:', files),
  },
}

export const SmallMaxSize: Story = {
  args: {
    maxSize: 1024 * 1024, // 1MB
    onUpload: (files) => console.log('Uploaded files:', files),
  },
}
