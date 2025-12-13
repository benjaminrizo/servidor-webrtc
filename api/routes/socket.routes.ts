import type { Server, Socket } from "socket.io";
import { PeerController } from "../controllers/PeerController";

const peerController = new PeerController();

export function registerSocketEvents(io: Server): void {
  io.on("connection", (socket: Socket) => {
    console.log(`🔌 New connection attempt: ${socket.id}`);
    
    // Manejar nueva conexión
    peerController.handleConnection(socket, io);

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
    
    //Solicitar lista de peers activos
    socket.on("getActivePeers", () => {
      peerController.handleGetActivePeers(socket);
    });
    
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
  
  // Log del servidor cada minuto
  setInterval(() => {
    const connectedSockets = io.sockets.sockets.size;
    console.log(`📊 Server health: ${connectedSockets} socket(s) connected`);
  }, 60000); // Cada minuto
}