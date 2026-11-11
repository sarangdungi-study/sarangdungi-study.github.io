import js from '@eslint/js'
import globals from 'globals'

export default [
  { ignores: ['node_modules/', 'media/'] },
  js.configs.recommended,
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...globals.browser, SUBJECTS: 'writable', CONCEPTS: 'writable', PROBLEMS: 'writable', Store: 'writable' },
    },
    rules: { 'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }] },
  },
  { files: ['*.mjs'], languageOptions: { sourceType: 'module', globals: globals.node } },
]
