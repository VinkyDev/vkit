import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { CalendarIcon, Save, X, Trash2 } from 'lucide-react';
import { useTodoStore, getTaskStatus } from '../store/useTodoStore';
import { formatDate } from '@vkit/utils';
import { cn } from '@vkit/utils';
import type { Todo } from '../types';

interface TaskDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  todo?: Todo;
  defaultDate?: Date;
}

interface TaskFormData {
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  startDate?: number;
  dueDate?: number;
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({
  open,
  onOpenChange,
  mode,
  todo,
  defaultDate,
}) => {
  const { addTodo, updateTodo, deleteTodo, toggleTodo, todos } = useTodoStore();

  // 任务状态文字映射
  const statusLabels = {
    overdue: '逾期',
    'in-progress': '进行中',
    'not-started': '未开始',
    completed: '已完成',
  };

  const [formData, setFormData] = useState<TaskFormData>({
    name: '',
    description: '',
    priority: 'medium',
    startDate: undefined,
    dueDate: undefined,
  });

  // 确认删除弹窗状态
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentTodo = mode === 'edit' && todo ? (todos.find(t => t.id === todo.id) ?? todo) : todo;

  // 重置表单数据
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && currentTodo) {
        setFormData({
          name: currentTodo.name,
          description: currentTodo.description ?? '',
          priority: currentTodo.priority,
          startDate: currentTodo.startDate,
          dueDate: currentTodo.dueDate,
        });
      } else if (mode === 'add') {
        const defaultDateTime = defaultDate ? defaultDate.getTime() : Date.now();
        setFormData({
          name: '',
          description: '',
          priority: 'medium',
          startDate: defaultDateTime,
          dueDate: defaultDateTime,
        });
      }
    }
  }, [open, mode, currentTodo, defaultDate]);

  const handleSave = () => {
    if (!formData.name.trim()) return;

    if (mode === 'add') {
      addTodo(
        formData.name.trim(),
        formData.priority,
        formData.description || undefined,
        formData.dueDate,
        formData.startDate
      );
    } else if (mode === 'edit' && currentTodo) {
      updateTodo(currentTodo.id, {
        name: formData.name.trim(),
        description: formData.description || undefined,
        priority: formData.priority,
        startDate: formData.startDate,
        dueDate: formData.dueDate,
      });
    }

    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (mode === 'edit' && currentTodo) {
      deleteTodo(currentTodo.id);
      onOpenChange(false);
    }
    setShowDeleteConfirm(false);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleToggleComplete = () => {
    if (mode === 'edit' && currentTodo) {
      toggleTodo(currentTodo.id);
    }
  };

  const updateFormData = (field: keyof TaskFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 获取当前任务状态和状态文字 - 使用最新的currentTodo
  const currentStatus = currentTodo ? getTaskStatus(currentTodo) : null;
  const statusText = currentStatus ? statusLabels[currentStatus] : '';

  return (
    <Drawer direction='right' open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader className='flex-row items-center justify-between'>
          <DrawerTitle className='flex items-center gap-2'>
            {mode === 'add' ? (
              '添加任务'
            ) : (
              <>
                <Checkbox
                  checked={currentTodo?.completed ?? false}
                  onCheckedChange={handleToggleComplete}
                />
                {statusText}
              </>
            )}
          </DrawerTitle>
          <Select
            value={formData.priority}
            onValueChange={(value: 'low' | 'medium' | 'high') => updateFormData('priority', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='low'>低优先级</SelectItem>
              <SelectItem value='medium'>中优先级</SelectItem>
              <SelectItem value='high'>高优先级</SelectItem>
            </SelectContent>
          </Select>
        </DrawerHeader>

        <div className='px-4 space-y-4'>
          {/* 任务名称 */}
          <div>
            <label className='text-sm font-medium'>任务名称</label>
            <Input
              className='mt-2'
              value={formData.name}
              onChange={e => updateFormData('name', e.target.value)}
              placeholder='输入任务名称'
              autoFocus
            />
          </div>

          {/* 描述 */}
          <div>
            <label className='text-sm font-medium'>描述</label>
            <Textarea
              value={formData.description}
              onChange={e => updateFormData('description', e.target.value)}
              placeholder='输入任务描述（可选）'
              rows={2}
              className='max-h-[84px] mt-2'
            />
          </div>

          {/* 开始日期和截止日期 */}
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className='text-sm font-medium'>开始日期</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal mt-2',
                      !formData.startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {formData.startDate ? formatDate(formData.startDate) : '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={date => updateFormData('startDate', date?.getTime())}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className='text-sm font-medium'>截止日期</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant='outline'
                    className={cn(
                      'w-full justify-start text-left font-normal mt-2',
                      !formData.dueDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className='mr-2 h-4 w-4' />
                    {formData.dueDate ? formatDate(formData.dueDate) : '选择日期'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={formData.dueDate ? new Date(formData.dueDate) : undefined}
                    onSelect={date => updateFormData('dueDate', date?.getTime())}
                    autoFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        <DrawerFooter>
          <div className='flex gap-2 w-full'>
            <Button onClick={handleSave} disabled={!formData.name.trim()} className='flex-1'>
              <Save className='w-4 h-4 mr-2' />
              {mode === 'add' ? '添加' : '保存'}
            </Button>
            {mode === 'edit' && (
              <Popover open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <PopoverTrigger asChild>
                  <Button variant='destructive' onClick={handleDelete}>
                    <Trash2 className='w-4 h-4 mr-2' />
                    删除
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-80'>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <h4 className='font-medium leading-none'>确认删除</h4>
                      <p className='text-sm text-muted-foreground'>
                        确定要删除任务 "{currentTodo?.name}" 吗？此操作无法撤销。
                      </p>
                    </div>
                    <div className='flex gap-2'>
                      <Button
                        variant='destructive'
                        onClick={confirmDelete}
                        size='sm'
                        className='flex-1'
                      >
                        确认删除
                      </Button>
                      <Button variant='outline' onClick={cancelDelete} size='sm' className='flex-1'>
                        取消
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            <Button variant='outline' onClick={handleCancel} className='flex-1'>
              <X className='w-4 h-4 mr-2' />
              取消
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
