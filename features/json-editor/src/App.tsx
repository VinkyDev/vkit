import { useState, useEffect } from 'react';
import JSONEditor from './components/JSONEditor';
import { useSearchInput } from '@vkit/hooks';
import { getPluginInitData } from '@vkit/api';
import { formatJSON, isValidJSON } from '@vkit/utils';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  const { value: searchValue, hasValue: hasSearchValue } = useSearchInput();

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
      {hasSearchValue && (
        <div className='bg-blue-50 px-3 py-2 text-sm text-blue-700 border-b border-blue-200'>
          搜索内容: {searchValue}
        </div>
      )}
      <JSONEditor value={jsonValue} onChange={handleJSONChange} />
    </main>
  );
}

export default App;
