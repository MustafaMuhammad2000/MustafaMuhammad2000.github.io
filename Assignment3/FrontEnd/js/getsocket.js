const socket = io("seng513.fly.dev");
// socket.on("connect", () => {
//   console.log(socket.id); // x8WIv7-mJelg7on_ALbx
// });

function get_socket() {
  // console.log("Return socket connection to iframe page");
  return socket;
}
