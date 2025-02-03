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
const scrape = require("./utils/scraper");
const { startHealthCheckTimer, receiveHealthCheck } = require('./utils/healthCheck');
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
const INITIAL_DELAY = 5 * 60 * 1000; // 5 minutes initial delay

// Scheduler function with error handling and logging
const scheduleScrapingJob = () => {
  console.log('Setting up scheduled scraping job...');
  
  // Run initial scrape after 5 minutes of server start
  setTimeout(async () => {
    try {
      console.log('Running initial scrape...');
      await scrape();
      console.log('Initial scrape completed successfully');
    } catch (error) {
      console.error('Error in initial scrape:', error);
    }
  }, INITIAL_DELAY);

  // Schedule regular scraping every 3 days
  setInterval(async () => {
    try {
      console.log('Running scheduled scrape...');
      await scrape();
      console.log('Scheduled scrape completed successfully');
    } catch (error) {
      console.error('Error in scheduled scrape:', error);
    }
  }, THREE_DAYS);
};

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/on', receiveHealthCheck);

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
  // Start the health check timer after server starts
  startHealthCheckTimer();
  // Schedule scaping job
  scheduleScrapingJob();
});
