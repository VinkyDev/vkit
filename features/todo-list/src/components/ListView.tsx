import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Circle, AlertTriangle, ArrowRight, Flag } from 'lucide-react';
import { useTodoStore, useTasksByStatus } from '../store/useTodoStore';
import { formatDateDisplay } from '@vkit/utils';
import { cn } from '@vkit/utils';
import type { Todo } from '../types';
import { EmptyState } from './EmptyState';
import { ScrollArea } from './ui/scroll-area';

interface TaskDrawerState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  todo?: Todo;
  defaultDate?: Date;
}

interface TodoItemProps {
  todo: Todo;
  onClick: (todo: Todo) => void;
}

const priorityColors = {
  low: 'text-green-600 bg-green-50 border-green-200',
  medium: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  high: 'text-red-600 bg-red-50 border-red-200',
};

const TodoItem: React.FC<TodoItemProps> = ({ todo, onClick }) => {
  const { updateTodo } = useTodoStore();

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止触发行点击事件
    updateTodo(todo.id, { completed: !todo.completed });
  };

  const handleRowClick = () => {
    onClick(todo);
  };

  const dueDateDisplay = formatDateDisplay(todo.dueDate);

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 border rounded-lg transition-colors cursor-pointer group',
        todo.completed
          ? 'bg-white/15 border-gray-200'
          : 'bg-white/20 border-gray-200 hover:bg-white/40'
      )}
      onClick={handleRowClick}
    >
      <button onClick={handleToggleComplete} className='flex-shrink-0'>
        {todo.completed ? (
          <CheckCircle2 className='w-4 h-4 text-green-600' />
        ) : (
          <Circle className='w-4 h-4 text-gray-400 hover:text-blue-600' />
        )}
      </button>

      <div className='flex-1 min-w-0'>
        <div className='flex items-center gap-3'>
          <div
            className={cn(
              'text-sm font-medium',
              todo.completed ? 'line-through text-gray-500' : 'text-gray-900'
            )}
          >
            {todo.name}
          </div>

          <div className='flex items-center gap-2'>
            {todo.dueDate && (
              <span className={cn('text-xs', dueDateDisplay?.color)}>{dueDateDisplay?.text}</span>
            )}

            {todo.priority !== 'medium' && (
              <Badge
                variant='outline'
                className={cn('text-xs px-1 py-0', priorityColors[todo.priority])}
              >
                <Flag className='w-3 h-3 mr-1' />
                {todo.priority === 'low' ? '低' : '高'}
              </Badge>
            )}
          </div>
        </div>

        {/* 描述在hover时显示 */}
        {todo.description && (
          <div className='mt-1'>
            <div className='text-xs text-gray-500 truncate'>{todo.description}</div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TaskSectionProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  todos: Todo[];
  color: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onTodoClick: (todo: Todo) => void;
}

const TaskSection: React.FC<TaskSectionProps> = ({
  title,
  icon,
  count,
  todos,
  color,
  isCollapsed = false,
  onToggleCollapse,
  onTodoClick,
}) => {
  if (count === 0) return null;

  return (
    <div className='space-y-2'>
      <button
        onClick={onToggleCollapse}
        className='flex items-center gap-2 w-full text-left p-2 rounded-lg hover:bg-white/40 transition-colors group'
      >
        <div className={cn('p-1.5 rounded-md', color)}>{icon}</div>
        <div className='flex-1'>
          <h3 className='font-medium text-sm text-gray-900'>{title}</h3>
        </div>
        <Badge variant='secondary' className='text-xs'>
          {count}
        </Badge>
        <div
          className={cn(
            'transition-transform duration-200',
            isCollapsed ? '-rotate-90' : 'rotate-0'
          )}
        >
          <ArrowRight className='w-4 h-4 text-gray-400' />
        </div>
      </button>

      {!isCollapsed && (
        <div className='space-y-1 pl-3'>
          {todos.map(todo => (
            <div key={todo.id}>
              <TodoItem todo={todo} onClick={onTodoClick} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface ListViewProps {
  setTaskDrawer: React.Dispatch<React.SetStateAction<TaskDrawerState>>;
}

export const ListView: React.FC<ListViewProps> = ({ setTaskDrawer }) => {
  const tasksByStatus = useTasksByStatus();
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

  const toggleSection = (section: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(section)) {
      newCollapsed.delete(section);
    } else {
      newCollapsed.add(section);
    }
    setCollapsedSections(newCollapsed);
  };

  const handleTodoClick = (todo: Todo) => {
    setTaskDrawer({
      isOpen: true,
      mode: 'edit',
      todo: todo,
    });
  };

  const totalTasks =
    tasksByStatus.overdue.length +
    tasksByStatus.inProgress.length +
    tasksByStatus.notStarted.length +
    tasksByStatus.completed.length;

  if (totalTasks === 0) {
    return <EmptyState />;
  }

  return (
    <ScrollArea className='h-full'>
      <div className='p-4 space-y-4'>
        <TaskSection
          title='逾期任务'
          icon={<AlertTriangle className='w-5 h-5 text-white' />}
          count={tasksByStatus.overdue.length}
          todos={tasksByStatus.overdue}
          color='bg-red-500'
          isCollapsed={collapsedSections.has('overdue')}
          onToggleCollapse={() => toggleSection('overdue')}
          onTodoClick={handleTodoClick}
        />

        <TaskSection
          title='进行中'
          icon={<Circle className='w-5 h-5 text-white' />}
          count={tasksByStatus.inProgress.length}
          todos={tasksByStatus.inProgress}
          color='bg-blue-500'
          isCollapsed={collapsedSections.has('inProgress')}
          onToggleCollapse={() => toggleSection('inProgress')}
          onTodoClick={handleTodoClick}
        />

        <TaskSection
          title='未开始'
          icon={<Circle className='w-5 h-5 text-white' />}
          count={tasksByStatus.notStarted.length}
          todos={tasksByStatus.notStarted}
          color='bg-gray-500'
          isCollapsed={collapsedSections.has('notStarted')}
          onToggleCollapse={() => toggleSection('notStarted')}
          onTodoClick={handleTodoClick}
        />

        <TaskSection
          title='已完成'
          icon={<CheckCircle2 className='w-5 h-5 text-white' />}
          count={tasksByStatus.completed.length}
          todos={tasksByStatus.completed}
          color='bg-green-500'
          isCollapsed={collapsedSections.has('completed')}
          onToggleCollapse={() => toggleSection('completed')}
          onTodoClick={handleTodoClick}
        />
      </div>
    </ScrollArea>
  );
};
