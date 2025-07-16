import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PopconfirmProps {
  children: React.ReactNode; // 触发元素
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function Popconfirm({
  children,
  title = '确认操作',
  description,
  onConfirm,
  onCancel,
}: PopconfirmProps) {
  const [open, setOpen] = useState(false);

  const handleConfirm = () => {
    onConfirm();
    setOpen(false);
  };

  const handleCancel = () => {
    onCancel?.();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className='w-[220px] space-y-2 bg-gray-100 mr-2'>
        <p className='text-sm font-medium'>{title}</p>
        {description && <p className='text-sm text-muted-foreground'>{description}</p>}
        <div className='flex justify-end gap-2 pt-2'>
          <Button variant='ghost' size='sm' onClick={handleCancel}>
            取消
          </Button>
          <Button variant='destructive' size='sm' onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
