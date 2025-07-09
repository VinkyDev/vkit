import { TOOLBAR_HEIGHT } from '@vkit/constants';
import { Code2, RefreshCw, Globe, X } from 'lucide-react';

interface ToolbarProps {
  currentUrl: string;
  devToolsEnabled: boolean;
  onDevToolsToggle: () => void;
  onRefresh: () => void;
  onClose: () => void;
}

const Toolbar = ({
  currentUrl,
  devToolsEnabled,
  onDevToolsToggle,
  onRefresh,
  onClose,
}: ToolbarProps) => {
  return (
    <div
      className='absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex items-center justify-between px-4 shadow-lg'
      style={{ height: TOOLBAR_HEIGHT }}
    >
      {/* 左侧：开发者工具控制 */}
      <div className='flex items-center space-x-3'>
        <button
          onClick={onDevToolsToggle}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            devToolsEnabled
              ? 'bg-green-100 text-green-700 hover:bg-green-200 shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Code2 className='w-4 h-4' />
          <span>{devToolsEnabled ? 'DevTools ON' : 'DevTools OFF'}</span>
        </button>

        <button
          onClick={onRefresh}
          className='flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm'
        >
          <RefreshCw className='w-4 h-4' />
          <span>刷新</span>
        </button>
      </div>

      {/* 中间：当前URL显示 */}
      <div className='flex-1 mx-4 flex items-center justify-center'>
        <div className='bg-gray-50 px-4 py-2 rounded-lg max-w-md truncate'>
          <div className='flex items-center space-x-2 text-sm'>
            <Globe className='w-4 h-4 text-gray-400 flex-shrink-0' />
            <span className='text-gray-600 truncate font-mono text-xs'>{currentUrl}</span>
          </div>
        </div>
      </div>

      {/* 右侧：关闭按钮 */}
      <div className='flex items-center'>
        <button
          onClick={onClose}
          className='flex items-center space-x-2 px-4 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm'
        >
          <X className='w-4 h-4' />
          <span>关闭</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
