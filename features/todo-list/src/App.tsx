import { CompactToolbar } from './components/CompactToolbar';
import { TimelineView } from './components/TimelineView';
import { ListView } from './components/ListView';
import { LoadingSpinner } from './components/LoadingSpinner';
import { TaskDrawer } from './components/TaskDrawer';
import { usePluginInitData } from './hooks';
import { useTodoStore } from './store/useTodoStore';
import { useState, useEffect } from 'react';
import type { Todo } from './types';

interface TaskDrawerState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  todo?: Todo;
  defaultDate?: Date;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const { viewMode } = useTodoStore();

  // TaskDrawer状态提升到App层
  const [taskDrawer, setTaskDrawer] = useState<TaskDrawerState>({
    isOpen: false,
    mode: 'add',
    todo: undefined,
    defaultDate: undefined,
  });

  // 初始化插件数据
  usePluginInitData();

  // 简单的初始化加载状态
  useEffect(() => {
    // 给persist插件一点时间来加载状态
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className='h-screen flex items-center justify-center bg-background'>
        <LoadingSpinner size='lg' />
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col bg-background'>
      {/* 公共工具栏 */}
      <CompactToolbar setTaskDrawer={setTaskDrawer} />

      {/* 视图内容 */}
      <div className='flex-1 overflow-hidden'>
        {viewMode === 'timeline' ? (
          <TimelineView setTaskDrawer={setTaskDrawer} />
        ) : (
          <ListView setTaskDrawer={setTaskDrawer} />
        )}
      </div>

      {/* TaskDrawer */}
      <TaskDrawer
        open={taskDrawer.isOpen}
        onOpenChange={open => {
          if (!open) {
            setTaskDrawer({
              isOpen: false,
              mode: 'add',
              todo: undefined,
              defaultDate: undefined,
            });
          }
        }}
        mode={taskDrawer.mode}
        todo={taskDrawer.todo}
        defaultDate={taskDrawer.defaultDate}
      />
    </div>
  );
}

export default App;
