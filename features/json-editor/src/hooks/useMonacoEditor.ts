import { useCallback, useRef } from 'react';
import type { OnMount } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';
import { 
  DEFAULT_EDITOR_OPTIONS, 
  JSON_LANGUAGE_CONFIG,
  FROSTED_GLASS_THEME,
  FROSTED_GLASS_THEME_DATA
} from '../utils/constants';
import { formatJSON, minifyJSON } from '@vkit/utils';

export interface UseMonacoEditorProps {
  readOnly?: boolean;
  lineNumbers?: boolean;
  validation?: boolean;
  onFormat?: (formattedValue: string) => void;
  onMinify?: (minifiedValue: string) => void;
}

export interface UseMonacoEditorReturn {
  editorRef: React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>;
  handleEditorDidMount: OnMount;
  formatCurrentJSON: () => void;
  minifyCurrentJSON: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

/**
 * Monaco编辑器逻辑hook
 */
export function useMonacoEditor(props: UseMonacoEditorProps = {}): UseMonacoEditorReturn {
  const { 
    readOnly = false, 
    lineNumbers = true, 
    validation = true,
    onFormat,
    onMinify 
  } = props;
  
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  // 格式化当前编辑器中的JSON
  const formatCurrentJSON = useCallback(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      const formatted = formatJSON(currentValue);
      editorRef.current.setValue(formatted);
      onFormat?.(formatted);
    }
  }, [onFormat]);

  // 压缩当前编辑器中的JSON
  const minifyCurrentJSON = useCallback(() => {
    if (editorRef.current) {
      const currentValue = editorRef.current.getValue();
      const minified = minifyJSON(currentValue);
      editorRef.current.setValue(minified);
      onMinify?.(minified);
    }
  }, [onMinify]);

  // 编辑器挂载处理
  const handleEditorDidMount: OnMount = useCallback(
    (editor, monacoInstance) => {
      editorRef.current = editor;

      // 注册毛玻璃主题
      monacoInstance.editor.defineTheme(FROSTED_GLASS_THEME, FROSTED_GLASS_THEME_DATA);
      monacoInstance.editor.setTheme(FROSTED_GLASS_THEME);

      // 配置JSON语言设置
      monacoInstance.languages.json.jsonDefaults.setDiagnosticsOptions({
        validate: validation,
        allowComments: JSON_LANGUAGE_CONFIG.allowComments,
        schemaValidation: JSON_LANGUAGE_CONFIG.schemaValidation,
        enableSchemaRequest: JSON_LANGUAGE_CONFIG.enableSchemaRequest,
      });

      // 应用编辑器配置
      const editorOptions = {
        ...DEFAULT_EDITOR_OPTIONS,
        lineNumbers: lineNumbers ? 'on' as const : 'off' as const,
        readOnly,
      };
      editor.updateOptions(editorOptions);

      // 添加格式化快捷键
      editor.addCommand(
        monacoInstance.KeyMod.Shift | monacoInstance.KeyMod.Alt | monacoInstance.KeyCode.KeyF,
        () => {
          formatCurrentJSON();
        }
      );
    },
    [validation, lineNumbers, readOnly, formatCurrentJSON]
  );

  // 获取编辑器当前值
  const getValue = useCallback(() => {
    return editorRef.current?.getValue() ?? '';
  }, []);

  // 设置编辑器值
  const setValue = useCallback((value: string) => {
    editorRef.current?.setValue(value);
  }, []);

  // 聚焦编辑器
  const focus = useCallback(() => {
    editorRef.current?.focus();
  }, []);

  // 获取编辑器实例
  const getEditor = useCallback(() => {
    return editorRef.current;
  }, []);

  return {
    editorRef,
    handleEditorDidMount,
    formatCurrentJSON,
    minifyCurrentJSON,
    getValue,
    setValue,
    focus,
    getEditor,
  };
} 