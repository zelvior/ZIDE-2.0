import React from 'react';
import { Command, Search, File, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileNode } from '@/src/hooks/useFileSystem';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  files: FileNode[];
  onSelect: (path: string) => void;
}

export const CommandPalette = ({ isOpen, onClose, files, onSelect }: CommandPaletteProps) => {
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  const flattenFiles = (nodes: FileNode[]): { name: string; path: string }[] => {
    let result: { name: string; path: string }[] = [];
    nodes.forEach(node => {
      if (node.type === 'file') {
        result.push({ name: node.name, path: node.path });
      } else if (node.children) {
        result = [...result, ...flattenFiles(node.children)];
      }
    });
    return result;
  };

  const allFiles = flattenFiles(files);
  const filteredFiles = allFiles.filter(f => 
    f.name.toLowerCase().includes(query.toLowerCase()) || 
    f.path.toLowerCase().includes(query.toLowerCase())
  ).slice(0, 10);

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
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search files by name..."
                className="flex-1 bg-transparent border-none outline-none text-base text-white placeholder:text-gray-600"
              />
              <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-gray-700 text-[10px] text-gray-500 font-bold uppercase">
                ESC
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto py-2">
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file, i) => (
                  <div
                    key={i}
                    onClick={() => {
                        onSelect(file.path);
                        onClose();
                    }}
                    className="px-4 py-2 hover:bg-[var(--active-bg)] cursor-pointer flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <File size={16} className="text-gray-500 group-hover:text-[var(--accent)] shrink-0" />
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-gray-300 group-hover:text-white truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-gray-600 truncate">
                          {file.path}
                        </span>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                ))
              ) : (
                <div className="px-4 py-10 text-center text-gray-500">
                  <File size={30} className="mx-auto mb-3 opacity-10" />
                  <p className="text-sm">No files found matching "{query}"</p>
                </div>
              )}
            </div>

            <div className="px-4 py-2 bg-[var(--bg)]/50 border-t border-[var(--border)] flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold uppercase">
                <Command size={10} />
                <span>Quick Actions</span>
              </div>
              <div className="flex items-center gap-4">
                 <span className="text-[10px] text-gray-600">↑↓ to navigate</span>
                 <span className="text-[10px] text-gray-600">Enter to select</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
