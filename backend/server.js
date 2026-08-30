const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error("JWT_SECRET is missing from .env file.");
    process.exit(1);
}

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
        process.exit(1);
    });


// ====================
// USER SCHEMA
// ====================

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);


// ====================
// BLOG SCHEMA
// ====================

const blogSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true
        },

        author: {
            type: String,
            required: true,
            trim: true
        },

        category: {
            type: String,
            required: true,
            trim: true
        },

        content: {
            type: String,
            required: true
        },

        // Owner of the blog
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);

const Blog = mongoose.model("Blog", blogSchema);


// ====================
// JWT AUTHENTICATION
// ====================

function authenticateToken(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null;

    if (!token) {
        return res.status(401).json({
            message: "Access denied. Please login."
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {

        return res.status(403).json({
            message: "Invalid or expired token"
        });

    }
}


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

        const {
            name,
            email,
            password
        } = req.body;

        if (!name || !email || !password) {

            return res.status(400).json({
                message: "All fields are required"
            });

        }

        const normalizedEmail =
            email.toLowerCase().trim();


        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                message: "User already exists"
            });

        }


        const hashedPassword =
            await bcrypt.hash(password, 10);


        const user = new User({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword

        });


        await user.save();


        res.status(201).json({

            message:
                "User registered successfully",

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });

    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

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

        const {
            email,
            password
        } = req.body;


        if (!email || !password) {

            return res.status(400).json({
                message:
                    "Email and password are required"
            });

        }


        const normalizedEmail =
            email.toLowerCase().trim();


        const user =
            await User.findOne({
                email: normalizedEmail
            });


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const passwordMatch =
            await bcrypt.compare(
                password,
                user.password
            );


        if (!passwordMatch) {

            return res.status(401).json({
                message:
                    "Invalid email or password"
            });

        }


        const token = jwt.sign(

            {
                userId: user._id.toString(),

                name: user.name,

                email: user.email
            },

            JWT_SECRET,

            {
                expiresIn: "1h"
            }

        );


        res.json({

            message: "Login successful",

            token,

            user: {

                id: user._id,

                name: user.name,

                email: user.email

            }

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );

        res.status(500).json({
            message: "Login failed"
        });

    }

});


// ====================
// GET LOGGED-IN USER PROFILE
// ====================

app.get(
    "/api/profile",
    authenticateToken,
    async (req, res) => {

        try {

            const user =
                await User.findById(
                    req.user.userId
                ).select("-password");


            if (!user) {

                return res.status(404).json({
                    message: "User not found"
                });

            }


            res.json(user);


        } catch (error) {

            console.error(
                "Profile error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to retrieve profile"
            });

        }

    }
);


// ====================
// CREATE BLOG
// ====================

app.post(
    "/api/blogs",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                title,
                category,
                content
            } = req.body;


            if (
                !title ||
                !category ||
                !content
            ) {

                return res.status(400).json({

                    message:
                        "Title, category and content are required"

                });

            }


            const blog = new Blog({

                title: title.trim(),

                author: req.user.name,

                category: category.trim(),

                content,

                userId: req.user.userId

            });


            await blog.save();


            res.status(201).json({

                message:
                    "Blog created successfully",

                blog

            });


        } catch (error) {

            console.error(
                "Blog creation error:",
                error
            );

            res.status(500).json({

                message:
                    "Blog creation failed"

            });

        }

    }
);


// ====================
// GET ALL BLOGS - PUBLIC
// ====================

app.get(
    "/api/blogs",
    async (req, res) => {

        try {

            const blogs =
                await Blog.find()
                    .sort({
                        createdAt: -1
                    });

            res.json(blogs);

        } catch (error) {

            console.error(
                "Get blogs error:",
                error
            );

            res.status(500).json({
                message:
                    "Failed to retrieve blogs"
            });
        }
    }
);


// ==============================
// GET ONE BLOG
// ==============================

app.get(
    "/api/blogs/:id",
    async (req, res) => {

        try {

            console.log(
                "Requested blog ID:",
                req.params.id
            );

            const blog =
                await Blog.findById(req.params.id);

            if (!blog) {

                console.log(
                    "Blog does not exist."
                );

                return res.status(404).json({
                    message: "Blog not found"
                });
            }

            console.log(
                "Blog found:",
                blog
            );

            // Return the blog
            // No login required to read blogs

            res.json(blog);

        } catch (error) {

            console.error(
                "Get single blog error:",
                error
            );

            res.status(400).json({
                message: "Invalid blog ID"
            });
        }
    }
);

// ====================
// UPDATE BLOG
// ====================

app.put(
    "/api/blogs/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const {
                title,
                category,
                content
            } = req.body;


            const blog =
                await Blog.findOneAndUpdate(

                    {
                        _id: req.params.id,

                        userId: req.user.userId
                    },

                    {

                        title,

                        category,

                        content,

                        author: req.user.name

                    },

                    {
                        new: true,

                        runValidators: true
                    }

                );


            if (!blog) {

                return res.status(404).json({

                    message:
                        "Blog not found or you do not have permission"

                });

            }


            res.json({

                message:
                    "Blog updated successfully",

                blog

            });


        } catch (error) {

            console.error(
                "Update blog error:",
                error
            );

            res.status(500).json({

                message:
                    "Blog update failed"

            });

        }

    }
);


// ====================
// DELETE BLOG
// ====================

app.delete(
    "/api/blogs/:id",
    authenticateToken,
    async (req, res) => {

        try {

            const blog =
                await Blog.findOneAndDelete({

                    _id: req.params.id,

                    userId: req.user.userId

                });


            if (!blog) {

                return res.status(404).json({

                    message:
                        "Blog not found or you do not have permission"

                });

            }


            res.json({

                message:
                    "Blog deleted successfully"

            });


        } catch (error) {

            console.error(
                "Delete blog error:",
                error
            );

            res.status(500).json({

                message:
                    "Blog deletion failed"

            });

        }

    }
);


// ====================
// START SERVER
// ====================

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected successfully");

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Backend server running on port ${PORT}`);
        });

    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1);
    }
}

startServer();