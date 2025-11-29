import { createSocketServer, PORT } from "./config/socket.config";
import { registerSocketEvents } from "./routes/socket.routes";

const io = createSocketServer();

registerSocketEvents(io);

io.listen(PORT);

console.log(`🚀 WebRTC Server is running on port ${PORT}`);