const Event = require("../models/Event");

const addEvent = async (req, res) => {
    // console.log(req.body);
    try {
        const { title, photos, date, description, paragraphs, subTitles, newest } = req.body;

        if (!title || !photos || !date || !description || newest === undefined || !paragraphs || !subTitles) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const event = await Event.create({
            title,
            photos,
            date,
            description,
            newest,
            paragraphs,
            subTitles
        });


        res.status(201).json({ event });
    } catch (error) {
        console.error("Error adding event:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.json({ events });
    } catch (error) {
        console.error("Error getting events:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getEventsBySubstring = async (req, res) => {
    try {
        const substring = req.params.substring;

        if (!substring) {
            return res.status(400).json({ error: "Substring parameter is required." });
        }

        const paragraphsQueries = paragraphs.map((paragraph, index) => {
            return { [`paragraphs.${index}`]: { $regex: substring, $options: 'i' } };
        });
        
        const events = await Event.find({
            $or: [
                { title: { $regex: substring, $options: 'i' } },
                { description: { $regex: substring, $options: 'i' } },
                ...paragraphsQueries
            ]
        });
        

        res.json({ events });
    } catch (error) {
        console.error("Error getting events by substring:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const deleteEventById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedEvent = await Event.findByIdAndDelete(id);
        if (!deletedEvent) {
            return res.status(404).json({ error: "Event not found." });
        }
        res.json({ message: "Event deleted successfully." });
    } catch (error) {
        console.error("Error deleting event by ID:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const updateEventById = async (req, res) => {
    const id = req.params.id;
    const { title, photos, date, description, paragraphs, subTitles, newest } = req.body;
    
    if (!title || !photos || !date || !description || !paragraphs || !subTitles || newest === undefined) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const updatedEvent = await Event.findByIdAndUpdate(id, {
            title,
            photos,
            date,
            description,
            paragraphs,
            subTitles,
            newest,
        }, { new: true });


        if (!updatedEvent) {
            return res.status(404).json({ error: "Event not found." });
        }

        res.json({ event: updatedEvent });
    } catch (error) {
        console.error("Error updating event by ID:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


module.exports = {
    addEvent,
    getAllEvents,
    getEventsBySubstring,
    deleteEventById,
    updateEventById,
};
