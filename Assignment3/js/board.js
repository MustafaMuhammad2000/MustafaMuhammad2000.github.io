let p1 = 0;
let p2 = 0;
let p3 = 0;
let boxes = [];
let turn = 0;

// Creates the board with dots, horizontal lines, vertical lines and boxes.
// Runs until game is finished, considered the main function of the program.
const checkMobile = () => {
  try {
    document.createEvent("TouchEvent");
    return true;
  } catch (error) {
    return false;
  }
};

const game = () => {
  p1 = 0;
  p2 = 0;
  p3 = 0;
  boxes = [];
  turn = 0;

  const sides = 3;
  let height = window.innerHeight;
  let width = window.innerWidth;
  if (checkMobile()) {
    height = window.outerHeight;
    width = window.outerWidth;
  }

  let offset = height * height * 0.00025 > 50 ? height * height * 0.00025 : 50;

  document.documentElement.style.setProperty("--w", offset);
  document.documentElement.style.setProperty("--h", offset);

  // Uses window size to dynamically render board size
  let startx = width / 2 - (sides * offset) / 2,
    starty =
      height / 8 +
      (window.scrollY +
        document.querySelector(".currplayer").getBoundingClientRect().top);
  let html = `<div id="container">`;
  let point = 0;
  for (let i = 0; i < sides + 1; i++) {
    if (i < sides) {
      for (let j = 0; j < sides; j++) {
        let x_coord = startx + j * offset,
          y_coord = starty + i * offset;
        if (j % 3 === 0) {
          html += `
					<div class="dot" style="left:${x_coord - 5}px; top:${
            y_coord - 5
          }px" data-box="${point}"></div>	
					<div class="box" box-id="${point}" style="left:${x_coord + 2.5}px; top:${
            y_coord + 2.5
          }px"></div>					
					<div class="g-line h-line" box-num-l="${point}" box-num-t="${
            point - sides
          }" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					<div class="g-line v-line" box-num-l="${-1}" box-num-t="${point}" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					`;
        } else {
          html += `
					<div class="dot" style="left:${x_coord - 5}px; top:${
            y_coord - 5
          }px" data-box="${point}"></div>	
					<div class="box" box-id="${point}" style="left:${x_coord + 2.5}px; top:${
            y_coord + 2.5
          }px"></div>					
					<div class="g-line h-line" box-num-l="${point}" box-num-t="${
            point - sides
          }" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					<div class="g-line v-line" box-num-l="${point}" box-num-t="${
            point - 1
          }" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					`;
        }
        boxes.push(0);
        point++;
      }
    } else {
      // For right most dots/lines.
      for (let k = 0; k < sides; k++) {
        let x_coord = startx + sides * offset,
          y_coord = starty + k * offset;
        html += `				
						<div class="dot" style="left:${x_coord - 5}px; top:${
          y_coord - 5
        }px" data-box="${point}"></div>
						<div class="g-line v-line" box-num-l="${
              sides * (k + 1) - 1
            }" box-num-t="${-1}" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
						`;
      }
      // For bottom dots/lines.
      for (let k = 0; k < sides; k++) {
        let x_coord = startx + k * offset,
          y_coord = starty + sides * offset;
        html += `				
						<div class="dot" style="left:${x_coord - 5}px; top:${
          y_coord - 5
        }px" data-box="${point}"></div>
						<div class="g-line h-line" box-num-l="${
              (sides - 1) * sides + k
            }" box-num-t="${-1}" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
						`;
      }
      // For bottom right dot.
      html += `<div class="dot" style="left:${
        startx + sides * offset - 5
      }px; top:${starty + sides * offset - 5}px" data-used="false"></div>`;
      html += "</div>";
    }
  }
  $("#game").html(html);
  clickLine();
};

//Whenever a line is clicked this function is fired.
//Checks to see if a box is completed after line is clicked, if not change turns.
const clickLine = () => {
  $("div.g-line")
    .unbind("click")
    .bind("click", function () {
      let line1 = parseInt($(this).attr("box-num-l"));
      let line2 = parseInt($(this).attr("box-num-t"));
      if (checkLine(this) && turn == 0) {
        let potential_side1 = false,
          potential_side2 = false;

        if (line1 >= 0) potential_side1 = addLine(line1);
        if (line2 >= 0) potential_side2 = addLine(line2);
        $(this).addClass("line-active");
        $(this).attr("data-used", "true");

        if (potential_side1 === false && potential_side2 === false) {
          turn++;
          clickLine();
        }
      } else if (checkLine(this) && turn == 1) {
        let potential_side1 = false,
          potential_side2 = false;

        if (line1 >= 0) potential_side1 = addLine(line1);
        if (line2 >= 0) potential_side2 = addLine(line2);
        $(this).addClass("line-active");
        $(this).attr("data-used", "true");

        if (potential_side1 === false && potential_side2 === false) {
          turn++;
          clickLine();
        }
      } else if (checkLine(this) && turn == 2) {
        let potential_side1 = false,
          potential_side2 = false;

        if (line1 >= 0) potential_side1 = addLine(line1);
        if (line2 >= 0) potential_side2 = addLine(line2);
        $(this).addClass("line-active");
        $(this).attr("data-used", "true");

        if (potential_side1 === false && potential_side2 === false) {
          turn = 0;
          clickLine();
        }
      }

      if (turn == 0) {
        $(".currplayer").text("Current Player : Player 1");
      } else if (turn == 1) {
        $(".currplayer").text("Current Player : Player 2");
      } else if (turn == 2) {
        $(".currplayer").text("Current Player : Player 3");
      }
    });
};

// Adds a point to current player and checks to see if board is full, if so return final result.
const boxCompleted = async (id) => {
  let color;
  if (turn == 0) {
    color = "red";
    p1++;
  } else if (turn == 1) {
    color = "blue";
    p2++;
  } else if (turn == 2) {
    color = "purple";
    p3++;
  }

  $("div.box[box-id='" + id + "']").css("background-color", color);
  boxes[id] = "complete";

  $(".p1").text("Player 1 : " + p1);
  $(".p2").text("Player 2 : " + p2);
  $(".p3").text("Player 3 : " + p3);

  let done = true;
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i] !== "complete") {
      done = false;
      break;
    }
  }

  //Using sweetalert library from "https://sweetalert2.github.io/"
  //Licence as follows: "https://github.com/sweetalert2/sweetalert2/blob/main/LICENSE"
  if (done) {
    const inputOptions = ["Restart Game", "Look at Filled Board"];
    if (
      (p1 === p2 && p2 === p3) ||
      (p1 === p2 && p1 > p3) ||
      (p2 === p3 && p2 > p1) ||
      (p1 === p3 && p1 > p2)
    ) {
      const { value: option } = await Swal.fire({
        icon: "warning",
        title: "Game Over!",
        text: "The game has ended in a draw.",
        input: "radio",
        inputOptions: inputOptions,
        inputValidator: (value) => {
          if (!value) {
            return "You need to choose one of the options!";
          }
        },
      });
      if (option == 0) {
        restartGame();
      }
    } else {
      let winnner = "";
      if (p1 > p2 && p1 > p3) {
        winner = "1";
      } else if (p2 > p1 && p2 > p3) {
        winner = "2";
      } else {
        winner = "3";
      }
      const { value: option } = await Swal.fire({
        icon: "success",
        title: "Game Over!",
        text: "Player " + winner + " has won the game!",
        input: "radio",
        inputOptions: inputOptions,
        inputValidator: (value) => {
          if (!value) {
            return "You need to choose one of the options!";
          }
        },
      });
      if (option == 0) {
        restartGame();
      }
    }
  }
};

// Add a line where user has clicked.
const addLine = (id) => {
  if (!isNaN(boxes[id])) {
    boxes[id]++;
  }
  if (boxes[id] === 4) {
    boxCompleted(id);
    return true;
  }
  return false;
};

// Checks to see if line can be clicked, or if it's already been used.
const checkLine = (line) => {
  return $(line).attr("data-used") === "false";
};

// Re-renders board dynamically if window size has been changed by changing coordinates of dots.
const redraw = () => {
  let d = document.getElementById("container");
  let height = window.innerHeight;
  let width = window.innerWidth;
  if (checkMobile()) {
    height = window.outerHeight;
    width = window.outerWidth;
  }
  var offset = height * height * 0.00025 > 50 ? height * height * 0.00025 : 50;

  const sides = 3;
  let startx = width / 2 - (sides * offset) / 2,
    starty =
      height / 8 +
      (window.scrollY +
        document.querySelector(".currplayer").getBoundingClientRect().top);
  document.documentElement.style.setProperty("--w", offset);
  document.documentElement.style.setProperty("--h", offset);

  let left = [];
  let top = [];

  for (let j = 0; j < sides; j++) {
    for (let i = 0; i < sides; i++) {
      let x_coord = startx + i * offset,
        y_coord = starty + j * offset;
      left.push(x_coord - 5);
      top.push(y_coord - 5);
      left.push(x_coord + 2.5);
      top.push(y_coord + 2.5);
      left.push(x_coord);
      top.push(y_coord);
      left.push(x_coord);
      top.push(y_coord);
    }
  }
  for (let i = 0; i < sides; i++) {
    let x_coord = startx + sides * offset,
      y_coord = starty + i * offset;
    left.push(x_coord - 5);
    top.push(y_coord - 5);
    left.push(x_coord);
    top.push(y_coord);
  }

  for (let i = 0; i < sides; i++) {
    let x_coord = startx + i * offset,
      y_coord = starty + sides * offset;
    left.push(x_coord - 5);
    top.push(y_coord - 5);
    left.push(x_coord);
    top.push(y_coord);
  }

  left.push(startx + sides * offset - 5);
  top.push(starty + sides * offset - 5);

  let k = 0;

  for (let item of d.children) {
    item.style.left = left[k] + "px";
    item.style.top = top[k] + "px";
    k++;
  }
};

// Restarts game
const restartGame = () => {
  $(".p1").text("Player 1 : " + 0);
  $(".p2").text("Player 2 : " + 0);
  $(".p3").text("Player 3 : " + 0);
  $(".currplayer").text("Current Player : Player 1");

  game();
};

window.addEventListener("resize", redraw);

//Start main function.
game();
