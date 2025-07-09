import { useEffect, useState } from 'react';
import { onPluginInitData, removePluginInitDataListener, type IPluginInitData } from '@vkit/api';

/**
 * 获取插件初始化数据的hook
 * 
 * @returns 初始化数据对象
 * 
 * @example
 * ```tsx
 * function MyPlugin() {
 *   const initData = usePluginInitData();
 * 
 *   useEffect(() => {
 *     if (initData?.initialValue) {
 *       console.log('收到初始值:', initData.initialValue);
 *     }
 *   }, [initData]);
 * 
 *   return <div>插件内容</div>;
 * }
 * ```
 */
export function usePluginInitData() {
  const [initData, setInitData] = useState<IPluginInitData | null>(null);

  useEffect(() => {
    // 监听初始化数据
    onPluginInitData((data) => {
      setInitData(data);
    });

    // 清理监听器
    return () => {
      removePluginInitDataListener();
    };
  }, []);

  return initData;
} 