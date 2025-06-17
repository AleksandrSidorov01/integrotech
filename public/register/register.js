document.addEventListener('DOMContentLoaded', () => {
    const inputs = [
        { id: 'textBoxFirstName', placeholder: 'Введите имя' },
        { id: 'textBoxLastName', placeholder: 'Введите фамилию' },
        { id: 'textBoxEmail', placeholder: 'Введите email' },
        { id: 'textBoxUsername', placeholder: 'Введите имя пользователя' },
        { id: 'textBoxPassword', placeholder: 'Введите пароль' },
        { id: 'textBoxConfirmPassword', placeholder: 'Подтвердите пароль' }
    ];

    inputs.forEach(input => {
        const element = document.getElementById(input.id);
        element.addEventListener('focus', () => {
            if (element.value === input.placeholder) {
                element.value = '';
                element.style.color = 'rgba(255, 255, 255, 0.4)';
            }
        });
        element.addEventListener('blur', () => {
            if (!element.value) {
                element.value = input.placeholder;
                element.style.color = 'rgba(255, 255, 255, 0.4)';
            }
        });
    });

    const passwordInputs = ['textBoxPassword', 'textBoxConfirmPassword'];
    passwordInputs.forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('focus', () => {
            if (input.value === 'Введите пароль' || input.value === 'Подтвердите пароль') {
                input.type = 'text';
            }
        });
        input.addEventListener('blur', () => {
            if (!input.value || input.value === '') {
                input.type = 'password';
                input.value = input.placeholder;
                input.style.color = 'rgba(255, 255, 255, 0.4)';
            } else if (input.value !== input.placeholder) {
                input.type = 'password';
            }
        });
    });

    const form = document.getElementById('registerForm');
    const errorElement = document.getElementById('error');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(form);

        try {
            const response = await fetch('/register', {
                method: 'POST',
                body: formData
            });
            const result = await response.text();
            if (errorElement) {
                errorElement.innerText = result;
            }
        } catch (error) {
            if (errorElement) {
                errorElement.innerText = 'Ошибка при отправке запроса';
            }
        }
    });
});