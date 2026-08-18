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
const loginForm = document.querySelector(".login-container form");

if (loginForm) {
    loginForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const savedEmail = localStorage.getItem("userEmail");
        const savedPassword = localStorage.getItem("userPassword");

        if (email === savedEmail && password === savedPassword) {
            alert("Login successful!");
            window.location.href = "dashboard.html";
        } else {
            alert("Invalid email or password!");
        }
    });
}
const blogForm = document.querySelector(".blog-form form");

if (blogForm) {
    blogForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const title = document.getElementById("title").value;
        const author = document.getElementById("author").value;
        const content = document.getElementById("content").value;
        const category = document.getElementById("category").value;

        const blog = {
            title: title,
            author: author,
            content: content,
            category: category
        };

        let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

        blogs.push(blog);

        localStorage.setItem("blogs", JSON.stringify(blogs));

        alert("Blog published successfully!");

        window.location.href = "dashboard.html";
    });
}
const blogList = document.getElementById("blog-list");

if (blogList) {
    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    blogs.forEach(function(blog, index) {
        const blogCard = document.createElement("div");

        blogCard.className = "blog-card";

        blogCard.innerHTML = `
            <h2>${blog.title}</h2>
            <div class="author">By ${blog.author}</div>
            <div class="category">category: ${blog.category || "Not specified"}</div>
            <p>${blog.content}</p>
            <button class="read-btn" onclick="readBlog(${index})">
    Read More
</button>

            <div class="actions">
            <button class="edit-btn"
            onclick="editBlog(${index})">
                Edit
            <button>

                        <button class="delete-btn" onclick="deleteBlog(${index})">
                    Delete
                </button>
            </div>
        `;

        blogList.appendChild(blogCard);
    });
}

function deleteBlog(index) {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    blogs.splice(index, 1);

    localStorage.setItem("blogs", JSON.stringify(blogs));

    window.location.reload();
}
function editBlog(index) {
    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    const newTitle = prompt("Enter new blog title:", blogs[index].title);
    const newContent = prompt("Enter new blog content:", blogs[index].content);

    if (newTitle && newContent) {
        blogs[index].title = newTitle;
        blogs[index].content = newContent;

        localStorage.setItem("blogs", JSON.stringify(blogs));

        window.location.reload();
    }
}
function searchBlogs() {
    const searchText = document
        .getElementById("searchInput")
        .value
        .toLowerCase();

    const selectedCategory = document
        .getElementById("categoryFilter")
        .value;

    const blogCards = document.querySelectorAll(".blog-card");

    blogCards.forEach(function(card) {
        const text = card.textContent.toLowerCase();
        const category = card.querySelector(".category").textContent;

        const matchesSearch = text.includes(searchText);
        const matchesCategory =
            selectedCategory === "" ||
            category.includes(selectedCategory);

        if (matchesSearch && matchesCategory) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}

function filterBlogs() {
    searchBlogs();
}
function readBlog(index) {
    localStorage.setItem("selectedBlog", index);
    window.location.href = "blog-details.html";
}