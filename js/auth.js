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

// ===================================================================
// ФУНКЦИЯ ДЛЯ ВЫВОДА СООБЩЕНИЙ
// ===================================================================
function showMessage(elementId, message, type = 'error') {
    const el = document.getElementById(elementId);
    if (!el) return;

    el.className = 'msg-box';
    el.textContent = message;
    el.classList.add(type, 'show');
}

// ===================================================================
// РЕГИСТРАЦИЯ
// ===================================================================
const registerForm = document.getElementById('register-form');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = registerForm.querySelector('button[type="submit"]');
        setButtonDisabled(submitBtn, true);

        const firstname = document
            .getElementById('register-first-name')
            .value.trim();
        const lastname = document
            .getElementById('register-last-name')
            .value.trim();
        const emailBlock = document.getElementById('email-register-block');
        const email =
            window.getComputedStyle(emailBlock).display !== 'none'
                ? document.getElementById('register-email').value.trim()
                : null;
        console.log(email);
        const password = document
            .getElementById('register-password')
            .value.trim();
        const role = document.getElementById('register-role')
            ? document.getElementById('register-role').value
            : 'user';
        const phoneBlock = document.getElementById('phone-register-block');
        const phone =
            window.getComputedStyle(phoneBlock).display !== 'none'
                ? (() => {
                      const phoneInput = document
                          .getElementById('register-phone')
                          .value.trim();
                      const countryCode =
                          document
                              .getElementById('selected-code')
                              ?.textContent.trim() || '';
                      return countryCode + phoneInput;
                  })()
                : null;
        const blogName = document.getElementById('register-blog-name')
            ? document.getElementById('register-blog-name').value.trim()
            : null;
        console.log(phone);

        if (!firstname || !lastname || !password) {
            showMessage('message', 'Заполните все обязательные поля');
            return;
        }

        if (password.length < 6) {
            showMessage('message', 'Пароль должен быть минимум 6 символов');
            return;
        }

        try {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                showMessage('message', 'Подтвердите, что вы не робот');
                return;
            }

            const res = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstname,
                    lastname,
                    email,
                    password,
                    role,
                    phone,
                    blogName,
                    recaptcha: recaptchaResponse,
                }),
            });

            const resText = await res.text();
            console.log('RAW RESPONSE:', resText);

            let data;

            try {
                data = JSON.parse(resText);
            } catch (e) {
                console.error('Ответ сервера не JSON:', resText);
                showMessage('message', 'Ошибка на сервере');
                return;
            }
            grecaptcha.reset();

            if (!res.ok) {
                showMessage('message', data.error || 'Ошибка регистрации');
                return;
            }
            const contactValue = phone ? phone : email;
            if (contactValue) {
                localStorage.setItem('contact', contactValue);
            }

            showMessage('message', 'Код успешно отправлен!', 'success');
            localStorage.setItem('last_page', 'register');

            setTimeout(() => {
                window.location.href = 'confirm_code.html';
            }, 800);
        } catch (err) {
            console.error(err);
            showMessage('message', 'Ошибка соединения с сервером');
        } finally {
            setButtonDisabled(submitBtn, false);
        }
    });
}

// ===================================================================
// ВХОД
// ===================================================================
const loginForm = document.getElementById('login-form');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const submitBtn = loginForm.querySelector('button[type="submit"]');
        setButtonDisabled(submitBtn, true);

        let login;

        if (
            document.getElementById('phone-login-block')?.style.display ===
            'block'
        ) {
            login = (() => {
                const phoneInput = document
                    .getElementById('login-phone')
                    .value.trim();

                const countryCode =
                    document
                        .getElementById('selected-code')
                        ?.textContent.trim() || '';
                return countryCode + phoneInput;
            })();
        } else {
            login = document.getElementById('login-email').value.trim();
        }

        const password = document.getElementById('login-password').value.trim();

        console.log(login);
        if (!login || !password) {
            showMessage('login-message', 'Заполните все поля');
            return;
        }

        try {
            const recaptchaResponse = grecaptcha.getResponse();
            if (!recaptchaResponse) {
                showMessage('message', 'Подтвердите, что вы не робот');
                return;
            }

            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    login,
                    password,
                    recaptcha: recaptchaResponse,
                }),
            });

            const raw = await res.text();
            console.log('RAW RESPONSE LOGIN:', raw);

            let data;
            try {
                data = JSON.parse(raw);
            } catch (e) {
                console.error('Сервер вернул НЕ JSON:', raw);
                showMessage('message', 'Ошибка на сервере');
                return;
            }

            grecaptcha.reset();

            if (!res.ok) {
                showMessage('message', data.error || 'Ошибка входа');
                return;
            }

            localStorage.setItem('contact', login);

            showMessage('message', 'Код успешно отправлен!', 'success');

            localStorage.setItem('last_page', 'login');
            setTimeout(() => {
                window.location.href = 'confirm_code.html';
            }, 800);
        } catch (err) {
            console.error(err);
            showMessage('message', 'Ошибка соединения с сервером');
        } finally {
            setButtonDisabled(submitBtn, false);
        }
    });
}

// ===================================================================
// ВЫХОД
// ===================================================================
function logout() {
    localStorage.removeItem('token');
    window.location.href = '../index.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);
});

// ===================================================================
// ВХОД ПО ГУГЛ
// ===================================================================
function handleGoogleCredentialResponse(response) {
    const googleBtn = document.querySelector('.g_id_signin');
    setButtonDisabled(googleBtn, true);

    const idToken = response.credential;
    console.log(idToken);
    fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id_token: idToken }),
    })
        .then(async (res) => {
            if (!res.ok) {
                const text = await res.text();
                console.error('Server response:', text);
                throw new Error('Ошибка входа через Google');
            }
            return res.json();
        })
        .then((data) => {
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);

                fetch(`${API_URL}/profile`, {
                    headers: { Authorization: `Bearer ${data.access_token}` },
                })
                    .then(async (res) => {
                        return res.json();
                    })
                    .then((profile) => {
                        if (!profile || !profile.user) {
                            showMessage(
                                'message',
                                'Не удалось загрузить профиль.'
                            );
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
                            'message',
                            'Успешный вход через Google!',
                            'success'
                        );
                        if (user.role === 'author') {
                            setTimeout(() => {
                                window.location.href = 'main_page.html';
                            }, 800);
                        } else if (user.role === 'user') {
                            setTimeout(() => {
                                window.location.href = 'user_main_page.html';
                            }, 800);
                        } else {
                            showMessage('message', 'Роль не определена');
                            return;
                        }
                    });
            } else {
                showMessage(
                    'message',
                    data.error || 'Ошибка входа через Google'
                );
            }
        })
        .catch((err) => {
            console.error('Fetch error:', err);
            showMessage('message', 'Ошибка соединения с сервером');
        })
        .finally(() => {
            setButtonDisabled(googleBtn, false);
        });
}


window.onload = () => {
    google.accounts.id.initialize({
        client_id:
            '704386223284-87296qffnf56riliuue9s7eu5dvium13.apps.googleusercontent.com',
        callback: handleGoogleCredentialResponse,
    });

    google.accounts.id.renderButton(document.querySelector('.g_id_signin'), {
        theme: 'outline',
        size: 'large',
    });
};

// ===================================================================
// ВХОД ЧЕРЕЗ GITHUB
// ===================================================================
const githubBtn = document.querySelector('.btn-github');
if (githubBtn) {
    githubBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const clientId = 'Ov23liXYUIzTpSJ82WRu';
        const redirectUri = `http://localhost:8080/signUp_page/github/callback`;
        const scope = 'read:user user:email';
        const githubUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&scope=${scope}`;
        window.location.href = githubUrl;
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const githubToken = params.get('github_token');

    if (!githubToken) return;

    console.log('GitHub token from URL:', githubToken);

    localStorage.setItem('token', githubToken);

    try {
        const res = await fetch(`${API_URL}/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${githubToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!res.ok) {
            const text = await res.text();
            console.error('Ошибка при запросе профиля:', res.status, text);
            showMessage(
                'message',
                `Ошибка при получении профиля: ${res.status}`
            );
            return;
        }

        let profile;
        try {
            profile = await res.json();
        } catch (e) {
            console.error('Ответ сервера не JSON:', await res.text());
            showMessage('message', 'Сервер вернул некорректный ответ');
            return;
        }

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

        showMessage('message', 'Успешный вход через GitHub!', 'success');

        if (user.role === 'author') {
            setTimeout(() => (window.location.href = 'main_page.html'), 800);
        } else if (user.role === 'user') {
            setTimeout(
                () => (window.location.href = 'user_main_page.html'),
                800
            );
        } else {
            showMessage('message', 'Роль не определена');
        }
    } catch (err) {
        console.error('Ошибка соединения с сервером:', err);
        showMessage('message', 'Ошибка соединения с сервером');
    }
});
