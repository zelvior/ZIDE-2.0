import React from 'react';
import { 
  GitBranch, 
  RotateCw, 
  History, 
  Check, 
  X, 
  Plus, 
  Archive,
  Layers,
  Trash2
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import axios from 'axios';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface GitFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
}

interface GitBranchInfo {
  name: string;
  current: boolean;
}

interface GitStash {
  id: string;
  message: string;
}

export const GitPanel = () => {
  const [changedFiles, setChangedFiles] = React.useState<GitFile[]>([]);
  const [branches, setBranches] = React.useState<GitBranchInfo[]>([]);
  const [stashes, setStashes] = React.useState<GitStash[]>([]);
  const [commitMessage, setCommitMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [gitHistory, setGitHistory] = React.useState<any[]>([]);
  const [view, setView] = React.useState<'changes' | 'history' | 'branches' | 'stash'>('changes');
  const [selectedDiff, setSelectedDiff] = React.useState<string | null>(null);

  const fetchStatus = React.useCallback(async () => {
    try {
      const res = await axios.post('/api/git', { command: 'status --porcelain' });
      if (res.data.code === 0) {
        const lines = res.data.output.trim().split('\n').filter(Boolean);
        const files: GitFile[] = lines.map((line: string) => {
          const statusChar = line.substring(0, 2).trim();
          const path = line.substring(3);
          let status: GitFile['status'] = 'modified';
          if (statusChar === '??') status = 'untracked';
          if (statusChar === 'A') status = 'added';
          if (statusChar === 'D') status = 'deleted';
          return { path, status };
        });
        setChangedFiles(files);
      }
    } catch (err) {
      console.error('Git status error:', err);
    }
  }, []);

  const fetchBranches = React.useCallback(async () => {
    try {
      const res = await axios.post('/api/git', { command: 'branch' });
      if (res.data.code === 0) {
        const lines = res.data.output.trim().split('\n').filter(Boolean);
        setBranches(lines.map(line => ({
          name: line.replace('*', '').trim(),
          current: line.startsWith('*')
        })));
      }
    } catch (err) {
      console.error('Git branch error:', err);
    }
  }, []);

  const fetchStashes = React.useCallback(async () => {
    try {
      const res = await axios.post('/api/git', { command: 'stash list' });
      if (res.data.code === 0) {
        const lines = res.data.output.trim().split('\n').filter(Boolean);
        setStashes(lines.map(l => {
          const [idStr, ...msg] = l.split(': ');
          return { id: idStr.trim(), message: msg.join(': ').trim() };
        }));
      }
    } catch (err) {
      console.error('Git stash error:', err);
    }
  }, []);

  const fetchDiff = async (path: string) => {
    try {
      setLoading(true);
      const res = await axios.post('/api/git', { command: `diff ${path}` });
      setSelectedDiff(res.data.output || 'No changes to display.');
    } catch (err) {
      console.error('Diff error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = React.useCallback(async () => {
    try {
      const res = await axios.post('/api/git', { command: 'log --oneline -n 10' });
      if (res.data.code === 0) {
        const lines = res.data.output.trim().split('\n').filter(Boolean);
        setGitHistory(lines.map((l: string) => {
           const [hash, ...msg] = l.split(' ');
           return { hash, message: msg.join(' ') };
        }));
      }
    } catch (err) {
      console.error('Git history error:', err);
    }
  }, []);

  React.useEffect(() => {
    fetchStatus();
    fetchHistory();
    fetchBranches();
    fetchStashes();
  }, [fetchStatus, fetchHistory, fetchBranches, fetchStashes, view]);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    setLoading(true);
    try {
      await axios.post('/api/git', { command: 'add .' });
      const res = await axios.post('/api/git', { command: `commit -m "${commitMessage}"` });
      if (res.data.code === 0) {
        setCommitMessage('');
        fetchStatus();
        fetchHistory();
      }
    } catch (err) {
      console.error('Commit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStash = async () => {
    setLoading(true);
    try {
      await axios.post('/api/git', { command: 'stash' });
      fetchStatus();
      fetchStashes();
    } catch (err) {
      console.error('Stash error:', err);
    } finally {
      setLoading(false);
    }
  };

  const applyStash = async (id: string) => {
    setLoading(true);
    try {
      const index = id.includes('{') ? id.split('{')[1].split('}')[0] : '0';
      await axios.post('/api/git', { command: `stash apply ${index}` });
      fetchStatus();
    } catch (err) {
      console.error('Stash apply error:', err);
    } finally {
      setLoading(false);
    }
  };

  const switchBranch = async (name: string) => {
    setLoading(true);
    try {
      await axios.post('/api/git', { command: `checkout ${name}` });
      fetchStatus();
      fetchBranches();
    } catch (err) {
      console.error('Branch switch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const createBranch = async () => {
    const name = prompt('New branch name:');
    if (!name) return;
    setLoading(true);
    try {
      await axios.post('/api/git', { command: `checkout -b ${name}` });
      fetchBranches();
    } catch (err) {
      console.error('Branch create error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async () => {
    setLoading(true);
    await axios.post('/api/git', { command: 'push' });
    setLoading(false);
    fetchStatus();
  };

  const handlePull = async () => {
    setLoading(true);
    await axios.post('/api/git', { command: 'pull' });
    setLoading(false);
    fetchStatus();
  };

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] border-r border-[var(--border)] overflow-hidden font-sans">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-gray-500 bg-[var(--sidebar-bg)] sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-2 text-white/80">
          <GitBranch size={12} className="text-[var(--accent)]" />
          <span>Source Control</span>
        </div>
        <div className="flex items-center gap-2">
          <RotateCw 
            size={14} 
            className={cn("cursor-pointer hover:text-white transition-colors", loading && "animate-spin")} 
            onClick={() => { fetchStatus(); fetchHistory(); fetchBranches(); fetchStashes(); }}
          />
        </div>
      </div>

      <div className="grid grid-cols-4 border-b border-[var(--border)] bg-[var(--bg)]/10 shrink-0">
        {[
          { id: 'changes', label: 'Diff' },
          { id: 'history', label: 'Log' },
          { id: 'branches', label: 'Br.' },
          { id: 'stash', label: 'Stash' }
        ].map((t) => (
          <button 
            key={t.id}
            onClick={() => setView(t.id as any)}
            className={cn(
              "flex flex-col items-center py-2.5 gap-1 text-[9px] font-bold uppercase tracking-widest transition-all relative",
              view === t.id ? "text-[var(--accent)]" : "text-gray-500 hover:text-gray-300"
            )}
          >
            {t.label}
            {view === t.id && <motion.div layoutId="git-tab-active" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)]" />}
          </button>
        ))}
      </div>

      <ScrollArea className="flex-1">
        {view === 'changes' && (
          <div className="p-4">
            <div className="mb-4">
              <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
                placeholder="Commit message (Ctrl+Enter)"
                className="w-full bg-[var(--active-bg)] border border-[var(--border)] rounded p-3 text-xs text-white placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none h-24 shadow-inner"
                onKeyDown={(e) => {
                   if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                     handleCommit();
                   }
                }}
              />
              <div className="flex gap-2 mt-2">
                <Button 
                  onClick={handleCommit} 
                  disabled={!commitMessage.trim() || loading}
                  className="flex-1 h-9 bg-[var(--accent)] hover:bg-opacity-90 text-[11px] font-bold shadow-lg"
                >
                  {loading ? 'Processing...' : 'Commit Changes'}
                </Button>
                <Button 
                  onClick={handleStash}
                  disabled={changedFiles.length === 0 || loading}
                  variant="outline"
                  className="h-9 w-10 border-[var(--border)] text-[11px] hover:bg-white/5"
                  title="Stash Changes"
                >
                  <Archive size={14} />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 mb-6">
              <Button variant="outline" size="sm" className="flex-1 text-[10px] border-[var(--border)] h-8 uppercase font-black tracking-widest hover:bg-white/5" onClick={handlePush}>
                 Push
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-[10px] border-[var(--border)] h-8 uppercase font-black tracking-widest hover:bg-white/5" onClick={handlePull}>
                 Pull
              </Button>
            </div>

            <div className="text-[10px] uppercase font-bold text-gray-600 mb-2 px-1 tracking-widest flex items-center gap-2">
              <div className="w-1 h-1 rounded-full bg-blue-500" />
              <span>Pending Changes ({changedFiles.length})</span>
            </div>

            {selectedDiff ? (
              <div className="mt-2 border border-[var(--border)] rounded-lg overflow-hidden shadow-2xl bg-[#0d0e12] animate-in fade-in slide-in-from-top-2 ring-1 ring-white/5">
                <div className="bg-[var(--active-bg)] px-3 py-2 text-[10px] flex items-center justify-between border-b border-[var(--border)]">
                   <div className="flex items-center gap-2">
                      <Layers size={13} className="text-[var(--accent)]" />
                      <span className="font-bold opacity-90 uppercase tracking-widest text-[9px]">Syntax Diff Preview</span>
                   </div>
                   <X size={14} className="cursor-pointer hover:text-white transition-colors" onClick={() => setSelectedDiff(null)} />
                </div>
                <div className="p-3 font-mono text-[10px] whitespace-pre overflow-x-auto max-h-[380px] leading-relaxed">
                   {selectedDiff.split('\n').map((line, i) => {
                     const isAdded = line.startsWith('+');
                     const isRemoved = line.startsWith('-');
                     return (
                      <div key={i} className={cn(
                        "flex gap-3 px-2 py-0.5 min-w-max border-l-2",
                        isAdded ? 'bg-green-500/10 text-green-400 border-green-500' : 
                        isRemoved ? 'bg-red-500/10 text-red-300 border-red-500' : 
                        'text-gray-400 border-transparent opacity-70'
                      )}>
                        <span className="w-6 shrink-0 text-right opacity-20 select-none font-sans">{i + 1}</span>
                        <span className="flex-1">{line}</span>
                      </div>
                     );
                   })}
                </div>
              </div>
            ) : changedFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-600 italic text-xs border border-dashed border-[var(--border)] rounded-lg mx-1 opacity-50">
                You are up to date.
              </div>
            ) : (
              <div className="space-y-0.5">
                {changedFiles.map((file, i) => (
                  <div 
                    key={i} 
                    onClick={() => fetchDiff(file.path)}
                    className="flex items-center justify-between group py-2 px-3 hover:bg-[var(--active-bg)] rounded-md transition-all cursor-pointer border border-transparent hover:border-[var(--border)] hover:shadow-sm"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <span className={cn(
                        "text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded shrink-0",
                        file.status === 'modified' ? "text-blue-400 bg-blue-400/10" : 
                        file.status === 'added' ? "text-green-400 bg-green-400/10" :
                        "text-red-400 bg-red-400/10"
                      )}>
                        {file.status === 'untracked' ? 'U' : file.status.charAt(0).toUpperCase()}
                      </span>
                      <div className="flex flex-col overflow-hidden">
                        <span className="text-xs text-gray-200 truncate font-semibold leading-none mb-1">{file.path.split('/').pop()}</span>
                        <span className="text-[9px] text-gray-600 truncate uppercase tracking-tighter">{file.path}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                       <Plus size={13} className="text-gray-500 hover:text-white" />
                       <Trash2 size={13} className="text-gray-500 hover:text-red-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {view === 'history' && (
          <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
             {gitHistory.map((commit, i) => (
               <div key={i} className="relative pl-7 pb-6 group last:pb-0">
                  <div className="absolute left-[7px] top-2 bottom-0 w-[1px] bg-[var(--border)] group-last:bg-transparent opacity-50" />
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full bg-[var(--sidebar-bg)] border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-all flex items-center justify-center shadow-lg">
                    <div className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-[var(--accent)] transition-all scale-0 group-hover:scale-100" />
                  </div>
                  
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs font-bold text-gray-200 group-hover:text-[var(--accent)] transition-colors leading-snug cursor-default">{commit.message}</span>
                    <div className="flex items-center gap-3">
                       <code className="text-[10px] text-gray-400 font-mono bg-[#0d0e12] px-2 py-0.5 rounded border border-white/5 shadow-sm">{commit.hash}</code>
                       <div className="flex items-center gap-1 opacity-40">
                          <History size={10} />
                          <span className="text-[9px] uppercase font-black tracking-widest italic">Stable</span>
                       </div>
                    </div>
                  </div>
               </div>
             ))}
             {gitHistory.length === 0 && (
               <div className="text-center py-12 text-gray-600 italic text-xs font-medium">
                 Initial commit pending.
               </div>
             )}
          </div>
        )}

        {view === 'branches' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-6 duration-400">
             <div className="flex items-center justify-between mb-5 px-1">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] opacity-80">Local Workspace</span>
               <Button size="sm" variant="ghost" onClick={createBranch} className="h-7 px-3 text-[10px] text-[var(--accent)] hover:bg-[var(--accent)]/10 font-bold border border-transparent hover:border-[var(--accent)]/20 transition-all rounded-full">
                 <Plus size={14} className="mr-1" /> Branch
               </Button>
             </div>
             <div className="space-y-1.5">
               {branches.map((b) => (
                 <div 
                   key={b.name} 
                   onClick={() => !b.current && switchBranch(b.name)}
                   className={cn(
                     "flex items-center justify-between py-3 px-4 rounded-xl text-xs transition-all cursor-pointer border",
                     b.current ? "bg-[var(--active-bg)] border-[var(--border)] text-[var(--accent)] font-bold shadow-xl ring-2 ring-white/5 scale-[1.02]" : "text-gray-400 border-transparent hover:bg-[var(--active-bg)]/40 hover:text-gray-200"
                   )}
                 >
                   <div className="flex items-center gap-3">
                     <GitBranch size={14} className={b.current ? "text-[var(--accent)]" : "text-gray-600 opacity-60"} />
                     <span className="tracking-tight">{b.name}</span>
                   </div>
                   {b.current && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}><Check size={14} /></motion.div>}
                 </div>
               ))}
             </div>
          </div>
        )}

        {view === 'stash' && (
          <div className="p-5 animate-in fade-in slide-in-from-right-6 duration-400">
             <div className="flex items-center justify-between mb-5 px-1">
               <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] opacity-80">Archive / Stash</span>
               <Button size="sm" variant="ghost" onClick={handleStash} className="h-7 px-3 text-[10px] text-[var(--accent)] hover:bg-[var(--accent)]/10 font-bold border border-transparent hover:border-[var(--accent)]/20 transition-all rounded-full">
                 <Archive size={14} className="mr-1" /> Snapshot
               </Button>
             </div>
             <div className="space-y-3">
               {stashes.map((s) => (
                 <div 
                   key={s.id} 
                   className="p-4 bg-[var(--active-bg)]/30 rounded-xl border border-[var(--border)] group hover:border-[var(--accent)]/30 hover:bg-[var(--active-bg)]/50 transition-all shadow-md relative overflow-hidden"
                 >
                    <div className="flex items-center justify-between mb-2.5 relative z-10">
                      <span className="text-[10px] text-gray-500 font-mono tracking-tighter opacity-70 bg-black/40 px-2 py-0.5 rounded-full">{s.id}</span>
                      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                        <Button size="sm" variant="default" className="h-6 px-3 text-[10px] bg-green-500/20 text-green-400 hover:bg-green-500/30 border border-green-500/20" onClick={() => applyStash(s.id)}>
                           Apply
                        </Button>
                        <Trash2 size={13} className="text-gray-600 hover:text-red-400 cursor-pointer transition-colors" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-300 font-medium leading-relaxed relative z-10">{s.message}</p>
                    <div className="absolute top-0 right-0 p-8 bg-[var(--accent)]/5 blur-3xl rounded-full -mr-4 -mt-4" />
                 </div>
               ))}
               {stashes.length === 0 && (
                 <div className="text-center py-12 text-gray-600 italic text-xs font-medium border border-dashed border-[var(--border)] rounded-xl mx-2 opacity-50">
                   No stashed snapshots.
                 </div>
               )}
             </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
