import { useState, useRef } from 'react';
import JSONEditor, { type JSONEditorRef } from './components/JSONEditor';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  const editorRef = useRef<JSONEditorRef>(null);

  return (
    <main className='max-w-4xl mx-auto px-4 py-6'>
      <JSONEditor ref={editorRef} value={jsonValue} onChange={setJsonValue} height='500px' />
    </main>
  );
}

export default App;
