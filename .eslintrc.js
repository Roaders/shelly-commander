module.exports = {
    env: {
        browser: true,
        node: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/eslint-recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaVersion: 11,
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    ignorePatterns: ['dist/'],
    rules: {
        'prettier/prettier': ['error', { endOfLine: 'auto', tabWidth: 4, singleQuote: true, printWidth: 120 }],
    },
    overrides: [
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
    ],
};
