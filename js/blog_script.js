if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const token = localStorage.getItem('token');

// ===== Универсальный запрос =====
async function apiRequest(url) {
    const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 401) {
        localStorage.clear();
        window.location.href = 'login.html';
        return null;
    }
    return res.json();
}

async function loadBlog() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const data = await apiRequest(
        `http://localhost:8080/post-manager/posts/${id}`
    );

    document.getElementById('name-blog').innerText = data.title;
    document.getElementById('text-blog').innerText = data.body;
}

document.getElementById('nazad-k-postam').addEventListener('click', () => {
    const role = localStorage.getItem('role');

    if (role === 'author') {
        window.location.href = 'main_page.html';
    } else if (role === 'user') {
        window.location.href = 'user_main_page.html';
    } else {
        // если роль не определена — отправляем на логин
        window.location.href = 'login.html';
    }
});

function logout() {
    localStorage.clear();
    window.location.href = '../index.html';
}
document.getElementById('logout-btn').addEventListener('click', logout);

loadBlog();
