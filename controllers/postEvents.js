const Events = require("../model/eventsModel");
const { parse, format } = require('date-fns');
const mongoose = require("mongoose");

const processEventData = (eventData) => {
  console.log(eventData)
  const description = `${eventData.title} ${eventData.description}`;
  
  const inputWithYear = eventData.date + " 2025";

  const parsedDate = parse(inputWithYear, "EEEE do MMMM yyyy", new Date());

  const formattedDate = format(parsedDate, "yyyy-MM-dd");

  const userId = new mongoose.Types.ObjectId("000000000000000000000001");
  const event = {
    title: description,
    description: description,
    date: formattedDate,
    location: eventData.title,
    user: userId,
    image: eventData.url,
    isPaid: false,
    ticketPrice: 0,
  };
  console.log(event)
  return event;
};

const postSingleEvent = async (eventData) => {
  try {
    const processedEvent = processEventData(eventData);
    const event = new Events({
      title: processedEvent.title,
      description: processedEvent.description,
      date: processedEvent.date,
      location: processedEvent.location,
      user: processedEvent.user,
      image: processedEvent.image,
      isPaid: processedEvent.isPaid,
      ticketPrice: processedEvent.ticketPrice,
    });

    console.log('event: ', event)
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
