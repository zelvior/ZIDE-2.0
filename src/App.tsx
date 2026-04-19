/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  ResizableHandle, 
  ResizablePanel, 
  ResizablePanelGroup 
} from "@/components/ui/resizable";
import { TooltipProvider } from "@/components/ui/tooltip";
import { FileTree } from './components/ide/FileTree';
import { CodeEditor } from './components/ide/CodeEditor';
import { ChatPanel } from './components/ide/ChatPanel';
import { TerminalPanel } from './components/ide/TerminalPanel';
import { Tabs } from './components/ide/Tabs';
import { InlineAI } from './components/ide/InlineAI';
import { CommandPalette } from './components/ide/CommandPalette';
import { useFileSystem } from './hooks/useFileSystem';
import { 
  Settings, 
  Command, 
  Search, 
  GitBranch, 
  Play, 
  Plus, 
  Cpu,
  LayoutGrid,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function App() {
  const { 
    fileTree, 
    activeFile, 
    openFiles, 
    fileContent, 
    readFile, 
    writeFile, 
    closeFile, 
    setActiveFile 
  } = useFileSystem();

  const [showChat, setShowChat] = React.useState(true);
  const [showTerminal, setShowTerminal] = React.useState(true);
  const [showCommandPalette, setShowCommandPalette] = React.useState(false);
  const [showInlineAI, setShowInlineAI] = React.useState(false);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // AI Chat (Ctrl+L)
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setShowChat(prev => !prev);
      }
      // Inline AI Edit (Ctrl+K or Ctrl+I)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'i')) {
        e.preventDefault();
        if (activeFile) setShowInlineAI(true);
      }
      // Command Palette (Ctrl+P)
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      // Terminal (Ctrl+J)
      if ((e.ctrlKey || e.metaKey) && e.key === 'j') {
        e.preventDefault();
        setShowTerminal(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeFile]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen overflow-hidden text-[var(--text)]">
        {/* Modals */}
        <CommandPalette 
          isOpen={showCommandPalette} 
          onClose={() => setShowCommandPalette(false)} 
          files={fileTree} 
          onSelect={readFile} 
        />
        <InlineAI 
           isOpen={showInlineAI} 
           onClose={() => setShowInlineAI(false)} 
           fileName={activeFile || ''} 
           currentCode={fileContent} 
           onApply={(newCode) => {
             if (activeFile) {
               writeFile(activeFile, newCode);
               // Force reload local content as well
               readFile(activeFile);
             }
           }}
        />

        {/* Header */}
        <header className="h-10 bg-[var(--sidebar-bg)] border-b border-[var(--border)] flex items-center px-4 justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Menu size={16} className="text-gray-500 hover:text-white cursor-pointer" />
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-[var(--accent)]" />
              <span className="font-bold text-xs">AETHER AI IDE</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-gray-700 h-4 uppercase font-bold text-gray-400">Preview v1.0</Badge>
            </div>
            <nav className="hidden md:flex items-center gap-4 text-xs text-gray-500 ml-4 font-medium">
              <span className="hover:text-[var(--text-bright)] cursor-pointer">File</span>
              <span className="hover:text-[var(--text-bright)] cursor-pointer">Edit</span>
              <span className="hover:text-[var(--text-bright)] cursor-pointer">Selection</span>
              <span className="hover:text-[var(--text-bright)] cursor-pointer">View</span>
              <span className="hover:text-[var(--text-bright)] cursor-pointer">Terminal</span>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-[var(--bg)] border border-[var(--border)] rounded px-2 py-0.5 text-[11px] text-gray-500 gap-2 cursor-pointer hover:border-gray-500">
              <Search size={12} />
              <span>Search codebase...</span>
              <span className="opacity-50 ml-4">Ctrl + P</span>
            </div>
            <div className="flex items-center gap-2 h-7 px-2 hover:bg-[var(--active-bg)] rounded cursor-pointer transition-colors">
              <Play size={14} className="text-green-500" />
              <span className="text-xs font-medium">Run</span>
            </div>
            <div className="h-4 w-[1px] bg-[var(--border)] mx-1" />
            <Settings size={16} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Side View Switcher */}
          <div className="w-12 bg-[#333333] flex flex-col items-center py-4 gap-6 shrink-0 border-r border-black/20">
            <LayoutGrid size={22} className="text-[var(--text-bright)] cursor-pointer" />
            <Search size={22} className="text-gray-500 hover:text-white cursor-pointer" />
            <GitBranch size={22} className="text-gray-500 hover:text-white cursor-pointer" />
            <div className="flex-1" />
            <Cpu size={22} className={cn("cursor-pointer", showChat ? "text-[var(--accent)]" : "text-gray-500 hover:text-white")} onClick={() => setShowChat(!showChat)} />
            <Settings size={22} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>

          <ResizablePanelGroup direction="horizontal">
            {/* File Explorer */}
            <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
              <FileTree 
                tree={fileTree} 
                onFileClick={readFile} 
                activeFile={activeFile} 
              />
            </ResizablePanel>
            
            <ResizableHandle withHandle />

            {/* Editor and Terminal */}
            <ResizablePanel defaultSize={showChat ? 60 : 85}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                  <div className="flex flex-col h-full overflow-hidden">
                    <Tabs 
                      openFiles={openFiles} 
                      activeFile={activeFile} 
                      onSelect={readFile} 
                      onClose={closeFile} 
                    />
                    <CodeEditor 
                      content={fileContent} 
                      path={activeFile} 
                      language="typescript"
                      onChange={(val) => {
                        if (activeFile && val !== undefined) {
                          writeFile(activeFile, val);
                        }
                      }}
                    />
                  </div>
                </ResizablePanel>
                
                {showTerminal && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={10}>
                      <div className="flex flex-col h-full">
                        <div className="h-8 bg-[var(--sidebar-bg)] border-b border-[var(--border)] flex items-center px-4 justify-between">
                          <div className="flex items-center gap-4 text-[11px] uppercase tracking-wider font-bold">
                            <span className="text-white border-b border-white py-1">Terminal</span>
                            <span className="text-gray-500 hover:text-white cursor-pointer">Output</span>
                            <span className="text-gray-500 hover:text-white cursor-pointer">Debug Console</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Plus size={14} className="text-gray-500 hover:text-white cursor-pointer" />
                            <Plus size={14} className="text-gray-500 hover:text-white cursor-pointer transform rotate-45" onClick={() => setShowTerminal(false)} />
                          </div>
                        </div>
                        <TerminalPanel />
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>

            {showChat && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
                  <ChatPanel currentFile={activeFile} fileContent={fileContent} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>

        {/* Status Bar */}
        <footer className="h-6 bg-[var(--accent)] text-white flex items-center px-3 justify-between text-[11px] shrink-0 font-medium">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer">
              <GitBranch size={12} />
              <span>main*</span>
            </div>
            <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer">
              <span className="w-2 h-2 rounded-full bg-white opacity-80 animate-pulse" />
              <span>Synched</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hover:bg-white/10 px-1 cursor-pointer">Ln 1, Col 1</div>
            <div className="hover:bg-white/10 px-1 cursor-pointer">Spaces: 2</div>
            <div className="hover:bg-white/10 px-1 cursor-pointer">UTF-8</div>
            <div className="hover:bg-white/10 px-1 cursor-pointer">TypeScript JSX</div>
            <div className="flex items-center gap-1 hover:bg-white/10 px-1 cursor-pointer bg-white/20">
              <Cpu size={12} />
              <span>Aether: Online</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
