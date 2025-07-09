import { useState, useCallback } from 'react';
import { createWebview, destroyWebview, reloadWebview, toggleWebviewDevTools } from '@vkit/api';
import WebviewContainer from './components/WebviewContainer';
import Toolbar from './components/Toolbar';
import { PLUGIN_VIEW_HEIGHT, SEARCH_HEIGHT, TOOLBAR_HEIGHT, WINDOW_WIDTH } from '@vkit/constants';

function App() {
  const [webviewCreated, setWebviewCreated] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const [devToolsEnabled, setDevToolsEnabled] = useState(false);

  const handleLoadUrl = useCallback(
    async (url: string) => {
      // 如果已有webview，先销毁
      if (webviewCreated) {
        await destroyWebview();
        setWebviewCreated(false);
      }

      // 创建新的webview
      const result = await createWebview({
        url,
        bounds: {
          x: 0,
          y: SEARCH_HEIGHT,
          width: WINDOW_WIDTH,
          height: PLUGIN_VIEW_HEIGHT - TOOLBAR_HEIGHT,
        },
        options: {
          webSecurity: false,
        },
        visible: true,
      });

      if (result.success) {
        setWebviewCreated(true);
        setCurrentUrl(url);
        setDevToolsEnabled(false); // 重置开发者工具状态
      } else {
        throw new Error(result.error ?? 'Failed to create webview');
      }
    },
    [webviewCreated]
  );

  const handleCloseWebview = useCallback(async () => {
    if (webviewCreated) {
      await destroyWebview();
      setWebviewCreated(false);
      setCurrentUrl('');
      setDevToolsEnabled(false);
    }
  }, [webviewCreated]);

  const handleDevToolsToggle = useCallback(async () => {
    if (!webviewCreated) return;

    const newState = !devToolsEnabled;
    setDevToolsEnabled(newState);

    try {
      await toggleWebviewDevTools({
        enabled: newState,
        mode: 'detach',
      });
    } catch {
      setDevToolsEnabled(!newState);
    }
  }, [webviewCreated, devToolsEnabled]);

  const handleRefresh = useCallback(async () => {
    if (!webviewCreated) return;
    await reloadWebview({ ignoreCache: true });
  }, [webviewCreated]);

  return (
    <div className='h-full w-full flex flex-col bg-gray-50'>
      <WebviewContainer hasWebview={webviewCreated} onLoadUrl={handleLoadUrl} />

      {webviewCreated && (
        <Toolbar
          currentUrl={currentUrl}
          devToolsEnabled={devToolsEnabled}
          onDevToolsToggle={handleDevToolsToggle}
          onRefresh={handleRefresh}
          onClose={handleCloseWebview}
        />
      )}
    </div>
  );
}

export default App;
