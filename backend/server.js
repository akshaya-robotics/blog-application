const express = require("express");

const app = express();
const PORT = 3000;

// Allow the server to read JSON data
app.use(express.json());

// Test route
app.get("/", (req, res) => {
    res.json({
        message: "Blog Application Backend is running!"
    });
});

// User Registration API
app.post("/api/register", (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    res.status(201).json({
        message: "User registered successfully",
        user: {
            name: name,
            email: email
        }
    });
});

// User Login API
app.post("/api/login", (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required"
        });
    }

    res.json({
        message: "Login successful",
        user: {
            email: email
        }
    });
});

// Create Blog API
app.post("/api/blogs", (req, res) => {
    const { title, author, content } = req.body;

    if (!title || !author || !content) {
        return res.status(400).json({
            message: "Title, author and content are required"
        });
    }

    res.status(201).json({
        message: "Blog created successfully",
        blog: {
            title: title,
            author: author,
            content: content
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});