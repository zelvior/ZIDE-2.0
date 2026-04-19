import React from 'react';
import { Command, Search, File, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileNode } from '@/src/hooks/useFileSystem';
import Fuse from 'fuse.js';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelect: (path: string) => void;
}

export const CommandPalette = ({ isOpen, onClose, files, onSelect }: CommandPaletteProps) => {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const flattenFiles = React.useMemo(() => {
    const flatten = (nodes: FileNode[]): { name: string; path: string }[] => {
      let result: { name: string; path: string }[] = [];
      nodes.forEach(node => {
        if (node.type === 'file') {
          result.push({ name: node.name, path: node.path });
        } else if (node.children) {
          result = [...result, ...flatten(node.children)];
        }
      });
      return result;
    };
    return flatten(files);
  }, [files]);

  const fuse = React.useMemo(() => new Fuse(flattenFiles, {
    keys: ['name', 'path'],
    threshold: 0.4,
    includeMatches: true
  }), [flattenFiles]);

  const results = React.useMemo(() => {
    if (!query) return flattenFiles.slice(0, 10);
    return fuse.search(query).map(r => r.item).slice(0, 10);
  }, [fuse, query, flattenFiles]);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
    } else if (e.key === 'Enter') {
      if (results[selectedIndex]) {
        onSelect(results[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-2xl bg-[var(--sidebar-bg)] border border-[var(--active-bg)] shadow-2xl rounded-xl overflow-hidden relative"
          >
            <div className="flex items-center px-4 py-3 gap-3 border-b border-[var(--border)]">
              <Search size={18} className="text-gray-500" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search files by name..."
                className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-gray-600"
              />
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-gray-700 text-[10px] text-gray-500 font-bold uppercase">
                ESC
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto py-2">
              {results.length > 0 ? (
                results.map((file, i) => (
                  <div
                    key={file.path}
                    onClick={() => {
                        onSelect(file.path);
                        onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={cn(
                      "px-4 py-2 cursor-pointer flex items-center justify-between group transition-colors",
                      selectedIndex === i ? "bg-[var(--active-bg)]" : "hover:bg-[var(--active-bg)]/50"
                    )}
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File size={16} className={cn(
                        "shrink-0",
                        selectedIndex === i ? "text-[var(--accent)]" : "text-gray-500"
                      )} />
                      <div className="flex flex-col overflow-hidden">
                        <span className={cn(
                          "text-sm font-medium truncate",
                          selectedIndex === i ? "text-white" : "text-gray-300"
                        )}>
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-600 truncate">
                          {file.path}
                        </span>
                      </div>
                    </div>
                    {selectedIndex === i && (
                      <div className="flex items-center gap-2">
                         <span className="text-[10px] text-gray-600 font-bold uppercase">Enter</span>
                         <ChevronRight size={14} className="text-[var(--accent)]" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-gray-500">
                  <Search size={30} className="mx-auto mb-3 opacity-10" />
                  <p className="text-sm">No files found matching "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-[var(--bg)]/50 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                <Command size={10} />
                <span>Search Codebase</span>
              </div>
              <div className="flex items-center gap-4">
                 <div className="flex items-center gap-1">
                   <span className="px-1 py-0.5 rounded border border-gray-700 text-[9px]">↑↓</span>
                   <span className="text-[10px] text-gray-600">to navigate</span>
                 </div>
                 <div className="flex items-center gap-1">
                   <span className="px-1 py-0.5 rounded border border-gray-700 text-[9px]">Enter</span>
                   <span className="text-[10px] text-gray-600">to select</span>
                 </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Helper for App selection (added to ensure cn works if not imported)
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
