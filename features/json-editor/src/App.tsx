import { useState, useRef } from 'react';
import JSONEditor, { type JSONEditorRef } from './components/JSONEditor';
import { PLUGIN_VIEW_HEIGHT } from '@vkit/constants';

function App() {
  const [jsonValue, setJsonValue] = useState('{}');

  const editorRef = useRef<JSONEditorRef>(null);

  return (
    <main style={{ height: PLUGIN_VIEW_HEIGHT }}>
      <JSONEditor ref={editorRef} value={jsonValue} onChange={setJsonValue} />
    </main>
  );
}

export default App;
