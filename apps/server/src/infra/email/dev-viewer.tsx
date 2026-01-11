import { render } from '@react-email/components'
import { createElement } from 'react'

import { createMiddleware } from '@server/lib/middleware'

import { emailTemplates, type EmailTemplateKey } from './templates'

/**
 * Development-only middleware that provides a visual email template viewer.
 * Registers routes at /dev/emails to list and preview all email templates.
 *
 * @example
 * if (env.isDev) {
 *   app.use(withEmailTemplateViewer())
 * }
 */
export const withEmailTemplateViewer = () =>
  createMiddleware({
    setup: (app) => {
      /**
       * GET /dev/emails
       * Simple HTML page listing all email templates.
       */
      app.get('/dev/emails', (_, res) => {
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
      app.get('/dev/emails/:template', async (req, res) => {
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
    },
  })
