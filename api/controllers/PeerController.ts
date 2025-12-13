import type { Socket, Server } from "socket.io";
import PeerService from "../services/PeerService";

export class PeerController {
  /**
   * Manejar nueva conexión de peer
   */
  handleConnection(socket: Socket, io: Server): void {
    // 🔥 FIX: Prevenir conexiones duplicadas del mismo cliente
    const existingPeerId = socket.handshake.headers['x-client-id'] as string;
    
    if (!PeerService.peerExists(socket.id)) {
      PeerService.addPeer(socket.id);
      
      // Enviar lista de peers existentes al nuevo peer
      const existingPeers = PeerService.getPeerList(socket.id);
      socket.emit("introduction", existingPeers);
      
      // Si alguien ya está compartiendo pantalla, notificar al nuevo peer
      const sharingUser = PeerService.getScreenSharingUser();
      if (sharingUser && PeerService.peerExists(sharingUser)) {
        socket.emit("screenShareStarted", sharingUser);
      }
      
      // Notificar solo a los demás
      socket.broadcast.emit("newUserConnected", socket.id);
      
      console.log(
        "✅ Peer joined:",
        socket.id,
        "| Total peers:",
        PeerService.getPeerCount(),
        "| Active:",
        existingPeers.length
      );
      
      // 🔥 NUEVO: Ping periódico para detectar conexiones muertas
      const pingInterval = setInterval(() => {
        if (socket.connected) {
          socket.emit('ping');
        } else {
          clearInterval(pingInterval);
        }
      }, 30000); // Cada 30 segundos
      
      socket.on('pong', () => {
        // Cliente está vivo
      });
      
      // Limpiar interval al desconectar
      socket.on('disconnect', () => {
        clearInterval(pingInterval);
      });
    }
  }

  /**
   * Manejar señales WebRTC entre peers
   */
  handleSignal(
    socket: Socket,
    io: Server,
    to: string,
    from: string,
    data: any
  ): void {
    if (PeerService.peerExists(to)) {
      io.to(to).emit("signal", to, from, data);
    } else {
      console.log("⚠️ Peer not found! Target:", to, "From:", from);
      // Notificar al emisor que el destinatario no existe
      socket.emit("peerNotFound", to);
    }
  }

  /**
   * Manejar inicio de compartir pantalla
   */
  handleScreenShareStarted(socket: Socket, io: Server, userId: string): void {
    console.log(`🖥️ User ${userId} started screen sharing`);
    
    // Establecer usuario que comparte
    PeerService.setScreenSharingUser(userId);
    
    // Notificar a todos los demás
    socket.broadcast.emit("screenShareStarted", userId);
  }

  /**
   * Manejar detención de compartir pantalla
   */
  handleScreenShareStopped(socket: Socket, io: Server, userId: string): void {
    console.log(`🛑 User ${userId} stopped screen sharing`);
    
    // Limpiar usuario que comparte
    if (PeerService.getScreenSharingUser() === userId) {
      PeerService.clearScreenSharingUser();
    }
    
    // Notificar a todos los demás
    socket.broadcast.emit("screenShareStopped", userId);
  }

  /**
   * Manejar desconexión de peer
   */
  handleDisconnect(socket: Socket, io: Server): void {
    const wasSharing = PeerService.getScreenSharingUser() === socket.id;
    const removed = PeerService.removePeer(socket.id);
    
    if (removed) {
      // Notificar a todos sobre la desconexión
      io.sockets.emit("userDisconnected", socket.id);
      
      // Si el que se desconectó estaba compartiendo, notificar
      if (wasSharing) {
        io.emit("screenShareStopped", socket.id);
        PeerService.clearScreenSharingUser();
      }
      
      console.log(
        "👋 Peer disconnected:",
        socket.id,
        "| Remaining peers:",
        PeerService.getPeerCount()
      );
    }
  }
  
  /**
   * 🔥 NUEVO: Obtener lista de peers activos
   */
  handleGetActivePeers(socket: Socket): void {
    const peers = PeerService.getPeerList(socket.id);
    socket.emit("activePeers", peers);
  }
}