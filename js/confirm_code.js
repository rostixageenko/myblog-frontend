const API_URL = 'http://localhost:8080/signUp_page';

// ===================================================================
// ФУНКЦИЯ ОТКЛЮЧЕНИЯ КНОПКИ
// ===================================================================
function setButtonDisabled(button, disabled = true) {
    if (!button) return;

    button.disabled = disabled;
    button.style.opacity = disabled ? '0.6' : '1';
    button.style.pointerEvents = disabled ? 'none' : 'auto';
}

// Функция для вывода сообщений
function showMessage(elementId, message, type = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.className = 'msg-box';
    el.textContent = message;
    el.classList.add(type, 'show');
}

// ======================================
// ПОДТВЕРЖДЕНИЕ (confirm code)
// ======================================
const confirmForm = document.getElementById('reset-form');

if (confirmForm) {
    confirmForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const code = document.getElementById('confirm-code').value.trim();

        // Проверка: код обязательно 6 цифр
        if (!/^\d{6}$/.test(code)) {
            showMessage('confirm-message', 'Код должен состоять из 6 цифр');
            return;
        }

        // Определяем откуда пришёл пользователь
        const referrer = localStorage.getItem('last_page'); // URL предыдущей страницы
        let endpoint = '';
        let body = {};

        const contact = localStorage.getItem('contact');

        if (!contact) {
            showMessage('confirm-message', 'Контакт не найден');
            return;
        }

        if (referrer.includes('register')) {
            // Пользователь пришёл с регистрации
            endpoint = '/confirm-registration';
        } else if (referrer.includes('login')) {
            // Пользователь пришёл с login
            endpoint = '/confirm-login';
        } else {
            showMessage(
                'confirm-message',
                'Сразу зарегистрируйтесь или войдите'
            );
            return;
        }

        body = {
            contact: contact,
            code: code,
        };

        const submitBtn = confirmForm.querySelector('button[type="submit"]');
        setButtonDisabled(submitBtn, true);

        try {
            const res = await fetch(`${API_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                showMessage(
                    'confirm-message',
                    data.error || 'Ошибка подтверждения'
                );
                return;
            }

            if (referrer.includes('register')) {
                showMessage(
                    'confirm-message',
                    'Регистрация завершена!',
                    'success'
                );
                localStorage.removeItem('contact');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 800);
            } else if (referrer.includes('login')) {
                localStorage.setItem('token', data.access_token);

                const profileRes = await fetch(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${data.access_token}` },
                });

                const profile = await profileRes.json();

                if (!profile || !profile.user) {
                    showMessage('message', 'Не удалось загрузить профиль.');
                    return;
                }

                const user = profile.user;
                localStorage.setItem('user_id', user.id);
                localStorage.setItem('role', user.role);
                localStorage.setItem('firstname', user.firstname);
                localStorage.setItem('lastname', user.lastname ?? '');
                localStorage.setItem('email', user.email ?? '');
                localStorage.setItem('phone', user.phone ?? '');
                localStorage.setItem('blogName', user.blogName ?? '');

                showMessage(
                    'confirm-message',
                    'Вход выполнен успешно!',
                    'success'
                );
                localStorage.removeItem('contact');

                setTimeout(() => {
                    if (user.role === 'author') {
                        window.location.href = 'main_page.html';
                    } else if (user.role === 'user') {
                        window.location.href = 'user_main_page.html';
                    } else {
                        showMessage('message', 'Неизвестная роль пользователя');
                    }
                }, 500);
            }
        } catch (err) {
            console.error(err);
            showMessage('confirm-message', 'Ошибка соединения с сервером');
        } finally {
            // Кнопка всегда возвращается
            setButtonDisabled(submitBtn, false);
        }
    });
}
