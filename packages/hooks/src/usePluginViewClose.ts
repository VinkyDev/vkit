import { useEffect } from 'react';
import { onPluginViewClosed, removePluginViewClosedListener } from '@vkit/api';

/**
 * 监听插件视图关闭事件的Hook
 *
 * @param onClose 插件视图关闭时的回调函数
 *
 * @example
 * ```typescript
 * function App() {
 *   const [selectedPlugin, setSelectedPlugin] = useState(null);
 *
 *   // 监听插件视图关闭事件
 *   usePluginViewClose(() => {
 *     setSelectedPlugin(null);
 *   });
 *
 *   return <div>...</div>;
 * }
 * ```
 */
export const usePluginViewClose = (callback: () => void): void => {
  useEffect(() => {
    onPluginViewClosed(callback);

    return () => {
      removePluginViewClosedListener();
    };
  }, [callback]);
};
