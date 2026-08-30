console.log("SCRIPT.JS LOADED");

const API_URL = "http://localhost:3000";

// ==============================
// AUTH HELPERS
// ==============================

function getToken() {
    return localStorage.getItem("token");
}

function getUser() {
    try {
        return JSON.parse(localStorage.getItem("user"));
    } catch {
        return null;
    }
}

function requireLogin() {
    if (!getToken()) {
        alert("Please login first.");
        window.location.href = "login.html";
        return false;
    }
    return true;
}

function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}


// ==============================
// REGISTER
// ==============================

const registerForm =
    document.querySelector(".register-container form");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name =
            document.getElementById("name").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        const confirmPassword =
            document.getElementById("confirm-password").value;

        if (!name || !email || !password) {
            alert("Please fill all fields.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/register`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        name,
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                alert("Registration successful!");

                window.location.href = "login.html";

            } else {

                alert(data.message || "Registration failed.");
            }

        } catch (error) {

            console.error(error);

            alert("Unable to connect to backend.");
        }
    });
}


// ==============================
// LOGIN
// ==============================

const loginForm =
    document.querySelector(".login-container form");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email =
            document.getElementById("email").value.trim();

        const password =
            document.getElementById("password").value;

        try {

            const response = await fetch(
                `${API_URL}/api/login`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email,
                        password
                    })
                }
            );

            const data = await response.json();

            console.log("Login response:", data);

            if (response.ok) {

                localStorage.setItem(
                    "token",
                    data.token
                );

                localStorage.setItem(
                    "user",
                    JSON.stringify(data.user)
                );

                alert("Login successful!");

                window.location.href = "dashboard.html";

            } else {

                alert(
                    data.message ||
                    "Invalid email or password."
                );
            }

        } catch (error) {

            console.error("Login error:", error);

            alert(
                "Unable to connect to backend server."
            );
        }
    });
}


// ==============================
// CREATE BLOG
// ==============================

const blogForm =
    document.querySelector(".blog-form form");

if (blogForm) {

    blogForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        if (!requireLogin()) {
            return;
        }

        const title =
            document.getElementById("title").value.trim();

        const category =
            document.getElementById("category").value.trim();

        const content =
            document.getElementById("content").value.trim();

        if (!title || !category || !content) {

            alert("Please fill all blog fields.");

            return;
        }

        try {

            const response = await fetch(
                `${API_URL}/api/blogs`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",

                        "Authorization":
                            `Bearer ${getToken()}`
                    },

                    body: JSON.stringify({
                        title,
                        category,
                        content
                    })
                }
            );

            const data = await response.json();

            console.log(
                "Create blog response:",
                data
            );

            if (
                response.status === 401 ||
                response.status === 403
            ) {

                alert("Session expired. Please login again.");

                logout();

                return;
            }

            if (response.ok) {

                alert("Blog published successfully!");

                window.location.href = "dashboard.html";

            } else {

                alert(
                    data.message ||
                    "Blog creation failed."
                );
            }

        } catch (error) {

            console.error(
                "Create blog error:",
                error
            );

            alert(
                "Unable to connect to backend server."
            );
        }
    });
}


// ==============================
// LOAD BLOGS
// ==============================

const blogList =
    document.getElementById("blog-list");

let allBlogs = [];

if (blogList) {

    console.log("Dashboard detected.");

    if (requireLogin()) {

        loadBlogs();
    }
}


async function loadBlogs() {

    try {

        console.log("Loading blogs...");

        const response = await fetch(
            `${API_URL}/api/blogs`,
            {
                method: "GET",

                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

        console.log(
            "Blog response status:",
            response.status
        );

        if (
            response.status === 401 ||
            response.status === 403
        ) {

            alert("Session expired. Please login again.");

            logout();

            return;
        }

        const data = await response.json();

        console.log("Blogs:", data);

        if (!response.ok) {

            throw new Error(
                data.message ||
                "Failed to load blogs"
            );
        }

        allBlogs = data;

        displayBlogs(allBlogs);

    } catch (error) {

        console.error(
            "Error loading blogs:",
            error
        );

        blogList.innerHTML =
            "<p>Unable to load blogs.</p>";
    }
}


// ==============================
// DISPLAY BLOGS
// ==============================

function displayBlogs(blogs) {

    if (!blogList) {
        return;
    }

    blogList.innerHTML = "";

    if (!blogs || blogs.length === 0) {

        blogList.innerHTML =
            "<p>No blogs found.</p>";

        return;
    }

    blogs.forEach(function (blog) {

        const card =
            document.createElement("div");

        card.className = "blog-card";

        card.innerHTML = `

            <h2>${escapeHTML(blog.title)}</h2>

            <div class="author">
                By ${escapeHTML(blog.author)}
            </div>

            <div class="category">
                Category:
                ${escapeHTML(blog.category)}
            </div>

            <p>
                ${escapeHTML(blog.content)}
            </p>

            <div class="actions">

                <a
                    href="blog-details.html?id=${blog._id}"
                >
                    Read More
                </a>

                <button
                    class="edit-btn"
                    onclick="editBlog('${blog._id}')"
                >
                    Edit
                </button>

                <button
                    class="delete-btn"
                    onclick="deleteBlog('${blog._id}')"
                >
                    Delete
                </button>

            </div>
        `;

        blogList.appendChild(card);
    });
}


// ==============================
// EDIT BLOG
// ==============================

async function editBlog(id) {

    const blog =
        allBlogs.find(
            item => item._id === id
        );

    if (!blog) {

        alert("Blog not found.");

        return;
    }

    const title =
        prompt(
            "Enter new title:",
            blog.title
        );

    if (title === null) return;

    const category =
        prompt(
            "Enter category:",
            blog.category
        );

    if (category === null) return;

    const content =
        prompt(
            "Enter new content:",
            blog.content
        );

    if (content === null) return;

    try {

        const response = await fetch(
            `${API_URL}/api/blogs/${id}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${getToken()}`
                },

                body: JSON.stringify({
                    title: title.trim(),
                    category: category.trim(),
                    content: content.trim()
                })
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Blog updated successfully!");

            loadBlogs();

        } else {

            alert(
                data.message ||
                "Blog update failed."
            );
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to backend.");
    }
}


// ==============================
// DELETE BLOG
// ==============================

async function deleteBlog(id) {

    if (
        !confirm(
            "Are you sure you want to delete this blog?"
        )
    ) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/blogs/${id}`,
            {
                method: "DELETE",

                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

        const data = await response.json();

        if (response.ok) {

            alert("Blog deleted successfully!");

            loadBlogs();

        } else {

            alert(
                data.message ||
                "Blog deletion failed."
            );
        }

    } catch (error) {

        console.error(error);

        alert("Unable to connect to backend.");
    }
}


// ==============================
// SEARCH
// ==============================

function searchBlogs() {

    const input =
        document.getElementById("searchInput");

    if (!input) return;

    const text =
        input.value.toLowerCase().trim();

    const filtered =
        allBlogs.filter(blog =>

            (blog.title || "")
                .toLowerCase()
                .includes(text)

            ||

            (blog.author || "")
                .toLowerCase()
                .includes(text)

            ||

            (blog.category || "")
                .toLowerCase()
                .includes(text)

            ||

            (blog.content || "")
                .toLowerCase()
                .includes(text)
        );

    displayBlogs(filtered);
}


// ==============================
// CATEGORY FILTER
// ==============================

function filterBlogs() {

    const filter =
        document.getElementById("categoryFilter");

    if (!filter) return;

    const category =
        filter.value;

    if (!category) {

        displayBlogs(allBlogs);

        return;
    }

    const filtered =
        allBlogs.filter(
            blog =>
                blog.category === category
        );

    displayBlogs(filtered);
}


// ==============================
// BLOG DETAILS
// ==============================

async function loadBlogDetails() {

    const container =
        document.getElementById("blog-details");

    if (!container) return;

    if (!requireLogin()) return;

    const params =
        new URLSearchParams(
            window.location.search
        );

    const id =
        params.get("id");

    if (!id) {

        container.innerHTML =
            "<h1>Blog not found</h1>";

        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/api/blogs/${id}`,
            {
                headers: {
                    "Authorization":
                        `Bearer ${getToken()}`
                }
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            container.innerHTML =
                `<p>${escapeHTML(
                    data.message ||
                    "Blog not found"
                )}</p>`;

            return;
        }

        container.innerHTML = `

            <h1>
                ${escapeHTML(data.title)}
            </h1>

            <p>
                By ${escapeHTML(data.author)}
            </p>

            <p>
                Category:
                ${escapeHTML(data.category)}
            </p>

            <div>
                ${escapeHTML(data.content)}
            </div>

        `;

    } catch (error) {

        console.error(error);

        container.innerHTML =
            "<p>Unable to load blog.</p>";
    }
}

loadBlogDetails();


// ==============================
// SECURITY
// ==============================

function escapeHTML(value) {

    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

console.log("SCRIPT.JS COMPLETELY LOADED");