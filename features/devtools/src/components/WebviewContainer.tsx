import React, { useState } from 'react';
import { Code2 } from 'lucide-react';

interface WebviewContainerProps {
  hasWebview: boolean;
  onLoadUrl: (url: string) => void;
}

const WebviewContainer = React.forwardRef<HTMLDivElement, WebviewContainerProps>(
  ({ hasWebview, onLoadUrl }, ref) => {
    const [url, setUrl] = useState('http://localhost:3000');
    const [isLoading, setIsLoading] = useState(false);

    const handleLoad = () => {
      if (!url.trim()) return;

      setIsLoading(true);
      try {
        onLoadUrl(url);
      } finally {
        setIsLoading(false);
      }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleLoad();
      }
    };

    const commonUrls = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:9001',
    ];

    if (hasWebview) {
      return (
        <div ref={ref} className='flex-1 w-full bg-white border border-gray-200'>
          {/* 实际的webview内容由主进程的WebContentsView管理 */}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className='flex-1 w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-8'
      >
        <div className='text-center mb-8'>
          <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg'>
            <Code2 className='w-8 h-8 text-white' />
          </div>
          <h2 className='text-2xl font-bold text-gray-800 mb-2'>开发者工具</h2>
          <p className='text-gray-600'>在应用内调试和查看网页内容</p>
        </div>

        <div className='bg-white rounded-xl shadow-sm p-6 w-full max-w-md'>
          <h3 className='text-lg font-semibold text-gray-800 mb-4'>加载网页</h3>

          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700 mb-2'>网页地址</label>
            <div className='flex space-x-2'>
              <input
                type='url'
                value={url}
                onChange={e => setUrl(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder='输入网页地址...'
                className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                disabled={isLoading}
              />
              <button
                onClick={handleLoad}
                disabled={isLoading || !url.trim()}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  isLoading || !url.trim()
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                }`}
              >
                {isLoading ? (
                  <div className='flex items-center space-x-2'>
                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                    <span>加载中</span>
                  </div>
                ) : (
                  '加载'
                )}
              </button>
            </div>
          </div>

          {/* 常用地址快选 */}
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>常用地址</label>
            <div className='grid grid-cols-2 gap-2'>
              {commonUrls.map(commonUrl => (
                <button
                  key={commonUrl}
                  onClick={() => setUrl(commonUrl)}
                  className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                    url === commonUrl
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                  }`}
                  disabled={isLoading}
                >
                  {commonUrl.split('//')[1]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

WebviewContainer.displayName = 'WebviewContainer';

export default WebviewContainer;
