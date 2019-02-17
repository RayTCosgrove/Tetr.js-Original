let video;
let poseNet;
let poses = [];
let skeletons = [];
let test = false;
let ready = false;
let last = 0;
let mySound;



//keypoint constants
const leftShoulder = 5;
const rightShoulder = 6;
const leftWrist = 9;
const rightWrist = 10;
const leftHip = 11;
const rightHip = 12;
const leftEye = 1;
const rightEye = 2;
const leftEar = 3;
const rightEar = 4;
const leftElbow = 7;
const rightElbow = 8;
const nose = 0;

function preload() {
    soundFormats('mp3', 'ogg');
    mySound = loadSound("./sounds/theme.mp3");

}

function setup() {

    //canvas
   let cnv = createCanvas(480, 270);
    cnv.parent('canvasContainer');
    //sets up video feed
    video = createCapture(VIDEO)
    video.size(width, height);
    video.hide();

    //seting up poseNet
    poseNet = ml5.poseNet(video, modelReady);
   // poseNet.detectionType = 'single';
    poseNet.on('pose', function (results) {
        poses = results;
    });
    poseNet.singlePose();



}

//runs when ml model has been loaded
function modelReady() {
    console.log('Model is ready');
    ready = true;

}

//constantly draws
function draw() {
    
    if (mouseIsPressed && !mySound.isPlaying()) {
        mySound.setVolume(1.0);
        mySound.loop();
    }
    
    translate(width,0);
    scale(-1.0,1.0)
    image(video, 0, 0, 480, 270);
    
    drawKeypoints();
    drawSkeleton();
    if (ready) {
        checkForMove();

    }
}

//performs actions
function checkForMove() {

    let currentTime = Date.now();
    if (currentTime - last >= 500) {
        last = currentTime;
        if (getPointY(leftWrist) < getPointY(leftShoulder) && getPointY(rightWrist) < getPointY(rightShoulder)) {

            console.log("hold it");
            holdCurrent();

        }

        if (getPointX(leftWrist) < getPointX(leftShoulder) && getPointX(rightWrist) < getPointX(leftShoulder)) {
            console.log("move right b");
            moveCurrentRight();
        }

        if (getPointX(leftWrist) > getPointX(rightShoulder) && getPointX(rightWrist) > getPointX(rightShoulder)) {
            console.log("move left b");
            moveCurrentLeft();
        }

        if (getPointY(leftEye) > getPointY(leftEar)&& getPointY(rightEye)>getPointY(rightEar)) {
            console.log("nodding");
            rotateCurrent();
        }
        
        if(getPointY(leftWrist)<getPointY(leftShoulder)&&getPointY(rightWrist)>getPointY(leftShoulder)){
            rotateCurrent();
        }
        

        if (getPointY(leftWrist) > getPointY(leftElbow) && getPointY(rightWrist) > getPointY(rightElbow)) {
            console.log("drop it");
            moveCurrentDown();
        }
    }

}

function getPointX(bodypart) {
    if (poses.length != 0) {
        return poses[0].pose.keypoints[bodypart].position.x;
    }
}

function getPointY(bodypart) {
    if (poses.length != 0) {
        return poses[0].pose.keypoints[bodypart].position.y;
    }
}

// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
    // Loop through all the poses detected
    for (let i = 0; i < poses.length; i++) {

        // For each pose detected, loop through all the keypoints
        for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
            // A keypoint is an object describing a body part (like rightArm or leftShoulder)
            let keypoint = poses[i].pose.keypoints[j];
            // Only draw an ellipse is the pose probability is bigger than 0.2
            if (keypoint.score > 0.2) {
                fill(255, 0, 0);
                noStroke();
                ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
            }
        }
    }
}

// A function to draw the skeletons
function drawSkeleton() {
    // Loop through all the skeletons detected
    for (let i = 0; i < poses.length; i++) {
        // For every skeleton, loop through all body connections
        for (let j = 0; j < poses[i].skeleton.length; j++) {
            let partA = poses[i].skeleton[j][0];
            let partB = poses[i].skeleton[j][1];
            stroke(255, 0, 0);
            line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
        }
    }
}
