import {main} from "./main.js"

const global = {};




global.gameLoop = function (totalRunningTime) {
    global.deltaTime = totalRunningTime - global.prevTotalRunningTime;
    global.deltaTime /= 1000;
    global.prevTotalRunningTime = totalRunningTime
    main.checkCollision
    main.updateBomb();
    main.draw();
    requestAnimationFrame(gameLoop);
}




export { global };
