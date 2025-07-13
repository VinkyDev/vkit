import React, { useMemo, useState, useRef, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useTodoStore, useTimelineTodos, getTaskStatus } from '../store/useTodoStore';
import { cn } from '@vkit/utils';
import type { MonthGanttTask, Todo } from '../types';

interface DragState {
  isDragging: boolean;
  dragType: 'move' | 'resize-start' | 'resize-end' | null;
  taskId: string | null;
  startX: number;
  originalStartDate: number;
  originalDueDate: number;
  hasMoved: boolean; // 跟踪是否实际发生了移动
}

interface TaskDrawerState {
  isOpen: boolean;
  mode: 'add' | 'edit';
  todo?: Todo;
  defaultDate?: Date;
}

interface TimelineViewProps {
  setTaskDrawer: React.Dispatch<React.SetStateAction<TaskDrawerState>>;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ setTaskDrawer }) => {
  const { todos, timelineStartDate, updateTodo } = useTodoStore();

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragType: null,
    taskId: null,
    startX: 0,
    originalStartDate: 0,
    originalDueDate: 0,
    hasMoved: false,
  });

  const [justFinishedDrag, setJustFinishedDrag] = useState(false);

  const timelineRef = useRef<HTMLDivElement>(null);

  const { scheduledTodos } = useTimelineTodos();

  // 生成月历时间轴数据
  const timelineData = useMemo(() => {
    const start = new Date(timelineStartDate);
    const year = start.getFullYear();
    const month = start.getMonth();

    // 获取月份第一天
    const firstDay = new Date(year, month, 1);

    // 获取第一周开始日期（以周一为开始，可能是上个月的日期）
    const startOfCalendar = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // 周日为6，其他日期减1
    startOfCalendar.setDate(firstDay.getDate() - mondayOffset);

    // 生成6周的日期（42天）
    const dates: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(startOfCalendar);
      date.setDate(startOfCalendar.getDate() + i);
      dates.push(date);
    }

    return { dates, currentMonth: month };
  }, [timelineStartDate]);

  // 将任务映射到月历甘特图
  const taskMapping = useMemo(() => {
    const tasks: MonthGanttTask[] = [];
    const rowAssignments: { [taskId: string]: number } = {};
    let maxRow = 0;

    scheduledTodos.forEach(todo => {
      const taskStart = todo.startDate ?? todo.dueDate!;
      const taskEnd =
        todo.dueDate ??
        (todo.startDate ? taskStart + (todo.duration ?? 1) * 24 * 60 * 60 * 1000 : taskStart);

      // 计算任务跨越的周
      const monthStart = timelineData.dates[0].getTime();
      const dayMs = 24 * 60 * 60 * 1000;

      // 任务的开始和结束在月历中的天数索引
      const startDayIndex = Math.max(0, Math.floor((taskStart - monthStart) / dayMs));
      const endDayIndex = Math.min(41, Math.floor((taskEnd - monthStart) / dayMs));

      if (startDayIndex <= 41 && endDayIndex >= 0) {
        // 确定行号 - 避免任务重叠
        let row = 0;
        const startWeek = Math.floor(startDayIndex / 7);
        const endWeek = Math.floor(endDayIndex / 7);

        // 查找可用的行
        while (true) {
          let hasConflict = false;
          for (let week = startWeek; week <= endWeek; week++) {
            const weekTasksInRow = tasks.filter(t => t.row === row && t.weekIndex === week);
            if (weekTasksInRow.length > 0) {
              hasConflict = true;
              break;
            }
          }
          if (!hasConflict) break;
          row++;
        }

        maxRow = Math.max(maxRow, row);
        rowAssignments[todo.id] = row;

        // 为每个跨越的周创建任务片段
        for (let week = startWeek; week <= endWeek; week++) {
          const weekStartDay = week * 7;
          const weekEndDay = weekStartDay + 6;

          // 计算在当前周内的实际开始和结束天
          const taskWeekStart = Math.max(startDayIndex, weekStartDay);
          const taskWeekEnd = Math.min(endDayIndex, weekEndDay);

          // 在当前周内的位置和宽度
          const weekStartX = ((taskWeekStart % 7) / 7) * 100;
          const weekWidth = ((taskWeekEnd - taskWeekStart + 1) / 7) * 100;

          // 确定圆角样式
          const isFirstSegment = week === startWeek;
          const isLastSegment = week === endWeek;
          const isMultiWeek = endWeek > startWeek;

          tasks.push({
            ...todo,
            startX: weekStartX,
            width: weekWidth,
            row,
            weekIndex: week,
            isMultiWeek,
            weekStartX,
            weekWidth,
            isFirstSegment,
            isLastSegment,
          });
        }
      }
    });

    return { tasks, maxRow };
  }, [scheduledTodos, timelineData.dates]);

  // 根据最大任务行数动态计算周高度
  const WEEK_HEIGHT = useMemo(() => {
    const baseHeight = 40; // 日期数字和基础空间
    const taskHeight = 28; // 每个任务条的高度（包括间距）
    const paddingBottom = 2; // 底部填充
    return baseHeight + (taskMapping.maxRow + 1) * taskHeight + paddingBottom;
  }, [taskMapping.maxRow]);

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === timelineData.currentMonth;
  };

  // 检查指定日期是否有任务
  const hasTasksOnDate = (date: Date) => {
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000 - 1;

    return scheduledTodos.some(todo => {
      const taskStart = todo.startDate ?? todo.dueDate!;
      const taskEnd =
        todo.dueDate ??
        (todo.startDate ? taskStart + (todo.duration ?? 1) * 24 * 60 * 60 * 1000 : taskStart);

      // 检查任务时间范围是否与当前日期重叠
      return taskStart <= endOfDay && taskEnd >= startOfDay;
    });
  };

  // 处理日期点击 - 添加任务
  const handleDateClick = (date: Date) => {
    setTaskDrawer({
      isOpen: true,
      mode: 'add',
      defaultDate: date,
    });
  };

  // 处理任务点击 - 编辑任务
  const handleTaskClick = (task: MonthGanttTask | Todo) => {
    // 如果刚刚完成拖拽，则不处理点击
    if (justFinishedDrag) {
      return;
    }

    setTaskDrawer({
      isOpen: true,
      mode: 'edit',
      todo: task as Todo,
    });
  };

  // 拖拽处理
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, todo: MonthGanttTask, type: 'move' | 'resize-start' | 'resize-end') => {
      e.preventDefault();
      e.stopPropagation();
      setDragState({
        isDragging: true,
        dragType: type,
        taskId: todo.id,
        startX: e.clientX,
        originalStartDate: todo.startDate ?? todo.dueDate!,
        originalDueDate: todo.dueDate ?? todo.startDate!,
        hasMoved: false,
      });
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState.isDragging || !timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const deltaX = e.clientX - dragState.startX;

      // 月视图：每列是一天
      const dayWidth = rect.width / 7;
      const daysDelta = Math.round(deltaX / dayWidth);

      if (daysDelta !== 0) {
        // 标记已发生移动
        if (!dragState.hasMoved) {
          setDragState(prev => ({ ...prev, hasMoved: true }));
        }

        const todo = todos.find(t => t.id === dragState.taskId);
        if (!todo) return;

        let newStartDate = dragState.originalStartDate;
        let newDueDate = dragState.originalDueDate;

        if (dragState.dragType === 'move') {
          const deltaMs = daysDelta * 24 * 60 * 60 * 1000;
          newStartDate = dragState.originalStartDate + deltaMs;
          newDueDate = dragState.originalDueDate + deltaMs;
        } else if (dragState.dragType === 'resize-start') {
          const deltaMs = daysDelta * 24 * 60 * 60 * 1000;
          newStartDate = dragState.originalStartDate + deltaMs;
          if (newStartDate > newDueDate) {
            newStartDate = newDueDate;
          }
        } else if (dragState.dragType === 'resize-end') {
          const deltaMs = daysDelta * 24 * 60 * 60 * 1000;
          newDueDate = dragState.originalDueDate + deltaMs;
          if (newDueDate < newStartDate) {
            newDueDate = newStartDate;
          }
        }

        updateTodo(todo.id, {
          startDate: newStartDate !== dragState.originalStartDate ? newStartDate : todo.startDate,
          dueDate: newDueDate !== dragState.originalDueDate ? newDueDate : todo.dueDate,
        });
      }
    },
    [dragState, todos, updateTodo]
  );

  const handleMouseUp = useCallback(() => {
    const wasDragging = dragState.isDragging;
    const hasMoved = dragState.hasMoved;

    setDragState({
      isDragging: false,
      dragType: null,
      taskId: null,
      startX: 0,
      originalStartDate: 0,
      originalDueDate: 0,
      hasMoved: false,
    });

    // 如果发生了拖拽移动，设置标记防止立即触发click
    if (wasDragging && hasMoved) {
      setJustFinishedDrag(true);
      // 短暂延迟后重置标记
      setTimeout(() => {
        setJustFinishedDrag(false);
      }, 100);
    }
  }, [dragState]);

  // 添加全局鼠标事件监听
  React.useEffect(() => {
    if (dragState.isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  // 根据任务状态获取颜色
  const getTaskColor = (task: Todo) => {
    const status = getTaskStatus(task);
    switch (status) {
      case 'overdue':
        return 'bg-red-500 hover:bg-red-600';
      case 'in-progress':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'not-started':
        return 'bg-gray-500 hover:bg-gray-600';
      case 'completed':
        return 'bg-green-500 hover:bg-green-600';
      default:
        return 'bg-blue-500 hover:bg-blue-600';
    }
  };

  return (
    <div className='h-full flex flex-col'>
      {/* 月历甘特图 */}
      <div className='flex-1 overflow-hidden bg-background'>
        <div className='h-full flex flex-col'>
          {/* 星期标题 */}
          <div className='border-b bg-muted/30 flex sticky top-0 z-20'>
            {['周一', '周二', '周三', '周四', '周五', '周六', '周日'].map(day => (
              <div
                key={day}
                className='flex-1 text-center text-sm font-medium text-muted-foreground p-2 border-r'
              >
                {day}
              </div>
            ))}
          </div>

          {/* 月历甘特图 */}
          <div className='flex-1 overflow-auto'>
            <div ref={timelineRef} className='relative'>
              {/* 背景日期网格 */}
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <div
                  key={weekIndex}
                  className='absolute w-full flex'
                  style={{ top: `${weekIndex * WEEK_HEIGHT}px`, height: `${WEEK_HEIGHT}px` }}
                >
                  {timelineData.dates
                    .slice(weekIndex * 7, (weekIndex + 1) * 7)
                    .map((date, dayIndex) => {
                      const isCurrentMonthDate = isCurrentMonth(date);
                      const isTodayDate = isToday(date);
                      const hasTasksOnThisDate = hasTasksOnDate(date);

                      return (
                        <div
                          key={dayIndex}
                          className={cn(
                            'flex-1 border-r border-b border-border/20 cursor-pointer hover:bg-muted/40 transition-colors relative group',
                            !isCurrentMonthDate && 'opacity-40 bg-muted/10',
                            isTodayDate && 'bg-primary/5'
                          )}
                          onClick={() => handleDateClick(date)}
                        >
                          {/* 日期数字 */}
                          <div
                            className={cn(
                              'absolute top-2 left-2 text-sm font-medium',
                              isTodayDate && 'text-primary font-bold'
                            )}
                          >
                            {date.getDate()}
                          </div>

                          {!hasTasksOnThisDate && (
                            <div className='absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity'>
                              <Plus className='h-4 w-4 text-primary' />
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ))}

              {/* 甘特条 */}
              {taskMapping.tasks.map(task => (
                <div
                  key={`${task.id}-${task.weekIndex}`}
                  className='absolute h-6 flex items-center z-10'
                  style={{
                    top: `${task.weekIndex * WEEK_HEIGHT + 30 + task.row * 28}px`,
                    left: `${task.startX}%`,
                    width: `${Math.max(task.width, 2)}%`,
                  }}
                >
                  <div
                    className={cn(
                      'w-full h-full flex items-center text-white text-xs font-medium cursor-move shadow-sm transition-all hover:shadow-md border border-white/20',
                      task.completed && 'opacity-60 line-through',
                      getTaskColor(task),
                      // 圆角逻辑：根据任务片段位置设置圆角
                      !task.isMultiWeek && 'rounded-sm', // 单周任务：完整圆角
                      task.isMultiWeek &&
                        task.isFirstSegment &&
                        !task.isLastSegment &&
                        'rounded-l-sm', // 多周任务第一段：只有左圆角
                      task.isMultiWeek && !task.isFirstSegment && !task.isLastSegment && '', // 多周任务中间段：无圆角
                      task.isMultiWeek &&
                        !task.isFirstSegment &&
                        task.isLastSegment &&
                        'rounded-r-sm', // 多周任务最后段：只有右圆角
                      task.isMultiWeek && task.isFirstSegment && task.isLastSegment && 'rounded-sm' // 只跨一周但被分割的任务：完整圆角
                    )}
                    onMouseDown={e => handleMouseDown(e, task, 'move')}
                    onClick={() => handleTaskClick(task)}
                  >
                    {/* 左侧调整手柄 */}
                    <div
                      className='absolute left-0 top-0 w-1 h-full bg-black/30 cursor-w-resize hover:bg-black/50 opacity-0 hover:opacity-100 transition-opacity'
                      onMouseDown={e => {
                        e.stopPropagation();
                        handleMouseDown(e, task, 'resize-start');
                      }}
                    />

                    {/* 任务内容 */}
                    <div className='flex-1 px-2 truncate flex items-center gap-1'>
                      <span className='truncate'>{task.name}</span>
                    </div>

                    {/* 右侧调整手柄 */}
                    <div
                      className='absolute right-0 top-0 w-1 h-full bg-black/30 cursor-e-resize hover:bg-black/50 opacity-0 hover:opacity-100 transition-opacity'
                      onMouseDown={e => {
                        e.stopPropagation();
                        handleMouseDown(e, task, 'resize-end');
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
