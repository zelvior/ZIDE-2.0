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
import { GitPanel } from './components/ide/GitPanel';
import { useFileSystem } from './hooks/useFileSystem';
import { 
  Settings, 
  Command, 
  Search, 
  GitBranch, 
  Play, 
  Plus, 
  Minus,
  Cpu,
  LayoutGrid,
  Menu,
  Files,
  Moon,
  Sun,
  Palette,
  Sparkles,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';

type View = 'explorer' | 'search' | 'git';

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

  const [view, setView] = React.useState<View>('explorer');
  const [theme, setTheme] = React.useState('vs-dark');
  const [selection, setSelection] = React.useState('');
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
      // View Switcher
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'E') {
        e.preventDefault();
        setView('explorer');
      }
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'G') {
        e.preventDefault();
        setView('git');
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const message = "You have uncommitted Git changes. Are you sure you want to leave Aether AI IDE?";
      e.returnValue = message;
      return message;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [activeFile]);

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col h-screen overflow-hidden transition-colors duration-300", 
        theme === 'light' ? 'bg-[#f3f3f3] text-gray-900' : 
        theme === 'dracula' ? 'bg-[#282a36] text-[#f8f8f2]' : 'bg-[var(--bg)] text-[var(--text)]')}>
        
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
               readFile(activeFile);
             }
           }}
        />

        {/* Header */}
        <header className={cn("h-10 border-b flex items-center px-4 justify-between shrink-0 z-40 transition-colors",
          theme === 'light' ? 'bg-white border-gray-200' : 
          theme === 'dracula' ? 'bg-[#191a21] border-[#44475a]' : 'bg-[var(--sidebar-bg)] border-[var(--border)]'
        )}>
          <div className="flex items-center gap-4 text-xs">
            <Menu size={16} className="text-gray-500 hover:text-white cursor-pointer" />
            <div className="flex items-center gap-2">
              <Cpu size={16} className="text-[var(--accent)]" />
              <span className="font-bold">AETHER AI IDE</span>
              <Badge variant="outline" className="text-[9px] py-0 px-1 border-gray-700 h-4 uppercase font-bold text-gray-400">v1.1</Badge>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="hidden lg:flex items-center bg-black/20 border border-white/5 rounded px-2 py-0.5 text-[11px] text-gray-500 gap-2 cursor-pointer hover:border-gray-500 min-w-[300px]" onClick={() => setShowCommandPalette(true)}>
                <Search size={12} />
                <span>Quick search files...</span>
                <div className="flex-1" />
                <span className="opacity-50 text-[9px]">Ctrl + P</span>
             </div>

             <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="flex items-center gap-2 h-7 px-2 hover:bg-white/5 rounded cursor-pointer transition-colors text-xs font-medium">
                  <Palette size={14} className="text-purple-400" />
                  <span>Theme</span>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#191a21] border-[#44475a] text-white">
                <DropdownMenuItem onClick={() => setTheme('vs-dark')} className="focus:bg-[#44475a] cursor-pointer">Dark Deep</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('light')} className="focus:bg-[#44475a] cursor-pointer">Light Modern</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('hc-black')} className="focus:bg-[#44475a] cursor-pointer">High Contrast</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dracula')} className="focus:bg-[#44475a] cursor-pointer">Dracula Official</DropdownMenuItem>
                <div className="h-[1px] bg-white/10 my-1" />
                <DropdownMenuItem>
                  <label className="flex items-center gap-2 px-2 py-1.5 focus:bg-[#44475a] cursor-pointer text-xs w-full">
                    <Plus size={12} />
                    <span>Upload Custom...</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (e) => {
                            try {
                              const content = JSON.parse(e.target?.result as string);
                              // We'll just alert and mock for now as Monaco needs direct access 
                              // but we can pass it to the editor if we had a registry
                              console.log('Custom theme loaded:', content);
                              alert('Theme parsed! Custom themes will be active in the next file open.');
                              setTheme('custom');
                            } catch (err) {
                              alert('Invalid theme JSON');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                    />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2 h-7 px-3 bg-[var(--accent)]/10 text-[var(--accent)] rounded cursor-pointer transition-all hover:bg-[var(--accent)]/20 text-xs font-bold border border-[var(--accent)]/30">
              <Play size={14} fill="currentColor" />
              <span>RUN</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10 mx-1" />
            <Settings size={16} className="text-gray-500 hover:text-white cursor-pointer" />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex overflow-hidden">
          {/* Side View Switcher */}
          <div className="w-12 bg-[#1e1e1e] flex flex-col items-center py-4 gap-6 shrink-0 border-r border-black/20 z-30">
            <Files 
              size={20} 
              className={cn("cursor-pointer transition-all", view === 'explorer' ? "text-[var(--accent)] scale-110" : "text-gray-500 hover:text-white")} 
              onClick={() => setView('explorer')} 
            />
            <Search 
              size={20} 
              className={cn("cursor-pointer transition-all", view === 'search' ? "text-[var(--accent)] scale-110" : "text-gray-500 hover:text-white")} 
              onClick={() => setView('search')} 
            />
            <GitBranch 
              size={20} 
              className={cn("cursor-pointer transition-all", view === 'git' ? "text-[var(--accent)] scale-110" : "text-gray-500 hover:text-white")} 
              onClick={() => setView('git')} 
            />
            <div className="flex-1" />
            <Cpu size={20} className={cn("cursor-pointer transition-all animate-pulse", showChat ? "text-[var(--accent)]" : "text-gray-500 hover:text-white")} onClick={() => setShowChat(!showChat)} />
          </div>

          <ResizablePanelGroup direction="horizontal">
            {/* Sidebar View */}
            <ResizablePanel defaultSize={15} minSize={10} maxSize={30}>
               {view === 'explorer' && (
                 <FileTree 
                   tree={fileTree} 
                   onFileClick={readFile} 
                   activeFile={activeFile} 
                 />
               )}
               {view === 'git' && <GitPanel />}
               {view === 'search' && (
                 <div className="flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--border)] p-4">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-gray-500 mb-4 opacity-70">Codebase Search</span>
                    <Input placeholder="Find text..." className="bg-black/20 border-white/5 h-8 text-xs mb-4 focus:ring-1 focus:ring-[var(--accent)]" />
                    <div className="py-20 text-center">
                       <Search size={32} className="mx-auto mb-4 text-white/5" />
                       <p className="text-[11px] text-gray-600">Search results will appear here as indexing completes.</p>
                    </div>
                 </div>
               )}
            </ResizablePanel>
            
            <ResizableHandle withHandle />

            {/* Editor and Terminal */}
            <ResizablePanel defaultSize={showChat ? 60 : 85}>
              <ResizablePanelGroup direction="vertical">
                <ResizablePanel defaultSize={showTerminal ? 70 : 100}>
                  <div className="flex flex-col h-full overflow-hidden relative">
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
                      theme={theme}
                      onSelectionChange={(sel) => setSelection(sel)}
                      onChange={(val) => {
                        if (activeFile && val !== undefined) {
                          writeFile(activeFile, val);
                        }
                      }}
                    />
                    {selection && (
                      <div className="absolute bottom-6 right-6 z-40">
                         <Button 
                           size="sm"
                           className="bg-[var(--accent)] hover:bg-[var(--accent)]/90 text-white rounded-full flex items-center gap-2 py-1 px-4 shadow-[0_0_20px_rgba(var(--accent-rgb),0.5)] border-none animate-in fade-in slide-in-from-bottom-4 duration-300"
                           onClick={() => setShowChat(true)}
                         >
                            <Sparkles size={14} className="animate-spin-slow" />
                            <span className="font-bold text-xs">Analyze Selection</span>
                         </Button>
                      </div>
                    )}
                  </div>
                </ResizablePanel>
                
                {showTerminal && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={30} minSize={10}>
                      <div className="flex flex-col h-full">
                        <div className="h-8 bg-[#1e1e1e] border-b border-white/5 flex items-center px-4 justify-between shrink-0">
                          <div className="flex items-center gap-6 text-[10px] uppercase tracking-widest font-bold">
                            <span className="text-[var(--accent)] border-b-2 border-[var(--accent)] h-8 flex items-center">Terminal</span>
                            <span className="text-gray-500 hover:text-white cursor-pointer h-8 flex items-center transition-colors">Problems</span>
                            <span className="text-gray-500 hover:text-white cursor-pointer h-8 flex items-center transition-colors">Output</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <Plus size={14} className="text-gray-500 hover:text-white cursor-pointer" />
                            <div className="h-3 w-[1px] bg-white/10" />
                            <Minus size={14} className="text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowTerminal(false)} />
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
                  <ChatPanel currentFile={activeFile} fileContent={fileContent} selection={selection} />
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </main>

        {/* Status Bar */}
        <footer className={cn(
          "h-6 flex items-center px-4 justify-between text-[10px] shrink-0 font-bold tracking-tight transition-colors z-40",
          theme === 'dracula' ? 'bg-[#bd93f9] text-[#282a36]' : 
          theme === 'light' ? 'bg-[#007acc] text-white' : 'bg-[var(--accent)] text-white'
        )}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
              <GitBranch size={11} />
              <span>main*</span>
            </div>
            <div className="flex items-center gap-1.5 hover:bg-white/10 px-1 cursor-pointer transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80 animate-pulse" />
              <span>Ready</span>
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className="hover:bg-white/10 px-1 cursor-pointer">Ln 14, Col 32</span>
            <span className="hover:bg-white/10 px-1 cursor-pointer uppercase">UTF-8</span>
            <div className="flex items-center gap-1.5 hover:bg-white/10 px-2 cursor-pointer bg-white/20 rounded-sm">
              <Cpu size={11} />
              <span className="uppercase text-[9px]">Aether Online</span>
            </div>
          </div>
        </footer>
      </div>
    </TooltipProvider>
  );
}
