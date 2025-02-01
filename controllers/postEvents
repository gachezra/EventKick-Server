const Event = require("../models/eventsModel");

const processEventData = (eventData) => {
  const description = eventData.title + eventData.description;
  const event = {
    title: description,
    description: description,
    date: req.body.date,
    location: req.body.title,
    user: 1,
    image: req.body.url,
    isPaid: false,
    ticketPrice: 0,
  };
  return {
    event,
  };
};

const postSingleEvent = async (eventData) => {
  try {
    const processedData = processEventData(eventData);
    const event = new Event(processedData);
    const newEvent = await event.save();
    return newEvent;
  } catch (error) {
    console.error(`Error posting event '${eventData.title}':`, error);
    throw error;
  }
};

const postEvents = async (req, res) => {
  try {
    // Handle single event
    if (!Array.isArray(req.body)) {
      const newEvent = await postSingleEvent(req.body);
      return res.status(201).json({
        success: true,
        data: newEvent,
      });
    }

    // Handle multiple events
    const results = [];
    const errors = [];

    for (const eventData of req.body) {
      try {
        const newEvent = await postSingleEvent(eventData);
        results.push(newEvent);
      } catch (error) {
        errors.push({
          title: eventData.title,
          error: error.message,
        });
      }
    }

    return res.status(201).json({
      success: true,
      data: {
        succeeded: results,
        failed: errors,
      },
      totalProcessed: req.body.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    console.error("Error in postEvents:", error);
    return res.status(500).json({
      success: false,
      error: "Internal server error while processing events",
    });
  }
};

module.exports = {
  postEvents,
  postSingleEvent, // Exported for testing or individual use
};
