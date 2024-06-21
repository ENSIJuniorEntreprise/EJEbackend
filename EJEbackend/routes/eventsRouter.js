const express = require("express")
const eventController = require("../controllers/eventController")

const router = express.Router();

router.post('/', eventController.addEvent);
router.get('/', eventController.getAllEvents);
router.get('/:substring', eventController.getEventsBySubstring);
router.put('/:id', eventController.updateEventById);
router.delete('/:id', eventController.deleteEventById);

module.exports = router;