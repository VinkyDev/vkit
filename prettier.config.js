// @ts-check

/**
 * @type {import("prettier").Config}
 */
const config = {
  // 基础格式选项
  printWidth: 100, // 每行最大字符数
  tabWidth: 2, // 缩进宽度
  useTabs: false, // 使用空格而不是制表符
  semi: true, // 语句末尾添加分号
  singleQuote: true, // 使用单引号
  quoteProps: 'as-needed', // 对象属性引号：仅在需要时添加

  // JSX 配置
  jsxSingleQuote: true, // JSX 中使用单引号

  // 尾随逗号
  trailingComma: 'es5', // ES5 中有效的地方添加尾随逗号

  // 空格配置
  bracketSpacing: true, // 对象大括号内添加空格
  bracketSameLine: false, // 多行JSX元素的>放在下一行

  // 箭头函数参数括号
  arrowParens: 'avoid', // 单参数箭头函数省略括号

  // 行尾字符
  endOfLine: 'lf', // 使用 LF 换行符

  // 嵌入式语言格式化
  embeddedLanguageFormatting: 'auto',

  // HTML 空白敏感度
  htmlWhitespaceSensitivity: 'css',

  // 针对特定文件类型的覆盖配置
  overrides: [
    {
      files: '*.json',
      options: {
        printWidth: 120,
        trailingComma: 'none',
      },
    },
    {
      files: '*.md',
      options: {
        printWidth: 80,
        proseWrap: 'preserve',
        tabWidth: 2,
      },
    },
    {
      files: '*.{yml,yaml}',
      options: {
        printWidth: 120,
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.html', '*.vue'],
      options: {
        printWidth: 120,
        htmlWhitespaceSensitivity: 'ignore',
      },
    },
    {
      files: '*.css',
      options: {
        printWidth: 120,
        singleQuote: false,
      },
    },
    {
      files: ['package.json', 'tsconfig*.json'],
      options: {
        printWidth: 120,
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
  ],
};

export default config;
