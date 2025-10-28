/** @type {import('prettier').Config} */
const config = {
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  arrowParens: 'always',
  endOfLine: 'lf',
  // Next.js specific
  plugins: ['prettier-plugin-tailwindcss'],
  tailwindConfig: './tailwind.config.ts',
  // Sort imports
  importOrder: [
    '^react',
    '^next',
    '^@',
    '^[./]',
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

module.exports = config;
