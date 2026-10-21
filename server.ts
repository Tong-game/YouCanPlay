import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer, WebSocket } from 'ws';
import { RoomManager } from './server/roomManager.js';
import { ClientAction, ServerMessage, GlobalChatMessage } from './src/types/game.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const isProd = process.env.NODE_ENV === 'production';
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

const roomManager = new RoomManager();

// Map of roomCode -> Set of WebSockets
const roomSockets = new Map<string, Set<WebSocket>>();

// Global Chat Community Store (persists in memory across rooms)
const globalChatHistory: GlobalChatMessage[] = [
  {
    id: 'sys-welcome',
    senderId: 'system',
    senderName: 'PlayParty Lounge',
    avatar: '🎉',
    color: '#6366f1',
    text: 'Welcome to PlayParty Global Lounge! Chat with anyone online, share room links, or jump into games together!',
    timestamp: Date.now(),
    isSystem: true,
  },
];

function broadcastToRoom(roomCode: string, msg: ServerMessage) {
  const sockets = roomSockets.get(roomCode.toUpperCase());
  if (!sockets) return;
  const payload = JSON.stringify(msg);
  for (const client of sockets) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

function broadcastToAll(msg: ServerMessage) {
  const payload = JSON.stringify(msg);
  for (const client of wss.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(payload);
    }
  }
}

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: Date.now() });
});

app.get('/api/rooms', (req, res) => {
  res.json({ rooms: roomManager.getAllPublicRooms() });
});

app.get('/api/rooms/:code', (req, res) => {
  const room = roomManager.getRoom(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({ room });
});

app.post('/api/rooms', (req, res) => {
  const { player, roomName, game } = req.body;
  if (!player || !player.id) {
    return res.status(400).json({ error: 'Player data required' });
  }
  const room = roomManager.createRoom(player, roomName, game);
  res.json({ room });
});

app.get('/api/global-chat', (req, res) => {
  res.json({ messages: globalChatHistory });
});

// WebSocket Server
const wss = new WebSocketServer({ server, path: '/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomCode: string | null = null;
  let currentPlayerId: string | null = null;

  // Send initial global chat history & online count
  ws.send(JSON.stringify({ type: 'global_chat_history', messages: globalChatHistory }));
  broadcastToAll({ type: 'online_count', count: wss.clients.size });

  // Ping-pong heartbeat
  const pingInterval = setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: 'pong' }));
    }
  }, 25000);

  ws.on('message', (data: string) => {
    try {
      const action: ClientAction = JSON.parse(data.toString());

      switch (action.type) {
        case 'get_global_chat': {
          ws.send(JSON.stringify({ type: 'global_chat_history', messages: globalChatHistory }));
          break;
        }

        case 'send_global_chat': {
          const text = (action.text || '').trim();
          if (!text && !action.roomInvite) return;

          const newMsg: GlobalChatMessage = {
            id: `gchat-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            senderId: action.player?.id || 'anon',
            senderName: action.player?.name || 'Player',
            avatar: action.player?.avatar || '🎮',
            color: action.player?.color || '#6366f1',
            text: text.slice(0, 300),
            timestamp: Date.now(),
            roomInvite: action.roomInvite,
          };

          globalChatHistory.push(newMsg);
          if (globalChatHistory.length > 80) {
            globalChatHistory.shift();
          }

          // Broadcast to everyone worldwide!
          broadcastToAll({ type: 'global_chat_message', message: newMsg });
          break;
        }

        case 'join_room': {
          const roomCode = action.roomCode.toUpperCase();
          const result = roomManager.joinRoom(roomCode, action.player);
          if (result.error || !result.room) {
            ws.send(JSON.stringify({ type: 'error', message: result.error || 'Failed to join room' }));
            return;
          }

          currentRoomCode = roomCode;
          currentPlayerId = action.player.id;
          roomManager.registerSocket(ws, roomCode, currentPlayerId);

          // Add to room sockets
          if (!roomSockets.has(roomCode)) {
            roomSockets.set(roomCode, new Set());
          }
          roomSockets.get(roomCode)!.add(ws);

          // Broadcast room state to all players in the room
          broadcastToRoom(roomCode, { type: 'room_state', room: result.room });
          break;
        }

        case 'leave_room': {
          if (currentRoomCode && currentPlayerId) {
            const res = roomManager.leaveRoom(currentRoomCode, currentPlayerId);
            if (roomSockets.has(currentRoomCode)) {
              roomSockets.get(currentRoomCode)!.delete(ws);
            }
            if (res.room) {
              broadcastToRoom(currentRoomCode, { type: 'room_state', room: res.room });
            }
            currentRoomCode = null;
            currentPlayerId = null;
          }
          break;
        }

        case 'select_game': {
          if (!currentRoomCode || !currentPlayerId) return;
          const updated = roomManager.selectGame(currentRoomCode, action.gameId, currentPlayerId);
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'toggle_ready': {
          if (!currentRoomCode || !currentPlayerId) return;
          const updated = roomManager.toggleReady(currentRoomCode, currentPlayerId);
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'start_game': {
          if (!currentRoomCode || !currentPlayerId) return;
          const updated = roomManager.startGame(currentRoomCode, currentPlayerId, room => {
            broadcastToRoom(room.code, { type: 'room_state', room });
          });
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'game_action': {
          if (!currentRoomCode || !currentPlayerId) return;
          const updated = roomManager.handleGameAction(currentRoomCode, currentPlayerId, action.action, room => {
            broadcastToRoom(room.code, { type: 'room_state', room });
          });
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'restart_game': {
          if (!currentRoomCode) return;
          const updated = roomManager.restartGame(currentRoomCode, room => {
            broadcastToRoom(room.code, { type: 'room_state', room });
          });
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'return_to_lobby': {
          if (!currentRoomCode) return;
          const updated = roomManager.returnToLobby(currentRoomCode);
          if (updated) {
            broadcastToRoom(currentRoomCode, { type: 'room_state', room: updated });
          }
          break;
        }

        case 'send_chat': {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = roomManager.getRoom(currentRoomCode);
          if (!room) return;
          const player = room.players.find(p => p.id === currentPlayerId);
          if (!player) return;

          const msg = roomManager.addChatMessage(currentRoomCode, player, action.text);
          if (msg) {
            broadcastToRoom(currentRoomCode, { type: 'chat_message', message: msg });
          }
          break;
        }

        case 'send_reaction': {
          if (!currentRoomCode || !currentPlayerId) return;
          const room = roomManager.getRoom(currentRoomCode);
          if (!room) return;
          const player = room.players.find(p => p.id === currentPlayerId);
          if (!player) return;

          broadcastToRoom(currentRoomCode, {
            type: 'reaction',
            emoji: action.emoji,
            senderName: player.name,
            senderId: player.id,
          });
          break;
        }
      }
    } catch (err) {
      console.error('Error handling WebSocket message:', err);
    }
  });

  ws.on('close', () => {
    clearInterval(pingInterval);
    const info = roomManager.unregisterSocket(ws);
    if (info) {
      if (roomSockets.has(info.roomCode)) {
        roomSockets.get(info.roomCode)!.delete(ws);
      }
      const res = roomManager.leaveRoom(info.roomCode, info.playerId);
      if (res.room) {
        broadcastToRoom(info.roomCode, { type: 'room_state', room: res.room });
      }
    }
    // Update global count
    setTimeout(() => {
      broadcastToAll({ type: 'online_count', count: wss.clients.size });
    }, 500);
  });
});

// Vite Middleware for Development or Express Static in Production
async function setupVite() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
