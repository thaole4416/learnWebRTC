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
  return !!window.RTCPeerConnection;
}

function handleMultipleDevices() {
  navigator.mediaDevices.enumerateDevices().then(function (sources) {
    var audioSource = null;
    var videoSource = null;
    for (var i = 0; i < sources.length; ++i) {
      var source = sources[i];
      if (source.kind === "audio") {
        console.log("Microphone found:", source.label, source.id);
        audioSource = source.id;
      } else if (source.kind === "video") {
        console.log("Camera found:", source.label, source.id);
        videoSource = source.id;
      } else {
        console.log("Unknown source found:", source);
      }
    }
    var constraints = {
      audio: { optional: [{ sourceId: audioSource }] },
      video: { optional: [{ sourceId: videoSource }] },
    };
    navigator.getUserMedia(
      constraints,
      function (stream) {
        var video = document.querySelector("video");
        video.src = window.URL.createObjectURL(stream);
      },
      function (error) {
        console.log("Raised an error when capturing:", error);
      }
    );
  });
}

function startPeerConnection() {
  const configuration = {
    //Uncomment this code to add custom iceServers
    //"iceServers": [{"url" : "stun:stun.1.google.com:19302"}]
  };
  yourConnection = new webkitRTCPeerConnection(configuration);
  theirConnection = new webkitRTCPeerConnection(configuration);

  yourConnection.createOffer().then((offer) => {
    yourConnection.setLocalDesciption(offer);
    theirConnection.setRemoteDescription(offer);

    theirConnection.createAnswer().then((offer) => {
      theirConnection.setLocalDesciption(offer);
      yourConnection.setRemoteDescription(offer);
    });
  });
}

function main() {
  const yourVideo = document.querySelector("#yours");
  const theirVideo = document.querySelector("#theirs");
  if (hasUserMedia()) {
    navigator.getUserMedia(
      {
        video: true,
        audio: true,
      },
      function (stream) {
        yourVideo.srcObject = stream;
        if (hasRTCPeerConnection()) {
          startPeerConnection(stream);
        } else {
          alert("sorry, we failed to capture your camera, please try again.");
        }
      },
      function (err) {
        alert(err);
      }
    );
  } else {
    alert("sorry, your browser does not support WebRTC");
  }
}

main();
