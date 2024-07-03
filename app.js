const express = require("express");
const User = require("./Model/UserSchema");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
// const server = http.createServer(app);

// update lacation fuunction
const updateLocations = async (userId, latitude, longitude) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { latitude: latitude, longitude: longitude } },
      { new: true }
    );
    if (!updatedUser) {
      throw new Error("User not found or could not update location");
    }
    console.log(`User location updated: ${updatedUser}`);
    return updatedUser;
  } catch (err) {
    console.error("Error updating user location:", error.message);
    throw err;
  }
};

module.exports = app;

// const server = http.createServer(app);
// app.use(cors());
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:5000",
//     methods: ["GET", "POST"],
//   },
// });
// app.use(express.json());

// io.on("connection", (socket) => {
//   console.log("A user connected");

//   // Listen for incoming messages from clients
//   socket.on("message", (msg) => {
//     console.log("Message received:", msg);
//     // Broadcast the message to all clients except the sender
//     socket.broadcast.emit("message", msg);
//   });

//   // Handle disconnect event
//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//   });
// });

// Middleware to authenticate Socket.IO connections
// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (!token) {
//     return next(new Error("Authentication error"));
//   }
//   try {
//     const decoded = jwt.verify(token, process.env.SCRATEKEY);
//     socket.request.user = decoded;
//     next();
//   } catch (err) {
//     next(new Error("Authentication error"));
//   }
// });
// // Middleware to authenticate Socket.IO connections
// io.use((socket, next) => {
//   // Access the request object from the socket
//   auth(socket.request, {}, (error) => {
//     if (error) {
//       return next(new Error("Authentication error"));
//     }
//     // If authenticated, proceed to the next middleware
//     next();
//   });
// });

// // Handle Socket.IO connections and events
// io.on("connection", (socket) => {
//   console.log(`User connected with socket id: ${socket.id}`);
//   // Attach user information to the socket
//   socket.user = socket.request.user;
//   // Handle location update
//   socket.on("updateLocation", async ({ latitude, longitude }) => {
//     try {
//       const userId = socket.user.id;
//       if (userId) {
//         console.log(
//           `Updating location for user ${userId} to (${latitude}, ${longitude})`
//         );
//         const updatedUser = await updateLocations(userId, latitude, longitude);
//         console.log(
//           `User ${userId} location updated to (${latitude}, ${longitude})`
//         );
//       } else {
//         console.log("No userId associated with the socket");
//       }
//     } catch (err) {
//       console.error("Error updating location:", err.message);
//       // Handle error: emit an error event or send an error response
//       socket.emit("locationUpdateError", { error: err.message });
//     }
//   });

//   // Handle disconnection
//   socket.on("disconnect", () => {
//     console.log(`User disconnected with socket id: ${socket.id}`);
//     // Clean up if needed
//   });
// });
