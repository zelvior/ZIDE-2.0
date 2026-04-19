import React from 'react';
import Editor from '@monaco-editor/react';

interface CodeEditorProps {
  content: string;
  language: string;
  path: string | null;
  onChange: (value: string | undefined) => void;
}

export const CodeEditor = ({ content, language, path, onChange }: CodeEditorProps) => {
  if (!path) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[var(--bg)] text-gray-500">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Aether AI IDE</h2>
          <p>Open a file to start coding</p>
          <div className="mt-4 text-sm opacity-50">
            <p>Ctrl + P to search files</p>
            <p>Ctrl + L for AI Assist</p>
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
      default: return 'plaintext';
    }
  };

  return (
    <div className="flex-1 h-full overflow-hidden">
      <Editor
        height="100%"
        language={getLanguage(path)}
        value={content}
        theme="vs-dark"
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
        }}
      />
    </div>
  );
};
