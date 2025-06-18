/**
 * =====================================================
 * УЛУЧШЕННАЯ СИСТЕМА УВЕДОМЛЕНИЙ ДЛЯ АВТОРИЗАЦИИ
 * =====================================================
 * 
 * Добавлены новые типы уведомлений:
 * - Приветственные сообщения
 * - Подсказки при вводе
 * - Предупреждения о безопасности
 * - Индикаторы процесса
 * - Уведомления о сессии
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const usernameInput = document.getElementById('textBoxUsername');
    const passwordInput = document.getElementById('textBoxPassword');

    // Инициализация уведомлений
    function initToast() {
        if (!window.toast) {
            window.toast = new ToastManager();
        }
    }

    // Показ состояния загрузки с прогрессом
    function setLoadingState(loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        
        if (loading) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Проверка данных...';
            submitBtn.style.opacity = '0.7';
            usernameInput.disabled = true;
            passwordInput.disabled = true;
            
            // НОВОЕ: Уведомление о начале процесса
            window.toast.info(
                'Проверка данных',
                'Проверяем ваши учетные данные...',
                { duration: 3000 }
            );
        } else {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Войти';
            submitBtn.style.opacity = '1';
            usernameInput.disabled = false;
            passwordInput.disabled = false;
        }
    }

    // Улучшенная валидация с подробными сообщениями
    function validateInputs() {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username) {
            window.toast.error(
                'Поле не заполнено', 
                'Пожалуйста, введите ваше имя пользователя',
                { duration: 4000 }
            );
            usernameInput.focus();
            return false;
        }

        if (!password) {
            window.toast.error(
                'Поле не заполнено', 
                'Пожалуйста, введите ваш пароль',
                { duration: 4000 }
            );
            passwordInput.focus();
            return false;
        }

        // НОВОЕ: Проверка длины имени пользователя
        if (username.length < 3) {
            window.toast.warning(
                'Короткое имя пользователя',
                'Имя пользователя должно содержать минимум 3 символа',
                { duration: 5000 }
            );
            usernameInput.focus();
            return false;
        }

        // НОВОЕ: Проверка длины пароля
        if (password.length < 4) {
            window.toast.warning(
                'Короткий пароль',
                'Пароль должен содержать минимум 4 символа',
                { duration: 5000 }
            );
            passwordInput.focus();
            return false;
        }

        // НОВОЕ: Проверка на подозрительные символы
        if (!/^[a-zA-Z0-9_]+$/.test(username)) {
            window.toast.warning(
                'Недопустимые символы',
                'Имя пользователя может содержать только буквы, цифры и подчеркивание',
                { duration: 6000 }
            );
            usernameInput.focus();
            return false;
        }

        return true;
    }

    // Основная функция авторизации
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        initToast();
        
        if (!validateInputs()) {
            return;
        }

        setLoadingState(true);
        
        const formData = new FormData(form);

        try {
            const response = await fetch('/login', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.text();
            
            if (response.ok) {
                // УЛУЧШЕННОЕ: Уведомление об успехе с дополнительной информацией
                const currentTime = new Date().toLocaleTimeString('ru-RU');
                
                window.toast.success(
                    'Добро пожаловать в InteGroTech!', 
                    `Авторизация выполнена успешно в ${currentTime}`,
                    { 
                        duration: 3000, 
                        sound: true,
                        closable: true 
                    }
                );
                
                // НОВОЕ: Уведомление о переходе
                setTimeout(() => {
                    window.toast.info(
                        'Переход в панель управления',
                        'Загружаем рабочую область...',
                        { duration: 1500 }
                    );
                }, 1000);
                
                // Перенаправление
                setTimeout(() => {
                    window.location.href = '/panel';
                }, 2000);
                
            } else {
                // УЛУЧШЕННАЯ обработка ошибок
                let title, message, duration = 6000;
                
                if (result.includes('Неверные данные')) {
                    title = 'Данные не найдены';
                    message = 'Пользователь с такими данными не найден в системе. Проверьте правильность ввода.';
                    duration = 7000;
                } else if (result.includes('Заполните все поля')) {
                    title = 'Незаполненные поля';
                    message = 'Все поля обязательны для заполнения';
                    duration = 5000;
                } else if (result.includes('Ошибка сервера')) {
                    title = 'Проблемы на сервере';
                    message = 'Временные технические проблемы. Попробуйте через несколько минут.';
                    duration = 8000;
                } else {
                    title = 'Ошибка авторизации';
                    message = 'Возникла неожиданная ошибка при входе в систему';
                    duration = 6000;
                }
                
                window.toast.error(title, message, {
                    duration: duration,
                    sound: true,
                    closable: true
                });
                
                // НОВОЕ: Подсказка о действиях
                setTimeout(() => {
                    window.toast.info(
                        'Что делать?',
                        'Проверьте данные или свяжитесь с администратором',
                        { duration: 5000, closable: true }
                    );
                }, 2000);
                
                // Очищаем пароль и фокусируемся
                passwordInput.value = '';
                passwordInput.focus();
            }
            
        } catch (error) {
            console.error('Ошибка:', error);
            
            window.toast.error(
                'Проблемы с соединением', 
                'Не удалось связаться с сервером. Проверьте интернет-подключение.',
                { duration: 8000, sound: true, closable: true }
            );
            
            // НОВОЕ: Дополнительная подсказка при сетевых проблемах
            setTimeout(() => {
                window.toast.warning(
                    'Рекомендации',
                    'Попробуйте обновить страницу или проверить настройки сети',
                    { duration: 6000, closable: true }
                );
            }, 3000);
        } finally {
            setLoadingState(false);
        }
    });

    // НОВЫЕ ИНТЕРАКТИВНЫЕ УВЕДОМЛЕНИЯ

    // Приветственное сообщение при загрузке страницы
    setTimeout(() => {
        initToast();
        window.toast.info(
            'Добро пожаловать!',
            'Введите ваши учетные данные для входа в систему InteGroTech',
            { duration: 4000, closable: true }
        );
    }, 500);

    // Подсказки при фокусе на поля
    let usernameHintShown = false;
    let passwordHintShown = false;

    usernameInput.addEventListener('focus', () => {
        if (!usernameHintShown) {
            window.toast.info(
                'Подсказка',
                'Введите ваше имя пользователя (минимум 3 символа)',
                { duration: 3000 }
            );
            usernameHintShown = true;
        }
    });

    passwordInput.addEventListener('focus', () => {
        if (!passwordHintShown) {
            window.toast.info(
                'Безопасность',
                'Введите ваш пароль. Данные передаются в зашифрованном виде.',
                { duration: 3000 }
            );
            passwordHintShown = true;
        }
    });

    // НОВОЕ: Предупреждение о caps lock
    function checkCapsLock(event) {
        if (event.getModifierState && event.getModifierState('CapsLock')) {
            window.toast.warning(
                'Caps Lock включен',
                'Проверьте регистр символов при вводе пароля',
                { duration: 4000 }
            );
        }
    }

    passwordInput.addEventListener('keydown', checkCapsLock);

    // НОВОЕ: Обработка нескольких неудачных попыток
    let attemptCount = 0;
    const maxAttempts = 3;

    form.addEventListener('submit', () => {
        attemptCount++;
        
        if (attemptCount === 2) {
            setTimeout(() => {
                window.toast.warning(
                    'Вторая попытка',
                    'Убедитесь в правильности вводимых данных',
                    { duration: 5000 }
                );
            }, 100);
        } else if (attemptCount >= maxAttempts) {
            setTimeout(() => {
                window.toast.error(
                    'Множественные неудачные попытки',
                    'Рекомендуем связаться с администратором системы',
                    { duration: 8000, closable: true }
                );
            }, 100);
        }
    });

    // НОВОЕ: Обработка потери фокуса страницы
    let pageBlurred = false;
    
    window.addEventListener('blur', () => {
        pageBlurred = true;
    });
    
    window.addEventListener('focus', () => {
        if (pageBlurred) {
            window.toast.info(
                'Добро пожаловать обратно!',
                'Продолжите ввод данных для авторизации',
                { duration: 2000 }
            );
            pageBlurred = false;
        }
    });

    // Инициализация
    initToast();
    
    console.log('✅ Расширенная система уведомлений авторизации активирована');
});