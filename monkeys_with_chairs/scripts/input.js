import { global } from "./global.js";
import { main } from "./main.js";
import { state } from "./main.js";



const input = {};


/*const angle1 =
    main.currentPlayer === 1
    ? document.querySelector("#info-left .angle")
    : document.querySelector("#info-right .angle");
const velocity1 =
    main.currentPlayer === 1
    ? document.querySelector("#info-left .velocity")
    : document.querySelector("#info-right .velocity");*/

input.angle = 0;
input.velocity = 0; 


let isDragging = false;
let dragStartX = undefined;
let dragStartY = undefined;

    main.bombGrabAreaDOM.addEventListener("mousedown", function (e) {
        if (state.phase === "aiming") {
          isDragging = true;
          dragStartX = e.clientX;
          dragStartY = e.clientY;
          document.body.style.cursor = "grabbing";
        }
      });
      
      window.addEventListener("mousemove", function (e) {
        if (isDragging) {
            console.log("mousemove event fired"); // Debug log
            let deltaX = e.clientX - dragStartX;
            let deltaY = e.clientY - dragStartY;
    
            state.bomb.velocity.x = -deltaX;
            state.bomb.velocity.y = deltaY;
            input.setInfo(deltaX, deltaY);
            main.draw();
        }
    });

 input.setInfo = function(deltaX, deltaY) {
    const hypotenuse = Math.sqrt(deltaX ** 2 + deltaY ** 2);
    const angleInRadians = Math.asin(deltaY / hypotenuse);
    const angleInDegrees = (angleInRadians / Math.PI) * 180;
  
    if (main.currentPlayer === 1) {
      document.querySelector("#info-left .angle").innerText = Math.round(angleInDegrees);
      document.querySelector("#info-left .velocity").innerText = Math.round(hypotenuse);
    } else {
      document.querySelector("#info-right .angle").innerText = Math.round(angleInDegrees);
      document.querySelector("#info-right .velocity").innerText = Math.round(hypotenuse);
    }
  }
  
  window.addEventListener("mouseup", function () {
    if (isDragging) {
        console.log("mouseup event fired"); // Debug log
        isDragging = false;
        document.body.style.cursor = "default";
        main.throwBomb();
    }
  });





// Event listeners


export {input}