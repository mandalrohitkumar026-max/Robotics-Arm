/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neuro: {
          bg: '#F8FAFC',
          surface: '#FFFFFF',
          surfaceSecondary: '#F1F5F9',
          surfaceHover: '#F8FAFC',
          border: '#E2E8F0',
          borderStrong: '#CBD5E1',
          textPrimary: '#0F172A',
          textSecondary: '#475569',
          textMuted: '#64748B',
          accent: '#2563EB',
          accentLight: '#EFF6FF',
          accentHover: '#1D4ED8',
          green: '#16A34A',
          amber: '#D97706',
          red: '#DC2626',
          // Aliases for compatibility
          textBright: '#0F172A',
          cyan: '#2563EB',
          blue: '#2563EB',
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Menlo', 'Consolas', 'monospace'],
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif']
      },
      borderRadius: {
        DEFAULT: '6px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '10px',
      },
      boxShadow: {
        subtle: '0 1px 2px rgba(15, 23, 42, 0.04)',
      }
    },
  },
  plugins: [],
}
