function setButtonDisabled(button, disabled = true) {
    if (!button) return;

    button.disabled = disabled;
    button.style.opacity = disabled ? '0.6' : '1';
    button.style.pointerEvents = disabled ? 'none' : 'auto';
}

// ================================
// МОДАЛЬНОЕ ОКНО
// ================================

const adminBtn = document.getElementById('admin-btn');
const adminBtnsMobile = document.querySelectorAll('.mobile-admin');
const modal = document.getElementById('admin-modal');
const closeModal = document.getElementById('close-modal');
const saveAdmin = document.getElementById('save-admin');

async function loadAdminContacts() {
    document.getElementById('admin-email').value =
        localStorage.getItem('email') || '';
    document.getElementById('admin-phone').value =
        localStorage.getItem('phone') || '';
    document.getElementById('admin-first-name').value =
        localStorage.getItem('firstname') || '';
    document.getElementById('admin-last-name').value =
        localStorage.getItem('lastname') || '';
}

if (adminBtn) {
    adminBtn.addEventListener('click', openProfile);
}

adminBtnsMobile.forEach((btn) => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openProfile();
    });
});

async function openProfile() {
    await loadAdminContacts();
    modal.style.display = 'flex';
}

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

saveAdmin.addEventListener('click', async (e) => {
    const email = document.getElementById('admin-email').value.trim();
    const phone = document.getElementById('admin-phone').value.trim();
    const first_name = document.getElementById('admin-first-name').value.trim();
    const last_name = document.getElementById('admin-last-name').value.trim();
    const user_id = localStorage.getItem('user_id');

    if (!(email || phone)) {
        alert('Ошибка: поля email и номер телефона пустые');
        return;
    }

    const oldEmail = localStorage.getItem('email') ?? '';
    const oldPhone = localStorage.getItem('phone') ?? '';
    const oldFirstName = localStorage.getItem('firstname') ?? '';
    const oldLastName = localStorage.getItem('lastname') ?? '';

    const changedFields = [];

    if (email !== oldEmail) changedFields.push('email');
    if (phone !== oldPhone) changedFields.push('phone');
    if (first_name !== oldFirstName) changedFields.push('first_name');
    if (last_name !== oldLastName) changedFields.push('last_name');

    if (changedFields.length === 0) {
        alert('Вы не изменили данные');
        return;
    }
    const btn = e.currentTarget;
    setButtonDisabled(btn, true);

    try {
        const data = await apiRequest(
            'http://localhost:8080/signUp_page/update-contacts',
            'PATCH',
            { email, phone, user_id, changedFields, first_name, last_name },
            true
        );

        if (data.status) {
            localStorage.setItem('email', email);
            localStorage.setItem('phone', phone);
            localStorage.setItem('firstname', first_name);
            localStorage.setItem('lastname', last_name);
            alert('Данные сохранены');
            modal.style.display = 'none';
            window.location.reload();
        } else {
            alert(data.error);
        }
    } catch (err) {
        alert(err);
    } finally {
        setButtonDisabled(btn, false);
    }
});

// ================================
// СБРОС ПАРОЛЯ В ПРОФИЛЕ
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

        const btn = e.currentTarget;
        setButtonDisabled(btn, true);

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
            window.location.reload();
        } catch (err) {
            alert('Ошибка соединения');
        } finally {
            setButtonDisabled(btn, false);
        }
    });

// ===================================================================
// УДАЛЕНИЕ АККАУНТА
// ===================================================================

const deleteAccountBtn = document.getElementById('delete-account');

if (deleteAccountBtn) {
    deleteAccountBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        user_id = localStorage.getItem('user_id');

        console.log(user_id);
        const confirmDelete = confirm(
            'Вы уверены, что хотите удалить аккаунт?\nЭто действие необратимо.'
        );

        if (!confirmDelete) return;

        const btn = e.currentTarget;
        setButtonDisabled(btn, true);

        try {
            const res = await fetch(
                'http://localhost:8080/signUp_page/delete-account',
                {
                    method: 'DELETE',
                    body: JSON.stringify({ user_id }),
                }
            );

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
                alert(data.error || data.message || 'Ошибка удаления аккаунта');
                return;
            }

            localStorage.removeItem('access_token');
            localStorage.removeItem('user_id');
            localStorage.removeItem('email');
            localStorage.removeItem('phone');
            localStorage.removeItem('firstname');
            localStorage.removeItem('lastname');
            localStorage.removeItem('role');

            alert('Аккаунт успешно удалён');

            window.location.href = 'login.html';
        } catch (err) {
            console.error(err);
        } finally {
            setButtonDisabled(btn, false);
        }
    });
}
