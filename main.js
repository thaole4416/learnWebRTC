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
    navigator.getUserMedia({ video: true, audio: true }, function (stream) {
        let video = document.querySelector('video');
        video.src = window.URL.createObjectURL(video);
    }, function (err) {
        alert('error', err)
    });
  } else {
    alert("Sorry, your browser does not support getUserMedia.");
  }
}

main();