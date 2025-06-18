/**
 * ПРОСТОЙ И РАБОЧИЙ register.js
 * Без излишних усложнений
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');

    // Инициализация уведомлений
    function initToast() {
        if (!window.toast) {
            window.toast = new ToastManager();
        }
    }

    // Основная функция обработки формы
    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Блокируем обычную отправку
        
        initToast();

        // Получаем данные формы
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value.trim();
        });

        // Простая валидация
        if (!data.firstName || !data.lastName || !data.email || !data.username || !data.password || !data.confirmPassword) {
            window.toast.error('Ошибка', 'Заполните все поля');
            return;
        }

        if (data.password !== data.confirmPassword) {
            window.toast.error('Ошибка', 'Пароли не совпадают');
            return;
        }

        if (data.password.length < 6) {
            window.toast.error('Ошибка', 'Пароль должен содержать минимум 6 символов');
            return;
        }

        // Показываем загрузку
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Создание...';

        try {
            // Отправляем запрос
            const response = await fetch('/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                credentials: 'same-origin'
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Успех
                window.toast.success('Успех!', 'Аккаунт создан! Перенаправляем на вход...', {
                    duration: 3000,
                    sound: true
                });

                // Перенаправляем
                setTimeout(() => {
                    window.location.href = '/';
                }, 2000);

            } else {
                // Ошибка
                window.toast.error('Ошибка регистрации', result.message || 'Попробуйте еще раз', {
                    duration: 5000
                });
                
                // Очищаем пароли
                form.querySelector('#textBoxPassword').value = '';
                form.querySelector('#textBoxConfirmPassword').value = '';
            }

        } catch (error) {
            console.error('Ошибка:', error);
            window.toast.error('Ошибка', 'Проблема с соединением', {
                duration: 5000
            });
        } finally {
            // Восстанавливаем кнопку
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });

    // Инициализируем при загрузке
    initToast();
});