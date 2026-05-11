import globals from 'globals';

export default [
    {
        files: ['js/**/*.js'],
        languageOptions: {
            ecmaVersion: 2024,
            sourceType: 'module',
            globals: {
                ...globals.browser,
            },
        },
        rules: {
            'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            'no-undef': 'error',
            'prefer-const': 'warn',
            'no-var': 'error',
            'eqeqeq': ['error', 'always'],
            'no-console': 'off',
            'semi': ['error', 'always'],
            'quotes': ['warn', 'single', { avoidEscape: true }],
            'indent': ['warn', 2, { SwitchCase: 1 }],
            'comma-dangle': ['warn', 'always-multiline'],
        },
    },
];