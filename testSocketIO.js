const socketIoClient = require("socket.io-client");
const socket = socketIoClient("https://localhost:5000", {
  auth: {
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2NmFkOTM1NDc5ZDY4OWRmMjAyMTgxMSIsImlhdCI6MTcxOTIzODcyNSwiZXhwIjoxNzE5MjQ1OTI1fQ.1-j7b_fXAcPEe8ObiHStcRuVSlJODxg69hm2f66WC_w", // Replace with a valid authentication token
  },
});
socket.on("connect", () => {
  console.log("Connected to the server");
  socket.emit("updateLocation", { latitude: 51.5074, longitude: -0.1278 });
  socket.on("locationUpdateError", (data) => {
    console.error("Location update error:", data.error);
  });
});
socket.on("disconnect", () => {
  console.log("Disconnected from the server");
});
socket.on("connect_error", (err) => {
  console.error("Connection error:", err);
});
