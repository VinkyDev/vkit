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
      className='absolute bottom-0 left-0 right-0 border-t border-black/10 flex items-center px-3'
      style={{ height: TOOLBAR_HEIGHT }}
    >
      <div className='flex-1 flex items-center bg-black/5 rounded-full px-4 py-1 mx-2'>
        <Globe className='w-4 h-4 text-gray-500 mr-3 flex-shrink-0' />
        <span className='flex-1 text-sm text-gray-700 truncate font-mono'>{currentUrl}</span>
      </div>

      <div className='flex items-center space-x-2'>
        <button
          onClick={onDevToolsToggle}
          className={`p-2 rounded-full transition-all duration-200 ${
            devToolsEnabled
              ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30'
              : 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20'
          }`}
          title={devToolsEnabled ? 'DevTools: 开启' : 'DevTools: 关闭'}
        >
          <Code2 className='w-4 h-4' />
        </button>

        <button
          onClick={onRefresh}
          className='p-2 rounded-full bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all duration-200'
          title='刷新页面'
        >
          <RefreshCw className='w-4 h-4' />
        </button>

        <button
          onClick={onClose}
          className='p-2 rounded-full bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-all duration-200'
          title='关闭工具'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
