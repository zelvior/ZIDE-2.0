import React from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';
import { useTerminal } from '@/src/hooks/useTerminal';
import { Sparkles, X, ChevronRight } from 'lucide-react';
import { useAI } from '@/src/hooks/useAI';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const TerminalPanel = () => {
  const terminalRef = React.useRef<HTMLDivElement>(null);
  const xtermRef = React.useRef<Terminal | null>(null);
  const fitAddonRef = React.useRef<FitAddon | null>(null);
  const { sendInput } = useTerminal(xtermRef);
  const { getCommandSuggestions } = useAI();
  const [suggestions, setSuggestions] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const fetchSuggestions = async () => {
    setLoading(true);
    setShowSuggestions(true);
    const res = await getCommandSuggestions(process.cwd());
    setSuggestions(res);
    setLoading(false);
  };

  React.useEffect(() => {
    if (!terminalRef.current) return;

    const term = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'JetBrains Mono',
      theme: {
        background: '#121316',
        foreground: '#cccccc',
        cursor: '#3b82f6',
        selectionBackground: 'rgba(59, 130, 246, 0.3)',
      },
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    
    const timer = setTimeout(() => {
      if (terminalRef.current) {
        try {
          fitAddon.fit();
        } catch (e) {
          console.warn('Initial terminal fit failed:', e);
        }
      }
    }, 100);

    xtermRef.current = term;
    fitAddonRef.current = fitAddon;

    term.onData((data) => {
      sendInput(data);
    });

    const resizeObserver = new ResizeObserver(() => {
      if (terminalRef.current && fitAddonRef.current) {
        try {
          fitAddonRef.current.fit();
        } catch (e) {
          // Ignore
        }
      }
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      term.dispose();
      resizeObserver.disconnect();
      clearTimeout(timer);
    };
  }, [sendInput]);

  return (
    <div className="h-full w-full bg-[#121316] relative flex flex-col group">
      <div className="absolute top-2 right-4 z-10 flex items-center gap-2">
         <button 
           onClick={fetchSuggestions}
           className="flex items-center gap-1.5 px-2.5 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-gray-400 hover:text-white transition-all shadow-lg"
         >
           <Sparkles size={12} className="text-yellow-500" />
           <span>AI Suggester</span>
         </button>
      </div>

      <AnimatePresence>
        {showSuggestions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 left-4 right-4 z-20 bg-[#1e2025] border border-white/10 rounded-xl shadow-2xl p-3 flex flex-col gap-2"
          >
            <div className="flex items-center justify-between mb-1 px-1">
              <div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-500">
                <Sparkles size={12} className="text-yellow-500" />
                <span>Smart Commands</span>
              </div>
              <X size={14} className="text-gray-500 hover:text-white cursor-pointer" onClick={() => setShowSuggestions(false)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {loading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="h-9 bg-white/5 rounded-lg animate-pulse" />
                ))
              ) : suggestions.length > 0 ? (
                suggestions.map((cmd, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      sendInput(cmd + '\r');
                      setShowSuggestions(false);
                    }}
                    className="flex items-center justify-between px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[var(--accent)]/30 rounded-lg text-xs font-mono text-gray-300 transition-all text-left group/btn"
                  >
                    <span className="truncate">{cmd}</span>
                    <ChevronRight size={14} className="text-gray-600 group-hover/btn:text-[var(--accent)] transition-colors shrink-0" />
                  </button>
                ))
              ) : (
                <div className="col-span-3 text-center py-4 text-xs text-gray-500 italic">
                   No suggestions found for this context.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div ref={terminalRef} className="flex-1 min-h-0 pl-2 pt-2" />
    </div>
  );
};
