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

const buyTicket = async (req, res) => {
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
    user.registeredEvents.push(eventId);

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

const registerEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body; 

  try {
    const event = await Events.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: "Event or User not found" });
    }

    event.registeredUsers.push({ user: userId, ticketScanned: false });
    user.registeredEvents.push(eventId);

    await event.save();
    await user.save();

    res.status(200).json({ message: "Successfully registered for the event" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTicketScanned = async (req, res) => {
  const { eventId, userId } = req.params; // Get eventId and userId from request parameters
  const { scanned } = req.body; // Get the scanned status from the request body

  try {
    // Find the event and the specific user within the registeredUsers array
    const event = await Events.findOne(
      { _id: eventId, 'registeredUsers.user': userId }, // Match event and user
      { 'registeredUsers.$': 1 } // Select only the matched registered user
    );

    if (!event) {
      return res.status(404).json({ message: 'Event or user not found' });
    }

    const userTicket = event.registeredUsers[0]; // Get the specific user's ticket details

    // Check if the ticket is already scanned
    if (userTicket.ticketScanned) {
      return res.status(400).json({ message: 'Ticket has already been scanned' });
    }

    // Update the ticketScanned status if it's not already scanned
    const updatedEvent = await Events.findOneAndUpdate(
      { _id: eventId, 'registeredUsers.user': userId }, // Match event and user
      { $set: { 'registeredUsers.$.ticketScanned': scanned } }, // Update ticketScanned
      { new: true } // Return the updated document
    );

    return res.status(200).json({
      message: 'Ticket scan status updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Error updating ticket scanned status:', error);
    return res.status(500).json({
      message: 'Internal server error',
    });
  }
};


const favouriteEvent = async (req, res) => {
  const { eventId } = req.params;
  const { userId } = req.body;

  try {
    const event = await Events.findById(eventId);
    const user = await User.findById(userId);

    if (!event || !user) {
      return res.status(404).json({ message: "Event or User not found" });
    }

    // Check if the user has already favorited the event
    const isFavorited = event.favouritedByUser.includes(userId);

    if (isFavorited) {
      // Remove user from event's favouritedByUser array
      event.favouritedByUser = event.favouritedByUser.filter(id => id.toString() !== userId.toString());

      // Remove event from user's favouriteEvents array
      user.favouriteEvents = user.favouriteEvents.filter(id => id.toString() !== eventId.toString());

      await event.save();
      await user.save();

      return res.status(200).json({
        message: "Successfully removed from favorites",
        favoritedCount: event.favouritedByUser.length
      });
    } else {
      // Add user to event's favouritedByUser array
      event.favouritedByUser.push(userId);

      // Add event to user's favouriteEvents array
      user.favouriteEvents.push(eventId);

      await event.save();
      await user.save();

      return res.status(200).json({
        message: "Successfully favorited the event",
        favoritedCount: event.favouritedByUser.length
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
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

const trackShare = async (req, res) => {
  const { eventId } = req.params;
  const { platform } = req.body;
  console.log('Received request:', { eventId, platform });
  console.log(eventId.toString());

  try {
    console.log('Attempting to find event with ID:', eventId);
    const event = await Event.findById(eventId.toString());
    console.log('Found event:', event);

    if (!event) {
      console.log('Event not found');
      return res.status(404).json({ message: 'Event not found' });
    }

    // Increment the share count for the specific platform
    if (!event.shares) {
      event.shares = {};
    }
    event.shares[platform] = (event.shares[platform] || 0) + 1;

    // Increment total share count
    event.totalShares = (event.totalShares || 0) + 1;

    await event.save();

    res.status(200).json({ message: 'Share tracked successfully' });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({ message: 'Error tracking share' });
  }
}

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
  favouriteEvent,
  buyTicket,
  updateTicketScanned,
  trackShare
};
