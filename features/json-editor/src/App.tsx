import { useState, useEffect } from 'react';
import JSONEditor from './components/JSONEditor';
import { getPluginInitData, getStoreValue, setStoreValue } from '@vkit/api';
import { formatJSON, isValidJSON } from '@vkit/utils';

interface PluginContext {
  mode?: string;
  content?: string;
}

const storeKey = 'json-editor';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  // 处理初始化数据
  useEffect(() => {
    const context = getPluginInitData() as PluginContext | null;
    if (context?.mode === 'edit' && context?.content) {
      if (isValidJSON(context.content)) {
        setJsonValue(formatJSON(context.content));
        setStoreValue({ key: storeKey, value: context.content });
      } else {
        setJsonValue(context.content);
        setStoreValue({ key: storeKey, value: context.content });
      }
    } else {
      getStoreValue<string>({ key: storeKey }).then(result => {
        if (result.success) {
          setJsonValue(formatJSON(result.data ?? '{}'));
        }
      });
    }
  }, []);

  // 处理JSON值变化
  const handleJSONChange = (newValue: string) => {
    setJsonValue(newValue);
    setStoreValue({ key: storeKey, value: newValue });
  };

  return (
    <main className='h-full w-full'>
      <JSONEditor value={jsonValue} onChange={handleJSONChange} />
    </main>
  );
}

export default App;
