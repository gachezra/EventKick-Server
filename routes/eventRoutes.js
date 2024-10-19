const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/authMiddleware");
const { 
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
    trackShare,
} = require("../controllers/eventsController");

router.get("/getevnt", getAllEvents);
router.post("/addevnt", verifyToken,createEvent);
router.get('/popular', getPopularEvents);
router.get('/upcoming', getUpcomingEvents);
router.get('/admin/approved', getApprovedEvents);
router.get('/admin/pending', verifyToken, getPendingEvents);
router.post('/register/:eventId', verifyToken, registerEvent);
router.post('/buy/:eventId', verifyToken, buyTicket);
router.post('/favourite/:eventId', verifyToken, favouriteEvent);
router.get('/user/:userId/registered', getUserRegisteredEvents);
router.put('/admin/approve/:id', verifyToken, approveEvent);
router.post('/scan/:eventId/:userId', verifyToken, updateTicketScanned);
router.put('/admin/disapprove/:id', verifyToken, disapproveEvent);
router.post('/incrementOpenedCount/:id', incrementOpenedCount);
router.get('/user/:userId', verifyToken, getEventsByUserId);
router.post('/share-track/:eventId', trackShare);
router.get('/:id', getEventById);
router.delete('/:id', verifyToken, deleteEvent);
router.put('/:id', verifyToken, updateEvent);

module.exports = router;
