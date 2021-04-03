const WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 8888 });

wss.on("connection", function (conn) {
  console.log("user connected");

  conn.on("message", function (message) {
    console.log("Get message", message);
  });

  conn.send("Hello world");
});
