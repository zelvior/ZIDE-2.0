import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
}

export function useFileSystem() {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [openFiles, setOpenFiles] = useState<string[]>([]);
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const refreshFiles = useCallback(async () => {
    try {
      const response = await axios.get('/api/files');
      setFileTree(response.data);
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    }
  }, []);

  const readFile = useCallback(async (path: string) => {
    setLoading(true);
    try {
      const response = await axios.post('/api/read', { filePath: path });
      setFileContent(response.data.content);
      setActiveFile(path);
      if (!openFiles.includes(path)) {
        setOpenFiles(prev => [...prev, path]);
      }
    } catch (error) {
      console.error(`Failed to read file ${path}:`, error);
    } finally {
      setLoading(false);
    }
  }, [openFiles]);

  const writeFile = useCallback(async (path: string, content: string) => {
    try {
      await axios.post('/api/write', { filePath: path, content });
    } catch (error) {
      console.error(`Failed to write file ${path}:`, error);
    }
  }, []);

  const closeFile = useCallback((path: string) => {
    setOpenFiles(prev => {
      const next = prev.filter(p => p !== path);
      if (activeFile === path) {
        setActiveFile(next.length > 0 ? next[next.length - 1] : null);
      }
      return next;
    });
  }, [activeFile]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  return {
    fileTree,
    activeFile,
    openFiles,
    fileContent,
    loading,
    refreshFiles,
    readFile,
    writeFile,
    closeFile,
    setActiveFile
  };
}
