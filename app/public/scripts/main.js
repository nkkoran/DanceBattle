var canvas;
var ctx;
var x;
var poseNet;
let camera;
var camPoses;


function init() {
	canvas = document.getElementById("poseCanvas");
	ctx = canvas.getContext("2d");
	ctx.fillStyle = "#000000";
    //ctx.fillRect(0, 0, 300, 600);
    camera = document.querySelector("#liveCamera");
}

function startCamera() {
    
	let video = camera;

    if (navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
          video.srcObject = stream;
        })
        .catch(function (err0r) {
          console.log("Something went wrong!");
        });
    }

    poseNet = ml5.poseNet(video, () => {
    	console.log('Model loaded');
    });

	poseNet.on('pose', (results) => {
  		camPoses = results;
	});

	ctx.fillStyle = '#FFFFFF';
	setInterval(draw, 10);
}

function draw() {
	if(typeof camPoses !== 'undefined') {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.fillRect(500-camPoses[0].pose.nose.x-5, camPoses[0].pose.nose.y-5, 10, 10);
	}
}


function stopCamera() {
      let video = camera;

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