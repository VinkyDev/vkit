import { createPluginView } from '@vkit/api';
import { builtinPlugins } from './constants';
import { useState } from 'react';
import { SEARCH_HEIGHT } from '@vkit/constants';

export default function App() {
  const [selected, setSelected] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <div className='w-full bg-white/80 backdrop-blur-xl shadow-2xl text-gray-800 transition-all duration-300 ease-in-out'>
      <div
        className='bg-gray-100 px-4 py-3 flex items-center space-x-3 border border-gray-200/80'
        style={{ height: SEARCH_HEIGHT }}
      >
        <div className='w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-sm font-bold text-white shadow-md'>
          V
        </div>
        <input
          type='text'
          placeholder='Hello, vkit! Please enter a keyword'
          className='bg-transparent text-base focus:outline-none w-full placeholder:text-gray-400'
          value={inputValue}
          onChange={e => {
            setInputValue(e.target.value);
          }}
        />
      </div>

      {!selected && (
        <div className='grid grid-cols-6 gap-4 p-4'>
          {builtinPlugins.map(tool => (
            <div
              key={tool.id}
              className='flex flex-col items-center justify-center bg-gray-50/80 p-4 rounded-xl hover:bg-gray-200/80 transition-colors cursor-pointer border border-gray-200/50 shadow-sm'
              onClick={() => {
                createPluginView(tool);
                setSelected(true);
              }}
            >
              <img className='w-8 h-8 mb-2' src={tool.iconUrl} alt={tool.name} />
              <div className='text-xs font-medium text-gray-600'>{tool.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
