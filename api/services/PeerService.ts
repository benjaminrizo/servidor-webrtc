import PeerDAO from "../dao/PeerDAO";
import type { Peer, SignalPayload } from "../models/Peer.model";

class PeerService {
  private screenSharingUserId: string | null = null;

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
    // Si el peer que se remueve estaba compartiendo pantalla, limpiar
    if (this.screenSharingUserId === socketId) {
      this.screenSharingUserId = null;
    }
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

  /**
   * Establecer el usuario que está compartiendo pantalla
   */
  setScreenSharingUser(socketId: string): void {
    this.screenSharingUserId = socketId;
  }

  /**
   * Obtener el usuario que está compartiendo pantalla
   */
  getScreenSharingUser(): string | null {
    return this.screenSharingUserId;
  }

  /**
   * Limpiar el usuario que está compartiendo pantalla
   */
  clearScreenSharingUser(): void {
    this.screenSharingUserId = null;
  }

  /**
   * Verificar si alguien está compartiendo pantalla
   */
  isScreenSharingActive(): boolean {
    return this.screenSharingUserId !== null;
  }
}

export default new PeerService();