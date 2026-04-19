import React from 'react';
import { FileNode } from '@/src/hooks/useFileSystem';
import { ChevronRight, ChevronDown, File, Folder, MoreVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FileTreeProps {
  tree: FileNode[];
  onFileClick: (path: string) => void;
  activeFile: string | null;
}

interface FileItemProps {
  key?: React.Key;
  node: FileNode;
  level: number;
  onFileClick: (path: string) => void;
  activeFile: string | null;
}

const FileItem = ({ node, level, onFileClick, activeFile }: FileItemProps) => {
  const [isOpen, setIsOpen] = React.useState(true);
  const isSelected = activeFile === node.path;

  if (node.type === 'directory') {
    return (
      <div className="select-none">
        <div 
          className={cn(
            "flex items-center py-1 px-2 hover:bg-[var(--active-bg)] cursor-pointer group",
            isSelected && "bg-[var(--active-bg)]"
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <ChevronDown size={14} className="mr-1" /> : <ChevronRight size={14} className="mr-1" />}
          <Folder size={14} className="mr-2 text-blue-400 fill-blue-400/20" />
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {isOpen && node.children?.map((child, i) => (
          <FileItem key={child.path} node={child} level={level + 1} onFileClick={onFileClick} activeFile={activeFile} />
        ))}
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex items-center py-1 px-2 hover:bg-[var(--active-bg)] cursor-pointer group",
        isSelected && "bg-[var(--active-bg)] text-[var(--accent)] border-l-2 border-[var(--accent)]"
      )}
      style={{ paddingLeft: `${level * 12 + 22}px` }}
      onClick={() => onFileClick(node.path)}
    >
      <File size={14} className="mr-2 text-gray-400" />
      <span className={cn("text-sm truncate", isSelected && "text-[var(--text-bright)]")}>{node.name}</span>
    </div>
  );
};

export const FileTree = ({ tree, onFileClick, activeFile }: FileTreeProps) => {
  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--border)]">
      <div className="px-4 py-2 flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-gray-500">
        <span>Explorer</span>
        <MoreVertical size={14} className="cursor-pointer hover:text-white" />
      </div>
      <ScrollArea className="flex-1">
        <div className="py-2">
          {tree.map((node) => (
            <FileItem key={node.path} node={node} level={0} onFileClick={onFileClick} activeFile={activeFile} />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
