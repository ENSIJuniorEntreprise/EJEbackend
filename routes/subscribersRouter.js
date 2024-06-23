const express = require("express")
const subscriberController = require("../controllers/subscriberController")

const router = express.Router();

router.post('/', subscriberController.addSubscriber);
router.post('/send', subscriberController.sendEmailToSubscribers);
router.delete('/:id', subscriberController.deleteSubscriberById);

module.exports = router;