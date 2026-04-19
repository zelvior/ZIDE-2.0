import React from 'react';
import { X, FileCode } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabsProps {
  openFiles: string[];
  activeFile: string | null;
  onSelect: (path: string) => void;
  onClose: (path: string) => void;
}

export const Tabs = ({ openFiles, activeFile, onSelect, onClose }: TabsProps) => {
  return (
    <div className="flex h-9 bg-[var(--sidebar-bg)] overflow-x-auto border-b border-[var(--border)]">
      {openFiles.map((path) => {
        const name = path.split('/').pop() || path;
        const isActive = activeFile === path;

        return (
          <div
            key={path}
            onClick={() => onSelect(path)}
            className={cn(
              "flex items-center min-w-[120px] max-w-[200px] px-3 border-r border-[var(--border)] cursor-pointer hover:bg-[var(--active-bg)] transition-colors group relative",
              isActive && "bg-[var(--bg)] border-t-2 border-t-[var(--accent)]"
            )}
          >
            <FileCode size={14} className="mr-2 text-blue-400 opacity-70" />
            <span className={cn("text-xs truncate flex-1", isActive ? "text-[var(--text-bright)]" : "text-gray-500")}>
              {name}
            </span>
            <X
              size={14}
              onClick={(e) => {
                e.stopPropagation();
                onClose(path);
              }}
              className="ml-2 hover:bg-gray-700 rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            />
          </div>
        );
      })}
    </div>
  );
};
