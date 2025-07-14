import { useEffect, useState } from 'react';
import { getPluginInitData } from '@vkit/api';
import { useTodoStore } from '../store/useTodoStore';
import type { QuickAddData } from '../types';

/**
 * 监听插件初始化数据的 hook
 */
export const usePluginInitData = () => {
  const [initData, setInitData] = useState<QuickAddData | null>(null);
  const addTodo = useTodoStore(state => state.addTodo);

  useEffect(() => {
    const context = getPluginInitData() as QuickAddData | null;
    setInitData(context);
    // 如果是快速添加模式，直接添加任务
    if (context?.mode === 'quick-add' && context?.task) {
      addTodo(context.task, 'medium', context.description);
    }
  }, [addTodo]);

  return initData;
};
