function hasUserMedia() {
  return !!(
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMeida ||
    navigator.msGetUserMedia
  );
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

function main() {
  if (hasUserMedia()) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMeida ||
      navigator.msGetUserMedia;
    let constraints = {
      video: {
        mandatory: {
          minWidth: 640,
          minHeight: 480,
        },
      },
      audio: true,
    };
    if (
      /Android|WebOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      constraints = {
        video: {
          minWidth: 480,
          minHeight: 320,
          maxWidth: 1024,
          maxHeight: 768,
        },
        audio: true,
      };
    }
    navigator.getUserMedia(
      constraints,
      function (stream) {
        let video = document.querySelector("video");
        video.src = window.URL.createObjectURL(stream);
      },
      function (err) {
        alert("error", err);
      }
    );
  } else {
    alert("Sorry, your browser does not support getUserMedia.");
  }
}

handleMultipleDevices();
