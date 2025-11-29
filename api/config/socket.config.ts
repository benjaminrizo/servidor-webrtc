import { Server } from "socket.io";
import "dotenv/config";

export function createSocketServer(): Server {
  const origins = (process.env.ORIGIN ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return new Server({
    cors: {
      origin: origins
    }
  });
}

export const PORT = Number(process.env.PORT) || 9000;