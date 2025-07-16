import { FileText, Image, Heart, List } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type FilterType = 'all' | 'text' | 'image' | 'favorites';

interface FilterTabsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts: {
    all: number;
    text: number;
    image: number;
    favorites: number;
  };
}

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  const filters = [
    { id: 'all' as const, label: '全部', icon: List, count: counts.all },
    { id: 'text' as const, label: '文本', icon: FileText, count: counts.text },
    { id: 'image' as const, label: '图片', icon: Image, count: counts.image },
    { id: 'favorites' as const, label: '收藏', icon: Heart, count: counts.favorites },
  ];

  return (
    <Tabs value={activeFilter} onValueChange={(value) => onFilterChange(value as FilterType)}>
      <TabsList className="grid w-full grid-cols-4">
        {filters.map((filter) => {
          const Icon = filter.icon;
          
          return (
            <TabsTrigger
              key={filter.id}
              value={filter.id}
              className="text-xs"
            >
              <Icon className="w-3 h-3 mr-1" />
              {filter.label}
              <span className="ml-1 text-muted-foreground">
                ({filter.count})
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
} 