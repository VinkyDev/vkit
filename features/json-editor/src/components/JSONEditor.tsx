import { useCallback, useEffect } from 'react';
import Editor, { type OnChange, type OnMount } from '@monaco-editor/react';
import { useMonacoEditor, type UseMonacoEditorProps } from '../hooks';
import { valueToJSONString, safeParseJSON } from '@vkit/utils';
import { EDITOR_THEME, EDITOR_LANGUAGE } from '../utils';

interface JSONEditorProps {
  /** JSON字符串或对象 */
  value?: string | object;
  /** 当内容改变时的回调 */
  onChange?: (value: string, json?: object) => void;
  /** 编辑器高度 */
  height?: string | number;
  /** 编辑器宽度 */
  width?: string | number;
  /** 是否只读模式 */
  readOnly?: boolean;
  /** 是否显示行号 */
  lineNumbers?: boolean;
  /** 是否开启语法验证 */
  validation?: boolean;
  /** 是否自动聚焦 */
  autoFocus?: boolean;
}

const JSONEditor = ({
  value = '',
  onChange,
  height,
  width = '100%',
  readOnly = false,
  lineNumbers = true,
  validation = true,
  autoFocus = true,
}: JSONEditorProps) => {
  const editorProps: UseMonacoEditorProps = {
    readOnly,
    lineNumbers,
    validation,
    onFormat: onChange
      ? formatted => {
          const parseResult = safeParseJSON<object>(formatted);
          onChange(formatted, parseResult.success ? parseResult.data : undefined);
        }
      : undefined,
    onMinify: onChange
      ? minified => {
          const parseResult = safeParseJSON<object>(minified);
          onChange(minified, parseResult.success ? parseResult.data : undefined);
        }
      : undefined,
  };

  const { handleEditorDidMount, focus } = useMonacoEditor(editorProps);

  const editorValue = valueToJSONString(value, 2);

  // 自动聚焦功能
  useEffect(() => {
    if (autoFocus) {
      // 延迟一下确保编辑器完全挂载
      const timer = setTimeout(() => {
        focus();
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [autoFocus, focus]);

  const handleEditorChange: OnChange = useCallback(
    newValue => {
      if (newValue !== undefined && onChange) {
        const parseResult = safeParseJSON<object>(newValue);
        onChange(newValue, parseResult.success ? parseResult.data : undefined);
      }
    },
    [onChange]
  );

  const handleEditorDidMountWithFocus = useCallback(
    (editor: Parameters<OnMount>[0], monaco: Parameters<OnMount>[1]) => {
      // 调用原始的挂载处理
      handleEditorDidMount(editor, monaco);

      // 如果开启自动聚焦，立即聚焦编辑器
      if (autoFocus) {
        requestIdleCallback(() => {
          editor.focus();
        });
      }
    },
    [handleEditorDidMount, autoFocus]
  );

  return (
    <div className='w-full h-full relative overflow-hidden rounded-lg'>
      <Editor
        height={height}
        width={width}
        language={EDITOR_LANGUAGE}
        theme={EDITOR_THEME}
        value={editorValue}
        onChange={handleEditorChange}
        onMount={handleEditorDidMountWithFocus}
        options={{
          automaticLayout: true,
          stickyScroll: {
            enabled: false,
          },
        }}
      />
    </div>
  );
};

JSONEditor.displayName = 'JSONEditor';

export default JSONEditor;
