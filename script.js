const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

const dungeonTiles = new Image();
dungeonTiles.src = "./assets/character-and-tileset/Dungeon_Tileset.png";

const CANVAS_WIDTH = 1500;
const CANVAS_HEIGHT = 1000;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const w = 50; // width/height of each cell
let cols, rows;
let grid = [];
let stack = [];
let current;

let tileCanvas, tileCtx; // offscreen canvas for cropped tile image

function index(i, j) {
  if (i < 0 || j < 0 || i >= cols || j >= rows) {
    return -1;
  } 
  return i + j * cols;
}

class Cell {
  constructor(i, j) {
    this.i = i; // column
    this.j = j; // row
    this.visited = false;
    this.walls = {
      top: true,
      right: true,
      bottom: true,
      left: true
    };
  }

  checkNeighbors() {
    let neighbors = [];

    const top    = grid[index(this.i    , this.j - 1)];
    const right  = grid[index(this.i + 1, this.j    )];
    const bottom = grid[index(this.i    , this.j + 1)];
    const left   = grid[index(this.i - 1, this.j    )];

    if (top && !top.visited) neighbors.push(top);
    if (right && !right.visited) neighbors.push(right);
    if (bottom && !bottom.visited) neighbors.push(bottom);
    if (left && !left.visited) neighbors.push(left);

    if (neighbors.length > 0) {
      const r = Math.floor(Math.random() * neighbors.length);
      return neighbors[r];
    } else {
      return undefined;
    }
  }

  draw_line(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "lightgreen";
    ctx.stroke();
  }

  removeLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = "black";
    ctx.stroke(); 
  }

  draw_cell() {
    const x = this.i * w;
    const y = this.j * w;

    if (this.walls.top)    this.draw_line(x    , y    , x + w, y    );
    if (this.walls.right)  this.draw_line(x + w, y    , x + w, y + w);
    if (this.walls.bottom) this.draw_line(x + w, y + w, x    , y + w);
    if (this.walls.left)   this.draw_line(x    , y + w, x    , y    );

    if (this.visited) {
      // Draw the cropped tile image from the offscreen canvas
      ctx.drawImage(tileCanvas, x, y, w, w);

      if (!this.walls.top)    this.removeLine(x    , y    , x + w, y    );
      if (!this.walls.right)  this.removeLine(x + w, y    , x + w, y + w);
      if (!this.walls.bottom) this.removeLine(x + w, y + w, x    , y + w);
      if (!this.walls.left)   this.removeLine(x    , y + w, x    , y    );
    }
  }
}

function removeWalls(curr, nxt) {
  let x = curr.i - nxt.i;
  let y = curr.j - nxt.j;

  if (x === 1) {
    curr.walls.left = false;
    nxt.walls.right = false
  } else if (x === -1) {
    curr.walls.right = false;
    nxt.walls.left = false;
  }

  if (y === 1) {
    curr.walls.top = false;
    nxt.walls.bottom = false;
  } else if (y === -1) {
    curr.walls.bottom = false;
    nxt.walls.top = false;
  }
}

function setup() {
  cols = Math.floor(CANVAS_WIDTH / w);
  rows = Math.floor(CANVAS_HEIGHT / w);

  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      let cell = new Cell(i, j);
      grid.push(cell);
    }
  }

  current = grid[0];
  current.visited = true;
}

function draw() {
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  for (let i = 0; i < grid.length; i++) {
    grid[i].draw_cell();
  }
}

function generateMaze() {
  while (true) {
    let next = current.checkNeighbors();
    if (next) {
      next.visited = true;
      stack.push(current);
      removeWalls(current, next);
      current = next;
    } else if (stack.length) {
      current = stack.pop();
    } else {
      break; // Maze complete
    }
  }
  draw();
}

// Wait for image to load before setup & generate
dungeonTiles.onload = function() {
  // Create offscreen canvas to crop tile from dungeonTiles
  tileCanvas = document.createElement('canvas');
  tileCanvas.width = 10;  // cropped tile width
  tileCanvas.height = 10; // cropped tile height
  tileCtx = tileCanvas.getContext('2d');

  // Crop 10x10 pixels from top-left corner of tileset (change sx, sy here to move crop)
  tileCtx.drawImage(dungeonTiles, 0, 0, 10, 10, 0, 0, 10, 10);

  setup();
  generateMaze();
};
