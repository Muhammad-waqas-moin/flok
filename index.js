const app = require("./app");
const databaseConnection = require("./Config/db");
const port = process.env.PORT;

databaseConnection();
app.listen(5000, () => {
  console.log("prot===>", port);
  console.log("server is listning on port 5000");
});

// user Routes
const userRoute = require("./Routes/UserRoutes");
app.use("/api/v1", userRoute);

// friend Request routes
const friendRequest = require("./Routes/FriendRequestRoute");
app.use("/api/v1", friendRequest);
