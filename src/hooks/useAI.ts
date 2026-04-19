import { useState, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function useAI() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (content: string, context?: string) => {
    setIsTyping(true);
    setMessages(prev => [...prev, { role: 'user', content }]);

    try {
      const systemInstruction = `You are Aether AI, the advanced coding assistant integrated into this IDE.
      You have access to the current file context. 
      Base your answers on the provided context if relevant.
      Always provide high-quality code snippets and explanations.
      Current File Context:
      ${context || 'No file context provided.'}`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [
          ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.content }] })),
          { role: 'user', parts: [{ text: content }] }
        ],
        config: {
          systemInstruction
        }
      });

      const assistantMessage = response.text || 'Sorry, I encountered an error.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('AI Error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to AI lost. Please check your config.' }]);
    } finally {
      setIsTyping(false);
    }
  }, [messages]);

  const getCodeEdit = useCallback(async (instruction: string, fileName: string, currentCode: string) => {
    try {
      const prompt = `Task: Edit the code in ${fileName} based on the following instruction.
      Instruction: ${instruction}
      
      Current Code:
      \`\`\`
      ${currentCode}
      \`\`\`
      
      Respond only with the complete updated code. Do not include any explanations or markdown decoration like \`\`\`typescript. Just the raw code.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.1-pro-preview",
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      return response.text;
    } catch (error) {
      console.error('AI Edit Error:', error);
      return null;
    }
  }, []);

  const getCommandSuggestions = useCallback(async (currentDir: string, lastCommand?: string) => {
    try {
      const prompt = `You are a terminal expert. Suggest 3 useful shell commands based on the current context.
      Current Directory: ${currentDir}
      Last Command: ${lastCommand || 'None'}
      
      Suggest commands that a developer might run next (e.g., git status, npm start, ls -la).
      Respond only with a JSON array of strings. No markdown. Example: ["git status", "npm run dev", "ls -R"]`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", // Flash is faster for suggestions
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      try {
        const text = response.text || '[]';
        // Cleanup potential markdown
        const cleaned = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleaned) as string[];
      } catch {
        return [];
      }
    } catch (error) {
      console.error('AI Suggestion Error:', error);
      return [];
    }
  }, []);

  return {
    messages,
    isTyping,
    sendMessage,
    getCodeEdit,
    getCommandSuggestions,
    setMessages
  };
}
