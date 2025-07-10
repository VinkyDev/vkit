import { type IPluginManifest } from '@vkit/api';

interface PluginIndicatorProps {
  plugin: IPluginManifest;
  onClose: () => void;
}

export default function PluginIndicator({ plugin }: PluginIndicatorProps) {
  return (
    <div className='flex items-center gap-2'>
      {plugin.icon ? (
        <img 
          className='w-4 h-4 rounded-sm' 
          src={plugin.icon} 
          alt={plugin.name}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      ) : (
        <div className='w-4 h-4 bg-gray-600 rounded-sm flex items-center justify-center text-white text-xs font-bold'>
          {plugin.name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className='text-sm font-medium text-gray-900 truncate'>
        {plugin.name}
      </span>
    </div>
  );
} 