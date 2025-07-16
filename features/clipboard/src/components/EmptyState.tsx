import { Clipboard } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
}

export function EmptyState({ message = "暂无剪切板内容" }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
        <Clipboard className="w-8 h-8 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground text-sm">{message}</p>
    </div>
  );
} 