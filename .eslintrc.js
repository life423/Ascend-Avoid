module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  extends: 'eslint:recommended',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // Error prevention
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    'no-debugger': 'warn',
    'no-duplicate-case': 'error',
    'no-empty': 'warn',
    'no-extra-semi': 'warn',
    'no-irregular-whitespace': 'warn',
    
    // Style consistency
    'indent': ['warn', 2, { SwitchCase: 1 }],
    'linebreak-style': ['warn', 'unix'],
    'quotes': ['warn', 'single', { avoidEscape: true }],
    'semi': ['warn', 'always'],
    'comma-dangle': ['warn', 'never'],
    'arrow-spacing': ['warn', { before: true, after: true }],
    'block-spacing': ['warn', 'always'],
    'comma-spacing': ['warn', { before: false, after: true }],
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
      // Relax rules for the main game file
      files: ['app.js'],
      rules: {
        'no-unused-vars': 'off', // Game code might use state vars
        'no-console': 'off',     // Console is used for debugging game
        'max-depth': 'off'       // Game loop can be deeply nested
      }
    }
  ]
};
