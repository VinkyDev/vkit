import { useState, useEffect, useMemo } from 'react';
import type { IClipboardEntry } from '@vkit/api';
import { getClipboardHistory, log, onClipboardChanged, deleteAllClipboardHistory } from '@vkit/api';
import { useSearchInput } from '@vkit/hooks';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import {
  ClipboardItemRender,
  FilterTabs,
  type FilterType,
  EmptyState,
  LoadingSpinner,
} from './components';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Popconfirm } from './components/ui/popconfirm';

function App() {
  const [clipboardHistory, setClipboardHistory] = useState<IClipboardEntry[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [isLoading, setIsLoading] = useState(true);
  const { value: searchQuery } = useSearchInput();

  const fetchClipboardHistory = async () => {
    try {
      const res = await getClipboardHistory();
      setClipboardHistory(res.data ?? []);
    } catch (error) {
      log('获取剪切板历史失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAll = async () => {
    if (clipboardHistory.length === 0) return;

    try {
      await deleteAllClipboardHistory();
      await fetchClipboardHistory();
      toast.success('已清空剪切板历史');
    } catch (error) {
      log('删除剪切板历史失败:', error);
      toast.error('删除失败，请重试');
    }
  };

  useEffect(() => {
    fetchClipboardHistory();

    const unlisten = onClipboardChanged(() => {
      fetchClipboardHistory();
    });

    return () => {
      unlisten();
    };
  }, []);

  // 计算过滤后的数据和统计
  const { filteredItems, counts } = useMemo(() => {
    const filtered = clipboardHistory.filter(item => {
      // 搜索过滤
      const matchesSearch =
        searchQuery === '' || item.content.toLowerCase().includes(searchQuery.toLowerCase());

      // 类型过滤
      const matchesFilter =
        activeFilter === 'all' ||
        (activeFilter === 'text' && item.type === 'text') ||
        (activeFilter === 'image' && item.type === 'image') ||
        (activeFilter === 'favorites' && item.favorite);

      return matchesSearch && matchesFilter;
    });

    // 计算各类型的数量
    const counts = {
      all: clipboardHistory.length,
      text: clipboardHistory.filter(item => item.type === 'text').length,
      image: clipboardHistory.filter(item => item.type === 'image').length,
      favorites: clipboardHistory.filter(item => item.favorite).length,
    };

    return { filteredItems: filtered, counts };
  }, [clipboardHistory, searchQuery, activeFilter]);

  const getEmptyMessage = () => {
    if (searchQuery) return '没有找到匹配的内容';
    if (activeFilter === 'favorites') return '暂无收藏内容';
    if (activeFilter === 'text') return '暂无文本内容';
    if (activeFilter === 'image') return '暂无图片内容';
    return '暂无剪切板内容';
  };

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col bg-background'>
      {/* 头部 - 搜索和过滤 */}
      <div className='flex-shrink-0 p-4 pb-3 space-y-3'>
        <div className='flex items-center justify-between'>
          <FilterTabs
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />
          <Popconfirm
            onConfirm={handleDeleteAll}
            description='确定要清空剪切板历史吗？此操作无法撤销。'
          >
            <Button
              variant='outline'
              size='sm'
              className='h-8 px-3 text-xs bg-white/40 hover:bg-white/60'
            >
              <Trash2 className='w-3 h-3 mr-1' />
              清空全部
            </Button>
          </Popconfirm>
        </div>
      </div>

      <Separator />

      {/* 主内容区域 */}
      <div className='flex-1 min-h-0'>
        {filteredItems.length === 0 ? (
          <EmptyState message={getEmptyMessage()} />
        ) : (
          <ScrollArea className='h-full'>
            <div className='p-4 space-y-3'>
              {filteredItems.map(item => (
                <ClipboardItemRender key={item.id} item={item} onUpdate={fetchClipboardHistory} />
              ))}
            </div>
          </ScrollArea>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export default App;
