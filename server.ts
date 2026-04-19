import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import { spawn } from 'child_process';
import cors from 'cors';
import chokidar from 'chokidar';

const PORT = 3000;
const ROOT_DIR = process.cwd();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  app.use(cors());
  app.use(express.json());

  // --- Filesystem API ---

  app.get('/api/files', async (req, res) => {
    try {
      const getFileTree = async (dir: string): Promise<any[]> => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        const result = await Promise.all(entries.map(async (entry) => {
          const fullPath = path.join(dir, entry.name);
          const relativePath = path.relative(ROOT_DIR, fullPath);
          
          if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist') {
            return null;
          }

          if (entry.isDirectory()) {
            return {
              name: entry.name,
              path: relativePath,
              type: 'directory',
              children: await getFileTree(fullPath)
            };
          } else {
            return {
              name: entry.name,
              path: relativePath,
              type: 'file'
            };
          }
        }));
        return result.filter(Boolean);
      };

      const tree = await getFileTree(ROOT_DIR);
      res.json(tree);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/read', async (req, res) => {
    const { filePath } = req.body;
    try {
      const absolutePath = path.join(ROOT_DIR, filePath);
      const content = await fs.readFile(absolutePath, 'utf-8');
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/write', async (req, res) => {
    const { filePath, content } = req.body;
    try {
      const absolutePath = path.join(ROOT_DIR, filePath);
      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(absolutePath, content, 'utf-8');
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  app.post('/api/delete', async (req, res) => {
    const { filePath } = req.body;
    try {
      const absolutePath = path.join(ROOT_DIR, filePath);
      await fs.rm(absolutePath, { recursive: true, force: true });
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // --- Terminal Socket ---
  io.on('connection', (socket) => {
    console.log('Terminal client connected');
    
    // We'll use a simple shell spawn here. 
    // In a production environment, you'd use node-pty for better TTY features.
    const shell = spawn('bash', ['-i'], {
      cwd: ROOT_DIR,
      env: process.env,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    shell.stdout.on('data', (data) => {
      socket.emit('terminal:data', data.toString());
    });

    shell.stderr.on('data', (data) => {
      socket.emit('terminal:data', data.toString());
    });

    socket.on('terminal:input', (data) => {
      shell.stdin.write(data);
    });

    socket.on('disconnect', () => {
      shell.kill();
      console.log('Terminal client disconnected');
    });
  });

  // --- Indexing / Symbol API ---

  app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    try {
      // Very basic grep-like search for demo purposes
      const results: any[] = [];
      const walk = async (dir: string) => {
        const files = await fs.readdir(dir, { withFileTypes: true });
        for (const file of files) {
          const resPath = path.resolve(dir, file.name);
          if (file.isDirectory()) {
            if (['node_modules', '.git', 'dist'].includes(file.name)) continue;
            await walk(resPath);
          } else {
            const content = await fs.readFile(resPath, 'utf8');
            if (content.toLowerCase().includes(String(q).toLowerCase())) {
              results.push({
                path: path.relative(ROOT_DIR, resPath),
                matches: content.split('\n').filter(l => l.toLowerCase().includes(String(q).toLowerCase())).slice(0, 5)
              });
            }
          }
        }
      };
      await walk(ROOT_DIR);
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // --- Git Utility ---
  app.post('/api/git', async (req, res) => {
    const { command } = req.body;
    try {
      // Security: Only allow safe git commands
      const allowedCommands = ['status', 'add', 'commit', 'push', 'pull', 'stash', 'branch', 'checkout', 'log', 'diff'];
      const cmdParts = command.split(' ');
      if (!allowedCommands.includes(cmdParts[0])) {
        return res.status(403).json({ error: 'Command not allowed' });
      }

      const git = spawn('git', cmdParts, { cwd: ROOT_DIR });
      let output = '';
      let errorOutput = '';
      
      git.stdout.on('data', (d) => output += d);
      git.stderr.on('data', (d) => errorOutput += d);
      
      git.on('close', (code) => {
        res.json({ code, output, error: errorOutput });
      });
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  });

  // --- Vite / Frontend ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(ROOT_DIR, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`AI IDE Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);
