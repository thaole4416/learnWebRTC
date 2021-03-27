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
    const video = document.querySelector("video");
    const canvas = document.querySelector("canvas");
    let streaming = false;
    navigator.getUserMedia(
      { video: true, audio: false },
      function (stream) {
        video.srcObject = stream;
        streaming = true;
      },
      function (err) {
        alert("error", err);
      }
    );
    document
      .querySelector("#capture")
      .addEventListener("click", function (event) {
        if (streaming) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          let context = canvas.getContext("2d");
          context.drawImage(video, 0, 0);
        }
      });
  } else {
    alert("Sorry, your browser does not support getUserMedia.");
  }
}

main();
