import { type SearchResult } from '../utils/search';

interface PluginGridProps {
  searchResults: SearchResult[];
  onItemSelect: (result: SearchResult, searchValue?: string) => void;
  searchQuery?: string;
  selectedIndex?: number;
}

export default function PluginGrid({
  searchResults,
  onItemSelect,
  searchQuery,
  selectedIndex = -1,
}: PluginGridProps) {
  const getItemTypeLabel = (result: SearchResult) => {
    // 检查是否是实时搜索结果（没有searchTerms字段）
    if (!('searchTerms' in result.item)) {
      return 'Instant';
    }

    // 根据匹配类型显示标签
    switch (result.matchType) {
      case 'searchTerms':
        return 'Match';
      case 'pinyin':
        return 'Pinyin';
      case 'description':
        return 'Desc';
      default:
        return 'Name';
    }
  };

  if (searchResults.length === 0 && searchQuery?.trim()) {
    return (
      <div className='flex flex-col items-center justify-center py-16 px-8'>
        <div className='text-6xl mb-4'>🔍</div>
        <div className='text-lg font-medium text-gray-600 mb-2'>No results found</div>
        <div className='text-sm text-gray-500'>Try searching for something else</div>
      </div>
    );
  }

  return (
    <div className='py-2'>
      {searchQuery?.trim() && (
        <div className='px-6 py-2'>
          <h3 className='text-sm font-medium text-gray-700 uppercase tracking-wide'>Results</h3>
        </div>
      )}

      <div className='space-y-1 px-2'>
        {searchResults.map((result, index) => {
          const isSelected = index === selectedIndex;
          const item = result.item;

          return (
            <div
              key={`${item.pluginId}-${item.id}`}
              data-plugin-item
              className={`
                flex items-center gap-3 px-4 py-3 mx-2 rounded-lg cursor-pointer transition-colors
                ${isSelected ? 'bg-black/8 text-gray-900' : 'hover:bg-black/4 text-gray-900'}
              `}
              onClick={() => onItemSelect(result, searchQuery)}
            >
              {/* 项目图标 */}
              <div className='flex-shrink-0'>
                {item.icon ? (
                  <img
                    className='w-8 h-8 rounded-lg object-cover'
                    src={item.icon}
                    alt={item.name}
                    onError={e => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon')) {
                        const fallbackIcon = document.createElement('div');
                        fallbackIcon.className =
                          'fallback-icon w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-white text-sm font-bold';
                        fallbackIcon.textContent = item.name.charAt(0).toUpperCase();
                        parent.appendChild(fallbackIcon);
                      }
                    }}
                  />
                ) : (
                  <div className='w-8 h-8 rounded-lg bg-gray-600 flex items-center justify-center text-white text-sm font-bold'>
                    {item.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* 项目信息 */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`text-sm font-medium truncate ${isSelected ? 'text-gray-900' : 'text-gray-900'}`}
                  >
                    {item.name}
                  </div>
                </div>
                <div
                  className={`text-xs truncate ${isSelected ? 'text-gray-600' : 'text-gray-500'}`}
                >
                  {item.description ?? 'No description available'}
                </div>
              </div>

              {/* 匹配类型标签 */}
              <div className='flex-shrink-0'>
                <span
                  className={`
                    text-xs px-2 py-1 rounded-md font-medium
                    ${isSelected ? 'bg-black/10 text-gray-700' : 'bg-black/5 text-gray-600'}
                  `}
                >
                  {getItemTypeLabel(result)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
