const API_URL = 'http://localhost:8080/signUp_page';

function setButtonDisabled(button, disabled = true) {
    if (!button) return;

    button.disabled = disabled;
    button.style.opacity = disabled ? '0.6' : '1';
    button.style.pointerEvents = disabled ? 'none' : 'auto';
}

function showMessage(text, type = 'error') {
    const el = document.getElementById('new-pass-msg');
    el.className = 'msg-box';
    el.textContent = text;
    el.classList.add(type === 'success' ? 'success' : 'error');
}


const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');

if (!token) {
    showMessage('Токен не найден в ссылке');
}

document
    .getElementById('new-password-form')
    .addEventListener('submit', async (e) => {
        e.preventDefault();

        const p1 = document.getElementById('new-pass').value.trim();
        const p2 = document.getElementById('new-pass2').value.trim();

        if (!p1 || !p2) {
            showMessage('Введите оба пароля');
            return;
        }

        if (p1 !== p2) {
            showMessage('Пароли не совпадают');
            return;
        }

        if (p1.length < 6) {
            showMessage('Пароль должен быть минимум 6 символов');
            return;
        }

        showMessage('Обновляем пароль...', 'success');

        const submitBtn = e.currentTarget.querySelector(
            'button[type="submit"]'
        );
        setButtonDisabled(submitBtn, true);
        try {
            const res = await fetch(`${API_URL}/reset-password/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password: p1 }),
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

            if (!res.ok) {
                showMessage(data.error || 'Ошибка');
                return;
            }

            showMessage('Пароль обновлён!', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 700);
        } catch (err) {
            console.log(err);
            showMessage('Ошибка соединения');
        } finally {
            setButtonDisabled(submitBtn, false);
        }
    });
