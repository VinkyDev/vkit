import { type IPluginManifest } from '@vkit/api';
import { searchPlugins } from '../utils/search';

interface PluginGridProps {
  plugins: IPluginManifest[];
  onPluginSelect: (plugin: IPluginManifest, searchValue?: string) => void;
  searchQuery?: string;
}

export default function PluginGrid({ plugins, onPluginSelect, searchQuery }: PluginGridProps) {

  const displayPlugins = searchQuery?.trim()
    ? searchPlugins(searchQuery, plugins).map(result => result.plugin)
    : plugins;

  return (
    <div className='grid grid-cols-6 gap-4 p-4'>
      {displayPlugins.map(plugin => (
        <div
          key={plugin.id}
          className='flex flex-col items-center justify-center bg-gray-50/80 p-4 rounded-xl hover:bg-gray-200/80 transition-colors cursor-pointer border border-gray-200/50 shadow-sm'
          onClick={() => onPluginSelect(plugin, searchQuery)}
        >
          <img 
            className='w-8 h-8 mb-2' 
            src={plugin.iconUrl} 
            alt={plugin.name}
            onError={(e) => {
              // 如果图片加载失败，显示默认图标
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent && !parent.querySelector('.fallback-icon')) {
                const fallbackIcon = document.createElement('div');
                fallbackIcon.className = 'fallback-icon w-8 h-8 mb-2 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold';
                fallbackIcon.textContent = plugin.name.charAt(0).toUpperCase();
                parent.insertBefore(fallbackIcon, target);
              }
            }}
          />
          <div className='text-xs font-medium text-gray-600 text-center'>{plugin.name}</div>
        </div>
      ))}
    </div>
  );
} 