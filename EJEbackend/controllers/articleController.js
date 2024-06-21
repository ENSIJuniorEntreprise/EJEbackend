const Article = require("../models/Article");

const addArticle = async (req, res) => {
    try {
        const { title, photo, submissionDate, description, content, onFront } = req.body;

        if (!title || !photo || !submissionDate || !description || !content || onFront === undefined) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const article = await Article.create({
            title,
            photo,
            submissionDate,
            description,
            content,
            onFront,
        });

        res.status(201).json({ article });
    } catch (error) {
        console.error("Error adding article:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find();
        res.json({ articles });
    } catch (error) {
        console.error("Error getting articles:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const getRecentArticles = async (req, res) => {
    try {
        const articlesCount = await Article.countDocuments(); // Get the count of all articles

        let articles;
        if (articlesCount > 9) {
            articles = await Article.find()
                .sort({ submissionDate: -1 }) // Sort articles by submission date in descending order
                .limit(9); // Limit the result to the 9 most recent articles
        } else {
            articles = await Article.find()
                .sort({ submissionDate: -1 }); // Sort articles by submission date in descending order
        }

        res.json({ articles });
    } catch (error) {
        console.error("Error getting articles:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};


const getArticlesBySubstring = async (req, res) => {
    try {
        const substring = req.params.substring;

        if (!substring) {
            return res.status(400).json({ error: "Substring parameter is required." });
        }

        const articles = await Article.find({
            $or: [
                { title: { $regex: substring, $options: 'i' } },
                { description: { $regex: substring, $options: 'i' } }
            ]
        });

        res.json({ articles });
    } catch (error) {
        console.error("Error getting articles by substring:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const deleteArticleById = async (req, res) => {
    const id = req.params.id;
    try {
        const deletedArticle = await Article.findByIdAndDelete(id);
        if (!deletedArticle) {
            return res.status(404).json({ error: "Article not found." });
        }
        res.json({ message: "Article deleted successfully." });
    } catch (error) {
        console.error("Error deleting article by ID:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

const updateArticleById = async (req, res) => {
    const id = req.params.id;
    const { title, photo, submissionDate, description, content, onFront } = req.body;
    
    if (!title || !photo || !submissionDate || !description || !content || onFront === undefined) {
        return res.status(400).json({ error: "All fields are required." });
    }

    try {
        const updatedArticle = await Article.findByIdAndUpdate(id, {
            title,
            photo,
            submissionDate,
            description,
            content,
            onFront,
        }, { new: true });

        console.log(updatedArticle);

        if (!updatedArticle) {
            return res.status(404).json({ error: "Article not found." });
        }

        res.json({ article: updatedArticle });
    } catch (error) {
        console.error("Error updating article by ID:", error);
        res.status(500).json({ error: "Internal server error." });
    }
};

module.exports = {
    addArticle,
    getAllArticles,
    getArticlesBySubstring,
    deleteArticleById,
    updateArticleById,
    getRecentArticles,
};
