import { useState } from 'react';
import { Heart, Edit2, Trash2, Copy, Image, FileText, Check } from 'lucide-react';
import type { IClipboardEntry } from '@vkit/api';
import { deleteClipboardHistory, toggleClipboardFavorite, updateClipboardHistory } from '@vkit/api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface ClipboardItemProps {
  item: IClipboardEntry;
  onUpdate: () => void;
}

export function ClipboardItemRender({ item, onUpdate }: ClipboardItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(item.content);
  const [copied, setCopied] = useState(false);
  const handleToggleFavorite = async () => {
    const result = await toggleClipboardFavorite(item.id);
    if (result.success) {
      onUpdate();
    }
  };

  const handleDelete = async () => {
    const result = await deleteClipboardHistory(item.id);
    if (result.success) {
      onUpdate();
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      const result = await updateClipboardHistory(item.id, editContent);
      if (result.success) {
        onUpdate();
        setIsEditing(false);
      }
    } else {
      setIsEditing(true);
    }
  };

  const handleCopy = async () => {
    if (item.type === 'image') {
      const [mimePart, dataPart] = item.content.split(',');
      const mimeMatch = mimePart.match(/data:(.*);base64/);
      const mimeType = mimeMatch?.[1] ?? 'image/png';

      const binary = atob(dataPart);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: mimeType });
      const clipboardItem = new ClipboardItem({ [mimeType]: blob });
      await navigator.clipboard.write([clipboardItem]);
    } else {
      await navigator.clipboard.writeText(item.content);
    }
    setCopied(true);
    toast.success('已复制到剪切板');
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  const formatTime = (createdAt: number) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return `${Math.floor(diff / 86400000)} 天前`;
  };

  const getTypeIcon = () => {
    switch (item.type) {
      case 'image':
        return <Image className='w-3 h-3' />;
      default:
        return <FileText className='w-3 h-3' />;
    }
  };

  const getPreviewContent = () => {
    if (item.type === 'image') {
      return (
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          <img src={item.content} alt='图片内容' className='max-h-40 object-contain' />
        </div>
      );
    }

    return (
      <div className='text-sm break-all'>
        {isEditing ? (
          <Textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            className='w-full p-2 border rounded-md max-h-40 resize-none'
            rows={4}
            autoFocus
            onBlur={() => setTimeout(handleEdit, 100)}
            onKeyDown={e => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleEdit();
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditContent(item.content);
              }
            }}
          />
        ) : (
          <span className='line-clamp-5'>{item.content}</span>
        )}
      </div>
    );
  };

  return (
    <Card className='p-3 hover:shadow-sm transition-shadow bg-white/40'>
      <div className='flex-1 min-w-0'>
        <div className='flex items-center justify-between gap-2 mb-2'>
          <div className='flex items-center gap-2'>
            <Badge variant='secondary' className='h-5 px-2 text-xs bg-black/5'>
              {getTypeIcon()}
              <span className='ml-1 capitalize'>{item.type === 'text' ? '文本' : '图片'}</span>
            </Badge>
            <span className='text-xs text-muted-foreground'>{formatTime(item.createdAt)}</span>
          </div>
          <div className='flex items-center gap-1'>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0 relative'
                    onClick={handleCopy}
                  >
                    <Copy
                      className={`h-4 w-4 transition-all duration-300 ${
                        copied ? 'scale-0' : 'scale-100'
                      }`}
                    />
                    <Check
                      className={`absolute inset-0 m-auto h-4 w-4 transition-all duration-300 ${
                        copied ? 'scale-100' : 'scale-0'
                      }`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>复制</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant='ghost'
                    size='sm'
                    className='h-7 w-7 p-0'
                    onClick={handleToggleFavorite}
                  >
                    <Heart
                      className={`w-3 h-3 ${item.favorite ? 'text-red-500 fill-current' : ''}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{item.favorite ? '取消收藏' : '收藏'}</p>
                </TooltipContent>
              </Tooltip>

              {item.type === 'text' && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-7 w-7 p-0 relative'
                      onClick={handleEdit}
                    >
                      <Check
                        className={`w-3 h-3 absolute inset-0 m-auto transition-all duration-300 ${
                          isEditing ? 'scale-100' : 'scale-0'
                        }`}
                      />
                      <Edit2
                        className={`w-3 h-3 absolute inset-0 m-auto transition-all duration-300 ${
                          isEditing ? 'scale-0' : 'scale-100'
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{isEditing ? '保存' : '编辑'}</p>
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant='ghost' size='sm' className='h-7 w-7 p-0' onClick={handleDelete}>
                    <Trash2 className='w-3 h-3' />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>删除</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {getPreviewContent()}
      </div>
    </Card>
  );
}
