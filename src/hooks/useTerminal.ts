import React, { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { Terminal } from 'xterm';

export function useTerminal(terminalRef: React.MutableRefObject<Terminal | null>) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const socket = io();
    socketRef.current = socket;

    socket.on('terminal:data', (data: string) => {
      if (terminalRef.current) {
        terminalRef.current.write(data);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [terminalRef]);

  const sendInput = useCallback((data: string) => {
    if (socketRef.current) {
      socketRef.current.emit('terminal:input', data);
    }
  }, []);

  return { sendInput };
}
