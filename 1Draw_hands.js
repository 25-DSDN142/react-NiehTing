// ----=  HANDS  =----
/* load images here */
let myImage;
let imageRequested = false;
let imgAlpha = 0;
let fadeTarget = 255;
let fadeSpeed = 2;
let fadeHoldFrames = 0;
let rayStates = [];
function prepareInteraction() {
  // Try to load shark; fallback to a known image if missing
  imageRequested = true;
  loadImage('images/shark.png',
    img => { myImage = img; },
    () => {
      console.warn('images/shark.png not found; falling back to images/background.png');
      loadImage('images/background.png', img2 => { myImage = img2; });
    }
  );
}

function drawInteraction(faces, hands) {
  //Ocean
  background(81, 166, 160);
  strokeWeight(0)
  fill(70, 145, 140);
  rect(0, 40, 1280, 640);
  fill(60, 122, 118);
  rect(0, 125, 1280, 640);
  fill(49, 99, 96);
  rect(0, 300, 1280, 640);

  // Ensure image is requested even if prepareInteraction wasn't called due to script order
  if (!myImage && !imageRequested) {
    imageRequested = true;
    loadImage('images/shark.png',
      img => { myImage = img; },
      () => {
        loadImage('images/background.png', img2 => { myImage = img2; });
      }
    );
  }

  // Random fade in/out state update
  if (fadeHoldFrames > 0) {
    fadeHoldFrames--;
  } else {
    if (imgAlpha < fadeTarget) {
      imgAlpha = min(fadeTarget, imgAlpha + fadeSpeed);
    } else if (imgAlpha > fadeTarget) {
      imgAlpha = max(fadeTarget, imgAlpha - fadeSpeed);
    } else {
      fadeHoldFrames = int(random(30, 120));
      fadeTarget = random() < 0.5 ? 0 : 255;
      fadeSpeed = random(1, 5);
    }
  }

  // Draw image with fading alpha
  if (myImage) {
    push();
    tint(255, imgAlpha);
    image(myImage, 940, 100, 300, 300);
    noTint();
    pop();
  }

  if (hands.length > 0) {
    drawFishBodyFromHand(hands[0]);
  }
  
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    //console.log(hand);
    if (showKeypoints) {
      drawConnections(hand)
    }

    // This is how to load in the x and y of a point on the hand.
    let indexFingerTipX = hand.index_finger_tip.x;
    let indexFingerTipY = hand.index_finger_tip.y;

    let middleFingerTipX = hand.middle_finger_tip.x;
    let middleFingerTipY = hand.middle_finger_tip.y;

    let ringFingerTipX = hand.ring_finger_tip.x;
    let ringFingerTipY = hand.ring_finger_tip.y;

    let pinkyFingerTipX = hand.pinky_finger_tip.x;
    let pinkyFingerTipY = hand.pinky_finger_tip.y;

    let thumbTipX = hand.thumb_tip.x;
    let thumbTipY = hand.thumb_tip.y;

    /*
    Start drawing on the hands here
    */
    
    //Draw Water rays beneath water (random)
    //Shark
    drawFishEyeFromHand(hand);


    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------
  push();
  noStroke();
  rotate(QUARTER_PI-50);
  const rays = [
    [-80, -0, 350, 40],
    [0, -300, 300, 10],
    [0, -200, 200, 20],
    [400, -1050, 300, 30],
    [300, -650, 300, 20],
  ];
  // initialize per-ray fade state if needed
  if (rayStates.length !== rays.length) {
    rayStates = new Array(rays.length).fill(0).map(() => ({
      alpha: random(0, 255),
      target: random() < 0.5 ? 0 : 255,
      speed: random(1, 5),
      hold: int(random(0, 60))
    }));
  }
  for (let i = 0; i < rays.length; i++) {
    const s = rayStates[i];
    // update independent fade per ray
    if (s.hold > 0) s.hold--; 
    else if (s.alpha < s.target) s.alpha = min(s.target, s.alpha + s.speed);
    else if (s.alpha > s.target) s.alpha = max(s.target, s.alpha - s.speed);
    else { s.hold = int(random(20, 100)); s.target = random() < 0.5 ? 0 : 255; s.speed = random(1, 5); }

    const [x, y, w, h] = rays[i];
    fill(255, s.alpha);
    rect(x, y, w, h, 40);
  }
  pop();
}

function drawFishBodyFromHand(hand) {
  // Determine pinch and draw fins/body once
  let finger = hand.pinky_finger_tip;
  let thumb = hand.thumb_tip;
  
  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  //Fish Fins
  fill(252, 127, 3);
  const finThreshold = 150;
  if (pinch > finThreshold) {
    quad(840, 450, 980, 270, 960, 530, 840, 550);
    quad(440, 450, 300, 270, 320, 530, 440, 550);
    quad(640, 400, 640, 120, 750, 50, 750, 200);
  } else {
    quad(840, 450, 920, 350, 920, 450, 840, 550);
    quad(440, 450, 360, 350, 360, 450, 440, 550);
    quad(640, 400, 640, 120, 530, 50, 530, 200);
  }
  // Fish body
  circle(640, 400, 500);
  fill(252, 152, 3);
  strokeWeight(0);
  rect(615, 160, 50, 120, 20);

  fill(0);
  ellipse(640, 500, 200, pinch);
}

function drawFishEyeFromHand(hand) {
  // Use pinch to size the white eyeball and middle finger for the pupil
  let finger = hand.pinky_finger_tip;
  let thumb = hand.thumb_tip;

  let centerX = (finger.x + thumb.x) / 2;
  let centerY = (finger.y + thumb.y) / 2;
  let pinch = dist(finger.x, finger.y, thumb.x, thumb.y);

  fill(255);
  stroke(0);
  strokeWeight(0);
  circle(centerX, centerY, pinch);

  let middleFingerTipX = hand.middle_finger_tip.x;
  let middleFingerTipY = hand.middle_finger_tip.y;
  fill(0)
  circle(middleFingerTipX, middleFingerTipY, 20);
}

function drawConnections(hand) {
  // Draw the skeletal connections
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}


// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {
  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 10);
  }
  pop()

}