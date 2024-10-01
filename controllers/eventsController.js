const Events = require("../model/eventsModel");
const User = require('../model/userModel');

const getAllEvents = async (req, res) => {
  try {
    const events = await Events.find();
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEventById = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const createEvent = async (req, res) => {
  const event = new Events({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    location: req.body.location,
    latitude: req.body.latitude,
    longitude: req.body.longitude,
    user: req.body.user,
    image: req.body.image,
    isPaid: req.body.isPaid,
    ticketPrice: req.body.isPaid ? req.body.ticketPrice : 0,
  });

  try {
    const newEvent = await event.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPopularEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3; // Optional: add pagination limit from query

    // Get the current date and time
    const now = new Date();

    const events = await Events.find({
      status: 'approved',
      date: { $gte: now } // Fetch events starting from the current date and time
    })
    .sort({ openedCount: -1 }) // Sort by popularity (openedCount descending)
    .limit(limit);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching popular events', error: err.message });
  }
};

const getUpcomingEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 3; // Optional: add pagination limit from query

    // Get the current date and time
    const now = new Date();

    // Set the end of today (23:59:59)
    const endOfToday = new Date(now);
    endOfToday.setHours(23, 59, 59, 999);

    const events = await Events.find({
      status: 'approved',
      date: { $gte: now, $lte: endOfToday } // Fetch events starting from now until the end of today
    })
    .sort({ date: 1 })
    .limit(limit);

    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching upcoming events for today', error: err.message });
  }
};


const incrementOpenedCount = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    event.openedCount += 1;
    await event.save();
    res.json({ message: 'Opened count incremented' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getEventsByUserId = async (req, res) => {
  try {
    const events = await Events.find({ user: req.params.userId });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const deleteEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json({ message: "Event deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateEvent = async (req, res) => {
  try {
    const event = await Events.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Update the fields if they are provided in the request body
    if (req.body.title) event.title = req.body.title;
    if (req.body.description) event.description = req.body.description;
    if (req.body.date) event.date = req.body.date;
    if (req.body.location) event.location = req.body.location;

    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const getPendingEvents = async (req, res) => {
  try {
    const events = await Events.find({ status: 'pending' });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const approveEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const disapproveEvent = async (req, res) => {
  try {
    const event = await Events.findByIdAndUpdate(
      req.params.id,
      { status: 'disapproved' },
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getApprovedEvents = async (req, res) => {
  try {
    const events = await Events.find({ status: 'approved' }).sort({ _id: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const registerEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId, tickets } = req.body; 

  try {
    const event = await Events.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: "Event or User not found" });
    }

    // if (event.registeredUsers.includes(userId)) {
    //   return res.status(400).json({ message: "You are already registered for this event" });
    // }

    event.registeredUsers.push(userId);

    if (tickets) {
      for (let i = 1; i <= tickets; i++) {
        const ticketNumber = `${eventId}_${i}`;
        user.tickets.push({ eventId, ticketNumber });
      }
    }

    await event.save();
    await user.save();

    res.status(200).json({ message: "Successfully registered for the event" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getUserRegisteredEvents = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).populate('tickets');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.json(user.registeredEvents);
  } catch (err) {
    console.error("Error fetching user registered events:", err);
    res.status(500).json({ message: "Error fetching registered events", error: err.message });
  }
};

module.exports = {
  getAllEvents,
  createEvent,
  getEventById,
  getPopularEvents,
  getUpcomingEvents,
  incrementOpenedCount,
  getEventsByUserId,
  deleteEvent,
  updateEvent,
  getPendingEvents,
  approveEvent,
  disapproveEvent,
  getApprovedEvents,
  registerEvent,
  getUserRegisteredEvents,
};
