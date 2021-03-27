function hasUserMedia() {
  return !!(
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMeida ||
    navigator.msGetUserMedia
  );
}

function addFilterToVideo() {
  const filters = ["", "grayscale", "sepia", "invert"];
  let currentFilter = 0;
  const canvas = document.querySelector("canvas");
  const video = document.querySelector("video");
  video.addEventListener("click", function (event) {
    console.log(streaming);
    if (streaming) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext("2d");
      context.drawImage(video, 0, 0);
      currentFilter++;
      if (currentFilter > filters.length - 1) currentFilter = 0;
      canvas.className = filters[currentFilter];
    }
  });
}

function main() {
  const video = document.querySelector("video");
  const canvas = document.querySelector("canvas");
  let streaming = false;
  if (hasUserMedia()) {
    navigator.getUserMedia =
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMeida ||
      navigator.msGetUserMedia;
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
  addFilterToVideo();
}

main();
