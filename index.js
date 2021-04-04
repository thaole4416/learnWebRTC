const WebSocketServer = require("ws").Server,
  wss = new WebSocketServer({ port: 8888 }),
  users = {};

function sendTo(conn, message) {
  conn.send(JSON.stringify(message));
}

function sendBoardcast(wss, msg) {
  wss.clients.forEach((conn) => conn.send(JSON.stringify(msg)));
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
          console.log("login success");
          sendBoardcast(wss, {
            type: "list",
            message: Object.values(users).map((c) => ({
              name: c.name,
              otherName: c.otherName,
            })),
          });
        }
        break;
      }
      case "offer": {
        console.log(`sending offer to`, data.name);
        let receiver = users[data.name];
        let sender = conn;
        if (receiver != null) {
          sender.otherName = data.name;
          sendTo(receiver, {
            type: "offer",
            offer: data.offer,
            name: conn.name,
          });
        } else {
          sendTo(sender, {
            type: "error",
            message: "cannot send offer to " + data.name,
          });
        }
        break;
      }
      case "answer": {
        console.log("sending answer to", data.name);
        let receiver = users[data.name];
        let sender = conn;
        if (receiver != null) {
          sender.otherName = data.name;
          sendTo(receiver, {
            type: "answer",
            answer: data.answer,
          });
        } else {
          sendTo(sender, {
            type: "error",
            message: "cannot send answer to " + data.name,
          });
        }
        break;
      }
      case "candidate": {
        console.log(`sending candidate to ${data.name}`);
        let receiver = users[data.name];
        if (receiver != null) {
          sendTo(receiver, {
            type: "candidate",
            candidate: data.candidate,
          });
          sendBoardcast(wss, {
            type: "list",
            message: Object.values(users).map((c) => ({
              name: c.name,
              otherName: c.otherName,
            })),
          });
        }
        break;
      }
      case "leave": {
        console.log("disconnecting user from", data.name);
        let receiver = users[data.name];
        receiver.otherName = null;
        if (receiver != null) {
          sendTo(receiver, {
            type: "leave",
          });
        }
        sendBoardcast(wss, {
          type: "list",
          message: Object.values(users).map((c) => ({
            name: c.name,
            otherName: c.otherName,
          })),
        });
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
  conn.on("close", function () {
    if (conn.name) {
      console.log(`${conn.name} disconnected`);
      delete users[conn.name];
      if (conn.otherName) {
        console.log("disconnecting user from", conn.otherName);
        let receiver = users[conn.otherName];
        receiver.otherName = null;
        if (receiver != null) {
          sendTo(receiver, {
            type: "leave",
          });
        }
      }
    }
    sendBoardcast(wss, {
      type: "list",
      message: Object.values(users).map((c) => ({
        name: c.name,
        otherName: c.otherName,
      })),
    });
  });
});
