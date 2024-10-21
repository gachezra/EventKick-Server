const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const messageRoutes = require("./routes/messagesRoute");
const eventRoutes = require("./routes/eventRoutes");
const commentRouter = require("./routes/commentRoutes");
const reviewRouter = require("./routes/reviewRoutes");
const forumRoutes = require("./routes/forumRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const verifyToken = require("./middleware/authMiddleware");
const lipaNaMpesaRoutes = require("./routes/routes.lipanampesa.js");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/mpesa", lipaNaMpesaRoutes)
app.use("/api/auth", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/comments", commentRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/forums", forumRoutes)
app.use("/api", transactionRoutes)

// Protect all other routes
// app.use(verifyToken);

app.use("/api/messages", messageRoutes);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m40xslu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set("strictQuery", true);
mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("DB Connected Successfully...");
})
.catch((err) => {
  console.log(err.message);
});

app.get("/", (req, res) => {
  res.send("WE OON 🤌🏿");
});

const server = app.listen(port, () => {
  console.log("Server Started on Port", port);
});
