function startCamera() {
    var video = document.querySelector("#liveCamera");

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
        })
        .catch(function (err0r) {
          console.log("Something went wrong!");
        });
    }
}

function stopCamera() {
      var video = document.querySelector("#liveCamera");

      var stream = video.srcObject;
      var tracks = stream.getTracks();

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i];
        track.stop();
      }

      video.srcObject = null;
}

function hoveringOnButton(name) {
    document.getElementById(name).classList.add("Hovering");
    document.getElementById(name).style.cursor = "pointer";

}

function leaveButton(name) {
    document.getElementById(name).classList.remove("Hovering");
    document.getElementById(name).style.cursor = "default";
}

function play() {
    document.getElementById('videoElement').play();
    document.getElementById('playButton').style.display = 'none';
    document.getElementById('pauseButton').style.display = 'block';
}

function pause() {
    document.getElementById('videoElement').pause();
    document.getElementById('playButton').style.display = 'block';
    document.getElementById('pauseButton').style.display = 'none';
}