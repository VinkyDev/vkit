import React from 'react';
import { CheckCircle, Search, Filter } from 'lucide-react';
import { useTodoStore } from '../store/useTodoStore';
import { Button } from './ui/button';

export const EmptyState: React.FC = () => {
  const { todos, searchTerm, setSearchTerm, statusFilters, setStatusFilters } = useTodoStore();

  const hasAnyTodos = todos.length > 0;
  const hasActiveFilters = searchTerm || statusFilters.length < 4;

  const handleClearFilters = () => {
    setSearchTerm('');
    setStatusFilters(['overdue', 'in-progress', 'not-started', 'completed']);
  };

  if (!hasAnyTodos) {
    // 完全没有任务
    return (
      <div className=' p-12 text-center'>
        <div className='mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
          <CheckCircle className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>暂无任务</h3>
        <p className='text-gray-500 mb-6'>开始添加您的第一个任务吧！</p>
      </div>
    );
  }

  if (hasActiveFilters) {
    return (
      <div className='p-12 text-center'>
        <div className='mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4'>
          <Search className='w-8 h-8' />
        </div>
        <h3 className='text-lg font-medium text-gray-900 mb-2'>没有匹配的任务</h3>
        <p className='text-gray-500 mb-6'>{searchTerm && `没有包含 "${searchTerm}" 的任务`}</p>
        <Button onClick={handleClearFilters}>
          <Filter className='w-4 h-4 mr-2' />
          清除过滤器
        </Button>
      </div>
    );
  }

  return (
    <div className='p-12 text-center'>
      <div className='mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
        <CheckCircle className='w-8 h-8' />
      </div>
      <h3 className='text-lg font-medium text-gray-900 mb-2'>空空如也</h3>
      <p className='text-gray-500'>这里什么都没有</p>
    </div>
  );
};
