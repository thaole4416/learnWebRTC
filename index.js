const WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 8888 }),
  users = {};

function sendTo(conn, message) {
  conn.send(JSON.stringify(message));
}

wss.on("connection", function (conn) {
  console.log("user connected");

  conn.on("message", function (message) {
    try {
      data = JSON.parse(message);
    } catch (err) {
      console.log(err);
      data = {};
    }
    switch (data.type) {
      case "login": {
        console.log(`user logged in as ${data.name}`);
        if (users[data.name]) {
          sendTo(conn, {
            type: "login",
            success: false,
          });
        } else {
          users[data.name] = conn;
          conn.name = data.name;
          sendTo(conn, {
            type: "login",
            success: true,
          });
        }
        break;
      }
      default: {
        sendTo(conn, {
          type: "error",
          message: "unrecognized command " + data.type,
        });
        break;
      }
    }
  });
});
