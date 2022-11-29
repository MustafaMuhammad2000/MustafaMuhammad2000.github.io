const socket = parent.get_socket();
// Global variables, names are self explanatory
let room_name = -1;
let data = sessionStorage.getItem("action");
let curr_name = sessionStorage.getItem("name");
let names = [];
let p1 = 0;
let p1_name;
let p2 = 0;
let p2_name;
let p3 = 0;
let p3_name;
let boxes = [];
let completedBy = [];
let turn = 0;
let const_turn = -1;

let notEnoughMembers = false;

// Deletes all cookies for user
// Inpsired from https://stackoverflow.com/questions/179355/clearing-all-cookies-with-javascript
const deleteAllCookies = () => {
  let cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i];
    let eqPos = cookie.indexOf("=");
    let name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie =
      name +
      "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/Assignment3/FrontEnd";
  }
};

// Checks to see if game is being played on mobile device
const checkMobile = () => {
  try {
    console.log("Mobile");
    document.createEvent("TouchEvent");
    return true;
  } catch (error) {
    console.log("Not");
    return false;
  }
};

// Socket portion

// Socket event for creating new game
socket.on("newGame", (data) => {
  room_name = data.room;
  const_turn = 0;
  p1_name = curr_name;
  names.push(curr_name);
  document.getElementById("codeLink").innerHTML = "Room code: " + room_name;
  document.getElementById("numOfPlayers").innerHTML =
    "Number of players joined: 1/3";
  document.cookie = `const_turn=${const_turn}`;
});
// Socket event for joining existing game
socket.on("joinedGame", (data) => {
  document.getElementById("codeLink").innerHTML = "Room code: " + room_name;
  document.getElementById("numOfPlayers").innerHTML =
    "Number of players joined: " + data.numplayers + "/3";
  if (const_turn === -1) {
    const_turn = data.numplayers - 1;
    document.cookie = `const_turn=${const_turn}`;
  }
  if (data.numplayers === 2) {
    p2_name = data.player_name;
    names.push(data.player_name);
  }
  if (data.numplayers - 1 === 2) {
    p3_name = data.player_name;
    names.push(data.player_name);
    if (names.length === 3) {
      document.cookie = `names=${names}`;
      document.cookie = `room_name=${room_name}`;
      document.cookie = `turn=${turn}`;
      socket.emit("allNames", { room_name, names });
    }
    const codeLink = document.getElementById("codeLink");
    const numPlayers = document.getElementById("numOfPlayers");
    codeLink.remove();
    numPlayers.remove();
    game();
  }
});
//Socket event for joining an invalid or non existant room
socket.on("roomError", (data) => {
  sessionStorage.clear();
  deleteAllCookies();
  toggler();
});
// Socket event to inform users if a line has been added
socket.on("addedLine", (data) => {
  boxes[data.id]++;
  if (boxes[data.id] === 4) {
    boxCompleted(data.id);
  }
  document.cookie = `boxes=${boxes}`;
});
// Sockent event to inform users if a line has been clicked
socket.on("clickedLine", (data) => {
  turn = data.turn;
  let line = document.getElementById(data.id);
  $(line).addClass("line-active");
  $(line).attr("data-used", "true");
  $(".currplayer").text("Current Player : " + names[turn]);
  let lines = getCookie("lines");
  lines += "|" + data.id;
  document.cookie = `lines=${lines}`;
  document.cookie = `turn=${turn}`;
});
// Reports all usernames for 3 players in game
socket.on("getAllNames", (data) => {
  names = data.names;
  $(".p1").text(names[0] + " : " + p1);
  $(".p2").text(names[1] + " : " + p2);
  $(".p3").text(names[2] + " : " + p3);
  if (const_turn == 0) {
    $(".p1").text("(You) " + names[0] + " : " + p1);
  } else if (const_turn == 1) {
    $(".p2").text("(You) " + names[1] + " : " + p2);
  } else if (const_turn == 2) {
    $(".p3").text("(You) " + names[2] + " : " + p3);
  }
  $(".currplayer").text("Current Player : " + names[turn]);
  document.cookie = `names=${names}`;
  document.cookie = `room_name=${room_name}`;
  document.cookie = `turn=${turn}`;
});

// Socket event to inform users which user completed a box
socket.on("tellCompletedBy", (data) => {
  completedBy = data.completedBy;
  document.cookie = `completedBy=${completedBy}`;
});

// Socket event to end game for other users
socket.on("endForOthers", () => {
  sessionStorage.clear();
  deleteAllCookies();
  toggler();
});

// Two socket events to inform user if there are enough members in the current game
socket.on("notEnoughMembers", (data) => {
  notEnoughMembers = true;
});

socket.on("enoughMembers", (data) => {
  notEnoughMembers = false;
});

// Game logic portion

// Draws game board
const game = () => {
  $(".p1").text(names[0] + " : " + p1);
  $(".p2").text(names[1] + " : " + p2);
  $(".p3").text(names[2] + " : " + p3);

  if (const_turn == 0) {
    $(".p1").text("(You) " + names[0] + " : " + p1);
  } else if (const_turn == 1) {
    $(".p2").text("(You) " + names[1] + " : " + p2);
  } else if (const_turn == 2) {
    $(".p3").text("(You) " + names[2] + " : " + p3);
  }
  $(".currplayer").text("Current Player : " + names[turn]);
  p1 = 0;
  p2 = 0;
  p3 = 0;
  boxes = [];
  completedBy = [];

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
  let count = 0;
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
					<div id="${count++}" class="g-line h-line" box-num-l="${point}" box-num-t="${
            point - sides
          }" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					<div id="${count++}" class="g-line v-line" box-num-l="${-1}" box-num-t="${point}" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					`;
        } else {
          html += `
					<div class="dot" style="left:${x_coord - 5}px; top:${
            y_coord - 5
          }px" data-box="${point}"></div>	
					<div class="box" box-id="${point}" style="left:${x_coord + 2.5}px; top:${
            y_coord + 2.5
          }px"></div>					
					<div id="${count++}" class="g-line h-line" box-num-l="${point}" box-num-t="${
            point - sides
          }" style="left:${x_coord}px; top:${y_coord}px" data-used="false"></div>
					<div  id="${count++}" class="g-line v-line" box-num-l="${point}" box-num-t="${
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
						<div id="${count++}" class="g-line v-line" box-num-l="${
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
						<div id="${count++}" class="g-line h-line" box-num-l="${
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
  completedBy = boxes.slice();
  $("#game").html(html);
  clickLine();
};

//Whenever a line is clicked this function is fired.
//Checks to see if a box is completed after line is clicked, if not change turns.
const clickLine = () => {
  $("div.g-line")
    .unbind("click")
    .bind("click", function () {
      if (turn !== const_turn) {
        return;
      }
      let line1 = parseInt($(this).attr("box-num-l"));
      let line2 = parseInt($(this).attr("box-num-t"));
      let id = parseInt($(this).attr("id"));
      if (checkLine(this)) {
        let potential_side1 = false,
          potential_side2 = false;
        if (line1 >= 0) potential_side1 = addLine(line1);
        if (line2 >= 0) potential_side2 = addLine(line2);
        $(this).addClass("line-active");
        $(this).attr("data-used", "true");

        // Informs other users the line has been clicked.
        socket.emit("clickLine", {
          id,
          room_name,
          potential_side1,
          potential_side2,
          turn,
        });
        let lines = getCookie("lines");
        lines += "|" + id;
        document.cookie = `lines=${lines}`;

        if (potential_side1 === false && potential_side2 === false) {
          turn++;
          if (turn >= 3) {
            turn = 0;
          }
          $(".currplayer").text("Current Player : " + names[turn]);
        }
        document.cookie = `turn=${turn}`;
      }
    });
};

// Adds a point to current player and checks to see if board is full, if so return final result.
const boxCompleted = (id) => {
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
  completedBy[id] = turn + 1;
  document.cookie = `completedBy=${completedBy}`;
  // Informs other users who has completed the box
  socket.emit("completedBy", { room_name, completedBy });

  $("div.box[box-id='" + id + "']").css("background-color", color);
  boxes[id] = "complete";

  $(".p1").text(names[0] + " : " + p1);
  $(".p2").text(names[1] + " : " + p2);
  $(".p3").text(names[2] + " : " + p3);
  if (const_turn == 0) {
    $(".p1").text("(You) " + names[0] + " : " + p1);
  } else if (const_turn == 1) {
    $(".p2").text("(You) " + names[1] + " : " + p2);
  } else if (const_turn == 2) {
    $(".p3").text("(You) " + names[2] + " : " + p3);
  }

  let done = true;
  for (let i = 0; i < boxes.length; i++) {
    if (boxes[i] !== "complete") {
      done = false;
      break;
    }
  }
  if (done) {
    endGame();
  }
};

//Using sweetalert library from "https://sweetalert2.github.io/"
//Licence as follows: "https://github.com/sweetalert2/sweetalert2/blob/main/LICENSE"
// Calculates winner and ends the game for all users
const endGame = async () => {
  if (
    (p1 === p2 && p2 === p3) ||
    (p1 === p2 && p1 > p3) ||
    (p2 === p3 && p2 > p1) ||
    (p1 === p3 && p1 > p2)
  ) {
    const { value } = await Swal.fire({
      icon: "warning",
      title: "Game Over!",
      text: "The game has ended in a draw.",
      confirmButtonText:
        'Go back to main page <i class="fa fa-arrow-right"></i>',
    });
    if (value) {
      sessionStorage.clear();
      deleteAllCookies();
      socket.emit("endGame", { room_name });
      toggler();
    }
  } else {
    let winner = "";
    if (p1 > p2 && p1 > p3) {
      winner = 0;
    } else if (p2 > p1 && p2 > p3) {
      winner = 1;
    } else {
      winner = 2;
    }
    // Fires alert and once clicked will clear all sessionstorage and cookie data
    const { value } = await Swal.fire({
      icon: "success",
      title: "Game Over!",
      text: names[winner] + " has won the game!",
      confirmButtonText:
        'Go back to main page <i class="fa fa-arrow-right"></i>',
    });
    if (value) {
      sessionStorage.clear();
      deleteAllCookies();
      socket.emit("endGame", { room_name });
      toggler();
    }
  }
};

// Add a line where user has clicked.
// Also informs other user which line has been added
const addLine = (id) => {
  if (!isNaN(boxes[id])) {
    boxes[id]++;
    document.cookie = `boxes=${boxes}`;
    socket.emit("addLine", { room_name, id });
  }
  if (boxes[id] === 4) {
    boxCompleted(id);
    document.cookie = `boxes=${boxes}`;
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
    height = window.screen.height;
    width = window.screen.width;
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

// Starting code and pause game portion

// Used when a user wants to prematurely end a game, will end for all other users.
const exitGame = async () => {
  await Swal.fire({
    icon: "question",
    title: "Exit Game?",
    confirmButtonText: "Yes",
    showDenyButton: true,
    denyButtonText: "No",
    text: "Do you wish to exit the game? This will cause the game to end for all players.",
    confirmButtonText: 'Yes <i class="fa fa-arrow-right"></i>',
    reverseButtons: true,
  }).then((result) => {
    if (result.isConfirmed) {
      sessionStorage.clear();
      deleteAllCookies();
      socket.emit("endGame", { room_name });
      toggler();
    }
  });
};

window.addEventListener("resize", redraw);

// Gets the specified cookie if it exists.
// Inspired from https://www.w3schools.com/js/js_cookies.asp
function getCookie(cname) {
  let name = cname + "=";
  let decodedCookie = decodeURIComponent(document.cookie);
  let ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == " ") {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

// Will update the game state according to cookie data when a user reopens the page and is still part of a game
const updateGameState = (lines, boxes) => {
  for (let i = 0; i < lines.length; i++) {
    let line = document.getElementById(lines[i]);
    $(line).addClass("line-active");
    $(line).attr("data-used", "true");
  }
  let done = true;
  for (let i = 0; i < boxes.length; i++) {
    let color;
    if (boxes[i].includes("complete")) {
      completedByPlayer = completedBy[i];
      completedByPlayer = Number(completedByPlayer);
      if (completedByPlayer - 1 === 0) {
        color = "red";
        p1++;
      } else if (completedByPlayer - 1 === 1) {
        color = "blue";
        p2++;
      } else if (completedByPlayer - 1 === 2) {
        color = "purple";
        p3++;
      }
      $("div.box[box-id='" + i + "']").css("background-color", color);
      $(".p1").text(names[0] + " : " + p1);
      $(".p2").text(names[1] + " : " + p2);
      $(".p3").text(names[2] + " : " + p3);
      if (const_turn == 0) {
        $(".p1").text("(You) " + names[0] + " : " + p1);
      } else if (const_turn == 1) {
        $(".p2").text("(You) " + names[1] + " : " + p2);
      } else if (const_turn == 2) {
        $(".p3").text("(You) " + names[2] + " : " + p3);
      }
    } else {
      done = false;
    }
  }
  if (done) {
    endGame();
  }
};
// // Toggles to a different iframe, in this case the start menu iframe
function toggler() {
  var iframe = window.parent.document.getElementById("test");
  iframe.src = "start.html";
}

// If cookies exists retrieve values and update the game state
const ifCookies = () => {
  room_name = getCookie("room_name");
  socket.emit("rejoinGame", { room_name });
  turn = Number(getCookie("turn"));
  const_turn = Number(getCookie("const_turn"));
  names = getCookie("names").split(",");
  game();
  let lines = getCookie("lines").split("|");
  lines = lines.slice(1).map(Number);
  boxes = getCookie("boxes").split(",");
  completedBy = getCookie("completedBy").split(",");
  if (room_name && !isNaN(turn) && names && lines && boxes && completedBy) {
    updateGameState(lines, boxes);
  }
};

// 1. Checks for cookies, if so will rejoin game
// 2. Checks to see if new game has been created, if so will showcase game code and wait for other users
// 3. Checks to see if invalid game code has been used, if so will return to start menu
// 4. Otherwise will join the specified game
if (getCookie("room_name") !== "") {
  ifCookies();
} else if (data === "create") {
  socket.emit("createGame");
} else if (!data) {
  toggler();
} else {
  room_name = data;
  socket.emit("joinGame", { room_name, curr_name });
}

// This portion checks for if someone leaves the page, will wait till they come back or
// other users can end the game.
let swal_open = false;

// Checks number of members every second
setInterval(function () {
  socket.emit("checkMembers", { room_name });
}, 1000);

//Opens an alert while waiting for player to rejoin.
setInterval(async function () {
  if (notEnoughMembers && getCookie("room_name")) {
    if (swal_open) {
      return;
    }
    swal_open = true;
    await Swal.fire({
      icon: "error",
      title: "Not enough players",
      text: "A player has disconnected, the game will resume when they reconnect. Alternatively you can exit the game. This will cause all other players to exit as well!",
      confirmButtonText: 'Exit <i class="fa fa-arrow-right"></i>',
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        sessionStorage.clear();
        deleteAllCookies();
        socket.emit("endGame", { room_name });
        toggler();
      }
    });
  } else if (!notEnoughMembers && swal_open) {
    swal_open = false;
    Swal.close();
  }
}, 1000);
