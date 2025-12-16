const API_URL = 'http://localhost:8080/signUp_page';

// ===== Проверяем токен =====
if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
}

const token = localStorage.getItem('token');

// ================================
// Универсальный запрос (НОВЫЙ)
// ================================
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
// МОДАЛЬНОЕ ОКНО
// ================================

// const adminBtn = document.getElementById('admin-btn');
// const modal = document.getElementById('admin-modal');
// const closeModal = document.getElementById('close-modal');
// const saveAdmin = document.getElementById('save-admin');

// async function loadAdminContacts() {
//     document.getElementById('admin-email').value =
//         localStorage.getItem('email') || '';
//     document.getElementById('admin-phone').value =
//         localStorage.getItem('phone') || '';
//     document.getElementById('admin-first-name').value =
//         localStorage.getItem('firstname') || '';
//     document.getElementById('admin-last-name').value =
//         localStorage.getItem('lastname') || '';
// }

// adminBtn.addEventListener('click', async () => {
//     await loadAdminContacts();
//     modal.style.display = 'flex';
// });

// closeModal.addEventListener('click', () => {
//     modal.style.display = 'none';
// });

// saveAdmin.addEventListener('click', async () => {
//     const email = document.getElementById('admin-email').value.trim();
//     const phone = document.getElementById('admin-phone').value.trim();
//     const first_name = document.getElementById('admin-first-name').value.trim();
//     const last_name = document.getElementById('admin-last-name').value.trim();
//     const user_id = localStorage.getItem('user_id');

//     if (!(email || phone)) {
//         alert('Ошибка: поля email и номер телефона пустые');
//         return;
//     }

//     const oldEmail = localStorage.getItem('email') ?? '';
//     const oldPhone = localStorage.getItem('phone') ?? '';
//     const oldFirstName = localStorage.getItem('firstname') ?? '';
//     const oldLastName = localStorage.getItem('lastname') ?? '';

//     const changedFields = [];

//     if (email !== oldEmail) changedFields.push('email');
//     if (phone !== oldPhone) changedFields.push('phone');
//     if (first_name !== oldFirstName) changedFields.push('firstname');
//     if (last_name !== oldLastName) changedFields.push('lastname');

//     if (changedFields.length === 0) {
//         alert('Вы не изменили данные');
//         return;
//     }

//     console.log(first_name);
//     console.log(last_name);

//     const data = await apiRequest(
//         `${API_URL}/update-contacts`,
//         'PATCH',
//         { email, phone, user_id, changedFields, first_name, last_name },
//         true
//     );

//     if (data?.status) {
//         localStorage.setItem('email', email);
//         localStorage.setItem('phone', phone);
//         localStorage.setItem('firstname', first_name);
//         localStorage.setItem('lastname', last_name);
//         alert('Данные сохранены');
//         modal.style.display = 'none';
//     } else {
//         alert(data.error);
//     }
// });

// ================================
// сброс пароля в профиле
// ================================

document
    .getElementById('reset-password-admin')
    .addEventListener('click', async (e) => {
        e.preventDefault();
        const email = document.getElementById('admin-email').value.trim();
        console.log(email);
        if (!email) {
            alert('Введите email');
            return;
        }

        if (!email.includes('@')) {
            alert('Некорректный email');
            return;
        }

        alert('Отправляем ссылку...');

        try {
            const res = await fetch(`${API_URL}/reset-password/request`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                alert(data.error || 'Ошибка');
                return;
            }

            alert('Ссылка отправлена! Проверьте почту.');
        } catch (err) {
            alert('Ошибка соединения');
        }
    });

// ================================
// Подставляем имя пользователя
// ================================
function loadProfile() {
    const firstName = localStorage.getItem('firstname') || '';
    const lastName = localStorage.getItem('lastname') || '';

    document.getElementById('firstNameMobile').innerText = firstName;
    document.getElementById('lastNameMobile').innerText = lastName;

    document.getElementById('firstName').innerText = firstName;
    document.getElementById('lastName').innerText = lastName;
}

loadProfile();

// ================================
// Выделение автора
// ================================
function highlightAuthor(cardElement) {
    const allCards = document.querySelectorAll('.author-card');
    allCards.forEach((c) => c.classList.remove('active'));

    if (cardElement) {
        cardElement.classList.add('active');
        cardElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// ================================
// Загрузить всех авторов
// ================================
async function loadAuthors() {
    const container = document.getElementById('authorsContainer');
    if (!container) return;

    const data = await apiRequest(`${API_URL}/getAllAuthors`);

    if (!data) {
        container.innerHTML = '<p>Не удалось загрузить авторов.</p>';
        return;
    }

    const authors = Array.isArray(data) ? data : data.authors || [];

    container.innerHTML = '';

    const savedAuthorId = Number(localStorage.getItem('selectedAuthorId'));
    let savedCardElement = null;

    authors.forEach((author) => {
        const card = document.createElement('div');
        card.className = 'author-card';
        card.style.cursor = 'pointer';

        const title = document.createElement('h4');
        title.innerHTML = `<b>${escapeHtml(
            author.blogName || 'Без названия'
        )}</b>`;

        const p = document.createElement('p');
        p.textContent = `Автор: ${author.firstname || ''} ${
            author.lastname || ''
        }`;

        card.appendChild(title);
        card.appendChild(p);

        card.addEventListener('click', () => {
            localStorage.setItem('selectedAuthorId', author.id);
            highlightAuthor(card);
            loadAuthorPosts(author.id);
        });

        container.appendChild(card);

        if (author.id === savedAuthorId) {
            savedCardElement = card;
        }
    });

    if (savedCardElement) {
        highlightAuthor(savedCardElement);
        loadAuthorPosts(savedAuthorId);
    }
}

loadAuthors();

// ================================
// Загрузить посты автора
// ================================
async function loadAuthorPosts(authorId) {
    const container = document.getElementById('postsContainer');
    if (!container) return;

    container.innerHTML = '<p>Загрузка постов...</p>';

    const data = await apiRequest(
        `http://localhost:8080/post-manager/posts?user_id=${encodeURIComponent(
            authorId
        )}`
    );

    if (!data) {
        container.innerHTML = '<p>Не удалось загрузить посты.</p>';
        return;
    }

    let posts = Array.isArray(data)
        ? data
        : Array.isArray(data.posts)
        ? data.posts
        : data.data || [];

    if (posts.length === 0) {
        container.innerHTML = '<p>У автора пока нет постов.</p>';
        return;
    }

    container.innerHTML = '';

    posts.forEach((post) => {
        const card = document.createElement('div');
        card.className = 'card';

        const h3 = document.createElement('h3');
        h3.textContent = post.title || 'Без названия';

        const body = document.createElement('p');
        const text = post.body || '';
        body.textContent =
            text.length > 120 ? text.slice(0, 120) + '...' : text;

        const footer = document.createElement('div');
        footer.className = 'card-footer';

        const link = document.createElement('a');
        link.textContent = 'Подробнее';
        link.href = 'javascript:void(0)';
        link.addEventListener('click', () => {
            localStorage.setItem('selectedAuthorId', authorId);
            openPost(post.id);
        });

        footer.appendChild(link);

        const wrapper = document.createElement('div');
        wrapper.className = 'body';
        wrapper.appendChild(body);

        card.appendChild(h3);
        card.appendChild(wrapper);
        card.appendChild(footer);

        container.appendChild(card);
    });
}

// ================================
// Открыть страницу поста
// ================================
function openPost(postId) {
    window.location.href = `blog_page.html?id=${encodeURIComponent(postId)}`;
}

// ================================
// Logout
// ================================
function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logout-btn');
const logoutBtnsMobile = document.querySelectorAll('.mobile-logout');

logoutBtn.addEventListener('click', logout);
logoutBtnsMobile.forEach((btn) => btn.addEventListener('click', logout));


// ================================
// Защита от XSS
// ================================
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ================================
// БУРГЕР МЕНЮ
// ================================

const burger = document.getElementById('burger');
const menu = document.getElementById('mobileMenu');

// Открытие / закрытие по бургеру
burger.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('active');
    burger.classList.toggle('active');
});

// Закрытие при клике вне меню
document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !burger.contains(e.target)) {
        menu.classList.remove('active');
        burger.classList.remove('active');
    }
});

// Закрытие при клике на кнопки внутри меню
menu.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation(); // ⬅ КЛЮЧЕВО
        menu.classList.remove('active');
        burger.classList.remove('active');
    });
});

// Закрытие при ресайзе на десктоп
window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
        menu.classList.remove('active');
        burger.classList.remove('active');
    }
});
