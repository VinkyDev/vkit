// @ts-check

/**
 * Commitlint配置 - 使用传统提交规范
 */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // 类型定义
    'type-enum': [
      2,
      'always',
      [
        'feat', // 新功能
        'fix', // 修复bug
        'docs', // 文档更新
        'style', // 代码格式（不影响代码运行的变动）
        'refactor', // 重构（既不是新增功能，也不是修改bug的代码变动）
        'perf', // 性能优化
        'test', // 增加测试
        'chore', // 构建过程或辅助工具的变动
        'ci', // CI配置文件和脚本的变动
        'build', // 构建系统或外部依赖项的变动
        'revert', // 撤销之前的commit
      ],
    ],

    // 主题长度限制
    'subject-max-length': [2, 'always', 100],
    'subject-min-length': [2, 'always', 4],

    // 主题格式
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],

    // 类型格式
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],

    // 范围
    'scope-case': [2, 'always', 'lower-case'],

    // 头部长度
    'header-max-length': [2, 'always', 100],
  },
};
