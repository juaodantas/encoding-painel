import { io, Socket } from 'socket.io-client';

interface VideoUploadError {
  videoId: string;
  error: string;
}

interface VideoStatusUpdate {
  videoId: string;
  status: string;
  etag?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private errorCallbacks: ((error: VideoUploadError) => void)[] = [];
  private statusCallbacks: ((status: VideoStatusUpdate) => void)[] = [];

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    const config = useRuntimeConfig()
    if (!this.socket) {
      const SOCKET_URL = config.public.apiUrl;

      console.log('Connecting to Socket.IO server:', SOCKET_URL);

      this.socket = io(SOCKET_URL, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        withCredentials: true,
        transports: ['polling', 'websocket'],
        path: '/socket.io/',
        forceNew: true,
        timeout: 10000,
        auth: {
          token: localStorage.getItem('token')
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to WebSocket server');
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setTimeout(() => {
          if (this.socket) {
            console.log('Attempting to reconnect...');
            this.socket.connect();
          }
        }, 5000);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from WebSocket server:', reason);
        if (reason === 'io server disconnect' || reason === 'transport close') {
          setTimeout(() => {
            if (this.socket) {
              console.log('Attempting to reconnect after disconnect...');
              this.socket.connect();
            }
          }, 5000);
        }
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });

      this.socket.on('video:status-updated', (data: VideoStatusUpdate) => {
        console.log('Video status updated RECEBIDO:', data);
        console.log('Callbacks registrados:', this.statusCallbacks.length);
        this.statusCallbacks.forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error('Erro ao executar callback de status:', e);
          }
        });
      });

      this.socket.on('video:error', (data: VideoUploadError) => {
        console.error('Video upload error:', data);
        this.errorCallbacks.forEach(callback => callback(data));
      });
    }
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting from WebSocket server...');
      this.socket.disconnect();
      this.socket = null;
    }
  }

  emitVideoUploadComplete(data: { videoId: string; etag: string; status: string }) {
    // Verificar se o socket está definido
    if (!this.socket) {
      console.error('Socket não inicializado. Tentando reconectar...');
      this.connect();
      
      // Tentar novamente após conexão
      setTimeout(() => this.emitVideoUploadComplete(data), 1000);
      return;
    }
  
    // Verificar se está conectado
    if (!this.socket.connected) {
      console.error('Socket desconectado. Tentando reconectar...');
      this.socket.connect();
      
      // Registrar callback para quando conectar
      this.socket.once('connect', () => {
        console.log('Reconectado! Emitindo evento pendente...');
        this._emitWithAck('video:upload-complete', data);
      });
      return;
    }
  
    // Se chegou aqui, o socket está conectado
    this._emitWithAck('video:upload-complete', data);
  }
  
  // Novo método privado para emitir com acknowledge
  private _emitWithAck(event: string, data: any, retries = 3) {
    console.log(`Emitindo ${event} (tentativa 1/${retries+1}):`, data);
    
    // Emitir com ack
    this.socket!.timeout(5000).emit(event, data, (err: any, response: any) => {
      if (err) {
        console.error(`Erro ao emitir ${event}:`, err);
        if (retries > 0) {
          console.log(`Tentando novamente... (${retries} tentativas restantes)`);
          setTimeout(() => this._emitWithAck(event, data, retries - 1), 1000);
        }
        return;
      }
      
      console.log(`Evento ${event} confirmado pelo servidor:`, response);
    });
  }

  emitVideoUploadError(data: { videoId: string; error: string }) {
    if (this.socket && this.socket.connected) {
      console.log('Emitting video:upload-error:', data);
      this.socket.emit('video:upload-error', data);
    } else {
      console.error('Socket not connected. Cannot emit video:upload-error');
    }
  }

  onVideoError(callback: (error: VideoUploadError) => void) {
    this.errorCallbacks.push(callback);
  }

  onVideoStatusUpdate(callback: (status: VideoStatusUpdate) => void) {
    this.statusCallbacks.push(callback);
  }

  removeErrorCallback(callback: (error: VideoUploadError) => void) {
    this.errorCallbacks = this.errorCallbacks.filter(cb => cb !== callback);
  }

  removeStatusCallback(callback: (status: VideoStatusUpdate) => void) {
    this.statusCallbacks = this.statusCallbacks.filter(cb => cb !== callback);
  }
}

export const socketService = SocketService.getInstance(); 