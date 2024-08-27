const express = require("express");
const User = require("./Model/UserSchema");
const http = require("http");
const path = require("path");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const { Server } = require("socket.io");
const databaseConnection = require("./Config/db");
const app = express();
const server = http.createServer(app);
// const io = new Server(server);
const io = new Server(server, {
  cors: {
    origin: "*", // Update this with your client origin
    methods: ["GET", "POST"],
  },
});
//socket.io

// Middleware to authenticate user using Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (token) {
    jwt.verify(token, process.env.SCRATEKEY, (err, decoded) => {
      if (err) {
        return next(new Error("Authentication error"));
      }
      socket.user = decoded;
      next();
    });
  } else {
    next(new Error("Authentication error"));
  }
});

// Initialize the userSocketMap as a Map
const userSocketMap = new Map();

// connection
io.on("connection", (socket) => {
  console.log(`A new connection is established with ${socket.id}`);

  // Join room logic
  socket.on("joinRoom", (userId) => {
    console.log("up comming id ====>", userId);
    console.log(`User ${userId} connected to room with socketid :`, socket.id);
    // socket.join(userId);
    userSocketMap.set(userId, socket.id);
    console.log("userSockets ========>", userSocketMap);
  });

  const userId = socket.user.id;

  socket.on("updateLocation", async ({ latitude, longitude }) => {
    try {
      const user = await User.findById(socket.user.id);
      if (!user) {
        socket.emit("error", "User not found");
        return;
      }

      user.location = {
        latitude: latitude,
        longitude: longitude,
        lastUpdated: Date.now(),
      };
      await user.save();
      socket.emit("locationUpdated", {
        userId: user._id,
        latitude: latitude,
        longitude: longitude,
      });
      // console.log(
      //   `User ${user._id} location updated: ${latitude}, ${longitude}`
      // );
    } catch (err) {
      console.log("err in  update location", err);
      socket.emit("error", err.message);
    }
  });

  //poke event handlers
  socket.on("pokeFriend", async (friendId) => {
    console.log("poke frind run with id:", friendId);
    if (friendId === socket.user.id) {
      socket.emit("error", "You cannot poke yourself");
      return;
    }
    try {
      const sender = await User.findById(socket.user.id);
      const receiver = await User.findById(friendId);

      if (!sender || !receiver) {
        socket.emit("error, user not found");
        return;
      }

      if (!sender.friends.includes(receiver._id)) {
        socket.emit("error", "You can only poke your friends");
        return;
      }

      if (sender.hasPoked.includes(receiver._id)) {
        socket.emit("error", `You already have poked this user`);
        return;
      }
      sender.hasPoked.push(receiver._id);
      receiver.pokedBy.push(sender._id);

      await sender.save();
      await receiver.save();

      console.log(`User ${sender._id} poked user ${receiver._id}`);

      const receiverSocketId = userSocketMap.get(friendId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("poked", {
          senderId: sender._id,
          senderName: sender.fullname,
        });
      }

      // Emit the poke event to all sockets associated with the receiver
      // const receiverSocketIds = userSocketMap[friendId];
      // if (receiverSocketIds) {
      //   receiverSocketIds.forEach((socketId) => {
      //     io.to(socketId).emit("poked", {
      //       senderId: sender._id,
      //       senderName: sender.fullname,
      //     });
      //   });
      // }
      // io.to(friendId).emit("poked", {
      //   senderId: sender._id,
      //   senderName: sender.fullname,
      // });
    } catch (err) {
      console.error("Error poking friend:", err);
      socket.emit("error", "Failed to poke friend");
    }
  });

  // unpokeFriend event handlers
  socket.on("unpokeFriend", async (friendId) => {
    console.log("unpoked friend with id:", friendId);
    if (friendId === socket.user.id) {
      socket.emit("error", "You cannot unpoke yourself");
      return;
    }
    try {
      const sender = await User.findById(socket.user.id);
      const receiver = await User.findById(friendId);

      if (!sender || !receiver) {
        socket.emit("error", "User not found");
        return;
      }

      // Check if the receiver is in the sender's friends list
      if (!sender.friends.includes(receiver._id)) {
        socket.emit("error", "You can only unpoke your friends");
        return;
      }

      if (!sender.hasPoked.includes(receiver._id)) {
        socket.emit("error", `You have not poked this user before`);
        return;
      }

      sender.hasPoked = sender.hasPoked.filter(
        (item) => item.toString() !== friendId
      );
      receiver.pokedBy = receiver.pokedBy.filter(
        (item) => item.toString() !== sender._id.toString()
      );
      await sender.save();
      await receiver.save();

      // io.to(friendId).emit("unpoked", {
      //   senderId: sender._id,
      //   senderName: sender.fullname,
      // });
      // // Emit the unpoke event to all sockets associated with the receiver
      // const receiverSocketIds = userSocketMap[friendId];
      // if (receiverSocketIds) {
      //   receiverSocketIds.forEach((socketId) => {
      //     io.to(socketId).emit("unpoked", {
      //       senderId: sender._id,
      //       senderName: sender.fullname,
      //     });
      //   });
      // }
      // Emit the unpoke event to all sockets associated with the receiver
      const receiverSocketId = userSocketMap.get(friendId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("unpoked", {
          senderId: sender._id,
          senderName: sender.fullname,
        });
      }

      console.log(`User ${sender._id} unpoked user ${receiver._id}`);
    } catch (err) {
      console.error("Error unpoking friend:", err);
      socket.emit("error", "Failed to unpoke friend");
    }
  });

  // Handle friend request
  socket.on("sendFriendRequest", async (receiverId) => {
    try {
      const senderId = socket.user.id;
      console.log("login user id sender ========>", senderId);
      console.log("receiverId ========>", receiverId);

      if (senderId === receiverId) {
        socket.emit("error", "You cant not request yourself");
        return;
      }

      const sender = await User.findById(senderId).populate("friends");
      const receiver = await User.findById(receiverId).populate("friends");

      if (!sender || !receiver) {
        socket.emit("error", "Users not found");
        return;
      }

      if (sender.friends.some((friend) => friend._id.equals(receiverId))) {
        socket.emit("error", "Already friends");
        return;
      }

      if (sender.sentFriendRequests.includes(receiverId)) {
        socket.emit("error", "Friend request already sent");
        return;
      }

      sender.sentFriendRequests.push(receiverId);
      receiver.receivedFriendRequests.push(senderId);
      await sender.save();
      await receiver.save();

      // // Emit a notification to the receiver's socket(s)
      // const receiverSocketIds = userSocketMap.get(receiverId);
      // if (receiverSocketIds) {
      //   receiverSocketIds.forEach((socketId) => {
      //     io.to(socketId).emit("newFriendRequest", {
      //       senderId: sender._id,
      //       senderName: sender.fullname,
      //     });
      //   });
      // }
      // Emit a notification to the receiver's socket(s)
      const receiverSocketIds = userSocketMap.get(receiverId);
      if (receiverSocketIds) {
        io.to(receiverSocketIds).emit("newFriendRequest", {
          senderId: sender._id,
          senderName: sender.fullname,
        });
      }

      // socket.emit("friendRequestSent", {
      //   receiverId: receiverId,
      //   message: "Friend request sent successfully",
      // });
    } catch (err) {
      console.error("Error sending friend request:", err);
      socket.emit("error", "Failed to send friend request");
    }
  });

  // Accept friend request
  socket.on("acceptFriendRequest", async ({ senderId, receiverId }) => {
    try {
      // Validate senderId and receiverId
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        socket.emit("error", "Invalid IDs");
        return;
      }

      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      // Check if sender and receiver exist
      if (!sender) {
        socket.emit("error", "Sender not found");
        return;
      }
      if (!receiver) {
        socket.emit("error", "Receiver not found");
        return;
      }

      // Check if the request exists in the receivedFriendRequests of the receiver
      if (!receiver.receivedFriendRequests.includes(senderId)) {
        socket.emit("error", "Friend request not found");
        return;
      }

      // Update sender's and receiver's friends array
      receiver.friends.push(senderId);
      sender.friends.push(receiverId);

      // Remove the request from receivedFriendRequests and sentFriendRequests
      receiver.receivedFriendRequests = receiver.receivedFriendRequests.filter(
        (id) => !id.equals(senderId)
      );
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (id) => !id.equals(receiverId)
      );

      await sender.save();
      await receiver.save();

      // Emit event to notify sender about acceptance
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        console.log("senderSocketId====>", senderSocketId);
        io.to(senderSocketId).emit("friendRequestAccepted", {
          receiverId: receiverId,
          receiverUsername: receiver.fullname,
        });
      }
      // Emit event to notify receiver about acceptance
      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        console.log("receiverSocketId====>", receiverSocketId);
        io.to(receiverSocketId).emit("friendRequestAccepted", {
          senderId: senderId,
          Username: sender.fullname,
        });
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
      socket.emit("error", "Failed to accept friend request");
    }
  });

  socket.on("rejectFriendRequest", async ({ senderId, receiverId }) => {
    try {
      // Validate senderId and receiverId
      if (
        !mongoose.Types.ObjectId.isValid(senderId) ||
        !mongoose.Types.ObjectId.isValid(receiverId)
      ) {
        socket.emit("error", "Invalid sender or receiver ID");
        return;
      }

      const receiver = await User.findById(receiverId);
      const sender = await User.findById(senderId);

      if (!receiver || !sender) {
        socket.emit("error", "Sender or receiver not found");
        return;
      }

      // Check if the request exists in the receivedFriendRequests of the receiver
      if (!receiver.receivedFriendRequests.includes(senderId)) {
        socket.emit("error", "Friend request not found");
        return;
      }

      // Remove the request from receivedFriendRequests and sentFriendRequests
      receiver.receivedFriendRequests = receiver.receivedFriendRequests.filter(
        (id) => !id.equals(senderId)
      );
      sender.sentFriendRequests = sender.sentFriendRequests.filter(
        (id) => !id.equals(receiverId)
      );

      await receiver.save();
      await sender.save();

      // // Emit event to notify sender about rejection
      // const senderSocketId = userSocketMap.get(senderId);
      // if (senderSocketId) {
      //   io.to(senderSocketId).emit("friendRequestRejected", {
      //     receiverId: receiverId,
      //     receiverUsername: receiver.fullname,
      //   });
      // }
      const senderSocketId = userSocketMap.get(senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("friendRequestRejected", {
          receiverId: receiverId,
          receiverUsername: receiver.fullname,
        });
      }

      const receiverSocketId = userSocketMap.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("friendRequestRejected", {
          senderId: senderId,
          senderName: sender.fullname,
        });
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
      socket.emit("error", "Failed to reject friend request");
    }
  });

  // Handle disconnect event
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    // Clean up userSocketMap on disconnect
    for (let [userId, socketId] of userSocketMap) {
      if (socketId === socket.id) {
        userSocketMap.delete(userId);
        break;
      }
    }
  });
});

app.use(express.json());
// Middleware to add io to req
app.use((req, res, next) => {
  req.io = io;
  req.userSocketMap = userSocketMap;
  next();
});

const port = process.env.PORT;

// Serve the HTML file
// app.get("/", (req, res) => {
//   res.sendFile(path.join(__dirname, "public", "index.html"));
// });

//database connection
databaseConnection();

//start server
server.listen(3000, () => {
  console.log("prot===>", port);
  console.log("server is listning on port 5000");
});

// user Routes
const userRoute = require("./Routes/UserRoutes");
app.use("/users", userRoute);

// friend Request routes
const friendRequest = require("./Routes/FriendRequestRoute");
const { friends } = require("./Controllar/UserControllar");
// app.use("/api/v1", friendRequest);
