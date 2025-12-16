(function () {
    const phoneToggleBtn = document.getElementById('phone-toggle-btn');
    const phoneLabel = phoneToggleBtn.querySelector('.phone-label');

    const emailBlock = document.querySelector('.email-block');
    const phoneBlock = document.querySelector('.phone-block');

    const form = document.querySelector('.form');
    const msgBox = document.getElementById('message');

    const phoneInput = document.querySelector('.phone-input');
    const emailInput = document.querySelector('.email-input');

    const countryPicker = document.getElementById('country-picker');
    const dropdown = document.getElementById('country-dropdown');
    const selectedFlag = document.getElementById('selected-flag');
    const selectedCode = document.getElementById('selected-code');

    let isPhoneMode = false;

    const masks = {
        '+375': '(XX)XXX-XX-XX',
        '+7': 'XXX-XXX-XX-XX',
    };

    function getSelectedCode() {
        return selectedCode.textContent.trim();
    }

    // =======================
    // Переключение режимов
    // =======================
    phoneToggleBtn.addEventListener('click', () => {
        isPhoneMode = !isPhoneMode;
        msgBox.textContent = '';

        if (isPhoneMode) {
            emailBlock.style.display = 'none';
            emailInput.removeAttribute('required');
            phoneBlock.style.display = 'block';
            phoneInput.setAttribute('required', 'true');
            applyMask([]);
            phoneLabel.textContent = 'Войти через email';
            document.getElementById('phone-icon').src = '../icon/icon-mail.svg';
        } else {
            phoneBlock.style.display = 'none';
            emailBlock.style.display = 'block';
            phoneInput.removeAttribute('required');
            emailInput.setAttribute('required', 'true');
            phoneLabel.textContent = 'Войти по номеру телефона';
            document.getElementById('phone-icon').src =
                '../icon/icon-telephone.svg';
        }
    });

    // =======================
    // Маска телефона
    // =======================
    function applyMask(digitsArr) {
        const code = getSelectedCode();
        const mask = masks[code];
        let result = '';
        let di = 0;

        for (let i = 0; i < mask.length; i++) {
            if (mask[i] === 'X') {
                result += digitsArr[di] || 'X';
                di++;
            } else {
                result += mask[i];
            }
        }
        phoneInput.value = result;
    }

    function extractDigits(str) {
        return str.replace(/\D/g, '').split('');
    }

    // =======================
    // Ввод и управление курсором
    // =======================
    phoneInput.addEventListener('keydown', (e) => {
        e.preventDefault(); // блокируем стандартный ввод

        let digits = extractDigits(phoneInput.value);
        const code = getSelectedCode();
        const mask = masks[code];

        if (e.key >= '0' && e.key <= '9') {
            if (digits.length < mask.replace(/[^X]/g, '').length) {
                digits.push(e.key);
                applyMask(digits);
            }
        } else if (e.key === 'Backspace') {
            if (digits.length > 0) {
                digits.pop();
                applyMask(digits);
            }
        }
        // все остальные клавиши игнорируем
    });

    // =======================
    // Фокус и блокировка мыши
    // =======================
    phoneInput.addEventListener('focus', () => {
        if (extractDigits(phoneInput.value).length === 0) {
            applyMask([]);
        }
        setTimeout(() => phoneInput.setSelectionRange(0, 0), 0);
    });
    phoneInput.addEventListener('mouseup', (e) => e.preventDefault());

    // =======================
    // Кастомный селектор стран
    // =======================
    countryPicker.addEventListener('click', () => {
        dropdown.style.display =
            dropdown.style.display === 'block' ? 'none' : 'block';
    });
    document.querySelectorAll('.country-item').forEach((item) => {
        item.addEventListener('click', () => {
            selectedFlag.src = item.dataset.flag;
            selectedCode.textContent = item.dataset.code;
            dropdown.style.display = 'none';
            applyMask(extractDigits(phoneInput.value));
        });
    });
    document.addEventListener('click', (e) => {
        if (!countryPicker.contains(e.target)) dropdown.style.display = 'none';
    });

    // =======================
    // Валидация формы
    // =======================
    form.addEventListener('submit', (e) => {
        msgBox.textContent = '';
        if (!isPhoneMode) return;

        const code = getSelectedCode();
        const mask = masks[code];
        const value = phoneInput.value;
        const digits = extractDigits(value);

        if (value.includes('X')) {
            e.preventDefault();
            msgBox.textContent = 'Заполните номер телефона полностью.';
            // msgBox.style.color = 'red';
            phoneInput.focus();
            return;
        }

        const valid =
            (code === '+375' && digits.length === 12) ||
            (code === '+7' && digits.length === 11);
        if (!valid) {
            e.preventDefault();
            msgBox.textContent = 'Введите корректный номер телефона.';
            // msgBox.style.color = 'red';
            phoneInput.focus();
        }
    });
})();
