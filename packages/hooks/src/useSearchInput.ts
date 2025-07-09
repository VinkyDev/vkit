import { useEffect, useState } from 'react';
import { 
  onSearchInputChange, 
  onSearchInputEnter, 
  removeSearchInputListeners,
  type ISearchInputChangeEvent,
  type ISearchInputEnterEvent 
} from '@vkit/api';

export interface UseSearchInputOptions {
  /**
   * 输入框内容变化时的回调
   */
  onChange?: (event: ISearchInputChangeEvent) => void;
  
  /**
   * 按回车键时的回调
   */
  onEnter?: (event: ISearchInputEnterEvent) => void;
  
  /**
   * 是否自动保存当前输入值到state
   * @default true
   */
  trackValue?: boolean;
}

export interface UseSearchInputReturn {
  /**
   * 当前搜索输入框的值
   */
  value: string;
  
  /**
   * 是否有输入内容
   */
  hasValue: boolean;
  
  /**
   * 清空状态值（不影响实际输入框）
   */
  clearValue: () => void;
}

/**
 * 监听主应用搜索输入框变化的hook
 * 
 * @param options 配置选项
 * @returns 搜索输入状态和方法
 * 
 * @example
 * ```tsx
 * function MyPlugin() {
 *   const { value, hasValue } = useSearchInput({
 *     onChange: (event) => {
 *       console.log('输入内容变化:', event.value);
 *     },
 *     onEnter: (event) => {
 *       console.log('用户按下回车:', event.value);
 *       // 执行搜索或其他操作
 *     }
 *   });
 * 
 *   return (
 *     <div>
 *       {hasValue && <p>搜索内容: {value}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useSearchInput(options: UseSearchInputOptions = {}): UseSearchInputReturn {
  const { onChange, onEnter, trackValue = true } = options;
  const [value, setValue] = useState<string>('');

  useEffect(() => {
    // 监听输入框内容变化
    onSearchInputChange((event) => {
      if (trackValue) {
        setValue(event.value);
      }
      onChange?.(event);
    });

    // 监听回车事件
    onSearchInputEnter((event) => {
      onEnter?.(event);
    });

    // 清理监听器
    return () => {
      removeSearchInputListeners();
    };
  }, [onChange, onEnter, trackValue]);

  const clearValue = () => {
    setValue('');
  };

  return {
    value,
    hasValue: Boolean(value.trim()),
    clearValue,
  };
} 