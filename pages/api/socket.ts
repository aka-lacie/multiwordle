import { RemoteSocket, Server, Socket } from "socket.io";
import * as fs from 'fs';
import * as path from 'path';

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  "action-rejected": (reason: string) => void;
  "start-game": (word: string) => void;
  "is-host": (room: string) => void;
  "start-turn": (nextPlayerId: string, guess: string | null) => void;
  "player-disconnect": (playerId: string) => void;
}

interface ClientToServerEvents {
  "join-room": (room: string, callback: any) => void;
  "send-start": (room: string) => void;
  "send-guess": (room: string, guess: string) => void;
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
        } else if (roomMembers.length > 6) {
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
        // if (roomMembers.length < 2) {
        //   socket.emit("action-rejected", "Not enough players.");
        //   console.log("Rejected: Not enough players.");
        //   return;
        // }
        roomMembers.push(GAME_STARTED);

        // Generate word
        const word = generateWord();
        io.in(room).emit("start-game", word);
        console.log(`Game started in room: ${room}`);
      });

      // Handle send guess request
      socket.on("send-guess", async (room, guess) => {
        // Figure out whose turn is next
        const prevPlayerId = socket.id
        const roomMembers = await io.in(room).fetchSockets();
        let flag = false
        let nextPlayerId: string;
        for (const soc of roomMembers) {
          if (flag) {
            nextPlayerId = soc.id
            break
          } else if (soc.id === prevPlayerId) {
            flag = true
          }
        }
        if (!nextPlayerId) nextPlayerId = roomMembers[0].id

        // Broadcast guess and next player id to room
        io.in(room).emit("start-turn", nextPlayerId, guess);
      });

      // Handle disconnect
      socket.on("disconnecting", () => {
        const rooms = Object.keys(socket.rooms);
        console.log(`socket ${socket.id} disconnected from rooms: ${rooms}`);
        for (const room of rooms) {
          io.to(room).emit("player-disconnect", socket.id);
        }
      });
    });
  }
  res.end();
};

const generateWord = () => {
  const wordsFilePath = path.resolve(process.cwd(), 'assets', 'words.txt');
  const words = fs.readFileSync(wordsFilePath, 'utf-8');
  const wordArr = words.split("\n");
  const word = wordArr[Math.floor(Math.random() * wordArr.length)];
  return word;
};

export default SocketHandler;
