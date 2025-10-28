import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          ...defaultTheme.fontFamily.sans,
        ],
        mono: [
          '"Fira Code"',
          '"Courier New"',
          ...defaultTheme.fontFamily.mono,
        ],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      colors: {
        // Dark-first modern palette
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        // Dark navy background
        navy: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d9ff',
          300: '#a3bfff',
          400: '#7c9eff',
          500: '#5b7dff',
          600: '#4861f5',
          700: '#3d4fe0',
          800: '#293cb8',
          900: '#1f2e8a',
          950: '#151d52',
        },
        // Brand primary - vibrant gradient-ready purple
        brand: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Accent colors with vibrant energy
        accent: {
          cyan: '#00d9ff',
          emerald: '#10b981',
          orange: '#ff6b35',
          pink: '#ff006e',
          purple: '#a855f7',
          rose: '#f43f5e',
          amber: '#fbbf24',
        },
        // Semantic colors - vibrant
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
        info: '#3b82f6',
      },
      backgroundColor: {
        base: '#ffffff',
        elevated: '#f8fafc',
        hover: '#f1f5f9',
      },
      textColor: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#64748b',
      },
      borderColor: {
        light: '#e2e8f0',
        base: '#cbd5e1',
        dark: '#94a3b8',
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        elevation: '0 10px 30px -5px rgba(99, 102, 241, 0.15)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'fade-out': 'fadeOut 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-down': 'slideDown 0.3s ease-in',
        'scale-in': 'scaleIn 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 2s infinite',
        'pulse-subtle': 'pulseSubtle 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '.95' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
  safelist: [
    // Add classes that are dynamically generated
    'animate-fade-in',
    'animate-fade-out',
    'animate-slide-up',
    'animate-slide-down',
    'animate-scale-in',
    'animate-bounce-subtle',
    'animate-pulse-subtle',
    'bg-base',
    'bg-elevated',
    'bg-hover',
    'text-primary',
    'text-secondary',
    'text-tertiary',
    'border-light',
    'border-base',
    'border-dark',
    'shadow-elevation',
  ],
};

export default config;
