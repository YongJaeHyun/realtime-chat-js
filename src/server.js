const http = require("http");
const express = require("express");
const app = express();
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

process.env.PORT = 3000;
app.set("port", process.env.PORT || 3001);

// 클라이언트가 socket으로 접속하면 실행
io.sockets.on("connection", (socket) => {
  console.log("소켓 연결 성공...");

  socket.on("greeting", (nickname) => {
    socket.nickname = nickname;
    socket.broadcast.emit("addSystemChat", {
      content: `${nickname} 님이 입장하셨습니다.`,
    });
  });

  socket.on("modify nickname", (nickname) => {
    if (nickname != socket.nickname) {
      socket.broadcast.emit("addSystemChat", {
        content: `${socket.nickname} 님이 ${nickname}으로 닉네임을 변경하셨습니다.`,
      });
      socket.nickname = nickname;
    }
  });

  socket.on("disconnect", () => {
    console.log("소켓 연결 끊김...");
    socket.broadcast.emit("addSystemChat", {
      content: `${socket.nickname} 님이 퇴장하셨습니다.`,
    });
  });

  socket.on("addChat", ({ nickname, content }) => {
    socket.broadcast.emit("addChat", { nickname, content });
  });
});

server.listen(app.get("port"), () => {
  console.log("Node.js 서버 실행 중 ... http://localhost:" + app.get("port"));
});
