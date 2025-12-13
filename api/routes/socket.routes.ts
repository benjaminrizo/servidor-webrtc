import type { Server, Socket } from "socket.io";
import { PeerController } from "../controllers/PeerController";

const peerController = new PeerController();

export function registerSocketEvents(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 New connection attempt: ${socket.id}`);
    
    // Manejar nueva conexión
    peerController.handleConnection(socket, io);

    // ============================================
    // 📹 EVENTOS DE WEBRTC
    // ============================================
    
    // Evento: señal WebRTC
    socket.on("signal", (to: string, from: string, data: any) => {
      peerController.handleSignal(socket, io, to, from, data);
    });

    // Evento: inicio de compartir pantalla
    socket.on("screenShareStarted", (userId: string) => {
      peerController.handleScreenShareStarted(socket, io, userId);
    });

    // Evento: detención de compartir pantalla
    socket.on("screenShareStopped", (userId: string) => {
      peerController.handleScreenShareStopped(socket, io, userId);
    });
    
    // Solicitar lista de peers activos
    socket.on("getActivePeers", () => {
      peerController.handleGetActivePeers(socket);
    });
    
    // ============================================
    // 💬 EVENTOS DE CHAT
    // ============================================
    
    // Evento: nuevo usuario se une al chat
    socket.on("newUser", (username: string) => {
      console.log(`💬 New user joined chat: ${username} (${socket.id})`);
      
      // Opcional: notificar a otros usuarios que alguien se unió
      socket.broadcast.emit("chat:userJoined", {
        userId: username,
        timestamp: new Date().toISOString()
      });
    });

    // Evento: mensaje de chat
    socket.on("chat:message", (payload: { userId: string; message: string }) => {
      console.log(`💬 Message from ${payload.userId}: ${payload.message}`);
      
      const messageWithTimestamp = {
        ...payload,
        timestamp: new Date().toISOString()
      };
      
      // Enviar mensaje a TODOS (incluyendo el remitente)
      io.emit("chat:message", messageWithTimestamp);
    });
    
    // ============================================
    // 🔧 EVENTOS DE SISTEMA
    // ============================================
    
    // Responder a ping
    socket.on("pong", () => {
      // El cliente respondió al ping, está vivo
    });

    // Evento: desconexión
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Disconnect reason for ${socket.id}:`, reason);
      peerController.handleDisconnect(socket, io);
    });
    
    // Error handling
    socket.on("error", (error) => {
      console.error(`❌ Socket error for ${socket.id}:`, error);
    });
  });

  // ============================================
  // 📊 MONITOREO DEL SERVIDOR
  // ============================================
  
  // Log del servidor cada minuto
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    console.log(`📊 Server health: ${connectedSockets} socket(s) connected`);
  }, 60000); // Cada minuto
}