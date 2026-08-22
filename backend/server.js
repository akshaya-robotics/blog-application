const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ====================
// MONGODB CONNECTION
// ====================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB connected successfully");
    })
    .catch((error) => {
        console.error("MongoDB connection error:", error);
    });

// ====================
// USER SCHEMA
// ====================

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model("User", userSchema);

// ====================
// BLOG SCHEMA
// ====================

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const Blog = mongoose.model("Blog", blogSchema);

// ====================
// HOME ROUTE
// ====================

app.get("/", (req, res) => {
    res.json({
        message: "Blog Application Backend is running!"
    });
});

// ====================
// REGISTER
// ====================

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name,
            email,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Registration failed"
        });
    }
});

// ====================
// LOGIN
// ====================

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        res.json({
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Login failed"
        });
    }
});

// ====================
// CREATE BLOG
// ====================

app.post("/api/blogs", async (req, res) => {
    try {
        const { title, author, category, content } = req.body;

        if (!title || !author || !category || !content) {
            return res.status(400).json({
                message: "Title, author and content are required"
            });
        }

        const blog = new Blog({
            title,
            author,
            category,
            content
        });

        await blog.save();

        res.status(201).json({
            message: "Blog created successfully",
            blog
        });

    } catch (error) {
        console.error("Blog creation error:", error);

        res.status(500).json({
            message: "Blog creation failed"
        });
    }
});

// ====================
// GET ALL BLOGS
// ====================

app.get("/api/blogs", async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ _id: -1 });

        res.json(blogs);

    } catch (error) {
        console.error("Get blogs error:", error);

        res.status(500).json({
            message: "Failed to retrieve blogs"
        });
    }
});

// ====================
// GET ONE BLOG
// ====================

app.get("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json(blog);

    } catch (error) {
        console.error("Get single blog error:", error);

        res.status(400).json({
            message: "Invalid blog ID"
        });
    }
});
// ====================
// UPDATE BLOG
// ====================

app.put("/api/blogs/:id", async (req, res) => {
    try {
        const { title, author, category, content } = req.body;

        const blog = await Blog.findByIdAndUpdate(
            req.params.id,
            {
                title,
                author,
                category,
                content
            },
            { new: true, runValidators: true }
        );

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json({
            message: "Blog updated successfully",
            blog
        });

    } catch (error) {
        console.error("Update blog error:", error);

        res.status(500).json({
            message: "Blog update failed"
        });
    }
});


// ====================
// DELETE BLOG
// ====================

app.delete("/api/blogs/:id", async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);

        if (!blog) {
            return res.status(404).json({
                message: "Blog not found"
            });
        }

        res.json({
            message: "Blog deleted successfully"
        });

    } catch (error) {
        console.error("Delete blog error:", error);

        res.status(500).json({
            message: "Blog deletion failed"
        });
    }
});
// ====================
// START SERVER
// ====================

app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
});