// Utility function for element selection
const $ = (id) => document.getElementById(id);

// DOM element references
const elements = {
  leaderboard: $("leaderboard"),
  gameContainer: $("gameContainer"),
  gamePreview: $("gamePreview"),
  main: $("main"),
  username: $("username"),
  level: $("level"),
  ammunition: $("ammunition"),
  wallCrack: $("wall_crack"),
  iceCube: $("ice_cube"),
  dogKilled: $("dog_killed"),
  player: $("player"),
  playerName: $("player-name"),
  time: $("time"),
  countDown: $("count-down"),
  countTime: $("count-time"),
  hearts: [1, 2, 3].map((i) => $(`heart-${i}`)),
};

// Grid constants
const grid = {
  minX: 0,
  maxX: 550,
  minY: 0,
  maxY: 440,
  cell: 55,
  forbiddenAreas: [
    // Top and Bottom
    ...Array.from({ length: 11 }, (_, i) => [i * 55, 0]),
    ...Array.from({ length: 11 }, (_, i) => [i * 55, 440]), // Left and Right

    ...Array.from({ length: 7 }, (_, i) => [0, (i + 1) * 55]),
    ...Array.from({ length: 7 }, (_, i) => [550, (i + 1) * 55]), // Inner Forbidden Zones

    ...[110, 220, 330, 440].flatMap((x) => [
      [x, 110],
      [x, 220],
      [x, 330],
    ]),
  ],
};

// Game state
const gameState = {
  igniteTime: 3000,
  timer: 120,
  isPlaying: false,
  playerLeft: grid.cell,
  playerTop: grid.cell,
  cellSize: grid.cell,
  lives: 3,
  dogLived: 1,
  dogKilled: 0,
  ammunition: 10,
  wallsDestroyed: 0,
  iceCubes: 0,
  isOver: false,
  playerData: {},
  walls: [],
  dogs: [],
  powerUps: [],
  grid,
  isFrozen: false,
  freezeTimeout: null,
  isLoading: false,
  countTime: 3,
};

const CONFIG = {
  powerUpData: {
    bomb: {
      img: "./Images/tnt.png",
      attr: () => {
        gameState.ammunition++;
        elements.ammunition.textContent = gameState.ammunition;
      },
    },
    ice: {
      img: "./Images/ice.png",
      attr: () => {
        gameState.iceCubes++;
        elements.iceCube.textContent = gameState.iceCubes;
        gameState.isFrozen = true;
        elements.player.style.opacity = "0.5";
        elements.player.classList.add("frozen");
        if (gameState.freezeTimeout) {
          clearTimeout(gameState.freezeTimeout);
        }
        gameState.freezeTimeout = setTimeout(() => {
          gameState.isFrozen = false;
          elements.player.style.opacity = "1";
          elements.player.classList.remove("frozen");
          gameState.freezeTimeout = null;
        }, 5000);
      },
    },
    heart: {
      img: "./Images/heart.png",
      attr: () => gameFunction.damagePlayer(),
    },
  },
  WALL_COUNT: { 1: 15, 2: 25, 3: 35 },
  DOG_COUNT: { 1: 1, 2: 2, 3: 3 },
  AMMUNITION: { 1: 50, 2: 25, 3: 15 },
  LEVEL_NAME: { 1: "Easy", 2: "Medium", 3: "Hard" },
};

// Modal system
const modal = {
  show(title, content) {
    // Create the modal if it doesn't exist
    if (!document.getElementById("modal")) {
      const modalElement = document.createElement("div");
      modalElement.id = "modal";
      modalElement.style.cssText =
        "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;justify-content:center;align-items:center;z-index:999;";

      const modalContent = document.createElement("div");
      modalContent.style.cssText =
        "background:white;padding:20px;border-radius:10px;max-width:80%;max-height:80%;overflow:auto;";

      const modalHeader = document.createElement("div");
      modalHeader.id = "modal-header";

      const modalTitle = document.createElement("h2");
      modalTitle.id = "modal-title";

      const modalBody = document.createElement("div");
      modalBody.id = "modal-content";

      const closeButton = document.createElement("button");
      closeButton.textContent = "X";
      closeButton.classList.add("btnClose");
      closeButton.onclick = this.hide;

      modalContent.appendChild(modalHeader);
      modalContent.appendChild(modalBody);
      modalHeader.appendChild(modalTitle);
      modalHeader.appendChild(closeButton);
      modalElement.appendChild(modalContent);
      document.body.appendChild(modalElement);
    }

    document.getElementById("modal-title").innerHTML = title;
    document.getElementById("modal-content").innerHTML = content;
    document.getElementById("modal").style.display = "flex";
  },

  hide() {
    const modalElement = document.getElementById("modal");
    if (modalElement) {
      modalElement.style.display = "none";
    }
  },
};

// Helper functions
const helpers = {
  resetAll() {
    elements.gameContainer.classList.add("hidden");
    elements.main.classList.remove("hidden");

    elements.username.value = "";
    elements.level.value = "";

    localStorage.clear();
    gameState.isPlaying = false;
  },
  saveToLeaderboard() {
    const playerData = {
      username: gameState.playerData.username,
      level: gameState.playerData.level,
      time: gameState.timer, // Use remaining time
      lives: gameState.lives,
      dogKilled: gameState.dogKilled,
      ammunition: gameState.ammunition,
      wall: gameState.wallsDestroyed,
      iceCubes: gameState.iceCubes,
      score:
        gameState.wallsDestroyed * 10 +
        gameState.iceCubes * 5 +
        gameState.dogKilled * 100, // Calculate score
    };
    // Retrieve existing leaderboard or initialize an empty array
    let leaderboard = localStorage.getItem("data-leaderboard");
    leaderboard = leaderboard ? JSON.parse(leaderboard) : [];

    // Add new entry
    leaderboard.push(playerData);

    // Save back to localStorage
    localStorage.setItem("data-leaderboard", JSON.stringify(leaderboard));

    setTimeout(() => {
      this.showLeaderboard();
    }, 100);
  },

  showLeaderboard() {
    modal.hide();
    // Retrieve leaderboard data
    let leaderboard = localStorage.getItem("data-leaderboard");
    leaderboard = leaderboard ? JSON.parse(leaderboard) : [];
    console.log("leaderboard", leaderboard);
    // Sort leaderboard by score (descending)
    leaderboard.sort((a, b) => b.score - a.score);

    // Generate table HTML
    let tableContent = `
      <table style="width: 100%; border-collapse: collapse; text-align: center;">
        <thead>
          <tr style="background-color: #f2f2f2;">
            <th style="padding: 8px; border: 1px solid #ddd;">No</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Username</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Level</th>
            <th style="padding: 8px; border: 1px solid #ddd;">Time Left</th>
            <th style="padding: 8px; border: 1px solid #ddd;"><img src="./Images/dog_down.png" style="width:50px; height:50px" alt="dog_killed" /></th>
            <th style="padding: 8px; border: 1px solid #ddd;"><img src="./Images/wall_crack.png" style="width:50px; height:50px" alt="wall_crack" /></th>
            <th style="padding: 8px; border: 1px solid #ddd;"><img src="./Images/tnt.png" style="width:50px; height:50px" alt="tnt" /></th>
            <th style="padding: 8px; border: 1px solid #ddd;"><img src="./Images/ice.png" style="width:50px; height:50px" alt="ice_cube" /></th>
            <th style="padding: 8px; border: 1px solid #ddd;">Score</th>
          </tr>
        </thead>
        <tbody>
    `;

    if (leaderboard.length === 0) {
      tableContent += `
        <tr>
          <td colspan="8" style="padding: 8px; text-align: center; border: 1px solid #ddd;">
            No leaderboard data available.
          </td>
        </tr>
      `;
    } else {
      leaderboard.forEach((entry, index) => {
        tableContent += `
          <tr>
            <td style="padding: 8px; border: 1px solid #ddd;">${index + 1}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.username
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              CONFIG.LEVEL_NAME[entry.level]
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.time
            }s</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.dogKilled
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${entry.wall}</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.ammunition
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.iceCubes
            }</td>
            <td style="padding: 8px; border: 1px solid #ddd;">${
              entry.score
            }</td>
          </tr>
        `;
      });
    }

    tableContent += `
        </tbody>
      </table>
      <div style="margin-top: 20px; text-align: center;">
        <button onclick="location.reload()" style="padding: 10px 20px; cursor: pointer;">Play Again</button>
        <button onclick="helpers.resetAll()" style="padding: 10px 20px; cursor: pointer; margin-left: 10px;">Reset</button>
      </div>
    `;
    // Show leaderboard in modal
    elements.gameContainer.classList.add("hidden");
    elements.main.classList.add("hidden");
    console.log(elements.leaderboard);
    elements.leaderboard.classList.remove("hidden");
    elements.leaderboard.innerHTML = tableContent;
  },
  startGame() {
    if (gameState.isLoading || gameState.isPlaying) return;

    if (!elements.username || !elements.level || !elements.countTime) {
      console.error("Required DOM elements are missing!");
      return alert("An error occurred. Please refresh the page.");
    }

    if (!elements.username.value || !elements.level.value) {
      return alert("Please enter your username and select a level!");
    }

    gameState.isLoading = true;

    // Preload assets
    const assets = [
      "./Images/char_up.png",
      "./Images/char_down.png",
      "./Images/char_left.png",
      "./Images/char_right.png",
      "./Images/dog_up.png",
      "./Images/dog_down.png",
      "./Images/dog_left.png",
      "./Images/dog_right.png",
      "./Sounds/walk.mp3",
      "./Sounds/explode.mp3",
      "./Sounds/pick.mp3",
      "./Sounds/bomb_ignite.mp3",
      "./Sounds/countdown.mp3",
      "./Sounds/dog_bark.mp3",
      "./Sounds/crack.mp3",
      "./Sounds/brick_break.mp3",
    ];

    let loadedAssets = 0;
    if (assets.length === 0) {
      startCountdown();
    } else {
      assets.forEach((src) => {
        if (src.endsWith(".png")) {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            loadedAssets++;
            if (loadedAssets === assets.length) {
              startCountdown();
            }
          };
          img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            loadedAssets++;
            if (loadedAssets === assets.length) {
              startCountdown();
            }
          };
        } else if (src.endsWith(".mp3")) {
          const audio = new Audio();
          audio.src = src;
          audio.oncanplaythrough = () => {
            loadedAssets++;
            if (loadedAssets === assets.length) {
              startCountdown();
            }
          };
          audio.onerror = () => {
            console.warn(`Failed to load audio: ${src}`);
            loadedAssets++;
            if (loadedAssets === assets.length) {
              startCountdown();
            }
          };
        }
      });
    }

    function startCountdown() {
      elements.main.classList.add("hidden");
      elements.countDown.classList.remove("hidden");

      gameState.countTime = 3;
      elements.countTime.textContent = gameState.countTime;
      helpers.playSound("countdown");
      const countdownInterval = setInterval(() => {
        gameState.countTime--;
        elements.countTime.textContent = gameState.countTime;

        if (gameState.countTime <= 0) {
          clearInterval(countdownInterval);
          elements.countDown.classList.add("hidden");
          gameFunction.playGame();
          gameState.isLoading = false;
        }
      }, 1000);
    }
  },

  // Generate random number between min and max
  randomRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  },
  playSound(source) {
    const sound = new Audio(`./Sounds/${source}.mp3`);
    sound.play();
  },
  // Check if position is valid for player or wall
  isValidPosition(left, top) {
    // Check if out of bounds
    if (
      left < gameState.grid.minX ||
      left > gameState.grid.maxX ||
      top < gameState.grid.minY ||
      top > gameState.grid.maxY
    ) {
      return false;
    }

    // Check if in forbidden area
    for (const [forbiddenLeft, forbiddenTop] of gameState.grid.forbiddenAreas) {
      if (left === forbiddenLeft && top === forbiddenTop) {
        return false;
      }
    }

    return true;
  },

  // Check for collisions with walls or other objects
  checkCollision(left, top) {
    // Check if position has a wall
    for (const wall of gameState.walls) {
      if (wall.left === left && wall.top === top) {
        return true;
      }
    }
    return false;
  },

  isValidWallPosition(leftPos, topPos) {
    // Check if position is valid using helper function
    if (!this.isValidPosition(leftPos, topPos)) {
      return false;
    }

    // Check for collision with existing walls
    if (this.checkCollision(leftPos, topPos)) {
      return false;
    }

    // Don't place walls too close to player starting position
    const playerDistance =
      Math.abs(leftPos - gameState.playerLeft) +
      Math.abs(topPos - gameState.playerTop);
    if (playerDistance <= gameState.cellSize * 2) {
      return false;
    }

    return true;
  },

  tryPlaceWall(leftPos, topPos) {
    // First attempt
    if (this.isValidWallPosition(leftPos, topPos)) {
      gameFunction.createWall(leftPos, topPos);
      return true;
    }

    // Retry once with a new random position
    const newLeftPos = this.randomRange(1, 10) * gameState.cellSize;
    const newTopPos = this.randomRange(0, 8) * gameState.cellSize;

    if (this.isValidWallPosition(newLeftPos, newTopPos)) {
      gameFunction.createWall(newLeftPos, newTopPos);
      return true;
    }

    // If both attempts fail, return false
    return false;
  },

  isValidDogPosition(leftPos, topPos) {
    // Check if position is valid using helper function
    if (!this.isValidPosition(leftPos, topPos)) {
      return false;
    }

    // Check for collision with existing walls
    if (this.checkCollision(leftPos, topPos)) {
      return false;
    }

    // Don't place dogs too close to player starting position
    const playerDistance =
      Math.abs(leftPos - gameState.playerLeft) +
      Math.abs(topPos - gameState.playerTop);
    if (playerDistance <= gameState.cellSize * 2) {
      return false;
    }

    // Ensure no overlap with existing dogs
    for (const dog of gameState.dogs) {
      if (dog.left === leftPos && dog.top === topPos) {
        return false;
      }
    }

    return true;
  },

  tryPlaceDog(leftPos, topPos) {
    // First attempt
    if (this.isValidDogPosition(leftPos, topPos)) {
      gameFunction.createDog(leftPos, topPos);
      return true;
    }

    // Retry once with a new random position
    const newLeftPos = this.randomRange(1, 10) * gameState.cellSize;
    const newTopPos = this.randomRange(0, 8) * gameState.cellSize;

    if (this.isValidDogPosition(newLeftPos, newTopPos)) {
      gameFunction.createDog(newLeftPos, newTopPos);
      return true;
    }

    // If both attempts fail, return false
    return false;
  },
};

// Game functions
const gameFunction = {
  // Initialize the game grid
  createGrid() {
    for (let i = 0; i < 99; i++) {
      const gridElement = document.createElement("span");
      gridElement.setAttribute("id", `grid-${i}`);
      elements.gamePreview.appendChild(gridElement);
    }
  },

  // Create walls at random positions
  generateWalls(count) {
    let wallsPlaced = 0;

    while (wallsPlaced < count) {
      // Get random positions within grid boundaries
      const leftPos = helpers.randomRange(1, 10) * gameState.cellSize;
      const topPos = helpers.randomRange(0, 8) * gameState.cellSize;

      // Check if position is valid and doesn't collide
      const isValid = helpers.tryPlaceWall(leftPos, topPos);

      if (isValid) {
        wallsPlaced++;
      }
    }
  },

  // Create Dogs at random positions
  generateDogs(count) {
    let dogsPlaced = 0;
    gameState.dogLived = count;
    gameState.dogKilled = 0;
    elements.dogKilled.textContent = gameState.dogKilled;
    while (dogsPlaced < count) {
      // Get random positions within grid boundaries
      const leftPos = helpers.randomRange(1, 10) * gameState.cellSize;
      const topPos = helpers.randomRange(0, 8) * gameState.cellSize;

      // Check if position is valid and doesn't collide
      const isValid = helpers.tryPlaceDog(leftPos, topPos);
      if (isValid) {
        dogsPlaced++;
      }
    }
  },

  // Create a wall element and add it to the game
  createWall(leftPosition, topPosition) {
    const wall = document.createElement("div");
    wall.classList.add("wall");
    wall.style.left = `${leftPosition}px`;
    wall.style.top = `${topPosition}px`;

    // Add wall to game state
    gameState.walls.push({
      element: wall,
      left: leftPosition,
      top: topPosition,
    });

    elements.gamePreview.appendChild(wall);
  },

  // Create a dog element and add it to the game
  createDog(leftPosition, topPosition) {
    const dog = document.createElement("div");
    dog.classList.add("dog");
    dog.style.left = `${leftPosition}px`;
    dog.style.top = `${topPosition}px`;
    dog.style.background = `url("./Images/dog_down.png")`;

    // Add dog to game state
    gameState.dogs.push({
      element: dog,
      left: leftPosition,
      top: topPosition,
    });

    elements.gamePreview.appendChild(dog);
  },
  moveDogs() {
    if (gameState.isOver || !gameState.isPlaying) return;

    for (const dog of gameState.dogs) {
      // Randomly decide whether to move (e.g., 50% chance)
      if (Math.random() > 0.5) {
        // Possible directions: up, down, left, right
        const directions = [
          { dx: 0, dy: -1, name: "up" },
          { dx: 0, dy: 1, name: "down" },
          { dx: -1, dy: 0, name: "left" },
          { dx: 1, dy: 0, name: "right" },
        ];

        // Shuffle directions to randomize movement
        const shuffledDirections = directions.sort(() => Math.random() - 0.5);
        let moved = false;
        for (const dir of shuffledDirections) {
          const newLeft = dog.left + dir.dx * gameState.cellSize;
          const newTop = dog.top + dir.dy * gameState.cellSize;

          dog.element.style.background = `url("./Images/dog_${dir.name}.png")`;

          if (
            helpers.isValidPosition(newLeft, newTop) &&
            !helpers.checkCollision(newLeft, newTop)
          ) {
            dog.left = newLeft;
            dog.top = newTop;
            dog.element.style.left = `${newLeft}px`;
            dog.element.style.top = `${newTop}px`;
            moved = true;

            // Check for collision with player
            if (
              newLeft === gameState.playerLeft &&
              newTop === gameState.playerTop
            ) {
              this.damagePlayer();
            }
            break;
          }
        }

        // If dog couldn't move, try moving toward the player (optional)
        if (!moved && Math.random() < 0.3) {
          const dx = gameState.playerLeft - dog.left;
          const dy = gameState.playerTop - dog.top;
          const absDx = Math.abs(dx);
          const absDy = Math.abs(dy);

          // Prioritize larger distance
          if (absDx > absDy) {
            const newLeft = dog.left + gameState.cellSize * (dx > 0 ? 1 : -1);
            if (
              helpers.isValidPosition(newLeft, dog.top) &&
              !helpers.checkCollision(newLeft, dog.top)
            ) {
              dog.left = newLeft;
              dog.element.style.left = `${newLeft}px`;
              dog.element.style.background = `url("./Images/dog_${
                dx > 0 ? "right" : "left"
              }.png")`;
              if (
                newLeft === gameState.playerLeft &&
                dog.top === gameState.playerTop
              ) {
                this.damagePlayer();
              }
            }
          } else {
            const newTop = dog.top + gameState.cellSize * (dy > 0 ? 1 : -1);
            if (
              helpers.isValidPosition(dog.left, newTop) &&
              !helpers.checkCollision(dog.left, newTop)
            ) {
              dog.top = newTop;
              dog.element.style.top = `${newTop}px`;
              dog.element.style.background = `url("./Images/dog_${
                dy > 0 ? "down" : "up"
              }.png")`;
              if (
                dog.left === gameState.playerLeft &&
                newTop === gameState.playerTop
              ) {
                this.damagePlayer();
              }
            }
          }
        }
      }
    }
  },
  // Update player position
  updatePlayer() {
    elements.player.style.left = `${gameState.playerLeft}px`;
    elements.player.style.top = `${gameState.playerTop}px`;

    for (const dog of gameState.dogs) {
      if (
        dog.left === gameState.playerLeft &&
        dog.top === gameState.playerTop
      ) {
        this.damagePlayer();
      }
    }
  },

  // Handle player movement
  playerMove(direction) {
    if (gameState.isFrozen) return;

    helpers.playSound("walk");

    let leftPosition = gameState.playerLeft;
    let topPosition = gameState.playerTop;

    // Update player sprite direction
    elements.player.style.background = `url("./Images/char_${direction}.png")`;

    // Calculate new position based on direction
    switch (direction) {
      case "right":
        leftPosition += gameState.cellSize;
        break;
      case "left":
        leftPosition -= gameState.cellSize;
        break;
      case "down":
        topPosition += gameState.cellSize;
        break;
      case "up":
        topPosition -= gameState.cellSize;
        break;
    }

    // Check if new position is valid
    if (
      helpers.isValidPosition(leftPosition, topPosition) &&
      !helpers.checkCollision(leftPosition, topPosition)
    ) {
      gameState.playerLeft = leftPosition;
      gameState.playerTop = topPosition;
      this.updatePlayer();
    }
  },

  // Start the game
  playGame() {
    // Store player data
    gameState.playerData = {
      username: elements.username.value,
      level: elements.level.value,
    };

    // Initialize game elements
    elements.playerName.textContent = gameState.playerData.username;
    elements.time.textContent = gameState.timer;
    gameState.ammunition = CONFIG.AMMUNITION[gameState.playerData.level];

    elements.ammunition.textContent = gameState.ammunition;
    elements.wallCrack.textContent = gameState.wallsDestroyed;
    elements.iceCube.textContent = gameState.iceCubes;

    // Set difficulty based on level
    const wallCount = CONFIG.WALL_COUNT[gameState.playerData.level];
    const dogCount = CONFIG.DOG_COUNT[gameState.playerData.level];

    // Hide main menu and show game container
    elements.gameContainer.classList.remove("hidden");

    // Create game grid and walls
    this.createGrid();
    this.generateWalls(wallCount);
    this.generateDogs(dogCount);
    this.updatePlayer();

    // Start game timer
    this.startTimer();
    gameState.isPlaying = true;
  },

  // Place bomb at player position
  placeBomb() {
    if (gameState.isFrozen) return;
    if (gameState.ammunition <= 0) return;
    helpers.playSound("drop");

    // Decrease ammunition
    gameState.ammunition--;
    elements.ammunition.textContent = gameState.ammunition;

    // Create bomb element
    const bomb = document.createElement("div");
    bomb.classList.add("bomb");
    const leftPosition = gameState.playerLeft;
    const topPosition = gameState.playerTop;
    bomb.style.left = `${leftPosition}px`;
    bomb.style.top = `${topPosition}px`;

    elements.gamePreview.appendChild(bomb);
    let igniteTime = gameState.igniteTime - 1000;

    helpers.playSound("bomb_ignite");
    const igniteInterval = setInterval(() => {
      helpers.playSound("bomb_ignite");
      igniteTime -= 1000;
      if (igniteTime <= 0) {
        clearInterval(igniteInterval);
      }
    }, 1000);

    // Set bomb timer
    setTimeout(() => {
      if (elements.gamePreview.contains(bomb)) {
        elements.gamePreview.removeChild(bomb);
        helpers.playSound("explode");
        this.explode(leftPosition, topPosition);
      }
    }, gameState.igniteTime);
  },

  // Explode bomb and create explosion effects
  explode(leftPosition, topPosition) {
    // Define explosion positions (center, up, down, left, right)
    const explosionPositions = [
      { left: leftPosition, top: topPosition },
      { left: leftPosition, top: topPosition - gameState.cellSize },
      { left: leftPosition, top: topPosition + gameState.cellSize },
      { left: leftPosition - gameState.cellSize, top: topPosition },
      { left: leftPosition + gameState.cellSize, top: topPosition },
    ];
    // Create explosion elements
    for (const position of explosionPositions) {
      if (helpers.isValidPosition(position.left, position.top)) {
        this.createExplosion(position.left, position.top);
      }
    }
  },

  // Create explosion effect at specified position
  createExplosion(leftPosition, topPosition) {
    // Skip if position is out of bounds
    if (
      leftPosition < gameState.grid.minX ||
      leftPosition > gameState.grid.maxX ||
      topPosition < gameState.grid.minY ||
      topPosition > gameState.grid.maxY
    ) {
      return;
    }

    // Create explosion element
    const explosion = document.createElement("div");
    explosion.classList.add("boom");
    explosion.style.left = `${leftPosition}px`;
    explosion.style.top = `${topPosition}px`;
    elements.gamePreview.appendChild(explosion);

    // Check if explosion hit player
    if (
      leftPosition === gameState.playerLeft &&
      topPosition === gameState.playerTop
    ) {
      this.damagePlayer();
    }

    this.checkIsDestroyed(leftPosition, topPosition);

    // Remove explosion after a short delay
    setTimeout(() => {
      if (elements.gamePreview.contains(explosion)) {
        elements.gamePreview.removeChild(explosion);
      }
    }, 800);
  },

  // Check if explosion destroys a wall
  checkIsDestroyed(leftPosition, topPosition) {
    // Check for walls
    for (let i = 0; i < gameState.walls.length; i++) {
      const wall = gameState.walls[i];
      if (wall.left === leftPosition && wall.top === topPosition) {
        helpers.playSound("brick_break");
        if (elements.gamePreview.contains(wall.element)) {
          elements.gamePreview.removeChild(wall.element);
        }
        gameState.walls.splice(i, 1);
        gameState.wallsDestroyed++;
        elements.wallCrack.textContent = gameState.wallsDestroyed;
        if (Math.random() < 0.3) {
          this.dropPowerUp(leftPosition, topPosition);
        }
        break;
      }
    }

    // Check for dogs
    for (let i = 0; i < gameState.dogs.length; i++) {
      const dog = gameState.dogs[i];
      if (dog.left === leftPosition && dog.top === topPosition) {
        if (elements.gamePreview.contains(dog.element)) {
          elements.gamePreview.removeChild(dog.element);
        }
        gameState.dogs.splice(i, 1);
        helpers.playSound("dog_defeat");
        gameState.dogKilled++;
        gameState.dogLived--;
        elements.dogKilled.textContent = gameState.dogKilled;
        if (gameState.dogLived === 0) {
          this.gameOver("You Won!");
        }
        break;
      }
    }

    // Check for power-ups
    for (let i = 0; i < gameState.powerUps.length; i++) {
      const powerUp = gameState.powerUps[i];
      if (
        powerUp.left === leftPosition &&
        powerUp.top === topPosition &&
        Date.now() - powerUp.creationTime >= 2000
      ) {
        if (elements.gamePreview.contains(powerUp.element)) {
          elements.gamePreview.removeChild(powerUp.element);
        }
        gameState.powerUps.splice(i, 1);
        break;
      }
    }
  },

  dropPowerUp(leftPosition, topPosition) {
    const rand = Math.random();
    let powerUpType = null;

    if (rand < 0.3) powerUpType = "bomb";
    else if (rand < 0.6) powerUpType = "ice";
    else if (rand < 0.9) powerUpType = "heart";
    else return;

    const powerUp = document.createElement("div");
    powerUp.style.left = `${leftPosition}px`;
    powerUp.style.top = `${topPosition}px`; // Fixed typo
    powerUp.classList.add("powerUps");
    const creationTime = Date.now();
    powerUp.setAttribute("data-creation-time", creationTime);
    powerUp.style.background = `url('${CONFIG.powerUpData[powerUpType].img}')`;
    powerUp.setAttribute("data-type", powerUpType);
    elements.gamePreview.appendChild(powerUp);

    // Add to gameState.powerUps
    gameState.powerUps.push({
      element: powerUp,
      left: leftPosition,
      top: topPosition,
      type: powerUpType,
      creationTime: creationTime,
    });
    this.checkPowerUpInterval();

    setTimeout(() => {
      const index = gameState.powerUps.findIndex((p) => p.element === powerUp);
      if (index !== -1) {
        if (elements.gamePreview.contains(powerUp)) {
          elements.gamePreview.removeChild(powerUp);
        }
        gameState.powerUps.splice(index, 1);
      }
    }, 10000);
  },

  checkPowerUpInterval() {
    const checkInterval = setInterval(() => {
      if (gameState.isOver || !gameState.isPlaying) {
        clearInterval(checkInterval);
        return;
      }

      for (let i = gameState.powerUps.length - 1; i >= 0; i--) {
        const powerUp = gameState.powerUps[i];
        if (powerUp.isCollected) continue;
        if (
          gameState.playerLeft === powerUp.left &&
          gameState.playerTop === powerUp.top &&
          elements.gamePreview.contains(powerUp.element)
        ) {
          elements.player.classList.add("playerPowerUp");
          powerUp.element.classList.add("powerUpCollected");
          helpers.playSound("pick");
          powerUp.isCollected = true;

          setTimeout(() => {
            elements.player.classList.remove("playerPowerUp");
            CONFIG.powerUpData[powerUp.type].attr();
            if (elements.gamePreview.contains(powerUp.element)) {
              elements.gamePreview.removeChild(powerUp.element);
            }
            gameState.powerUps.splice(i, 1);
          }, 500);
        }
      }
    }, 100);
  },

  // Damage the player when hit by explosion
  damagePlayer() {
    if (gameState.lives <= 0) return;
    helpers.playSound("crack");
    elements.player.classList.add("playerDamaged");
    setTimeout(() => {
      elements.player.classList.remove("playerDamaged");
    }, 2000);
    // Update heart display
    gameState.lives--;
    elements.hearts[gameState.lives].style.background =
      "url('./Images/heart_break.png')";
    elements.hearts[gameState.lives].style.backgroundPosition = "center";
    elements.hearts[gameState.lives].style.backgroundSize = "contain";
    elements.hearts[gameState.lives].style.backgroundRepeat = "no-repeat";

    // Animation elements.player opacity = 50% for 0.5 seconds. Then back to normal

    // Check for game over
    if (gameState.lives <= 0) {
      this.gameOver("You lost! All lives depleted.");
    }
  },

  // Game timer
  startTimer() {
    const timerInterval = setInterval(() => {
      if (gameState.isOver) {
        clearInterval(timerInterval);
        return;
      }

      if (gameState.timer > 0) {
        gameState.timer--;
        elements.time.textContent = gameState.timer;
      } else {
        gameState.isOver = true;
        clearInterval(timerInterval);
        this.gameOver("Time's up! Game over.");
      }

      // Move dogs every second
      this.moveDogs();
    }, 1000);
  },

  // Game over handling
  gameOver(message) {
    gameState.isOver = true;
    gameState.isPlaying = false;

    // Remove dogs from DOM
    for (const dog of gameState.dogs) {
      if (elements.gamePreview.contains(dog.element)) {
        elements.gamePreview.removeChild(dog.element);
      }
    }
    gameState.dogs = []; // Clear dog array

    // Calculate score
    const score = gameState.wallsDestroyed * 10 + gameState.iceCubes * 5;

    // Show game over modal
    modal.show(
      "Game Over",
      `
      <div class="gameOverView">
        <h3>${message}</h3>
        <button onclick="helpers.showLeaderboard()">View Leaderboard</button>
        <button onclick="helpers.saveToLeaderboard()">Save</button>
      </div>
      `
    );
  },
};

// Event listeners for keyboard input
document.addEventListener("keydown", (event) => {
  if (gameState.isPlaying && !gameState.isOver) {
    switch (event.key) {
      case "w":
      case "ArrowUp":
        gameFunction.playerMove("up");
        break;
      case "s":
      case "ArrowDown":
        gameFunction.playerMove("down");
        break;
      case "d":
      case "ArrowRight":
        gameFunction.playerMove("right");
        break;
      case "a":
      case "ArrowLeft":
        gameFunction.playerMove("left");
        break;
      case " ":
        gameFunction.placeBomb();
        break;
    }
  }
});

// function startBgMusicOnce() {
//   const bgMusic = new Audio("./Sounds/bgMusic.mp3");
//   bgMusic.loop = true;
//   bgMusic.volume = 0.5;
//   bgMusic.play();
//   document.removeEventListener("click", startBgMusicOnce); // Remove after 1st click
// }

// document.addEventListener("click", startBgMusicOnce);

// Make game functions available globally
window.game = gameFunction;
window.helpers = helpers;
window.modal = modal;
