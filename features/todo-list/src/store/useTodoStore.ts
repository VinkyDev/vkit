import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getStoreValue, setStoreValue } from '@vkit/api';
import type { Todo, TodoStore, TasksByStatus, TaskStatus } from '../types';
import { generateId, filterTodos } from '../utils';

const STORAGE_KEY = 'todo-list';

// 存储适配器
const vkitStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const result = await getStoreValue({ key: name });
    return result.success && result.data ? JSON.stringify(result.data) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    const data: unknown = JSON.parse(value);
    await setStoreValue({
      key: name,
      value: data,
      sync: true,
    });
  },
  removeItem: async (name: string): Promise<void> => {
    await setStoreValue({
      key: name,
      value: null,
      sync: true,
    });
  },
};

// 获取当前月的开始和结束日期
const getMonthRange = () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  return { start: start.getTime(), end: end.getTime() };
};

// 默认状态
const defaultState = {
  todos: [],
  searchTerm: '',
  viewMode: 'timeline' as const,
  timelineStartDate: getMonthRange().start,
  timelineEndDate: getMonthRange().end,
  statusFilters: ['overdue', 'in-progress', 'not-started', 'completed'] as TaskStatus[],
};

// 任务状态分类函数
export const getTaskStatus = (todo: Todo): TaskStatus => {
  if (todo.completed) {
    return 'completed';
  }

  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStart = today.getTime();

  // 检查是否逾期
  if (todo.dueDate && todo.dueDate < todayStart) {
    return 'overdue';
  }

  // 检查是否已开始
  if (todo.startDate && todo.startDate <= now) {
    return 'in-progress';
  }

  // 如果只有截止日期，且截止日期是今天或以后，认为是进行中
  if (!todo.startDate && todo.dueDate && todo.dueDate >= todayStart) {
    return 'in-progress';
  }

  // 如果有开始日期但还未开始
  if (todo.startDate && todo.startDate > now) {
    return 'not-started';
  }

  // 没有日期的任务默认为进行中
  return 'in-progress';
};

export const useTodoStore = create<TodoStore>()(
  persist(
    (set, get) => ({
      ...defaultState,

      addTodo: (
        name: string,
        priority = 'medium',
        description?: string,
        dueDate?: number,
        startDate?: number,
        duration?: number
      ) => {
        if (!name.trim()) return;

        // 如果没有传递日期，则默认为当天
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayTimestamp = today.getTime();

        const newTodo: Todo = {
          id: generateId(),
          name: name.trim(),
          description,
          completed: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          priority,
          dueDate: dueDate ?? todayTimestamp,
          startDate: startDate ?? todayTimestamp,
          duration,
        };

        set(state => {
          const newTodos = [newTodo, ...state.todos];

          return {
            todos: newTodos,
          };
        });
      },

      updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => {
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === id ? { ...todo, ...updates, updatedAt: Date.now() } : todo
          ),
        }));
      },

      deleteTodo: (id: string) => {
        set(state => ({
          todos: state.todos.filter(todo => todo.id !== id),
        }));
      },

      toggleTodo: (id: string) => {
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed, updatedAt: Date.now() } : todo
          ),
        }));
      },

      clearCompleted: () => {
        set(state => ({
          todos: state.todos.filter(todo => !todo.completed),
        }));
      },

      toggleAll: () => {
        const { todos } = get();
        const hasActiveItems = todos.some(todo => !todo.completed);

        set(state => ({
          todos: state.todos.map(todo => ({
            ...todo,
            completed: hasActiveItems,
            updatedAt: Date.now(),
          })),
        }));
      },

      setSearchTerm: searchTerm => {
        set({ searchTerm });
      },

      setViewMode: viewMode => {
        set({ viewMode });
      },

      setTimelineStartDate: timelineStartDate => {
        set({ timelineStartDate });
      },

      setTimelineEndDate: timelineEndDate => {
        set({ timelineEndDate });
      },

      setStatusFilters: statusFilters => {
        set({ statusFilters });
      },

      toggleStatusFilter: status => {
        set(state => {
          const currentFilters = state.statusFilters;
          const isSelected = currentFilters.includes(status);

          if (isSelected) {
            // 移除筛选
            return {
              statusFilters: currentFilters.filter(filter => filter !== status),
            };
          } else {
            // 添加筛选
            return {
              statusFilters: [...currentFilters, status],
            };
          }
        });
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => vkitStorage),
      partialize: state => ({
        todos: state.todos,
        searchTerm: state.searchTerm,
        viewMode: state.viewMode,
        timelineStartDate: state.timelineStartDate,
        timelineEndDate: state.timelineEndDate,
        statusFilters: state.statusFilters,
      }),
    }
  )
);

// 过滤任务
export const useFilteredTodos = () => {
  const { todos, searchTerm, statusFilters } = useTodoStore();

  // 先根据搜索词筛选
  let filteredTodos = filterTodos(todos, searchTerm);

  // 再根据状态筛选
  if (statusFilters.length > 0) {
    filteredTodos = filteredTodos.filter(todo => {
      const status = getTaskStatus(todo);
      return statusFilters.includes(status);
    });
  }

  return filteredTodos;
};

// 过滤任务计数
export const useFilterCounts = () => {
  const { todos } = useTodoStore();
  return {
    all: todos.length,
    active: todos.filter(todo => !todo.completed).length,
    completed: todos.filter(todo => todo.completed).length,
  };
};

// 按状态分组的任务
export const useTasksByStatus = (): TasksByStatus => {
  const filteredTodos = useFilteredTodos();

  const tasksByStatus: TasksByStatus = {
    overdue: [],
    inProgress: [],
    notStarted: [],
    completed: [],
  };

  filteredTodos.forEach(todo => {
    const status = getTaskStatus(todo);
    switch (status) {
      case 'overdue':
        tasksByStatus.overdue.push(todo);
        break;
      case 'in-progress':
        tasksByStatus.inProgress.push(todo);
        break;
      case 'not-started':
        tasksByStatus.notStarted.push(todo);
        break;
      case 'completed':
        tasksByStatus.completed.push(todo);
        break;
    }
  });

  return tasksByStatus;
};

// 拓扑图视图任务数据
export const useTimelineTodos = () => {
  const { timelineStartDate } = useTodoStore();

  // 使用已经筛选过的任务（包含搜索和状态筛选）
  const filteredTodos = useFilteredTodos();

  // 分类任务：有日期的和无日期的
  const allScheduledTodos = filteredTodos.filter(todo => todo.startDate ?? todo.dueDate);
  const unscheduledTodos = filteredTodos.filter(todo => !todo.startDate && !todo.dueDate);

  // 月视图：生成月历的完整日期范围（6周42天）
  const monthStart = new Date(timelineStartDate);
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();

  // 获取月份第一天
  const firstDay = new Date(year, month, 1);

  // 获取月历显示的开始日期（可能是上个月的日期）
  const calendarStart = new Date(firstDay);
  calendarStart.setDate(firstDay.getDate() - firstDay.getDay());

  // 获取月历显示的结束日期（42天后）
  const calendarEnd = new Date(calendarStart);
  calendarEnd.setDate(calendarStart.getDate() + 41);
  calendarEnd.setHours(23, 59, 59, 999); // 设置为当天的最后一刻

  const calendarStartMs = calendarStart.getTime();
  const calendarEndMs = calendarEnd.getTime();

  // 在时间范围内的任务
  const visibleTodos = allScheduledTodos.filter(todo => {
    const taskStart = todo.startDate ?? todo.dueDate!;
    const taskEnd =
      todo.dueDate ??
      (todo.startDate ? taskStart + (todo.duration ?? 1) * 24 * 60 * 60 * 1000 : taskStart);

    // 检查任务是否与月历显示范围有重叠
    return taskEnd >= calendarStartMs && taskStart <= calendarEndMs;
  });

  return {
    scheduledTodos: visibleTodos, // 在当前时间范围内可见的任务
    unscheduledTodos,
    totalScheduled: allScheduledTodos.length,
    totalUnscheduled: unscheduledTodos.length,
    allScheduledTodos, // 所有有日期的任务
  };
};
