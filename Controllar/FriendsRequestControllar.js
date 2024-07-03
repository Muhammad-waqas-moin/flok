const FriendRequest = require("../Model/FreindRequestSchema");
const { userSocketMap } = require("../index");

// send friend request
exports.friendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const senderID = req.user.id;

    const friendRequestExists = await FriendRequest.findOne({
      sender: senderID,
      receiver: receiverId,
    });

    if (friendRequestExists) {
      return res.status(400).json({
        status: "failed",
        messgage: "friend request already send",
      });
    }
    const newRequest = new FriendRequest({
      sender: senderID,
      receiver: receiverId,
    });
    newRequest.save();

    // // Emit event for new friend request
    // // console.log("req.io=====================>", req.io);
    // req.io.emit("newFriendRequest", {
    //   senderId: senderID,
    //   receiverId: receiverId,
    //   requestId: newRequest._id,
    // });

    const receiverSocketIds = req.userSocketMap[receiverId];
    if (receiverSocketIds) {
      receiverSocketIds.forEach((socketId) => {
        req.io.to(socketId).emit("newFriendRequest", {
          senderId: senderID,
          receiverId: receiverId,
          requestId: newRequest._id,
        });
      });
    }
    return res.status(200).json({
      status: "success",
      messgage: "friend request send",
      requestId: newRequest._id,
    });
  } catch (err) {
    return res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};

//accept Friend Request
exports.acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await FriendRequest.findById(requestId).populate(
      "sender receiver"
    );
    console.log("request =======>", request);
    if (!request || request.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Invalid or non-pending request" });
    }
    request.status = "accepted";
    await request.save();

    const sender = request.sender;
    const receiver = request.receiver;

    sender.friends.push(receiver._id);
    receiver.friends.push(sender._id);

    await sender.save();
    await receiver.save();
    return res.status(200).json({
      status: "success",
      message: "friends request accepted",
    });
  } catch (err) {
    return res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};

//reject friend Requests
exports.rejectFriendRequest = async (req, res) => {
  console.log("reject route hit");
  try {
    const senderID = req.user.id;
    const { receiverId } = req.body;
    const request = await FriendRequest.findOne({
      sender: senderID,
      receiver: receiverId,
      status: "pending",
    });
    console.log("request for reject ======>", request);
    if (!request) {
      return res.status(400).json({
        status: "failed",
        message: "Invalid or non-pending request",
      });
    }
    request.status = "rejected";
    await request.save();
    return res.status(200).json({
      status: "ok",
      message: "Friend request rejected",
    });
  } catch (err) {
    return res.status(404).json({
      status: "failed",
      message: err.message,
    });
  }
};
// // // Reject Friend Request
// app.post('/reject-request', authenticateJWT, async (req, res) => {
//     const senderId = req.body.senderId;
//     const receiverId = req.user.id;
//     const request = await FriendRequest.findOne({ sender: senderId, receiver: receiverId, status: 'pending' });
//     if (!request) {
//       return res.status(400).json({ message: 'Invalid or non-pending request' });
//     }
//     request.status = 'rejected';
//     await request.save();
//     res.status(200).json({ message: 'Friend request rejected' });
//   });
