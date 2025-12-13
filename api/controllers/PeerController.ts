import type { Socket, Server } from "socket.io";
import PeerService from "../services/PeerService";

export class PeerController {
  /**
   * Manejar nueva conexión de peer
   */
  handleConnection(socket: Socket, io: Server): void {
    if (!PeerService.peerExists(socket.id)) {
      PeerService.addPeer(socket.id);
      
      // Enviar lista de peers existentes al nuevo peer
      const existingPeers = PeerService.getPeerList(socket.id);
      socket.emit("introduction", existingPeers);
      
      // Notificar a todos sobre el nuevo peer
      io.emit("newUserConnected", socket.id);
      
      console.log(
        "Peer joined with ID",
        socket.id,
        ". There are",
        PeerService.getPeerCount(),
        "peer(s) connected."
      );
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
      console.log("Peer not found! Target:", to);
    }
  }

  /**
   * Manejar inicio de compartir pantalla
   */
  handleScreenShareStarted(socket: Socket, io: Server, userId: string): void {
  console.log(`User ${userId} started screen sharing`);
  // Notificar a todos los demás peers
  socket.broadcast.emit("screenShareStarted", userId);
}

  /**
   * Manejar detención de compartir pantalla
   */
  handleScreenShareStopped(socket: Socket, io: Server, userId: string): void {
  console.log(`User ${userId} stopped screen sharing`);
  socket.broadcast.emit("screenShareStopped", userId);
}

  /**
   * Manejar desconexión de peer
   */
  handleDisconnect(socket: Socket, io: Server): void {
    const removed = PeerService.removePeer(socket.id);
    
    if (removed) {
      io.sockets.emit("userDisconnected", socket.id);
      
      console.log(
        "Peer disconnected with ID",
        socket.id,
        ". There are",
        PeerService.getPeerCount(),
        "peer(s) connected."
      );
    }
  }
  
}