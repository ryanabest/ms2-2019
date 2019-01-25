let paddle,
    ball,
    balls,
    width = window.innerWidth,
    height = window.innerHeight,
    score = 0;

function setup() {
  this.y = 30;
  createCanvas(width,height);
  paddle = new pongPaddle();

  // one pong ball
  ball = new pongBall();

  // multiple balls
  // balls = [];
  // let num = 5;
  // for (let n=0;n<num;n++) {
  //   balls.push(new pongBall());
  // }

}

function draw() {
  background(255,204,0);
  paddle.move();
  paddle.create();

  // one ball
  ball.create();
  ball.move(paddle.x,paddle.x + paddle.w,paddle.y);

  // multiple balls
  // for (let b=0;b<balls.length;b++) {
  //   let ball = balls[b];
  //   ball.create();
  //   ball.move(paddle.x,paddle.x + paddle.w,paddle.y);
  // }
}

function mouseMoved() {
  let x = mouseX;
}

// Pong Ball Class
class pongBall {

  constructor() {
    this.diameter = 50;
    this.radius = this.diameter/2;
    this.speed = 5;
    this.yDirection = 1;
    this.xDirection = 1;
    this.x = (Math.random() * (width - 2*this.diameter)) + this.diameter;
    this.y = (Math.random() * (height * 0.5)) + this.diameter;
  }

  create() {
    noStroke();
    fill('white');
    ellipse(this.x,this.y,this.diameter);
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

    // Middle of ball is below the top of the paddle
    if (this.y > paddleY) {
      this.yDirection = 1; // continue going down forever

    } else if (this.x - this.radius >= paddleXmin // Left side of paddle
            && this.x + this.radius <= paddleXmax // Right side of paddle
            && this.y + this.radius > paddleY) { // Bottom of ball is below the top of the paddle
      this.yDirection = -1; // bounce

      score += 1; // add one to the score
      console.log(score);
      if (score/5 === Math.ceil(score/5)) {
        this.speed += 2; // increase the speed every 5 wins
      };
    }

    // Move the ball
    this.x += this.xDirection * this.speed;
    this.y += this.yDirection * this.speed;

  }
}

class pongPaddle {
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
    rect(this.x,this.y,this.w,this.h);
  }
}
