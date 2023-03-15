import { RemoteSocket, Server, Socket } from "socket.io";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  "action-rejected": (reason: string) => void;
  "start-game": () => void;
  "is-host": (room: string) => void;
}

interface ClientToServerEvents {
  "join-room": (room: string, callback: any) => void;
  "send-start": (room: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
}

// really hacky way to prevent new joins after game started
// TODO: fix inclusion check so that it isn't looking for strict equality
const GAME_STARTED = "GAME_STARTED_SPECIAL_KEY" as unknown as RemoteSocket<ServerToClientEvents, SocketData>;

const SocketHandler = (req, res) => {
  if (res.socket.server.io) {
    console.log("Socket is already running");
  } else {
    console.log("Socket is initializing");
    const io = new Server<
      ClientToServerEvents,
      ServerToClientEvents,
      InterServerEvents,
      SocketData
    >(res.socket.server);
    res.socket.server.io = io;

    io.on("connection", (socket) => {
      // Handle join room request
      socket.on("join-room", async (room: string, callback) => {
        socket.join(room);
        const roomMembers = await io.in(room).fetchSockets();

        // Kick out if game already started
        if (roomMembers.includes(GAME_STARTED)) {
          socket.leave(room);
          socket.emit("action-rejected", "The game has already started.");
          console.log("Rejected: The game has already started.");
          callback(false);
        // Kick out if room is full
        } else if (roomMembers.length > 5) {
          socket.leave(room);
          socket.emit("action-rejected", "Room is full.");
          console.log("Rejected: Room is full.");
          callback(false);    
        // Make host if first player
        } else if (roomMembers.length === 1) {
          socket.emit("is-host", room);
          console.log(`socket ${socket.id} is host of room: ${room}`);
          callback(true);
        } else {
          console.log(`socket ${socket.id} joined room: ${room}`);
          callback(true);
        }

      });

      // Handle start game request
      socket.on("send-start", async (room) => {
        const roomMembers = await io.in(room).fetchSockets();
        
        // Reject if not enough players
        if (roomMembers.length < 2) {
          socket.emit("action-rejected", "Not enough players.");
          console.log("Rejected: Not enough players.");
          return;
        }
        roomMembers.push(GAME_STARTED);
        io.in(room).emit("start-game");
        console.log(`Game started in room: ${room}`);
      });
    });
  }
  res.end();
};

export default SocketHandler;
