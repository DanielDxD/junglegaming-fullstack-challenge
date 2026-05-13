import { io, Socket } from 'socket.io-client';
import { env } from '@/config/env';

class SocketClient {
  private static instance: SocketClient;
  private socket: Socket | null = null;

  private constructor() { }

  public static getInstance(): SocketClient {
    if (!SocketClient.instance) {
      SocketClient.instance = new SocketClient();
    }
    return SocketClient.instance;
  }

  public connect(): Socket {
    if (!this.socket) {
      this.socket = io(env.NEXT_PUBLIC_API_URL, {
        path: '/games/socket.io',
        transports: ['websocket'],
        autoConnect: true,
      });
    }
    return this.socket;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketClient = SocketClient.getInstance();
