import { useState, useEffect } from 'react';
import JSONEditor from './components/JSONEditor';
import { getPluginInitData } from '@vkit/api';
import { formatJSON, isValidJSON } from '@vkit/utils';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  // 处理初始化数据
  useEffect(() => {
    const initData = getPluginInitData();
    if (initData?.initialValue) {
      if (isValidJSON(initData.initialValue)) {
        setJsonValue(formatJSON(initData.initialValue));
      } else {
        setJsonValue(initData.initialValue);
      }
    }
  }, []);

  // 处理JSON值变化
  const handleJSONChange = (newValue: string) => {
    setJsonValue(newValue);
  };

  return (
    <main className='h-full w-full'>
      <JSONEditor value={jsonValue} onChange={handleJSONChange} />
    </main>
  );
}

export default App;
