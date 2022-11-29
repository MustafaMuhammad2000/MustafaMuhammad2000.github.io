// Start page, can create or join games here
const socket = parent.get_socket();

// Toggles to a different iframe, in this case the game iframe
function toggler() {
  var iframe = window.parent.document.getElementById("test");
  iframe.src = "board.html";
}

// Creates a game
function createGame() {
  let player_name = document.getElementById("playername_create").value;
  sessionStorage.setItem("action", "create");
  sessionStorage.setItem("name", player_name);
  toggler();
}

// Returns specified cookie if it exists
// Taken from https://www.w3schools.com/js/js_cookies.asp
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

// Checks for cookie existence, if exists then joins exsiting game
// Inspired from https://www.w3schools.com/js/js_cookies.asp
function checkCookie() {
  let room_name = getCookie("room_name");
  if (room_name !== "") {
    toggler();
  }
}

// Join a game
function joinGame() {
  let room_name = document.getElementById("code").value;
  let player_name = document.getElementById("playername_join").value;
  console.log(player_name);
  sessionStorage.setItem("action", room_name);
  sessionStorage.setItem("name", player_name);
  toggler();
}

// Prevents forms from refreshing page and disconnecting socket
let createForm = document.getElementById("createForm");
let joinForm = document.getElementById("joinForm");

function handleForm(event) {
  event.preventDefault();
}
createForm.addEventListener("submit", handleForm);
joinForm.addEventListener("submit", handleForm);
