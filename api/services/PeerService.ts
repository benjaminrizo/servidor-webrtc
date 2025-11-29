import PeerDAO from "../dao/PeerDAO";
import type { Peer, SignalPayload } from "../models/Peer.model";

class PeerService {
  /**
   * Agregar un nuevo peer
   */
  addPeer(socketId: string): Peer {
    return PeerDAO.create(socketId);
  }

  /**
   * Obtener lista de peer IDs (excluyendo el actual)
   */
  getPeerList(excludeSocketId?: string): string[] {
    const allIds = PeerDAO.getAllIds();
    if (excludeSocketId) {
      return allIds.filter(id => id !== excludeSocketId);
    }
    return allIds;
  }

  /**
   * Verificar si un peer existe
   */
  peerExists(socketId: string): boolean {
    return PeerDAO.exists(socketId);
  }

  /**
   * Remover un peer
   */
  removePeer(socketId: string): boolean {
    return PeerDAO.delete(socketId);
  }

  /**
   * Obtener información de un peer
   */
  getPeer(socketId: string): Peer | null {
    return PeerDAO.findById(socketId);
  }

  /**
   * Obtener el conteo de peers conectados
   */
  getPeerCount(): number {
    return PeerDAO.count();
  }

  /**
   * Validar payload de señal
   */
  validateSignalPayload(payload: SignalPayload): boolean {
    return !!(payload.to && payload.from && payload.data);
  }
}

export default new PeerService();