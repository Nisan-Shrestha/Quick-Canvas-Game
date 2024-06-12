const PHYSICS_STEP: number = 5;
const PLAYER_MOVE_SPEED: number = 1;
const OBSTACLE_SPEED: number = 0.5;
const BG_SPEED: number = 0.1;
const LANE_WIDTH: number = 100;
let resetButton: Button;
let BG_MAX_HEIGHT: number = 100;
let xpad = 5;
let Game_Over = false;
let Score: number = 0;
let BGPos: number = 0;
let global_listener;

const PlayerSprite = new Image();
PlayerSprite.src = "/player.png";
const EnemySprite = new Image();
EnemySprite.src = "/enemy.png";
// new Image();
//       this.image.src = imageSrc;
const canvas: HTMLCanvasElement = document.getElementById(
  "gameCanvas"
) as HTMLCanvasElement;
let lanePos: number[];
function setupCanvas() {
  if (canvas.parentElement) {
    canvas.width = canvas.parentElement.offsetWidth;
    canvas.height = canvas.parentElement.offsetHeight;
    BG_MAX_HEIGHT = (840 / canvas.height) * 640;
  }

  lanePos = [
    canvas.width / 4 - LANE_WIDTH / 2,
    canvas.width / 2 - LANE_WIDTH / 2,
    (canvas.width * 3) / 4 - LANE_WIDTH / 2,
  ];

  global_listener = window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() === "r") {
      if (Game_Over) {
        Game_Over = false;
        Score = 0;

        obsArray = [];
        setupGame();
      }
    }
  });
}

const ctx: CanvasRenderingContext2D = canvas.getContext("2d")!;

if (ctx !== null) {
  ctx.fillStyle = "green";
  ctx.fillRect(200, 10, 150, 100);
  // console.log(canvas.width, canvas.height);
}

interface IKeymap {
  left: string;
  right: string;
  fire: string;
}
interface Button {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onClick: () => void;
  active: boolean;
}
enum Lane {
  left = 0,
  right = 2,
  center = 1,
}
// let a = new Imag?e()

class Rect2D {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  image: HTMLImageElement | undefined;
  drawImage: boolean = false;
  // image: Image
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    drawImage: boolean = false,
    image: HTMLImageElement
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
    this.drawImage = drawImage;
    this.image = image;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    if (!this.drawImage) ctx.fillRect(this.x, this.y, this.width, this.height);
    else if (this.image)
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    ctx.strokeStyle = "black";
    // ctx.strokeRect(this.x, this.y, this.width, this.height);
  }
}

class Player {
  keymap: IKeymap;
  lane: Lane;
  rect: Rect2D;
  moveSpeed: number;
  currentPos: number;
  targetPos: number;
  constructor(
    keymap: IKeymap,
    width: number,
    height: number,
    imageMode: boolean = false,
    image: HTMLImageElement
  ) {
    this.moveSpeed = PLAYER_MOVE_SPEED;
    this.keymap = keymap;
    lanePos = [
      canvas.width / 4 - width / 2,
      canvas.width / 2 - width / 2,
      (canvas.width * 3) / 4 - width / 2,
    ];
    this.rect = new Rect2D(
      lanePos[1],
      canvas.height - 210,
      width,
      height,
      "red",
      imageMode,
      image
    );
    this.lane = Lane.center;
    this.targetPos = lanePos[Lane.center];
    this.currentPos = lanePos[Lane.center];
    this.setupControls();
  }

  setupControls() {
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case this.keymap.left:
          this.shiftTargetLeft();
          break;
        case this.keymap.right:
          this.shiftTargetRight();
          break;
        case this.keymap.fire:
          // this.shoot()
          break;
      }
    });
  }

  shiftTargetLeft() {
    if (this.lane === Lane.center) {
      this.lane = Lane.left;
      this.targetPos = lanePos[Lane.left];
    } else if (this.lane === Lane.right) {
      this.lane = Lane.center;
      this.targetPos = lanePos[Lane.center];
    }
  }
  shiftTargetRight() {
    if (this.lane === Lane.center) {
      this.lane = Lane.right;
      this.targetPos = lanePos[Lane.right];
    } else if (this.lane === Lane.left) {
      this.lane = Lane.center;
      this.targetPos = lanePos[Lane.center];
    }
  }

  private movePosition(delta: number, direction: number): void {
    if (this.targetPos != this.currentPos)
      this.currentPos +=
        direction * delta * (this.moveSpeed + Math.trunc(Score / 8) * 0.25);
    this.rect.x = this.currentPos;
  }

  updateDirection(delta: number) {
    // console.log(this.currentPos, this.targetPos);
    if (this.currentPos - this.targetPos > 10) {
      this.movePosition(delta, -1);
    } else if (this.currentPos - this.targetPos < -10) {
      this.movePosition(delta, 1);
    } else {
      this.currentPos = this.targetPos;
    }
  }

  update(delta: number) {
    // console.log(delta);
    this.updateDirection(delta);
  }
}

class Obstacle {
  rect: Rect2D;
  lane: Lane;
  overflow: boolean = false;
  constructor(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    imageMode: boolean = false,
    image:HTMLImageElement
  ) {
    this.rect = new Rect2D(x, y, width, height, color, imageMode, image);
    this.lane = Lane.center;
    this.rect.x = lanePos[this.lane];
  }

  private movePosition(delta: number): void {
    this.rect.y += delta * (OBSTACLE_SPEED + Math.trunc(Score / 8) * 0.255);
    // direction * delta * ;

    if (this.rect.y >= canvas.height) {
      this.rect.y = -this.rect.height;
      this.rect.x = lanePos[Math.floor(Math.random() * 3)];
      Score += 1;
    }
  }

  update(delta: number) {
    // console.log(delta);
    this.movePosition(delta);
  }
}

function update() {
  let newTS: number = Date.now();
  let deltaTime = newTS - lastTimestamp;
  lastTimestamp = newTS;
  // console.log(1000/deltaTime)

  if (!Game_Over) {
    //draw and update
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < PHYSICS_STEP; i++) {
      player.update(deltaTime / PHYSICS_STEP);
      for (let obj of obsArray) obj.update(deltaTime / PHYSICS_STEP);
      BGPos +=
        (deltaTime / PHYSICS_STEP) * (BG_SPEED + Math.trunc(Score / 8) * 0.25);
      canvas.style.backgroundPositionY = Math.trunc(BGPos) + "px";
    }

    console.log(BGPos, "px");

    player.rect.draw(ctx);
    for (let obj of obsArray) obj.rect.draw(ctx);
    // console.log(canvas);
  }
  ctx.textAlign = "left";
  ctx.font = "26px Inter";
  ctx.fillStyle = "#ffffff";
  ctx.globalAlpha = 0.25;
  ctx.fillRect(0, 0, 150, 80);
  ctx.fillStyle = "black";
  ctx.globalAlpha = 1;
  ctx.fillText(`Score: ${Score}`, 10, 50);
  // console.log(obsArray.length, Score);

  checkCollision();
  requestAnimationFrame(update);
}

function isColliding(a: Rect2D, b: Rect2D): boolean {
  return (
    a.x < b.x + b.width - xpad &&
    a.x + a.width - xpad > b.x &&
    a.y < b.y + b.height - xpad &&
    a.y + a.height - xpad > b.y
  );
}

function checkCollision() {
  for (let obj of obsArray) {
    if (isColliding(player.rect, obj.rect)) {
      console.log("Collision Detected");
      if (!Game_Over)
        setTimeout(() => {
          drawGameOverScreen();
          // alert("Game Over: Press R to restart \n Your Score: " + Score);
        }, 200);
      if (!Game_Over) Game_Over = true;
    }
  }
}

function setupGame() {
  player = new Player(
    {
      left: "a",
      right: "d",
      fire: " ",
    },
    100,
    123,
    true,
    PlayerSprite
  );
  obsArray = [];
  obsArray.push(
    new Obstacle(0, -123, 100, 123, "blue", true, EnemySprite)
  );
  obsArray.push(
    new Obstacle(0, -123, 100, 123, "blue", true, EnemySprite)
  );
}

function drawMainMenu(ctx: CanvasRenderingContext2D, buttons: Button[]) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.font = "48px Helvetica Neue";
  ctx.fillStyle = "#FFFFFF";
  ctx.textAlign = "center";
  ctx.fillText("Main Menu", canvas.width / 2, canvas.height / 4);

  // Draw the buttons
  ctx.font = "24px Helvetica Neue";
  buttons.forEach((button) => {
    button.active = true;
    ctx.fillStyle = "#0283B6"; // Button color
    ctx.fillRect(button.x, button.y, button.width, button.height);

    ctx.fillStyle = "#FFFFFF"; // Button text color
    ctx.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 1.5
    );
  });
}

function isInsideButton(x: number, y: number, button: Button): boolean {
  return (
    x >= button.x &&
    x <= button.x + button.width &&
    y >= button.y &&
    y <= button.y + button.height
  );
}

function handleCanvasClick(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  buttons: Button[]
) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  buttons.forEach((button) => {
    if (isInsideButton(x, y, button) && button.active) {
      button.onClick();
      button.active = false;
    }
  });
}

// Example usageplaye

function initMenu() {
  const buttonWidth = 200;
  const buttonHeight = 50;
  const buttonX = (canvas.width - buttonWidth) / 2;
  const buttonYStart = canvas.height / 2;

  const buttons: Button[] = [
    {
      text: "Start Game",
      x: buttonX,
      y: buttonYStart,
      width: buttonWidth,
      height: buttonHeight,
      onClick: () => {
        setupGame();
        console.log("Starting game");
        lastTimestamp = Date.now();

        setTimeout(() => update(), 0);
      },
      active: false,
    },
  ];
  resetButton = {
    text: "Restart (Click Here | Press R",
    x: (ctx.canvas.width - 200) / 2, // Center horizontally
    y: (ctx.canvas.height + 200) / 2 + 30, // Positioned below the text area
    width: 200,
    height: 50,
    onClick: () => {
      console.log("Restarting game");
      Game_Over = false;
      Score = 0;

      obsArray = [];
      setupGame();
    },
    active: false,
  };

  drawMainMenu(ctx, buttons);

  canvas.addEventListener("click", (event) => {
    handleCanvasClick(event, canvas, buttons);
    handleCanvasClick(event, canvas, [resetButton]);
  });
}

function drawGameOverScreen() {
  const textAreaX = (ctx.canvas.width - 400) / 2;
  const textAreaY = (ctx.canvas.height - 200) / 2;
  const textAreaWidth = 400;
  const textAreaHeight = 200;

  // Draw the background for the text area
  ctx.fillStyle = "#000000"; // Black background for the text area
  ctx.fillRect(textAreaX, textAreaY, textAreaWidth, textAreaHeight);

  ctx.font = "48px Helvetica Neue";
  ctx.fillStyle = "#FF0000";
  ctx.textAlign = "center";
  ctx.fillText("Game Over", ctx.canvas.width / 2, textAreaY + 60);

  ctx.font = "36px Helvetica Neue";
  ctx.fillStyle = "#FFFFFF";
  ctx.fillText(`Score: ${Score}`, ctx.canvas.width / 2, textAreaY + 120);

  // Draw the reset button
  ctx.fillStyle = "#0283B6"; // Button color
  ctx.fillRect(
    resetButton.x,
    resetButton.y,
    resetButton.width,
    resetButton.height
  );
  resetButton.active = true;
  ctx.font = "14px Helvetica Neue";
  ctx.fillStyle = "#FFFFFF"; // Button text color
  ctx.fillText(
    resetButton.text,
    resetButton.x + resetButton.width / 2,
    resetButton.y + resetButton.height / 1.5
  );
}

let player: Player;
let obsArray: Obstacle[] = [];
let lastTimestamp = Date.now();

function main() {
  setupCanvas();
  initMenu();
  // setupGame();
  // update();
}

main();
