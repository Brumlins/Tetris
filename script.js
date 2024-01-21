let frameCount = 0;
class Tetris {
  constructor() {
    // vytvoreni 2d canvasu
    this.canvas = document.getElementById("tetrisCanvas");
    this.ctx = this.canvas.getContext("2d");

    // velikost bloku a hraci plochy
    this.blockSize = 30;
    this.grid = Array.from({ length: 20 }, () => Array(10).fill(0));

    // aktualni tetromina a klavesa napodledy stisknuta hracem
    this.currentPiece = this.spawnPiece();
    this.lastKeyPressed = null;

    // skore hrace
    this.score = 0;

    this.outline = [];
  }

  // obsluha stisknuti klaves
  handleKeyPress() {
    document.addEventListener("keydown", (event) => {
      this.lastKeyPressed = event.code;
    });
  }

  // generovani nahodneho tetromina
  spawnPiece() {
    //tvary tetromin
    const pieces = [
      [[1, 1, 1, 1]],
      [[1, 1, 1], [1]],
      [[1, 1, 1], [0, 0, 1]],
      [[1, 1, 1], [0, 1]],
      [[1, 1], [1, 1]],
      [[1, 1, 1], [1, 0]],
      [[1, 1, 1], [0, 1]],
    ];

    const pieceIndex = Math.floor(Math.random() * pieces.length);
    const piece = pieces[pieceIndex];
    const randomColor = this.getRandomColorRGB();

    return {
      shape: piece,
      x: Math.floor((10 - piece[0].length) / 2),
      y: 0,
      color: randomColor,
    };
  }

  // nahodne generovani barev, ktere jsem si vybral
  getRandomColorRGB() {
    const colors = [
      [128, 0, 128], // fialova
      [0, 128, 0],   // zelena
      [255, 0, 0],   // cervena
      [0, 0, 255],    // modra
      [255, 255, 0]   // zluta
    ];

    const randomIndex = Math.floor(Math.random() * colors.length);
    const rgbValues = colors[randomIndex];

    return `rgb(${rgbValues[0]}, ${rgbValues[1]}, ${rgbValues[2]})`;
  }

  // vykresleni tetrominy na platno
  drawPiece(piece) {
    piece.shape.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          const x = (piece.x + j) * this.blockSize;
          const y = (piece.y + i) * this.blockSize;

          // vykresleni barvou tetrominu
          this.ctx.fillStyle = piece.color;
          this.ctx.fillRect(x, y, this.blockSize, this.blockSize);

          // pridani ohraniceni 
          this.addOutline(x, y);
        }
      });
    });
  }

  // jednoducha funkce pro pridani ohraniceni na pole
  addOutline(x, y) {
    this.outline.push({ x, y });
  }

  drawOutline() {
    // vykresleni ohraniceni tetromna
    this.outline.forEach(({ x, y }) => {
      this.ctx.strokeStyle = "#000"; 
      this.ctx.lineWidth = 1; 
      this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
    });

    // vycisteni polr ohraniceni pro dalsi snimek
    this.outline = [];
  }



  // vykresleni herniho stavu
  draw() {
    this.clearCanvas(); // vymazani obsahu canvasu
    this.drawGrid(); //vyskresleni hraci plochy
    this.drawPiece(this.currentPiece); // vykredleni tetrominy
    this.drawOutline(); // vykresleni ohraniceni
    // vykresleni skore
    this.ctx.fillStyle = "#000";
    this.ctx.font = "20px Arial";
    this.ctx.fillText(`Score: ${this.score}`, 20, 30);
  }

  // funkce pro vymazani obsahu canvasu
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // funkce pro vykresleni herni plochy
  drawGrid() {
    this.grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell) {
          this.ctx.fillStyle = cell;
          this.ctx.fillRect(j * this.blockSize, i * this.blockSize, this.blockSize, this.blockSize);
        }
      });
    });
  }

  // pohyb doleva
  movePieceLeft() {
    this.currentPiece.x--;

    if (this.checkCollision() || this.checkPieceOverlap()) {
      this.currentPiece.x++; // vraci pohyb zpet, pokud je nejake prekryti
    }
  }

  // pohyb doprava
  movePieceRight() {
    this.currentPiece.x++;

    const maxX = 10 - this.currentPiece.shape[0].length;
    if (this.checkCollision() || this.checkPieceOverlap()) {
      this.currentPiece.x--; // vraci pohyb zpet, pokud je nejake prekryti
    }
  }


  checkPieceOverlap() {
    // kontrola prekryti s jinymi tetrominy v mrizce
    for (let i = 0; i < this.currentPiece.shape.length; i++) {
      for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
        if (this.currentPiece.shape[i][j] && this.grid[this.currentPiece.y + i] && this.grid[this.currentPiece.y + i][this.currentPiece.x + j] !== 0) {
          return true; 
        }
      }
    }
    return false; 
  }

  //kontrola prohry (jestli se nachazi na souradnicich objeveni tetromin tetromina, detekuje prohru)
  checkGameOver() {
    for (let i = 0; i < this.currentPiece.shape.length; i++) {
      for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
        if (this.currentPiece.shape[i][j] && this.grid[this.currentPiece.y + i] && this.grid[this.currentPiece.y + i][this.currentPiece.x + j] !== 0) {
          return true;
        }
      }
    }
    return false; 
  }

  // aktualizace herniho stavu
  update() {
  // kontrola prohry
  if (this.checkGameOver()) {
    alert("Prohral jsi! Skore: " + this.score);
    //vycisteni hraci plochy a resetovani skore
    this.grid = Array.from({ length: 20 }, () => Array(10).fill(0));
    this.score = 0;
    return;
  }

    // pocet snimku = rychlost padani tetrominy
    if (frameCount % 30 === 0) {
      this.movePieceDown();
    }


    // ovladani tetrominy
    switch (this.lastKeyPressed) {
      case "ArrowLeft":
        this.movePieceLeft();
        break;
      case "ArrowRight":
        this.movePieceRight();
        break;
      case "ArrowDown":
        this.movePieceDown();
        break;
      case "ArrowUp":
        this.rotatePiece();
        break;
    }

    // resetovani naposledy stisknutou klavesu na null
    this.lastKeyPressed = null;
  }

  //funkce pro rotaci tetromina
  rotatePiece() {
    // prevezme informace o aktualni tetromine a ulozi do konstanty rotatedPiece
    const rotatedPiece = JSON.parse(JSON.stringify(this.currentPiece));

    // samotna rotace (doleva)
    rotatedPiece.shape = rotatedPiece.shape[0].map((_, i) =>
      rotatedPiece.shape.map(row => row[i]).reverse()
    );

    // kontrola, jestli se pri rotaci vleze tetromina do hraci plochy
    if (!this.checkCollision(rotatedPiece)) {
      this.currentPiece = rotatedPiece;
    }
  }

  // pohyb dolu
  movePieceDown() {
    this.currentPiece.y++;

    if (this.checkCollision() || this.checkPieceOverlap()) {
      this.currentPiece.y--; //vrati pohyb pri prekryti, nahrazeni tetromin, nebo vydtup z hraci plochy
      this.lockPiece();
      this.clearLines();
      this.currentPiece = this.spawnPiece();
    }
  }

  // funkce na kontroly tetromin
  checkCollision(piece = this.currentPiece) {
    for (let i = 0; i < piece.shape.length; i++) {
      for (let j = 0; j < piece.shape[i].length; j++) {
        if (piece.shape[i][j]) {
          const newX = piece.x + j;
          const newY = piece.y + i;

          // kontrola, aby zustala tetromina na hraci plose
          if (newX < 0 || newX >= 10 || newY >= 20) {
            return true;
          }
  
          // kontrola, aby padajici tetromina "nenahradila" zamknutou tetrominu
          if (newY >= 0 && this.grid[newY][newX] !== 0) {
            return true;
          }
        }
      }
    }
    return false;
  }

lockPiece() {
  // prevezme informace o tetromine a zamkne ji
  for (let i = 0; i < this.currentPiece.shape.length; i++) {
    for (let j = 0; j < this.currentPiece.shape[i].length; j++) {
      if (this.currentPiece.shape[i][j]) {
        this.grid[this.currentPiece.y + i][this.currentPiece.x + j] = this.currentPiece.color;
        this.addOutline((this.currentPiece.x + j) * this.blockSize, (this.currentPiece.y + i) * this.blockSize);
      }
    }
  }

  // vyvolani nefungujici ohraniceni tetromina po jeho zamknuti 
  this.drawLockedPiece();
}

//toto melo fungovat jako ohraniceni tetromina i po jeho zamknuti, ale nevim kde je problem
drawLockedPiece() {
  this.outline.forEach(({ x, y }) => {
    this.ctx.strokeStyle = "#000"; 
    this.ctx.lineWidth = 1; 
    this.ctx.strokeRect(x, y, this.blockSize, this.blockSize);
  });
  
}


  // odstraneni kompletnich radku
  clearLines() {
    // kontrola radku
    for (let i = 0; i < this.grid.length; i++) {
      if (this.grid[i].every(cell => cell !== 0)) {
        // smazani radku
        this.grid.splice(i, 1);
        this.updateScore();
        // pridani noveho radku dole
        this.grid.unshift(Array(10).fill(0));
      }
    }
  }

  // funkce pro aktualizaci skore
  updateScore() {
    // zvyseni skore o 10 za cely odstraneny radek
    this.score += 10;
  }


  
}

let game;

function setup() {
  game = new Tetris();
  game.handleKeyPress();
}

function draw() {
  frameCount++;
  game.update();
  game.draw();
}
