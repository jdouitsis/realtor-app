import { render } from '@react-email/components'
import { Router } from 'express'
import { createElement } from 'react'

import { emailTemplates, type EmailTemplateKey } from '@server/infra/email/templates'

const router = Router()

/**
 * GET /dev/emails
 * Simple HTML page listing all email templates.
 */
router.get('/', (_, res) => {
  const templateLinks = Object.entries(emailTemplates)
    .map(
      ([key, value]) => `
      <li style="margin: 8px 0;">
        <a href="/dev/emails/${key}" target="_blank" style="font-size: 16px;">
          ${value.name}
        </a>
        <span style="color: #666; margin-left: 8px;">${value.description}</span>
      </li>
    `
    )
    .join('')

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Email Templates</title>
        <style>
          body { font-family: system-ui, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
          h1 { margin-bottom: 24px; }
          ul { list-style: none; padding: 0; }
          a { color: #0066cc; text-decoration: none; }
          a:hover { text-decoration: underline; }
        </style>
      </head>
      <body>
        <h1>Email Templates</h1>
        <p>Click a template to preview it in a new tab.</p>
        <ul>${templateLinks}</ul>
      </body>
    </html>
  `
  res.type('html').send(html)
})

/**
 * GET /dev/emails/:template
 * Render a specific email template to HTML.
 * Supports query params to override default props.
 */
router.get('/:template', async (req, res) => {
  const { template } = req.params
  const templateConfig = emailTemplates[template as EmailTemplateKey]

  if (!templateConfig) {
    res.status(404).send('Template not found')
    return
  }

  // Merge default props with query params
  const props = { ...templateConfig.defaultProps, ...req.query }

  // For dev routes, we use createElement with type assertions to handle dynamic components
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(templateConfig.component as any, props as any)
  const html = await render(element)

  res.type('html').send(html)
})

export default router
