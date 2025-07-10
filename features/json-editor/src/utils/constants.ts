import type * as monaco from 'monaco-editor';

/**
 * Monaco编辑器默认配置
 */
export const DEFAULT_EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineHeight: 20,
  tabSize: 2,
  insertSpaces: true,
  wordWrap: 'on',
  formatOnType: true,
  formatOnPaste: true,
  glyphMargin: true,
  folding: true,
  showFoldingControls: 'always',
  foldingStrategy: 'indentation',
  renderLineHighlight: 'line',
  selectionHighlight: false,
  automaticLayout: true,
};

/**
 * JSON语言配置
 */
export const JSON_LANGUAGE_CONFIG = {
  validate: true,
  allowComments: false,
  schemaValidation: 'error' as const,
  enableSchemaRequest: true,
};

/**
 * 毛玻璃背景主题定义
 */
export const FROSTED_GLASS_THEME = 'frosted-glass-theme';

/**
 * 毛玻璃主题配置
 */
export const FROSTED_GLASS_THEME_DATA: monaco.editor.IStandaloneThemeData = {
  base: 'vs',
  inherit: true,
  rules: [
    // JSON 语法高亮
    { token: 'string.key.json', foreground: '2563eb', fontStyle: 'bold' }, // 蓝色键名
    { token: 'string.value.json', foreground: '059669' }, // 绿色字符串值
    { token: 'number.json', foreground: 'dc2626' }, // 红色数字
    { token: 'keyword.json', foreground: '7c3aed' }, // 紫色关键字 (true, false, null)
    { token: 'delimiter.bracket.json', foreground: '374151' }, // 深灰色括号
    { token: 'delimiter.array.json', foreground: '374151' }, // 深灰色数组分隔符
    { token: 'delimiter.colon.json', foreground: '6b7280' }, // 灰色冒号
    { token: 'delimiter.comma.json', foreground: '6b7280' }, // 灰色逗号
  ],
  colors: {
    // 编辑器背景 - 透明
    'editor.background': '#ffffff00',
    'editor.foreground': '#1f2937',
    focusBorder: '#00000000',
    'editorWidget.border': '#00000000',
    'editor.border': '#00000000',

    // 行号和装订线
    'editorLineNumber.foreground': '#9ca3af',
    'editorLineNumber.activeForeground': '#374151',
    'editorGutter.background': '#ffffff00',

    // 当前行高亮 - 半透明
    'editor.lineHighlightBackground': '#f3f4f615',
    'editor.lineHighlightBorder': '#e5e7eb30',

    // 选中文本
    'editor.selectionBackground': '#3b82f630',
    'editor.selectionHighlightBackground': '#3b82f620',
    'editor.inactiveSelectionBackground': '#3b82f615',

    // 光标
    'editorCursor.foreground': '#1f2937',

    // 括号匹配
    'editorBracketMatch.background': '#fbbf2415',

    // 滚动条 - 半透明
    'scrollbar.shadow': '#00000020',
    'scrollbarSlider.background': '#9ca3af30',
    'scrollbarSlider.hoverBackground': '#9ca3af50',
    'scrollbarSlider.activeBackground': '#9ca3af70',

    // 查找匹配
    'editor.findMatchBackground': '#fbbf2430',
    'editor.findMatchHighlightBackground': '#fbbf2420',
    'editor.findRangeHighlightBackground': '#3b82f615',

    // 错误和警告装饰
    'editorError.foreground': '#ef4444',
    'editorWarning.foreground': '#f59e0b',
    'editorInfo.foreground': '#3b82f6',

    // 悬停和建议框
    'editorHoverWidget.background': '#ffffff95',
    'editorHoverWidget.border': '#e5e7eb',
    'editorSuggestWidget.background': '#ffffff95',
    'editorSuggestWidget.border': '#e5e7eb',
  },
};

/**
 * 编辑器主题
 */
export const EDITOR_THEME = FROSTED_GLASS_THEME;

/**
 * 编辑器语言
 */
export const EDITOR_LANGUAGE = 'json';

/**
 * 快捷键配置
 */
export const KEYBOARD_SHORTCUTS = {
  FORMAT: 'Shift+Alt+F',
} as const;
