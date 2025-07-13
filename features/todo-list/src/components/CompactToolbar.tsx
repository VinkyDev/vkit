import React, { Fragment } from 'react';
import {
  Search,
  Calendar,
  List,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Filter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTodoStore } from '../store/useTodoStore';
import type { Todo, TaskStatus } from '../types';

interface TaskDrawerState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  todo?: Todo;
  defaultDate?: Date;
}

interface CompactToolbarProps {
  setTaskDrawer: React.Dispatch<React.SetStateAction<TaskDrawerState>>;
}

export const CompactToolbar: React.FC<CompactToolbarProps> = ({ setTaskDrawer }) => {
  const {
    searchTerm,
    setSearchTerm,
    viewMode,
    setViewMode,
    timelineStartDate,
    setTimelineStartDate,
    setTimelineEndDate,
    statusFilters,
    toggleStatusFilter,
  } = useTodoStore();

  // 任务状态选项
  const statusOptions: { status: TaskStatus; label: string }[] = [
    { status: 'overdue', label: '逾期' },
    { status: 'in-progress', label: '进行中' },
    { status: 'not-started', label: '未开始' },
    { status: 'completed', label: '已完成' },
  ];

  // Timeline视图的导航功能
  const navigatePeriod = (direction: 'prev' | 'next') => {
    const current = new Date(timelineStartDate);
    current.setMonth(current.getMonth() + (direction === 'prev' ? -1 : 1));

    const start = new Date(current.getFullYear(), current.getMonth(), 1);
    const end = new Date(current.getFullYear(), current.getMonth() + 1, 0);

    setTimelineStartDate(start.getTime());
    setTimelineEndDate(end.getTime());
  };

  const goToToday = () => {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    setTimelineStartDate(start.getTime());
    setTimelineEndDate(end.getTime());
  };

  const getCurrentPeriodTitle = () => {
    const start = new Date(timelineStartDate);
    return start.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long' });
  };

  return (
    <div className='border-b bg-background transition-all duration-200'>
      <div className='flex items-center justify-between p-2'>
        <div className='flex items-center gap-3'>
          {/* 添加任务按钮 */}
          <Button
            size='sm'
            onClick={() =>
              setTaskDrawer({
                isOpen: true,
                mode: 'add',
                defaultDate: new Date(),
              })
            }
            className='gap-1'
          >
            <Plus className='h-4 w-4' />
            添加任务
          </Button>

          {/* Timeline视图特有的控制元素 */}
          {viewMode === 'timeline' && (
            <Fragment>
              <div className='h-4 w-px bg-border mx-1' />
              <Button variant='outline' size='sm' onClick={() => navigatePeriod('prev')}>
                <ChevronLeft className='h-4 w-4' />
              </Button>
              <h2 className='text-lg font-semibold'>{getCurrentPeriodTitle()}</h2>
              <Button variant='outline' size='sm' onClick={() => navigatePeriod('next')}>
                <ChevronRight className='h-4 w-4' />
              </Button>
              <Button variant='outline' size='sm' onClick={goToToday}>
                <RotateCcw className='h-4 w-4' />
              </Button>
            </Fragment>
          )}
        </div>

        <div className='flex items-center gap-3'>
          {/* 搜索框 */}
          <div className='relative max-w-xs'>
            <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground' />
            <Input
              placeholder='搜索任务...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='h-8 pl-7 text-sm transition-all duration-200 focus:ring-2 w-48'
            />
          </div>

          {/* 筛选按钮 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='outline' size='sm' className='h-8 gap-1'>
                <Filter className='h-3 w-3' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='w-40'>
              <DropdownMenuLabel>任务状态</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {statusOptions.map(option => (
                <div key={option.status} className='flex items-center space-x-2 px-2 py-1.5'>
                  <Checkbox
                    id={option.status}
                    checked={statusFilters.includes(option.status)}
                    onCheckedChange={() => toggleStatusFilter(option.status)}
                  />
                  <label
                    htmlFor={option.status}
                    className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer'
                  >
                    {option.label}
                  </label>
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className='h-4 w-px bg-border' />

          {/* 视图切换按钮 */}
          {viewMode === 'list' ? (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode('timeline')}
              className='gap-1 h-8 transition-all duration-200 hover:scale-105'
            >
              <Calendar className='h-4 w-4' />
              图表
            </Button>
          ) : (
            <Button
              variant='outline'
              size='sm'
              onClick={() => setViewMode('list')}
              className='gap-1 h-8 transition-all duration-200 hover:scale-105'
            >
              <List className='h-4 w-4' />
              列表
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
