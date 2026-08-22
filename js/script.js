// Registration
const registerForm = document.querySelector(".register-container form");

if (registerForm) {
    registerForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:3000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message);
                window.location.href = "login.html";
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.error(error);
            alert("Unable to connect to the backend server.");
        }
    });
}


// Login
const loginForm = document.querySelector(".login-container form");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:3000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || "Login successful!");

                // Save logged-in user information
                localStorage.setItem("user", JSON.stringify(data.user));

                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Invalid email or password!");
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to the backend server.");
        }
    });
}


// Create Blog
const blogForm = document.querySelector(".blog-form form");

if (blogForm) {
    blogForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const category = document.getElementById("category").value;
        const content = document.getElementById("content").value;

        try {
            const response = await fetch("http://localhost:3000/api/blogs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: title,
                    author: author,
                    category: category,
                    content: content
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Blog published successfully!");
                window.location.href = "dashboard.html";
            } else {
                alert(data.message || "Blog creation failed.");
            }

        } catch (error) {
            console.error("Blog creation error:", error);
            alert("Unable to connect to the backend server.");
        }
    });
}


// Display Blogs from MongoDB
const blogList = document.getElementById("blog-list");

let allBlogs = [];

if (blogList) {
    loadBlogs();
}

async function loadBlogs() {
    try {
        const response = await fetch("http://localhost:3000/api/blogs");

        if (!response.ok) {
            throw new Error("Failed to load blogs");
        }

        allBlogs = await response.json();

        displayBlogs(allBlogs);

    } catch (error) {
        console.error("Error loading blogs:", error);
        blogList.innerHTML = "<p>Unable to load blogs.</p>";
    }
}

function displayBlogs(blogs) {
    blogList.innerHTML = "";

    if (blogs.length === 0) {
        blogList.innerHTML = "<p>No blogs found.</p>";
        return;
    }

    blogs.forEach(function(blog) {
        const blogCard = document.createElement("div");

        blogCard.className = "blog-card";

        blogCard.innerHTML = `
            <h2>${blog.title}</h2>

            <div class="author">
                By ${blog.author}
            </div>

            <div class="category">
                Category: ${blog.category}
            </div>

            <p>${blog.content}</p>

            <div class="actions">
                <button class="edit-btn" onclick="editBlog('${blog._id}')">
    Edit
</button>

<button class="delete-btn" onclick="deleteBlog('${blog._id}')">
    Delete
</button>
            </div>
        `;

        blogList.appendChild(blogCard);
    });
}


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
// EDIT BLOG
// ====================

async function editBlog(id) {
    const blog = allBlogs.find(function(item) {
        return item._id === id;
    });

    if (!blog) {
        alert("Blog not found.");
        return;
    }

    const newTitle = prompt("Enter new blog title:", blog.title);

    if (newTitle === null) {
        return;
    }

    const newContent = prompt("Enter new blog content:", blog.content);

    if (newContent === null) {
        return;
    }

    const newCategory = prompt("Enter category:", blog.category);

    if (newCategory === null) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/blogs/${id}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: newTitle,
                    author: blog.author,
                    category: newCategory,
                    content: newContent
                })
            }
        );

        const data = await response.json();

        if (response.ok) {
            alert("Blog updated successfully!");
            loadBlogs();
        } else {
            alert(data.message || "Failed to update blog.");
        }

    } catch (error) {
        console.error("Edit error:", error);
        alert("Unable to connect to the backend server.");
    }
}
// ====================
// SEARCH BLOGS
// ====================

function searchBlogs() {
    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const filteredBlogs = allBlogs.filter(function(blog) {
        return (
            blog.title.toLowerCase().includes(searchText) ||
            blog.author.toLowerCase().includes(searchText) ||
            blog.content.toLowerCase().includes(searchText) ||
            blog.category.toLowerCase().includes(searchText)
        );
    });

    displayBlogs(filteredBlogs);
}


// ====================
// FILTER BY CATEGORY
// ====================

function filterBlogs() {
    const category = document.getElementById("categoryFilter").value;

    if (category === "") {
        displayBlogs(allBlogs);
        return;
    }

    const filteredBlogs = allBlogs.filter(function(blog) {
        return blog.category === category;
    });

    displayBlogs(filteredBlogs);
}