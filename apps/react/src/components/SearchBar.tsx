import { sendSearchInputChange, sendSearchInputEnter, type IPluginManifest } from '@vkit/api';
import { SEARCH_HEIGHT } from '@vkit/constants';
import PluginIndicator from './PluginIndicator';

interface SearchBarProps {
  inputValue: string;
  onInputChange: (value: string) => void;
  selectedPlugin: IPluginManifest | null;
  onPluginClose: () => void;
}

export default function SearchBar({ 
  inputValue, 
  onInputChange, 
  selectedPlugin, 
  onPluginClose
}: SearchBarProps) {
  const handleInputChange = (value: string) => {
    onInputChange(value);
    // 发送输入框内容变化事件到插件
    sendSearchInputChange({ value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      // 发送回车事件到插件
      sendSearchInputEnter({ value: inputValue });
    }
  };

  return (
    <div
      className='bg-gray-100 px-4 py-3 flex items-center space-x-3 border border-gray-200/80'
      style={{ height: SEARCH_HEIGHT }}
    >
      {!selectedPlugin ? (
        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md'>
          V
        </div>
      ) : (
        <PluginIndicator plugin={selectedPlugin} onClose={onPluginClose} />
      )}
      
      <input
        type='text'
        placeholder='Hello, vkit! Please enter a keyword'
        className='bg-transparent text-base focus:outline-none w-full placeholder:text-gray-400'
        value={inputValue}
        onChange={e => handleInputChange(e.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
} 