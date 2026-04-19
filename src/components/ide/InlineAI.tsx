import React from 'react';
import { Command, Sparkles, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAI } from '@/src/hooks/useAI';

interface InlineAIProps {
  isOpen: boolean;
  onClose: () => void;
  fileName: string;
  currentCode: string;
  onApply: (newCode: string) => void;
}

export const InlineAI = ({ isOpen, onClose, fileName, currentCode, onApply }: InlineAIProps) => {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { getCodeEdit } = useAI();
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setInput('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    setLoading(true);
    const newCode = await getCodeEdit(input, fileName, currentCode);
    if (newCode) {
      onApply(newCode);
      onClose();
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="w-full max-w-xl bg-[var(--sidebar-bg)] border border-[var(--active-bg)] shadow-2xl rounded-xl p-1 pointer-events-auto overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="flex flex-col">
              <div className="flex items-center px-3 py-2 gap-3 bg-[var(--bg)]/50 rounded-lg">
                <Sparkles size={16} className="text-yellow-500 animate-pulse" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={`Edit ${fileName.split('/').pop()}...`}
                  className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-500 h-8"
                  disabled={loading}
                />
                {loading ? (
                  <Loader2 size={16} className="animate-spin text-[var(--accent)]" />
                ) : (
                  <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded border border-gray-700 text-[10px] text-gray-500 font-bold uppercase">
                    Enter
                  </div>
                )}
                <X 
                  size={16} 
                  className="text-gray-500 hover:text-white cursor-pointer ml-1" 
                  onClick={onClose} 
                />
              </div>
              
              <div className="px-3 py-1.5 flex items-center justify-between">
                <div className="flex gap-4">
                   <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      Rewrite file
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                      Refactor logic
                   </div>
                </div>
                <div className="text-[10px] text-gray-500 italic">
                  Powered by Aether 3.1 Pro
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
