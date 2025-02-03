const Event = require("../model/eventsModel");

const processEventData = (eventData) => {
  const description = `${eventData.title} ${eventData.description}`;
  const event = {
    title: description,
    description: description,
    date: eventData.date,
    location: eventData.title,
    user: 1,
    image: eventData.url,
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

const postEvents = async (events) => {
  try {
    // Handle single event
    if (!Array.isArray(events)) {
      const newEvent = await postSingleEvent(events);
    }

    // Handle multiple events
    const results = [];
    const errors = [];

    for (const eventData of events) {
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

    console.log({
      success: true,
      data: {
        succeeded: results,
        failed: errors,
      },
      totalProcessed: events.length,
      successCount: results.length,
      errorCount: errors.length,
    });
  } catch (error) {
    console.error("Error in postEvents:", error);
  }
};

module.exports = {
  postEvents
};
