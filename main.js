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

function startPeerConnection(stream) {
  const configuration = {
    //Uncomment this code to add custom iceServers
    //"iceServers": [{"url" : "stun:127.0.0.1:9876"}]
  };
  yourConnection = new webkitRTCPeerConnection(configuration);
  theirConnection = new webkitRTCPeerConnection(configuration);

  // setup ice handling
  yourConnection.onicecandidate = function (event) {
    if (event.candidate) {
      theirConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };
  theirConnection.onicecandidate = function (event) {
    if (event.candidate) {
      yourConnection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };

  // setup streaming listening
  const [track] = stream.getTracks();
  yourConnection.addTrack(track);
  let inboundStream = null;
  const theirVideo = document.querySelector("#theirs");
  theirConnection.ontrack = (ev) => {
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

  // begin the offer
  yourConnection.createOffer().then((offer) => {
    yourConnection.setLocalDescription(offer);
    theirConnection.setRemoteDescription(offer);
    theirConnection.createAnswer().then((offer) => {
      theirConnection.setLocalDescription(offer);
      yourConnection.setRemoteDescription(offer);
    });
  });
}

function main() {
  const yourVideo = document.querySelector("#yours");
  if (hasUserMedia()) {
    navigator.getUserMedia(
      { video: true, audio: false },
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
