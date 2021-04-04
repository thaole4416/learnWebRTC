let name, connectedUser;
const connection = new WebSocket("ws://localhost:8888");

let loginPage = document.querySelector("#login-page"),
  usernameInput = document.querySelector("#username"),
  loginButton = document.querySelector("#login"),
  callPage = document.querySelector("#call-page"),
  theirUsernameInput = document.querySelector("#their-username"),
  callButton = document.querySelector("#call"),
  userList = document.querySelector("#list"),
  hangUpButton = document.querySelector("#hang-up"),
  myName;

callPage.style.display = "none";

// Login when the user clicks the button
loginButton.addEventListener("click", function (event) {
  let name = usernameInput.value;
  myName = name;
  if (name.length > 0) {
    send({ type: "login", name: name });
  }
});

connection.onopen = function () {
  console.log("connected");
};

// handle all messages through this callback
connection.onmessage = function (message) {
  console.log(`got message`, message.data);

  var data = JSON.parse(message.data);

  switch (data.type) {
    case "login": {
      onLogin(data.success);
      break;
    }
    case "list": {
      onList(data.message);
      break;
    }
    case "offer": {
      onOffer(data.offer, data.name);
      break;
    }
    case "answer": {
      onAnswer(data.answer);
      break;
    }
    case "candidate": {
      onCandidate(data.candidate);
      break;
    }
    case "leave": {
      onLeave();
      break;
    }
    default:
      break;
  }
};
connection.onerror = function (err) {
  console.log("got error", err);
};

function send(message) {
  if (connectedUser) {
    message.name = connectedUser;
  }
  connection.send(JSON.stringify(message));
}

function onLogin(success) {
  if (success === false) {
    alert("Login unsuccessful, please try a different name.");
  } else {
    loginPage.style.display = "none";
    callPage.style.display = "block";
    // Get the plumbing ready for a call
    startConnection();
  }
}
callButton.addEventListener("click", function () {
  let theirUsername = theirUsername.value;

  if (theirUsername.length > 0) {
    startPeerConnection(theirUsername);
  }
});
hangUpButton.addEventListener("click", function () {
  send({
    type: "leave",
  });
  onLeave();
});
function onList(list) {
  userList.innerHTML = "";
  list.forEach((item) => {
    if (item.name !== myName) {
      let listItem = document.createElement("li");
      listItem.innerText = `${item.name} --------  ${
        item.otherName ? "calling" : "online"
      }`;
      listItem.addEventListener("click", function (e) {
        theirUsernameInput.value = item.name;
      });
      userList.appendChild(listItem);
    }
  });
}
function onOffer(offer, name) {
  connectedUser = name;
  yourConnection.setRemoteDescription(new RTCSessionDescription(offer));
  yourConnection.createAnswer(
    function (answer) {
      yourConnection.setLocalDescription(answer);
      send({
        type: "answer",
        answer,
      });
    },
    function (err) {
      alert("an error has occurred");
    }
  );
}
function onAnswer(answer) {
  yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
}
function onCandidate(candidate) {
  yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
}
function onLeave() {
  connectedUser = null;
  theirVideo.srcObject = null;
  yourConnection.close();
  yourConnection.onaddtrack = null;
  setupPeerConnection(stream);
}

let yourVideo = document.querySelector("#yours"),
  theirVideo = document.querySelector("#theirs"),
  yourConnection,
  stream;

function hasUserMedia() {
  return !!(
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMeida ||
    navigator.msGetUserMedia
  );
}

function hasRTCPeerConnection() {
  window.RTCPeerConnection =
    window.RTCPeerConnection ||
    window.webkitRTCPeerConnection ||
    window.mozRTCPeerConnection;
  window.RTCSessionDescription =
    window.RTCSessionDescription ||
    window.webkitRTCSessionDescription ||
    window.mozRTCSessionDescription;
  window.RTCIceCandidate =
    window.RTCIceCandidate ||
    window.webkitRTCIceCandidate ||
    window.mozRTCIceCandidate;
  return !!window.RTCPeerConnection;
}

function startConnection() {
  if (hasUserMedia()) {
    navigator.getUserMedia(
      {
        video: true,
        audio: false,
      },
      function (mystream) {
        stream = mystream;
        yourVideo.srcObject = stream;
        if (hasRTCPeerConnection()) {
          setupPeerConnection(stream);
        } else {
          alert("sorry, your browser does not support webrtc.");
        }
      },
      function (err) {
        console.log(err);
      }
    );
  } else {
    alert("sorry, your browser does not support webrtc");
  }
}

function setupPeerConnection(stream) {
  let configuration = {
      iceServers: [{ url: "stun:stun.1.google.com:19302" }],
    },
    yourConnection = new RTCPeerConnection(configuration);

  let [track] = stream.getTracks();
  yourConnection.addTrack(track);
  yourConnection.ontrack = function (e) {
    if (ev.streams && ev.streams[0]) {
      theirVideo.srcObject = ev.streams[0];
    } else {
      if (!inboundStream) {
        inboundStream = new MediaStream();
        theirVideo.srcObject = inboundStream;
      }
      inboundStream.addTrack(ev.track);
    }
  };

  yourConnection.onicecandidate = function (e) {
    if (e.candidate) {
      send({
        type: "candidate",
        candidate: e.candidate,
      });
    }
  };
}

function startPeerConnection(user) {
  connectedUser = user;

  yourConnection.createOffer(
    function (offer) {
      send({
        type: offer,
        offer,
      });
      yourConnection.setLocalDescription(offer);
    },
    function (err) {
      alert("an error has occurred.");
    }
  );
}
