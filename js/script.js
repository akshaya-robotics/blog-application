
// Registration
const registerForm = document.querySelector(".register-container form");

if (registerForm) {
    registerForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirm-password").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        localStorage.setItem("userName", name);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userPassword", password);

        alert("Registration successful!");

        window.location.href = "login.html";
    });
}


// Login
const loginForm = document.querySelector(".login-container form");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const savedEmail = localStorage.getItem("userEmail");
        const savedPassword = localStorage.getItem("userPassword");

        if (email === savedEmail && password === savedPassword) {
            localStorage.setItem("userEmail",email);
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid email or password!");
        }
    });
}


// Create Blog
const blogForm = document.querySelector(".blog-form form");

if (blogForm) {
    blogForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const content = document.getElementById("content").value;

        const blog = {
            title: title,
            author: author,
            content: content
        };

        let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

        blogs.push(blog);

        localStorage.setItem("blogs", JSON.stringify(blogs));

        alert("Blog published successfully!");

        window.location.href = "dashboard.html";
    });
}


// Display Blogs
const blogList = document.getElementById("blog-list");

if (blogList) {
    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    blogs.forEach(function(blog, index) {
        const blogCard = document.createElement("div");

        blogCard.className = "blog-card";

        blogCard.innerHTML = `
            <h2>${blog.title}</h2>
            <div class="author">By ${blog.author}</div>
            <p>${blog.content}</p>

            <div class="actions">
                <button class="edit-btn" onclick="editBlog(${index})">
                    Edit
                </button>

                <button class="delete-btn" onclick="deleteBlog(${index})">
                    Delete
                </button>
            </div>
        `;

        blogList.appendChild(blogCard);
    });
}


// Delete Blog
function deleteBlog(index) {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    blogs.splice(index, 1);

    localStorage.setItem("blogs", JSON.stringify(blogs));

    window.location.reload();
}


// Edit Blog
function editBlog(index) {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    const newTitle = prompt(
        "Enter new blog title:",
        blogs[index].title
    );

    const newContent = prompt(
        "Enter new blog content:",
        blogs[index].content
    );

    if (newTitle && newContent) {
        blogs[index].title = newTitle;
        blogs[index].content = newContent;

        localStorage.setItem("blogs", JSON.stringify(blogs));

        window.location.reload();
    }
}