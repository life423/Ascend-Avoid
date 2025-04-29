module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended'
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json'
  },
  plugins: [
    '@typescript-eslint'
  ],
  rules: {
    // Error prevention
    'no-unused-vars': 'off', // Use TypeScript version instead
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-debugger': 'warn',
    'no-duplicate-case': 'error',
    'no-empty': 'warn',
    'no-extra-semi': 'warn',
    'no-irregular-whitespace': 'warn',
    
    // TypeScript specific
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-non-null-assertion': 'warn',
    '@typescript-eslint/no-empty-interface': 'warn',
    '@typescript-eslint/ban-ts-comment': ['warn', {
      'ts-ignore': 'allow-with-description',
      'ts-nocheck': 'allow-with-description'
    }],
    
    // Style consistency
    'indent': 'off', // Use TypeScript version
    '@typescript-eslint/indent': ['warn', 2, { SwitchCase: 1 }],
    'linebreak-style': ['warn', 'unix'],
    'quotes': 'off', // Use TypeScript version
    '@typescript-eslint/quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': 'off', // Use TypeScript version
    '@typescript-eslint/semi': ['warn', 'always'],
    'comma-dangle': 'off', // Use TypeScript version
    '@typescript-eslint/comma-dangle': ['warn', 'never'],
    'arrow-spacing': ['warn', { before: true, after: true }],
    'block-spacing': ['warn', 'always'],
    'comma-spacing': 'off', // Use TypeScript version
    '@typescript-eslint/comma-spacing': ['warn', { before: false, after: true }],
    'keyword-spacing': ['warn', { before: true, after: true }],
    'space-before-blocks': ['warn', 'always'],
    
    // Best practices
    'curly': ['warn', 'all'],
    'eqeqeq': ['warn', 'always'],
    'no-floating-decimal': 'warn',
    'no-multi-spaces': 'warn',
    
    // Game-specific rules
    'complexity': ['warn', 15],  // Flag complex functions
    'max-depth': ['warn', 4],    // Avoid deeply nested code
    'max-params': ['warn', 5]    // Avoid too many parameters
  },
  overrides: [
    {
      // Relax rules for test files
      files: ['**/*.test.ts', 'tests/**/*.ts'],
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-console': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off'
      }
    },
    {
      // Relax rules for the main game files
      files: ['src/core/Game.ts', 'src/multiplayer/MultiplayerManager.ts'],
      rules: {
        'no-console': 'off',     // Console is used for debugging game
        'max-depth': 'off',      // Game loop can be deeply nested
        'complexity': ['warn', 20]  // Game logic can be more complex
      }
    }
  ]
};
