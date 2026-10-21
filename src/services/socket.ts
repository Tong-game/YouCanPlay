import { ClientAction, ServerMessage, Room, ChatMessage, Player } from '../types/game';

type EventCallback<T = any> = (data: T) => void;

class SocketClient {
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<EventCallback>> = new Map();
  private isConnecting: boolean = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private currentRoomCode: string | null = null;
  private currentPlayer: Player | null = null;

  public connect(): Promise<boolean> {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return Promise.resolve(true);
    }

    if (typeof window === 'undefined') {
      return Promise.resolve(false);
    }

    return new Promise(resolve => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        const wsUrl = `${protocol}//${host}/ws`;

        this.isConnecting = true;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          this.isConnecting = false;
          this.emit('connection_status', { connected: true });

          // Auto rejoin room if reconnected
          if (this.currentRoomCode && this.currentPlayer) {
            this.send({
              type: 'join_room',
              roomCode: this.currentRoomCode,
              player: {
                id: this.currentPlayer.id,
                name: this.currentPlayer.name,
                avatar: this.currentPlayer.avatar,
                color: this.currentPlayer.color,
              },
            });
          }

          resolve(true);
        };

        this.ws.onmessage = (event: MessageEvent) => {
          try {
            const data: ServerMessage = JSON.parse(event.data);
            this.handleServerMessage(data);
          } catch (err) {
            console.error('Socket message parse error:', err);
          }
        };

        this.ws.onclose = () => {
          this.isConnecting = false;
          this.emit('connection_status', { connected: false });
          this.scheduleReconnect();
        };

        this.ws.onerror = (err) => {
          this.isConnecting = false;
          this.emit('connection_status', { connected: false, error: err });
          resolve(false);
        };
      } catch (err) {
        this.isConnecting = false;
        resolve(false);
      }
    });
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      if (this.currentRoomCode) {
        this.connect();
      }
    }, 2000);
  }

  private handleServerMessage(msg: ServerMessage) {
    switch (msg.type) {
      case 'room_state':
        this.emit('room_state', msg.room);
        break;
      case 'chat_message':
        this.emit('chat_message', msg.message);
        break;
      case 'global_chat_history':
        this.emit('global_chat_history', msg.messages);
        break;
      case 'global_chat_message':
        this.emit('global_chat_message', msg.message);
        break;
      case 'online_count':
        this.emit('online_count', msg.count);
        break;
      case 'reaction':
        this.emit('reaction', msg);
        break;
      case 'error':
        this.emit('error', msg.message);
        break;
      case 'pong':
        // Heartbeat received
        break;
      default:
        this.emit(msg.type, msg);
    }
  }

  public send(action: ClientAction) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(action));
    } else {
      // Reconnect and send
      this.connect().then(connected => {
        if (connected && this.ws && this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify(action));
        }
      });
    }
  }

  public joinRoom(roomCode: string, player: Player) {
    this.currentRoomCode = roomCode;
    this.currentPlayer = player;
    this.send({
      type: 'join_room',
      roomCode,
      player: {
        id: player.id,
        name: player.name,
        avatar: player.avatar,
        color: player.color,
      },
    });
  }

  public leaveRoom() {
    this.send({ type: 'leave_room' });
    this.currentRoomCode = null;
  }

  public on<T = any>(event: string, callback: EventCallback<T>) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  public off<T = any>(event: string, callback: EventCallback<T>) {
    if (this.listeners.has(event)) {
      this.listeners.get(event)!.delete(callback);
    }
  }

  private emit(event: string, data: any) {
    const list = this.listeners.get(event);
    if (list) {
      list.forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in socket listener for ${event}:`, err);
        }
      });
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

export const socket = new SocketClient();
