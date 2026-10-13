/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // 备忘录主题色板：由 app/globals.css 中的 CSS 变量提供，自动跟随系统深色模式
        n: {
          window: 'var(--n-window)',
          sidebar: 'var(--n-sidebar)',
          label: 'var(--n-label)',
          label2: 'var(--n-label-2)',
          label3: 'var(--n-label-3)',
          separator: 'var(--n-separator)',
          accent: 'var(--n-accent)',
          hover: 'var(--n-hover)',
          selected: 'var(--n-selected)',
          row: 'var(--n-row-selected)',
          rowInactive: 'var(--n-row-selected-inactive)',
          rowLabel: 'var(--n-row-selected-label)',
          field: 'var(--n-field)',
          chip: 'var(--n-chip)',
          menu: 'var(--n-menu)',
          highlight: 'var(--n-menu-highlight)',
          grouped: 'var(--n-grouped)',
          cell: 'var(--n-cell)',
        },
      },
    },
  },
  plugins: [],
}
