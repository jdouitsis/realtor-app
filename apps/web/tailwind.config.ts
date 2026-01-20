import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
      },
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        surface: {
          1: 'hsl(var(--surface-1))',
          2: 'hsl(var(--surface-2))',
          3: 'hsl(var(--surface-3))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))',
        },
        // Status colors (support opacity: bg-status-active/10)
        status: {
          active: 'hsl(var(--status-active) / <alpha-value>)',
          invited: 'hsl(var(--status-invited) / <alpha-value>)',
          inactive: 'hsl(var(--status-inactive) / <alpha-value>)',
          'active-text': 'hsl(var(--status-active-text))',
          'invited-text': 'hsl(var(--status-invited-text))',
          'inactive-text': 'hsl(var(--status-inactive-text))',
        },
        // Semantic colors (general-purpose, support opacity: bg-semantic-info/10)
        semantic: {
          info: 'hsl(var(--semantic-info) / <alpha-value>)',
          success: 'hsl(var(--semantic-success) / <alpha-value>)',
          warning: 'hsl(var(--semantic-warning) / <alpha-value>)',
          neutral: 'hsl(var(--semantic-neutral) / <alpha-value>)',
          accent: 'hsl(var(--semantic-accent) / <alpha-value>)',
          highlight: 'hsl(var(--semantic-highlight) / <alpha-value>)',
        },
        // Alert colors
        alert: {
          'warning-bg': 'hsl(var(--alert-warning-bg))',
          'warning-border': 'hsl(var(--alert-warning-border))',
          'warning-text': 'hsl(var(--alert-warning-text))',
          'warning-heading': 'hsl(var(--alert-warning-heading))',
        },
        // Avatar colors
        avatar: {
          header: 'hsl(var(--avatar-header))',
          bg: 'hsl(var(--avatar-bg))',
          text: 'hsl(var(--avatar-text))',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, hsl(var(--gradient-start)), hsl(var(--gradient-end)))',
      },
      transitionDuration: {
        '150': '150ms',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config
