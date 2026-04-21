import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import importPlugin from 'eslint-plugin-import'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'

export default defineConfig([
  globalIgnores(['dist', 'node_modules', 'e2e', 'src/__tests__']),
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      import: importPlugin,
      'jsx-a11y': jsxA11y,
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: { ...globals.browser, google: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
      'import/order': ['warn', { alphabetize: { order: 'asc' } }],
      'import/first': 'warn',
      'import/no-duplicates': 'error',
      'import/no-unresolved': 'off',
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/label-has-associated-control': 'warn',
      'react-hooks/set-state-in-effect': 'off',
      'no-empty': 'off',
    },
  },
  {
    files: ['vite.config.js', 'vitest.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  {
    files: ['src/data/sheetsApi.js'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
  {
    files: ['src/App.jsx', 'src/components/ExerciseAccordionSheet.jsx'],
    rules: {
      'no-unused-vars': 'off',
    },
  },
])
