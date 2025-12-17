if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const API_URL = 'http://localhost:8080/signUp_page';


const token = localStorage.getItem('token');
const user_id = localStorage.getItem('user_id');

function setButtonDisabled(button, disabled = true) {
    if (!button) return;

    button.disabled = disabled;
    button.style.opacity = disabled ? '0.6' : '1';
    button.style.pointerEvents = disabled ? 'none' : 'auto';
}

// ===================================================================
// JWT CHECK
// ===================================================================

let lastJwtCheck = 0;
const JWT_CHECK_INTERVAL = 30_000;

async function checkJwtToken() {
    const token = localStorage.getItem('token');

    if (!token) {
        logout();
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/check`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.status === 401) {
            logout();
        }
    } catch (e) {
        console.warn('JWT check failed');
    }
}

function throttledJwtCheck() {
    const now = Date.now();
    if (now - lastJwtCheck < JWT_CHECK_INTERVAL) return;
    lastJwtCheck = now;
    checkJwtToken();
}

['click', 'keydown', 'scroll', 'mousemove', 'touchstart'].forEach(
    (event) => {
        document.addEventListener(event, throttledJwtCheck, {
            passive: true,
        });
    }
);

document.addEventListener('DOMContentLoaded', () => {
    checkJwtToken();
});




async function apiRequest(url, method = 'GET', body = null, isJson = false) {
    const options = {
        method,
        headers: { Authorization: `Bearer ${token}` },
    };

    if (isJson && body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
    }

    if (body instanceof FormData) options.body = body;

    const res = await fetch(url, options);

    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        return null;
    }

    return res.json();
}

// ================================
// ПОДСТАНОВКА ДАННЫХ ПРОФИЛЯ
// ================================
function loadProfileFromLocal() {
    const firstName = localStorage.getItem('firstname') || '';
    const lastName = localStorage.getItem('lastname') || '';
    const blogName = localStorage.getItem('blogName') || '';

    document.getElementById('firstName').innerText = firstName;
    document.getElementById('lastName').innerText = lastName;
    document.getElementById('blogName').innerText = blogName;


    document.getElementById('firstNameMobile').innerText = firstName;
    document.getElementById('lastNameMobile').innerText = lastName;
    document.getElementById('blogNameMobile').innerText = blogName;
}


loadProfileFromLocal();

// ================================
// ЗАГРУЗКА ПОСТОВ
// ================================

async function getPosts() {
    let data = await apiRequest(
        `http://localhost:8080/post-manager/posts?user_id=${user_id}`
    );

    const container = document.querySelector('.blog-container');
    container.innerHTML = '';

    if (!data || data.error) {
        container.innerHTML = `<h3 style="color:red;">Ошибка: ${data?.error}</h3>`;
        return;
    }

    data.forEach((post) => {
        const formattedBody = post.body.replace(/\n/g, '<br>');

        container.innerHTML += `
            <div class="card" style="z-index:1;">
                <div class="title"><h5>${post.title}</h5></div>
                <div class="body"><p>${formattedBody}</p></div>
                <div class="card-footer">
                    <a href="javascript:void(0)" onclick="openPost('${post.id}')">Подробнее</a>
                    <a href="#" onclick="selectPost('${post.id}', '${post.title}', '${encodeURIComponent(post.body)}')">Изменить</a>
                    <a href="#" onclick="removePost(${post.id})">Удалить</a>
                </div>
            </div>`;
    });
}

getPosts();

// ================================
// Добавление поста
// ================================
async function addPost() {
    const btn = document.getElementById('add-post-btn');
    setButtonDisabled(btn, true);

    try {
        const title = document.getElementById('title').value;
        const body = document.getElementById('body').value;

        let formData = new FormData();
        formData.append('title', title);
        formData.append('body', body);
        formData.append('user_id', user_id);

        let data = await apiRequest(
            'http://localhost:8080/post-manager/posts',
            'POST',
            formData
        );

        if (data?.status === true) {
            getPosts();
        } else {
            alert(data?.error || 'Ошибка при добавлении');
        }
    } finally {
        setButtonDisabled(btn, false);
    }
}


// ================================
// Удаление
// ================================
async function removePost(id, link) {
    setButtonDisabled(link, true);

    try {
        let data = await apiRequest(
            `http://localhost:8080/post-manager/posts/${id}`,
            'DELETE'
        );

        if (data?.status) {
            getPosts();
        } else {
            alert(data?.error || 'Ошибка удаления');
        }
    } finally {
        setButtonDisabled(link, false);
    }
}


// ================================
// Редактирование
// ================================
let currentEditId = null;

function selectPost(id, title, body) {
    currentEditId = id;
    const decodedBody = decodeURIComponent(body);

    document.getElementById('title-edit').value = title;
    document.getElementById('body-edit').value = decodedBody;
}

async function updatePost() {
    const btn = document.getElementById('update-post-btn');
    setButtonDisabled(btn, true);

    try {
        const title = document.getElementById('title-edit').value;
        const body = document.getElementById('body-edit').value;

        let data = await apiRequest(
            `http://localhost:8080/post-manager/posts/${currentEditId}`,
            'PATCH',
            { title, body, user_id },
            true
        );

        if (data?.status) {
            currentEditId = null;
            getPosts();
        } else {
            alert(data?.error || 'Ошибка обновления');
        }
    } finally {
        setButtonDisabled(btn, false);
    }
}

// ================================
// Logout
// ================================
function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}

// ================================
// Открыть страницу поста
// ================================
function openPost(postId) {
    window.location.href = `blog_page.html?id=${encodeURIComponent(postId)}`;
}
const logoutBtn = document.getElementById('logout-btn');
const logoutBtnsMobile = document.querySelectorAll('.mobile-logout');

logoutBtn.addEventListener('click', logout);
logoutBtnsMobile.forEach((btn) => btn.addEventListener('click', logout));
