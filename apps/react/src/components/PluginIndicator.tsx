import { X } from 'lucide-react';
import { type IPluginManifest } from '@vkit/api';

interface PluginIndicatorProps {
  plugin: IPluginManifest;
  onClose: () => void;
}

export default function PluginIndicator({ plugin, onClose }: PluginIndicatorProps) {
  return (
    <div className='flex items-center space-x-2 px-2 py-1 bg-blue-50 border border-blue-200 rounded-md'>
      {plugin.icon ? (
        <img 
          className='w-5 h-5' 
          src={plugin.icon} 
          alt={plugin.name}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='w-5 h-5 bg-blue-500 rounded flex items-center justify-center text-white text-xs font-bold'>
          {plugin.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className='text-sm font-medium text-blue-700 max-w-32 truncate'>
        {plugin.name}
      </span>
      <button
        onClick={onClose}
        className='p-1 hover:bg-blue-100 rounded-full transition-colors'
        title='关闭插件'
      >
        <X className='w-3 h-3 text-blue-600' />
      </button>
    </div>
  );
} 