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
 * 编辑器主题
 */
export const EDITOR_THEME = 'vs-light';

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