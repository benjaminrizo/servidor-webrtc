import type { Server, Socket } from "socket.io";
import { PeerController } from "../controllers/PeerController";

const peerController = new PeerController();

export function registerSocketEvents(io: Server): void {
  io.on("connection", (socket: Socket) => {
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

    // Evento: desconexión
    socket.on("disconnect", () => {
      peerController.handleDisconnect(socket, io);
    });
  });
}