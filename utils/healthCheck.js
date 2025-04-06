const axios = require('axios');
require('dotenv').config();

const PARTNER_URL = `${process.env.PARTNER}`;

// Function to send health check request
const sendHealthCheck = async () => {
  try {
    const response = await axios.get(`${PARTNER_URL}/on`);
    console.log('Health check sent to partner server:', response.data);
  } catch (error) {
    console.error('Failed to send health check:', error.message);
  }
};

function getRandomInterval() {
  // Random time between 2 and 3 hours in milliseconds
  return Math.floor(Math.random() * (10800000 - 7200000 + 1)) + 7200000;
};

// Start the timer to send requests randomly
const startHealthCheckTimer = () => {
  // Send first check immediately
  sendHealthCheck();
  
  // Then send randomly
  setInterval(sendHealthCheck, getRandomInterval);
};

// Handle incoming health check
const receiveHealthCheck = (req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`Health check received at ${timestamp}`);
  
  res.json({
    status: 'active',
    server: 'eventkick',
    timestamp
  });
};

module.exports = {
  startHealthCheckTimer,
  receiveHealthCheck
};
