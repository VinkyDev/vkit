// @ts-check
import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

const globalIgnores = {
  ignores: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**',
    '**/coverage/**',
    '**/.git/**',
    '**/release/**',
    '**/dist-electron/**',
    '**/*.min.js',
    '**/public/**/*.js',
    '**/out/**',
  ],
};

// 基础配置
const baseConfig = [
  globalIgnores,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // 通用规则
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-unused-vars': 'off', // 由 TypeScript 处理
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-misused-promises': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
    },
  },
];

// React应用配置
const reactConfig = [
  {
    files: ['apps/react/**/*.{ts,tsx}', 'packages/**/*.{ts,tsx}', 'features/**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,

      // React Refresh 规则
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // 禁用不适合React的规则
      'no-undef': 'off', // TypeScript处理
    },
  },
];

// Electron主进程配置
const electronConfig = [
  {
    files: ['apps/electron/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
    rules: {
      // Electron特定规则
      'no-console': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/consistent-type-imports': 'off',
      '@typescript-eslint/no-floating-promises': 'off',

      // Node.js最佳实践
      'n/prefer-global/process': 'off',
      'n/prefer-global/buffer': 'off',
    },
  },
];

// 配置文件特殊处理
const configFilesConfig = [
  {
    files: ['**/*.config.{js,ts,mjs,mts}', '**/vite.config.{js,ts}', '**/eslint.config.{js,ts}'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      'no-console': 'off',
    },
  },
];

// JavaScript文件禁用类型检查
const jsConfig = [
  {
    files: ['**/*.js', '**/*.mjs', '**/*.cjs'],
    ...tseslint.configs.disableTypeChecked,
  },
];

export default [
  ...baseConfig,
  ...reactConfig,
  ...electronConfig,
  ...configFilesConfig,
  ...jsConfig,
  prettierConfig,
];
