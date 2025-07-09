import { useState, useEffect } from 'react';
import JSONEditor from './components/JSONEditor';
import { usePluginInitData, useSearchInput } from '@vkit/hooks';
import { formatJSON, isValidJSON } from '@vkit/utils';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  const { value: searchValue, hasValue: hasSearchValue } = useSearchInput();
  const initData = usePluginInitData();

  // 处理初始化数据
  useEffect(() => {
    const initialValue = initData?.initialValue;
    if (initialValue) {
      if (isValidJSON(initialValue)) {
        setJsonValue(formatJSON(initialValue));
      } else {
        setJsonValue(initialValue);
      }
    }
  }, [initData]);

  // 处理JSON值变化
  const handleJSONChange = (newValue: string) => {
    setJsonValue(newValue);
  };

  return (
    <main className="h-full w-full">
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
