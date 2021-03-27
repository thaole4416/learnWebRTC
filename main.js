function hasUserMedia() {
  return !!(
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMeida ||
    navigator.msGetUserMedia
  );
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

main();
