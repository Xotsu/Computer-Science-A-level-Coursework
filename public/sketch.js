var socket = io.connect();
var connenction = false;
var stateSwitch = false;
var enemy = {
  x: -20,
  y: -20,
  b: [],
  lives: 3,
  removeBullet: -1 //index of the bullet that will be removed if hit (shouldnt hapen more than once per frame)
};
var removeBullet = -1;

function serverSetup() {
  socket.on("drawing", function(data) {
    if (!stateSwitch) {
      state = 0;
      stateSwitch = true;
    }
    enemy.x = data.x;
    enemy.y = data.y;
    enemy.b = [];
    for (i = 0; i < data.b.length; i++) {
      enemy.b.push(data.b[i]);
    }
    enemy.lives = data.lives;
    enemy.removeBullet = data.removeBullet;
  });
}
var topScoresGot = false;
function topScoreFunction() {
  if (!topScoresGot) {
    socket.on("top5", function(data) {
      //songSound.loop()
      //songSound.play()
      console.log("running");
      for (record of data) {
        topScores.push(record.Names + " " + record.Score);
      }
    });
    topScoresGot = true;
  }
}

function send() {
  var data = {
    x: player.x,
    y: player.y,
    b: bullets,
    lives: player.lives,
    removeBullet: removeBullet
  };
  removeBullet = -1;
  socket.emit("drawing", data);
}

function drawMultiplayer() {
  push();
  fill(0, 0, 255);
  ellipse(enemy.x, enemy.y, 10);
  pop();
  push();
  fill(255, 255, 0);
  for (b of enemy.b) {
    ellipse(b.position.x, b.position.y, b.radius);
  }
  pop();
}

function checkBulletCollisions() {
  if (enemy.removeBullet != -1) {
    bullets.splice(enemy.removeBullet, 1);
    enemyDamagedSound.play();
    score++;
  }
  for (b of enemy.b) {
    if (
      !collideCircleCircle(
        player.x,
        player.y,
        5,
        b.position.x,
        b.position.y,
        b.radius / 2
      )
    ) {
      if (b.position.xv > 0) {
        player.xv = 1 / b.position.xv + b.radius / 3;
      } else if (b.position.xv < 0) {
        player.xv = 1 / b.position.xv - b.radius / 3;
      }
      player.yv = 2 / b.position.yv + b.radius;

      player.x += player.xv;
      player.y += player.yv;
      removeBullet = enemy.b.indexOf(b);
      enemy.b.splice(enemy.b.indexOf(b), 1);
      enemyKilledSound.play();
      score--;
    }
  }
}

function displayLives() {
  for (i = 0; i < player.lives * 25; i += 25) {
    image(mh, i, 0, mh.width / 4, mh.height / 4);
  }
  for (i = 950; i > 950 - enemy.lives * 25; i -= 25) {
    image(eh, i, 0, eh.width / 4, eh.height / 4);
  }
  push();
  //textAlign(TOP,LEFT)
  textSize(70);
  fill(255);
  text("Score: " + score, 140, 80);
  pop();
}

//Game State Variables
var state = 4; //state 0: game 1: won 2: lost 3: lobby screen 4 or other: menu
var backgroundArray = []; //array where all of the backgrounds are stored
var backgroundSelection = Math.floor(Math.random() * 4); //selects a random number to display as a background
//Player Variables
var player = {
  x: 500,
  y: 200,
  xv: 0,
  yv: 0,
  lives: 3
};
//Platform sides which are colliding with the player going top right bottom left
var sides = {
  t: false,
  r: false,
  b: false,
  l: false
};
var gravity = 0.27;
var resistance = 0.5;
var floorCol = false;
var doubleJump = true;
var tripleJump = true;
//bullet variables
var bullets = [];
var canShoot = true;
var canShootCounter = 0;
var timeFired = 5;

var userName;
var scoreSent = false;
var scoreReceived = false;
var userNameObtained = false;
var score = 0;
var topScores = [];

function preload() {
  songSound = loadSound("Music/Song.mp3");
  enemyDamagedSound = loadSound("Music/EnemyDamaged.wav");
  enemyKilledSound = loadSound("Music/EnemyKilled.wav");
  jumpSound = loadSound("Music/Jump.wav");
  shootSound = loadSound("Music/PlayerDamaged.wav");
  playerKilledSound = loadSound("Music/PlayerKilled.wav");
  mh = loadImage("Pictures/rHeart.png");
  eh = loadImage("Pictures/blueH.png");
  b0 = loadImage("Pictures/background1.png");
  b1 = loadImage("Pictures/background4.png");
  b2 = loadImage("Pictures/background2.jpg");
  b4 = loadImage("Pictures/background3.jpg");
  b3 = loadImage("Pictures/background41.png");
  platform = loadImage("Pictures/Platform.png");
}

function setup() {
  createCanvas(1000, 600);
  clickers(); //generates all of the buttons for the game
  loadImages();
}

function draw() {
  background(100);
  stateManager(); //manages what gets displayed on the screen
}

function loadImages() {
  backgroundArray.push(b0);
  backgroundArray.push(b1);
  backgroundArray.push(b3);
  backgroundArray.push(b2);
}

function stateManager() {
  if (state === 0) {
    //display game screen
    game();
  } else if (state == 1) {
    //display won screen
    gameWon();
  } else if (state == 2) {
    //display lost screen
    gameLost();
  } else if (state == 3) {
    //display menu
    waitingLobby();
  } else {
    menuScreen();
  }
}

function waitingLobby() {
  if (!connenction) {
    serverSetup();
    connenction = false;
  }
  send();
  background(40);
  //image(b4,0,0)
  push();
  fill(140, 140, 140);
  stroke(120, 120, 120);
  textSize(80);
  text("Waiting For Players...", 500, 150);
  pop();
  toMenu.draw();
}

function menuScreen() {
  background(40);
  image(b4, 0, 0);
  topScoreFunction();
  push();
  fill(192, 247, 185);
  stroke(80, 80, 80);
  textSize(80);
  text("Welcome to \nSuper Jump", 500, 150);
  pop();
  startButton.draw();
  if (!scoreReceived) {
    socket.emit("getScores");
    scoreReceived = true;
  }
  if (!userNameObtained) {
    userName = prompt("Please enter your username:");
    userNameObtained = true;
  }
  for (i = 0; i < topScores.length; i++) {
    push();
    fill(255);
    text("High Scores:", width - 200, 20);
    text(topScores[i], width - 200, 50 + i * 20);
    pop();
  }
}

var gameStarted = false;

function game() {
  image(backgroundArray[backgroundSelection], 0, 0);
  image(platform, 333, 280, platform.width + 10, platform.height + 20);
  displayLives();
  checkCollisions(333, 280, platform.width + 10, platform.height + 20);
  checkBulletCollisions();
  bullet();
  movement();
  jumping();
  velocity();
  drawMultiplayer();
  if (player.lives <= 0) {
    state = 2;
  }
  if (enemy.lives <= 0) {
    state = 1;
  }
  push();
  fill(255, 0, 0);
  ellipse(player.x, player.y, 10);
  pop();
  send();
}

function bullet() {
  if (canShoot == false) {
    canShootCounter++;
  }
  if (canShootCounter == 30) {
    canShoot = true;
    canShootCounter = 0;
  }
  if (mouseIsPressed) {
    timeFired += 0.5;
    timeFired = Math.max(Math.min(timeFired, 40), 8);
  }
  for (b of bullets) {
    b.display();
    b.update();
  }
}

function mouseReleased() {
  if (canShoot) {
    if (!gameStarted) {
      bullets = [];
      gameStarted = true;
    } else if (gameStarted) {
      bullets.push(new Bullet(player, timeFired));
      shootSound.play();
      canShoot = false;
      timeFired = 5;
    }
  }
}

function movement() {
  if (keyIsDown(65) && !(player.x < 10)) {
    if (sides.r) {
      //player.x++
      player.xv = 0;
    } else {
      player.xv = -5;
    }
  }
  //RIGHT
  if (keyIsDown(68) && !(player.x > 990)) {
    if (sides.l) {
      player.xv = 0;
    } else if (keyIsDown(65)) {
      player.xv = 0;
    } else {
      player.xv = 5;
    }
  }
}

function keyPressed() {
  if (keyCode == 32) {
    if (doubleJump == true) {
      doubleJump = false;
      player.yv = -6;
      player.y -= 1;
      jumpSound.play();
    } else if (tripleJump == true) {
      tripleJump = false;
      player.yv = -6;
      player.y -= 1;
      jumpSound.play();
    }
  }
}

function jumping() {
  if (!sides.t && player.y <= 600) {
    player.yv += gravity;
    player.yv = Math.max(Math.min(player.yv, 10), -30);
  } else {
    if (sides.t && player.yv >= 0) {
      player.yv = 0;
      player.y = 277;
      floorCol = true;
      doubleJump = true;
      tripleJump = true;
    } else if (sides.t && player.yv < 0) {
      floorCol = true;
      doubleJump = true;
      tripleJump = true;
    } else {
      player.yv = -5;
      player.x = 500;
      player.y = 200;
      floorCol = true;
      doubleJump = true;
      tripleJump = true;
      player.lives--;
      playerKilledSound.play();
    }
  }
  player.y += player.yv;
}

function velocity() {
  //horizontal velcity
  if (player.xv > 0.5) {
    player.xv -= resistance;
  } else if (player.xv < -0.5) {
    player.xv += resistance;
  } else {
    player.xv = 0;
  }
  player.x += player.xv;
}

function gameWon() {
  //winning game screen
  background(240);
  push();
  fill(192, 247, 185);
  stroke(20, 250, 3);
  textSize(100);
  text("YOU WIN", 500, 150);
  pop();
  if (!scoreSent) {
    var myScore = {
      name: userName,
      score: score
    };
    socket.emit("addScore", myScore);
    scoreSent = true;
  }
  toMenu.draw();
}

function gameLost() {
  //losing game screen
  background(30);
  push();
  fill(219, 37, 55);
  stroke(143, 19, 37);
  textSize(50);
  text("GAME OVER\n  YOU LOSE", 500, 150);
  pop();
  if (!scoreSent) {
    var myScore = {
      name: userName,
      score: score
    };
    socket.emit("addScore", myScore);
    scoreSent = true;
  }
  toMenu.draw();
}

function clickers() {
  //button that will be in the middle of the menu starting game when pressed
  startButton = new Clickable();
  startButton.locate(width / 2 - 170, height / 2 - 40);
  startButton.width = 340;
  startButton.height = 80;
  startButton.text = "Start";
  startButton.onPress = function() {
    state = 3;
  };

  //button that will reset the game by going back to the main menu
  toMenu = new Clickable();
  toMenu.locate(width / 2 - 170, height / 2 - 40);
  toMenu.width = 340;
  toMenu.height = 80;
  toMenu.text = "Play Again";
  toMenu.onPress = function() {
    location.reload();
  };
}

function checkCollisions(x, y, w, h) {
  // === COLLISION LINES OF RECT ONE === ** TOP RIGHT BOTTOM LET **
  sides.t = checkCollision(x, y, x + w, y, player.x, player.y, 5);
  sides.r = checkCollision(x + w, y, x + w, y + h, player.x, player.y, 5);
  sides.b = checkCollision(x, y + h, x + w, y + h, player.x, player.y, 5);
  sides.l = checkCollision(x, y, x, y + h, player.x, player.y, 5);
}
