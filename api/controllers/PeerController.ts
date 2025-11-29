import type { Socket, Server } from "socket.io";
import PeerService from "../services/PeerService";
import type { SignalPayload } from "../models/Peer.model";

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