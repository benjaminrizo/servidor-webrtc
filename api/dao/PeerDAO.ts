import type { Peer } from "../models/Peer.model";

class PeerDAO {
  private peers: Map<string, Peer> = new Map();

  /**
   * Crear un nuevo peer
   */
  create(socketId: string): Peer {
    const peer: Peer = {
      socketId,
      connectedAt: new Date()
    };
    this.peers.set(socketId, peer);
    return peer;
  }

  /**
   * Obtener un peer por su socketId
   */
  findById(socketId: string): Peer | null {
    return this.peers.get(socketId) ?? null;
  }

  /**
   * Obtener todos los peers
   */
  findAll(): Peer[] {
    return Array.from(this.peers.values());
  }

  /**
   * Obtener todos los IDs de peers
   */
  getAllIds(): string[] {
    return Array.from(this.peers.keys());
  }

  /**
   * Verificar si un peer existe
   */
  exists(socketId: string): boolean {
    return this.peers.has(socketId);
  }

  /**
   * Eliminar un peer
   */
  delete(socketId: string): boolean {
    return this.peers.delete(socketId);
  }

  /**
   * Obtener el conteo de peers
   */
  count(): number {
    return this.peers.size;
  }

  /**
   * Limpiar todos los peers (útil para testing)
   */
  clear(): void {
    this.peers.clear();
  }
}

export default new PeerDAO();