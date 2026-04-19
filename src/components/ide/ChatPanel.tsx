import React from 'react';
import { Send, User, Bot, Sparkles, X, RotateCcw } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAI, ChatMessage } from '@/src/hooks/useAI';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface ChatPanelProps {
  currentFile: string | null;
  fileContent: string;
}

export const ChatPanel = ({ currentFile, fileContent }: ChatPanelProps) => {
  const [input, setInput] = React.useState('');
  const { messages, isTyping, sendMessage, setMessages } = useAI();
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    sendMessage(input, currentFile ? `File: ${currentFile}\nContent:\n${fileContent}` : undefined);
    setInput('');
  };

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-[var(--sidebar-bg)] border-l border-[var(--border)] overflow-hidden">
      <div className="px-4 py-2 border-bottom border-[var(--border)] flex items-center justify-between text-[11px] uppercase tracking-wider font-semibold text-gray-500">
        <div className="flex items-center gap-2">
          <Sparkles size={12} className="text-yellow-500" />
          <span>Aether Chat</span>
        </div>
        <RotateCcw 
          size={14} 
          className="cursor-pointer hover:text-white transition-colors" 
          onClick={() => setMessages([])}
        />
      </div>

      <ScrollArea className="flex-1 px-4 py-4" ref={scrollRef}>
        <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mt-10 text-gray-500"
            >
              <Bot size={40} className="mx-auto mb-4 opacity-20" />
              <p className="text-sm">I'm your AI assistant.</p>
              <p className="text-xs mt-1">Ask me anything about your code.</p>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <motion.div
              initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              key={i}
              className={cn(
                "mb-6 flex flex-col",
                msg.role === 'user' ? "items-end" : "items-start"
              )}
            >
              <div className="flex items-center gap-2 mb-1 opacity-50">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                <span className="text-[10px] font-bold uppercase">{msg.role}</span>
              </div>
              <div className={cn(
                "px-3 py-2 rounded-lg text-sm max-w-[90%] break-words whitespace-pre-wrap leading-relaxed",
                msg.role === 'user' 
                  ? "bg-[var(--accent)] text-white" 
                  : "bg-[var(--active-bg)] text-[var(--text)] border border-[var(--border)]"
              )}>
                {msg.content}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-xs text-gray-500"
            >
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
              <span>Aether is thinking...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </ScrollArea>

      <div className="p-4 border-t border-[var(--border)] bg-[var(--sidebar-bg)]">
        {currentFile && (
          <div className="mb-2 px-2 py-1 bg-[var(--active-bg)] rounded text-[10px] flex items-center justify-between border border-[var(--border)]">
            <span className="truncate opacity-70">Context: {currentFile}</span>
            <Sparkles size={10} className="text-yellow-500 ml-2" />
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Aether..."
            className="h-9 text-sm bg-[var(--active-bg)] border-[var(--border)] focus:ring-[var(--accent)]"
          />
          <Button 
            type="submit" 
            size="icon" 
            disabled={!input.trim() || isTyping}
            className="h-9 w-9 bg-[var(--accent)] hover:bg-opacity-80 transition-colors"
          >
            <Send size={16} />
          </Button>
        </form>
      </div>
    </div>
  );
};
