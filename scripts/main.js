import { global } from "./global.js";
let main = {};

const canvas = document.getElementById("game");
canvas.width = 870;
canvas.height = 500;
const ctx = canvas.getContext("2d");
main.bombGrabAreaDOM = document.getElementById("bomb-grab-area");
let previousAnimationTimestamp = undefined
const blastHoleRadius = 18
main.rotation = 32;




let background = [];
let monkeys = []; // Array to store player monkey images
let banana = [];
let state = {}; // Game state
main.currentPlayer = 1;
main.bomb = {
  x: undefined,
  y: undefined,
  velocity: {
    x: 0,

    y: 0
  }
};
main.phase = state.phase



main.newGame = async function () {
  document.getElementById("congratulations").style.visibility = "hidden" ;
  document.getElementById("startmenu").style.visibility = "hidden";
  document.getElementById("info-left").style.visibility = "visible";
  document.getElementById("info-right").style.visibility = "visible";
  
  state = {
    phase: "aiming",
    currentPlayer: main.currentPlayer,
    bomb: main.bomb,
    Buildings: [],
    blastHoles: [],
    scale: 1,
  };

  console.log("test")

  // Generate 8 buildings
  for (let i = 0; i < 8; i++) {
    main.generateBuilding(i);
  }
  main.calculateScale();

  await main.loadImages(); // Wait for images to load
  main.initializeBombPosition();
  main.draw(); // Start drawing after loading images
};


main.calculateScale = function () {
  const lastBuilding = state.Buildings[7]
  const totalWidth = lastBuilding.x + lastBuilding.width


  state.scale = window.innerWidth / totalWidth

}

main.generateBuilding = function (index) {
  const preBuilding = state.Buildings[index - 1];
  const x = preBuilding ? preBuilding.x + preBuilding.width + 4 : 10;
  const minWidth = 70;
  const maxWidth = 120;
  const width = minWidth + Math.random() * (maxWidth - minWidth);

  const platformWithGorilla = index === 1 || index === 6;

  const minHeight = 40;
  const maxHeight = 300;
  const minHeightGorilla = 30;
  const maxHeightGorilla = 150;
  const height = platformWithGorilla
    ? minHeightGorilla + Math.random() * (maxHeightGorilla - minHeightGorilla)
    : minHeight + Math.random() * (maxHeight - minHeight);

  const lightsOn = [];
  for (let i = 0; i < 50; i++) {
    const light = Math.random() <= 0.33 ? true : false;
    lightsOn.push(light);
  }

  state.Buildings.push({ x, width, height, lightsOn });
};



main.loadImages = async function () {
  const loadImage = (src) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = src;
      img.onload = () => resolve(img);
    });
  };

  monkeys.push(
    await loadImage("./images/monkeaim01.png"),
    await loadImage("./images/monkeaim02.png"),
    await loadImage("./images/monkestand.png")
  );

  banana.push(await loadImage("./images/go_go_chair.png"));
  background.push(await loadImage("./images/backgournd.png"));
};





main.draw = function () {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);

  main.drawbackground();
  main.drawBuildingsWithBlastHoles();
  main.drawMonkes(1);
  main.drawMonkes(2);
  main.drawBomb();
  ctx.restore();
};
main.drawBuildingsWithBlastHoles = function () {
  ctx.save();

  state.blastHoles.forEach((blastHole) => {
    ctx.beginPath();

    // Outer shape clockwise
    ctx.rect(
      0,
      0,
      window.innerWidth / state.scale,
      window.innerHeight / state.scale
    );

    // Inner shape counterclockwise
    ctx.arc(blastHole.x, blastHole.y, blastHoleRadius, 0, 2 * Math.PI, true);

    ctx.clip();
  });

  main.drawBuildings();

  ctx.restore();
}
main.drawbackground = function () {
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);


  ctx.drawImage(
    background[0],
    0,
    0,
    canvas.width,
    canvas.height,

  )
  ctx.restore();
};

main.drawBuildings = function () {
  state.Buildings.forEach((building) => {
    // Draw building
    ctx.fillStyle = "#4A3C68";
    ctx.fillRect(building.x, 0, building.width, building.height);

    // Draw windows
    const windowWidth = 10;
    const windowHeight = 12;
    const gap = 15;

    const numberOfFloors = Math.ceil(
      (building.height - gap) / (windowHeight + gap)
    );
    const numberOfRoomsPerFloor = Math.floor(
      (building.width - gap) / (windowWidth + gap)
    );

    for (let floor = 0; floor < numberOfFloors; floor++) {
      for (let room = 0; room < numberOfRoomsPerFloor; room++) {
        if (building.lightsOn[floor * numberOfRoomsPerFloor + room]) {
          ctx.save();

          ctx.translate(building.x + gap, building.height - gap);
          ctx.scale(1, -1);

          const x = room * (windowWidth + gap);
          const y = floor * (windowHeight + gap);

          ctx.fillStyle = "#EBB6A2";
          ctx.fillRect(x, y, windowWidth, windowHeight);

          ctx.restore();
        }
      }
    }
  });
}


main.drawMonkes = function (player) {
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  let currentMonke = undefined


  const building =
    player === 1
      ? state.Buildings[1]
      : state.Buildings[6];

  if (player === 1 && main.currentPlayer === 1 && state.phase === "aiming") {
    currentMonke = monkeys[0]
  }
  else if (player === 2 && main.currentPlayer === 2 && state.phase === "aiming") {
    currentMonke = monkeys[1]

  }
  else {
    currentMonke = monkeys[2]
  }



  const monkeyImage = currentMonke;
  const monkeyWidth = 70;
  const monkeyHeight = 70;


  if (monkeyImage.complete) {

    ctx.drawImage(
      monkeyImage,
      building.x + building.width / 2 - 35,
      canvas.height - building.height - monkeyHeight,
      monkeyWidth,
      monkeyHeight
    );
  } else {
    monkeyImage.onload = () => {
      ctx.drawImage(
        monkeyImage,
        building.x + building.width / 2 - 35,
        canvas.height - building.height - monkeyHeight,
        monkeyWidth,
        monkeyHeight
      );
    };
  }

  ctx.restore();
}


main.initializeBombPosition = function () {
  const building =
    main.currentPlayer === 1
      ? state.Buildings[1]
      : state.Buildings[6]; // Second last building

  const gorillaX = building.x + building.width / 2;
  const gorillaY = building.height;
  const gorillaHandOffsetX = main.currentPlayer === 1 ? -32 : 32;
  const gorillaHandOffsetY = 50;

  state.bomb.x = gorillaX + gorillaHandOffsetX;
  state.bomb.y = gorillaY + gorillaHandOffsetY;
  state.bomb.velocity.x = 0;
  state.bomb.velocity.y = 0;

}

main.drawBomb = function () {
  ctx.save();
  ctx.translate(main.bomb.x, main.bomb.y)
  if (state.phase === "aiming") {
    ctx.translate(-main.bomb.velocity.x / 6, 25, -main.bomb.velocity.y / 6, 25);
    ctx.strokeStyle = "rgba(0,0,0,0.7)";
    ctx.lineWidth = 3;
    ctx.setLineDash([3, 8]);

    ctx.beginPath();
    ctx.moveTo(0, 0)
    ctx.lineTo(main.bomb.velocity.x, main.bomb.velocity.y);
    ctx.stroke();
  }

  const bombImage = banana[0]; // Assuming banana[0] is the loaded go_go_chair.png image
  const bombWidth = 40; // Adjust the width of the bomb
  const bombHeight = 40; // Adjust the height of the bomb

  if (bombImage.complete) {
    ctx.drawImage(
      bombImage,
      state.phase === "aiming" ? 64 : main.rotation,
      0,
      32,
      32,
      -bombWidth / 2, // Center the image on the bomb's position
      -bombHeight / 2, // Center the image on the bomb's position
      bombWidth,
      bombHeight
    );
  } else {
    bombImage.onload = () => {
      ctx.drawImage(
        bombImage,
        state.phase === "aiming" ? 64 : main.rotation,
        0,
        32,
        32,
        -bombWidth / 2,
        -bombHeight / 2,
        bombWidth,
        bombHeight
      );
    };
  }

  ctx.restore();
};


main.throwBomb = function () {
  state.phase = "in flight";
  previousAnimationTimestamp = undefined;
  requestAnimationFrame(main.animate);
}



main.animate = function (timestamp) {
  if (previousAnimationTimestamp === undefined) {
    previousAnimationTimestamp = timestamp;
    requestAnimationFrame(main.animate);
    return;
  }

  const elapsedTime = timestamp - previousAnimationTimestamp;

  main.moveBomb(elapsedTime)

  const miss = main.checkFrameHit() || main.checkBuildingHit();
  const hit = main.checkMonkeHit();


  if (miss) {
    main.currentPlayer = main.currentPlayer === 1 ? 2 : 1;
    state.phase = "aiming";
    main.initializeBombPosition();

    main.draw();
    return;
  }

  // Handle the case when we hit the enemy
  if (hit) {
    if (hit) {
      state.phase = "celebrating";
      main.announceWinner();

      main.draw();
      return;
    }
  }


  main.draw();

  // Continue the animation loop
  previousAnimationTimestamp = timestamp;
  requestAnimationFrame(main.animate);
}
main.tracker = 1
main.moveBomb = function (elapsedTime) {
  const multiplier = elapsedTime / 200;

  const rotationSpeed = 0.1; // Lower this value to slow down rotation
  const trackerSpeed = 0.05; // New variable to slow down tracker increment

  // Adjust trajectory by gravity
  state.bomb.velocity.y -= 20 * multiplier;

  // Calculate new position
  state.bomb.x += state.bomb.velocity.x * multiplier;
  state.bomb.y += state.bomb.velocity.y * multiplier;

  // Slow down rotation and tracker updates
  if (main.tracker > 1) {
    if (main.rotation < 65) {
      //console.log(main.tracker)

      main.tracker = 0;
      main.rotation += 32; // Scale rotation with speed

    } else {
      main.tracker = 0;
      main.rotation = 0;
      //console.log(main.tracker)

    }
  } else {
    main.tracker += 0.40 ;
    //console.log(main.tracker)
    // Increment tracker more slowly
  }

};


main.checkFrameHit = function () {
  // Stop throw animation once the bomb gets out of the left, bottom, or right edge of the screen
  if (
    state.bomb.y < 0 ||
    state.bomb.x < 0 ||
    state.bomb.x > canvas.width
  ) {
    return true; // The bomb is off-screen
  }
}

main.checkMonkeHit = function () {
  const building =
    main.currentPlayer === 1
      ? state.Buildings[6] // Opponent's building
      : state.Buildings[1]; // Opponent's building

  const gorillaX = building.x + building.width / 2 - 35; // Gorilla's X position (centered)
  const gorillaY = building.height; // Gorilla's Y position (height of the building)

  const monkeyWidth = 70; // Width of the monkey
  const monkeyHeight = 70; // Height of the monkey

  // Check if the bomb is within the monkey's boundaries
  if (
    state.bomb.x > gorillaX && // Right of the monkey's left side
    state.bomb.x < gorillaX + monkeyWidth && // Left of the monkey's right side
    state.bomb.y > gorillaY && // Above the monkey's bottom side
    state.bomb.y < gorillaY + monkeyHeight // Below the monkey's top side
  ) {
    return true; // Hit detected
  }

  return false; // No hit
};




main.checkBuildingHit = function () {
  for (let i = 0; i < state.Buildings.length; i++) {
    const building = state.Buildings[i];
    if (
      state.bomb.x + 4 > building.x &&
      state.bomb.x - 4 < building.x + building.width &&
      state.bomb.y - 4 < 0 + building.height
    ) {

      for (let j = 0; j < state.blastHoles.length; j++) {
        const blastHole = state.blastHoles[j];


        const horizontalDistance = state.bomb.x - blastHole.x;
        const verticalDistance = state.bomb.y - blastHole.y;
        const distance = Math.sqrt(
          horizontalDistance ** 2 + verticalDistance ** 2
        );
        if (distance < blastHoleRadius) {

          return false;
        }
      }



      state.blastHoles.push({ x: state.bomb.x, y: state.bomb.y });
      return true; // Building hit
    }
  }
}


main.button = document.getElementById("button")
main.start = document.getElementById("start")

main.announceWinner = function () {
  document.getElementById("winner").innerText = `Player ${main.currentPlayer}`;
  document.getElementById("congratulations").style.visibility = "visible";
}

main.button.addEventListener("click", main.newGame)
main.start.addEventListener("click", main.newGame)


export { main };
export { state };
