let paddle,
    ball,
    balls,
    width = window.innerWidth * 0.95,
    height = window.innerHeight * 0.95;

function setup() {
  createCanvas(width,height);
  paddle = new PongPaddle();

  // one pong ball
  // ball = new PongBall();

  // multiple balls
  balls = [];
  let num = 20;
  for (let n=0;n<num;n++) {
    balls.push(new PongBall());
  }

}

function draw() {
  background(255,204,0);
  paddle.move();
  paddle.create();

  // one ball
  // ball.move(paddle.x,paddle.x + paddle.w,paddle.y);

  // multiple balls
  for (let b=0;b<balls.length;b++) {
    let ball = balls[b];
    ball.move(paddle.x,paddle.x + paddle.w,paddle.y);
  }
}

function mouseMoved() {
  let x = mouseX;
}

// Pong Ball Class
class PongBall {

  constructor() {
    this.diameter = 30;
    this.radius = this.diameter/2;
    this.speed = random(1,2);
    this.yDirection = random(1,3);
    this.xDirection = random(1,3);
    this.x = (Math.random() * (width - 2*this.diameter)) + this.diameter;
    this.y = (Math.random() * (height * 0.5)) + this.diameter;
    this.score = 0;
  }

  move(paddleXmin,paddleXmax,paddleY) {

    // right and left wall
    if (this.x + this.radius > width || (this.x-this.radius) < 0) {
      this.xDirection *= -1;
    }

    // top wall
    if (this.y-this.radius < 0) {
      this.yDirection *= -1;
    }

    if (this.x - this.radius >= paddleXmin // Left side of paddle
            && this.x + this.radius <= paddleXmax // Right side of paddle
            && this.y > paddleY - this.radius
            && this.y < paddleY - this.radius + (this.speed*this.yDirection)) { // Bottom of ball is below the top of the paddle
      this.yDirection *= -1; // bounce

      this.score++; // add one to the score
      this.speed *= 1.1; // increase the speed
    }

    // Move the ball
    this.x += this.xDirection * this.speed;
    this.y += this.yDirection * this.speed;

    noStroke();
    fill('white');
    ellipse(this.x,this.y,this.diameter);
    fill('black');
    textAlign(CENTER, CENTER);
    text(this.score,this.x,this.y)

  }
}

class PongPaddle {
  constructor() {
    this.w = width / 4;
    this.h = 20;
  }

  move() {
    this.x = mouseX - (this.w/2);
    this.y = height - this.h - 10;
  }

  create() {
    noStroke();
    fill('lightblue');
    rect(this.x,this.y,this.w,this.h,10);
  }
}
