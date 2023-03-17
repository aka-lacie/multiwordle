import { RemoteSocket, Server, Socket } from "socket.io";
import * as fs from 'fs';
import * as path from 'path';

interface ServerToClientEvents {
  noArg: () => void;
  withAck: (d: string, callback: (e: number) => void) => void;
  "action-rejected": (reason: string) => void;
  "player-joined": (playerName: string, playerId: string) => void;
  "update-players": (players: Player[]) => void;
  "start-game": (word: string) => void;
  "is-host": (room: string) => void;
  "whose-turn": (playerName: string) => void;
  "start-turn": (nextPlayerId: string, guess: string | null) => void;
  "player-disconnect": (playerId: string) => void;
}

interface ClientToServerEvents {
  "join-room": (room: string, callback: any) => void;
  "joined-lobby": (room: string, username: string) => void;
  "host-update-players": (room: string, players: Player[]) => void;
  "send-start": (room: string) => void;
  "send-guess": (room: string, guess: string) => void;
  "my-turn": (room: string, username: string) => void;
  "leave-room": (room: string, username: string) => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
}

type Player = {
  name: string;
  id: string;
}

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

        // Kick out if room is full
        if (roomMembers.length > 6) {
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

      // Handle joined lobby request and broadcast new player to room
      socket.on("joined-lobby", (room, username) => {
        socket.to(room).emit("player-joined", username, socket.id);
      });

      // Handle host update players request
      socket.on("host-update-players", (room, players) => {
        socket.to(room).emit("update-players", players);
      });

      // Handle start game request
      socket.on("send-start", (room) => {
        // Generate word
        const word = generateWord().toUpperCase();
        io.in(room).emit("start-game", word);
        console.log(`Game started in room: ${room} with solution: ${word}`);
      });

      // Handle my turn request
      socket.on("my-turn", async (room, username) => {
        console.log(`It's ${username}'s turn in room: ${room}`)
        socket.to(room).emit("whose-turn", username);
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
      socket.on("disconnecting", (reason) => {
        console.log(`socket ${socket.id} rooms before disconnecting:`, socket.rooms);
        const rooms = Array.from(socket.rooms);
        console.log(`socket ${socket.id} disconnected from rooms: ${rooms.join(", ")}`);
        console.log(`reason: ${reason}`)
        for (const room of rooms) {
          if (room !== socket.id) socket.to(room).emit("player-disconnect", socket.id);
        }
      });
    });
  }
  res.end();
};

const generateWord = () => {
  const wordsFilePath = path.resolve(process.cwd(), 'assets', 'wordle-La.txt');
  const words = fs.readFileSync(wordsFilePath, 'utf-8');
  const wordArr = words.split("\n");
  const word = wordArr[Math.floor(Math.random() * wordArr.length)];
  return word;
};

export default SocketHandler;
