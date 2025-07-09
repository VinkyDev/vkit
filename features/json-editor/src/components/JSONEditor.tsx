import { useCallback } from 'react';
import Editor, { type OnChange } from '@monaco-editor/react';
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
}

const JSONEditor = ({
  value = '',
  onChange,
  height,
  width = '100%',
  readOnly = false,
  lineNumbers = true,
  validation = true,
}: JSONEditorProps) => {

  const editorProps: UseMonacoEditorProps = {
    readOnly,
    lineNumbers,
    validation,
    onFormat: onChange ? (formatted) => {
      const parseResult = safeParseJSON(formatted);
      onChange(formatted, parseResult.success ? parseResult.data : undefined);
    } : undefined,
    onMinify: onChange ? (minified) => {
      const parseResult = safeParseJSON(minified);
      onChange(minified, parseResult.success ? parseResult.data : undefined);
    } : undefined,
  };

  const { handleEditorDidMount } = useMonacoEditor(editorProps);

  const editorValue = valueToJSONString(value, 2);

  const handleEditorChange: OnChange = useCallback(
    newValue => {
      if (newValue !== undefined && onChange) {
        const parseResult = safeParseJSON(newValue);
        onChange(newValue, parseResult.success ? parseResult.data : undefined);
      }
    },
    [onChange]
  );

  return (
    <div className='w-full h-full relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
      <Editor
        height={height}
        width={width}
        language={EDITOR_LANGUAGE}
        theme={EDITOR_THEME}
        value={editorValue}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={{
          automaticLayout: true,
        }}
      />
    </div>
  );
};

JSONEditor.displayName = 'JSONEditor';

export default JSONEditor;
