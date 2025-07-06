import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import Editor, { type OnMount, type OnChange } from '@monaco-editor/react';
import type * as monaco from 'monaco-editor';

export interface JSONEditorRef {
  formatJSON: () => void;
  minifyJSON: () => void;
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  getEditor: () => monaco.editor.IStandaloneCodeEditor | null;
}

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

const JSONEditor = forwardRef<JSONEditorRef, JSONEditorProps>(
  (
    {
      value = '',
      onChange,
      height = '400px',
      width = '100%',
      readOnly = false,
      lineNumbers = true,
      validation = true,
    },
    ref
  ) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [editorValue, setEditorValue] = useState<string>(() => {
      if (typeof value === 'string') {
        return value;
      }
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return '';
      }
    });

    // 格式化JSON
    const formatJSON = useCallback(() => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const value = editor.getValue();

        try {
          const parsed = JSON.parse(value) as object;
          const formatted = JSON.stringify(parsed, null, 2);
          editor.setValue(formatted);
        } catch (error) {
          console.warn('无法格式化无效的JSON:', error);
        }
      }
    }, []);

    // 压缩JSON
    const minifyJSON = useCallback(() => {
      if (editorRef.current) {
        const editor = editorRef.current;
        const value = editor.getValue();

        try {
          const parsed = JSON.parse(value) as object;
          const minified = JSON.stringify(parsed);
          editor.setValue(minified);
        } catch (error) {
          console.warn('无法压缩无效的JSON:', error);
        }
      }
    }, []);

    // 处理编辑器挂载
    const handleEditorDidMount: OnMount = useCallback(
      (editor, monaco) => {
        editorRef.current = editor;

        // 配置JSON语言设置
        monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
          validate: validation,
          allowComments: false,
          schemaValidation: 'error',
          enableSchemaRequest: true,
        });

        // 设置编辑器选项
        editor.updateOptions({
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineHeight: 20,
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          formatOnType: true,
          formatOnPaste: true,
          lineNumbers: lineNumbers ? 'on' : 'off',
          readOnly,
          glyphMargin: true,
          folding: true,
          showFoldingControls: 'always',
          foldingStrategy: 'indentation',
          renderLineHighlight: 'line',
          selectionHighlight: false,
          automaticLayout: true,
        });

        // 添加格式化快捷键
        editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
          formatJSON();
        });
      },
      [validation, lineNumbers, readOnly, formatJSON]
    );

    // 处理内容变化
    const handleEditorChange: OnChange = useCallback(
      newValue => {
        if (newValue !== undefined) {
          setEditorValue(newValue);
          if (onChange) {
            try {
              const parsedJSON = JSON.parse(newValue) as object;
              onChange(newValue, parsedJSON);
            } catch {
              onChange(newValue);
            }
          }
        }
      },
      [onChange]
    );
    // 暴露方法给父组件
    useImperativeHandle(
      ref,
      () => ({
        formatJSON,
        minifyJSON,
        getValue: () => editorRef.current?.getValue() ?? '',
        setValue: (value: string) => editorRef.current?.setValue(value),
        focus: () => editorRef.current?.focus(),
        getEditor: () => editorRef.current,
      }),
      [formatJSON, minifyJSON]
    );

    // 当外部value变化时更新编辑器
    useEffect(() => {
      const newValue = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
      if (newValue !== editorValue && editorRef.current) {
        editorRef.current.setValue(newValue);
        setEditorValue(newValue);
      }
    }, [value, editorValue]);

    return (
      <div className='relative overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm'>
        <Editor
          height={height}
          width={width}
          language='json'
          theme='vs-light'
          value={editorValue}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            automaticLayout: true,
          }}
        />
      </div>
    );
  }
);

JSONEditor.displayName = 'JSONEditor';

export default JSONEditor;
