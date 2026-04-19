import React from 'react';
import Editor, { OnMount } from '@monaco-editor/react';

interface CodeEditorProps {
  content: string;
  language: string;
  path: string | null;
  theme: string;
  onChange: (value: string | undefined) => void;
  onSelectionChange: (selection: string) => void;
}

export const CodeEditor = ({ content, language, path, theme, onChange, onSelectionChange }: CodeEditorProps) => {
  const editorRef = React.useRef<any>(null);

  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorSelection((e: any) => {
      const model = editor.getModel();
      if (model && e.selection) {
        const selectionText = model.getValueInRange(e.selection);
        onSelectionChange(selectionText);
      }
    });

    // Custom theme definition if needed
    if (theme === 'dracula') {
      monaco.editor.defineTheme('dracula', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'comment', foreground: '6272a4' },
          { token: 'keyword', foreground: 'ff79c6' },
          { token: 'number', foreground: 'bd93f9' },
          { token: 'string', foreground: 'f1fa8c' },
          { token: 'type', foreground: '8be9fd' },
        ],
        colors: {
          'editor.background': '#282a36',
          'editor.foreground': '#f8f8f2',
          'editorLineNumber.foreground': '#6272a4',
          'editorCursor.foreground': '#f8f8f2',
          'editor.selectionBackground': '#44475a',
        }
      });
    }
  };

  if (!path) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg)] text-gray-500">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 opacity-20 border-2 border-dashed border-gray-500 rounded-2xl flex items-center justify-center animate-pulse">
             <div className="w-10 h-10 bg-gray-500 rounded-lg" />
          </div>
          <h2 className="text-2xl font-bold mb-2 tracking-tight">Aether AI IDE</h2>
          <p className="text-sm opacity-60">Open a repository or file to start building.</p>
          <div className="mt-8 grid grid-cols-2 gap-4 max-w-sm mx-auto text-[11px] font-bold uppercase tracking-widest">
            <div className="p-3 bg-[var(--active-bg)] rounded-lg hover:border-[var(--accent)] border border-transparent transition-all cursor-pointer">
               New File
            </div>
            <div className="p-3 bg-[var(--active-bg)] rounded-lg hover:border-[var(--accent)] border border-transparent transition-all cursor-pointer">
               Open Folder
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map file extensions to Monaco languages
  const getLanguage = (path: string) => {
    const ext = path.split('.').pop();
    switch (ext) {
      case 'ts':
      case 'tsx': return 'typescript';
      case 'js':
      case 'jsx': return 'javascript';
      case 'css': return 'css';
      case 'html': return 'html';
      case 'json': return 'json';
      case 'md': return 'markdown';
      case 'py': return 'python';
      case 'cpp': return 'cpp';
      case 'go': return 'go';
      case 'rs': return 'rust';
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden relative">
      <Editor
        height="100%"
        language={getLanguage(path)}
        value={content}
        theme={theme}
        onMount={handleEditorMount}
        onChange={onChange}
        options={{
          fontSize: 14,
          fontFamily: 'JetBrains Mono',
          minimap: { enabled: true },
          scrollBeyondLastLine: false,
          smoothScrolling: true,
          cursorSmoothCaretAnimation: "on",
          padding: { top: 16 },
          roundedSelection: true,
          bracketPairColorization: { enabled: true },
          formatOnPaste: true,
          formatOnType: true,
          tabSize: 2,
          automaticLayout: true,
        }}
      />
    </div>
  );
};
