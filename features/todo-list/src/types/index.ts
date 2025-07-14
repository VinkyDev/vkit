export interface Todo {
  id: string;
  name: string;
  description?: string;
  completed: boolean;
  createdAt: number;
  updatedAt: number;
  priority: 'low' | 'medium' | 'high';
  dueDate?: number;
  startDate?: number;
  duration?: number; // 任务持续时间（天数）
}

export type ViewMode = 'list' | 'timeline';

export interface TodoState {
  todos: Todo[];
  searchTerm: string;
  viewMode: ViewMode;
  timelineStartDate: number; // 时间轴开始日期
  timelineEndDate: number; // 时间轴结束日期
  statusFilters: TaskStatus[]; // 筛选的任务状态
}

export interface TodoActions {

  addTodo: (name: string, priority?: Todo['priority'], description?: string, dueDate?: number, startDate?: number, duration?: number) => void;
  updateTodo: (id: string, updates: Partial<Omit<Todo, 'id' | 'createdAt'>>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  
  clearCompleted: () => void;
  toggleAll: () => void;
  
  setSearchTerm: (term: string) => void;
  
  setViewMode: (mode: ViewMode) => void;
  setTimelineStartDate: (date: number) => void;
  setTimelineEndDate: (date: number) => void;
  setStatusFilters: (filters: TaskStatus[]) => void;
  toggleStatusFilter: (status: TaskStatus) => void;
}

export type TodoStore = TodoState & TodoActions;

export interface FilterCounts {
  all: number;
  active: number;
  completed: number;
}

export interface QuickAddData {
  mode: 'quick-add';
  task: string;
  description?: string;
}

export interface TimelineDay {
  date: Date;
  isToday: boolean;
  isWeekend: boolean;
  todos: Todo[];
}

export interface TimelineWeek {
  startDate: Date;
  endDate: Date;
  days: TimelineDay[];
}

// 只保留月视图相关的类型
export interface MonthGanttTask extends Todo {
  startX: number;
  width: number;
  row: number;
  weekIndex: number; // 第几周
  isMultiWeek: boolean; // 是否跨周
  weekStartX: number; // 在当前周内的起始位置
  weekWidth: number; // 在当前周内的宽度
  isFirstSegment: boolean; // 是否为多周任务的第一个片段
  isLastSegment: boolean; // 是否为多周任务的最后一个片段
}

// 新的任务状态分类
export type TaskStatus = 'overdue' | 'in-progress' | 'not-started' | 'completed';

export interface TasksByStatus {
  overdue: Todo[];
  inProgress: Todo[];
  notStarted: Todo[];
  completed: Todo[];
} 