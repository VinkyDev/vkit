import { Search, Lock, Code, Palette, Globe, Leaf, FileJson, Compass } from 'lucide-react';

const tools = [
  { icon: <Leaf size={24} />, label: 'Relax' },
  { icon: <Compass size={24} />, label: 'excalidraw' },
  { icon: <Code size={24} />, label: 'ip' },
  { icon: <Search size={24} />, label: 'find' },
  { icon: <Lock size={24} />, label: 'Passwords' },
  { icon: <FileJson size={24} />, label: 'Json' },
  { icon: <Palette size={24} />, label: 'Color' },
  { icon: <Globe size={24} />, label: 'network' },
];

export default function App() {
  return (
    <div className='w-full rounded-2xl bg-gradient-to-b from-[#0f1120] to-[#0c0e1a] p-4 shadow-2xl text-white space-y-4'>
      <div className='rounded-xl bg-[#1e2235] px-4 py-2 flex items-center space-x-2'>
        <div className='w-6 h-6 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm font-bold'>
          V
        </div>
        <input
          type='text'
          placeholder='Hello, Rubick! Please enter a keyword'
          className='bg-transparent text-sm focus:outline-none w-full'
        />
      </div>

      <div className='grid grid-cols-4 gap-4'>
        {tools.map(tool => (
          <div
            key={tool.label}
            className='flex flex-col items-center justify-center bg-[#1a1c2b] p-3 rounded-xl hover:bg-[#2a2d44] transition-colors'
          >
            <div className='mb-1 text-blue-300'>{tool.icon}</div>
            <div className='text-xs'>{tool.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
