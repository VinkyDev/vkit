import { sendSearchInputChange, sendSearchInputEnter, type IPluginManifest } from '@vkit/api';
import { SEARCH_HEIGHT } from '@vkit/constants';
import { useEffect, useRef } from 'react';
import { Search, ArrowLeft } from 'lucide-react';
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
  onPluginClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 自动聚焦
  useEffect(() => {
    if (!selectedPlugin && inputRef.current) {
      requestIdleCallback(() => {
        inputRef.current?.focus();
      });
    }
  }, [selectedPlugin]);

  const handleInputBlur = () => {
    if (!selectedPlugin) {
      requestIdleCallback(() => {
        const activeElement = document.activeElement;
        if (!activeElement || activeElement === document.body) {
          if (inputRef.current) {
            inputRef.current.focus();
          }
        }
      });
    }
  };

  const handleInputChange = (value: string) => {
    onInputChange(value);
    sendSearchInputChange({ value });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedPlugin) {
      sendSearchInputEnter({ value: inputValue });
    }
    if (e.key === 'Backspace' && selectedPlugin && inputValue.length === 0) {
      onPluginClose();
    }
  };

  return (
    <div className='border-b border-black/10 window-drag' style={{ height: SEARCH_HEIGHT }}>
      <div className='w-full h-full px-4 py-2 flex items-center gap-3'>
        {selectedPlugin ? (
          <>
            <button
              onClick={onPluginClose}
              className='p-1 hover:bg-black/5 rounded-md transition-colors window-no-drag'
            >
              <ArrowLeft className='w-4 h-4 text-gray-600' />
            </button>
            <PluginIndicator plugin={selectedPlugin} onClose={onPluginClose} />
          </>
        ) : (
          <Search className='w-4 h-4 text-gray-400 flex-shrink-0' />
        )}

        <input
          ref={inputRef}
          type='text'
          placeholder={selectedPlugin ? 'Type a command...' : 'Search for apps and commands...'}
          className='flex-1 text-gray-900 placeholder-gray-500 bg-transparent border-none outline-none window-no-drag'
          value={inputValue}
          onChange={e => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleInputBlur}
        />
      </div>
    </div>
  );
}
