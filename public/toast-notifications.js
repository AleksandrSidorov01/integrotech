/**
 * ============================================
 * СИСТЕМА ВСПЛЫВАЮЩИХ УВЕДОМЛЕНИЙ (TOAST)
 * ============================================
 * 
 * Класс ToastManager управляет созданием, показом и скрытием
 * всплывающих уведомлений в правой части экрана.
 * 
 * Возможности:
 * - Различные типы уведомлений (success, error, info, warning)
 * - Автоматическое закрытие через заданное время
 * - Ручное закрытие по клику
 * - Анимации появления и исчезновения
 * - Прогресс-бар показывающий время до автозакрытия
 * - Адаптивность под мобильные устройства
 * 
 * Автор: Разработано для проекта "Интегротех"
 * Дата: 2025
 */

class ToastManager {
    constructor() {
        // Инициализация контейнера для уведомлений
        this.container = null;
        this.toasts = new Map(); // Хранилище активных уведомлений
        this.toastCounter = 0; // Счетчик для уникальных ID
        
        // Инициализация при создании экземпляра
        this.init();
    }

    /**
     * Инициализация системы уведомлений
     * Создает контейнер для toast-ов в DOM
     */
    init() {
        // Проверяем, существует ли уже контейнер
        this.container = document.querySelector('.toast-container');
        
        if (!this.container) {
            // Создаем контейнер для уведомлений
            this.container = document.createElement('div');
            this.container.className = 'toast-container';
            document.body.appendChild(this.container);
        }
    }

    /**
     * Основной метод для создания уведомления
     * @param {string} type - Тип уведомления (success, error, info, warning)
     * @param {string} title - Заголовок уведомления
     * @param {string} message - Текст сообщения
     * @param {Object} options - Дополнительные опции
     */
    show(type, title, message, options = {}) {
        // Настройки по умолчанию
        const config = {
            duration: options.duration || 5000, // Время показа в миллисекундах
            closable: options.closable !== false, // Возможность закрыть вручную
            progress: options.progress !== false, // Показать прогресс-бар
            sound: options.sound || false, // Звуковое уведомление
            actions: options.actions || [], // Дополнительные кнопки действий
            ...options
        };

        // Создаем уникальный ID для уведомления
        const toastId = ++this.toastCounter;
        
        // Создаем DOM элемент уведомления
        const toastElement = this.createToastElement(type, title, message, config);
        toastElement.setAttribute('data-toast-id', toastId);

        // Добавляем в контейнер
        this.container.appendChild(toastElement);
        
        // Сохраняем в коллекции активных уведомлений
        this.toasts.set(toastId, {
            element: toastElement,
            config: config,
            timeout: null
        });

        // Запускаем анимацию появления
        setTimeout(() => {
            toastElement.classList.add('show');
        }, 10);

        // Настраиваем автоматическое закрытие
        if (config.duration > 0) {
            this.scheduleAutoClose(toastId, config.duration);
        }

        // Воспроизводим звук, если включен
        if (config.sound) {
            this.playNotificationSound(type);
        }

        return toastId;
    }

    /**
     * Создание DOM элемента уведомления
     * @param {string} type - Тип уведомления
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {Object} config - Конфигурация
     * @returns {HTMLElement} - DOM элемент уведомления
     */
    createToastElement(type, title, message, config) {
        // Создаем основной элемент
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        // Определяем иконку в зависимости от типа
        const icons = {
            success: '✅',
            error: '❌', 
            info: 'ℹ️',
            warning: '⚠️'
        };

        // Формируем HTML структуру
        toast.innerHTML = `
            <div class="toast-icon">${icons[type] || '📢'}</div>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
            ${config.closable ? '<button class="toast-close" aria-label="Закрыть">&times;</button>' : ''}
            ${config.progress ? '<div class="toast-progress"></div>' : ''}
        `;

        // Добавляем обработчик закрытия
        if (config.closable) {
            const closeBtn = toast.querySelector('.toast-close');
            closeBtn.addEventListener('click', () => {
                const toastId = parseInt(toast.getAttribute('data-toast-id'));
                this.hide(toastId);
            });
        }

        // Добавляем обработчик клика по всему уведомлению (опционально)
        if (config.onClick) {
            toast.style.cursor = 'pointer';
            toast.addEventListener('click', (e) => {
                if (!e.target.classList.contains('toast-close')) {
                    config.onClick();
                }
            });
        }

        return toast;
    }

    /**
     * Настройка автоматического закрытия уведомления
     * @param {number} toastId - ID уведомления
     * @param {number} duration - Время до закрытия в миллисекундах
     */
    scheduleAutoClose(toastId, duration) {
        const toast = this.toasts.get(toastId);
        
        if (toast) {
            toast.timeout = setTimeout(() => {
                this.hide(toastId);
            }, duration);
        }
    }

    /**
     * Скрытие уведомления
     * @param {number} toastId - ID уведомления для скрытия
     */
    hide(toastId) {
        const toast = this.toasts.get(toastId);
        
        if (!toast) return;

        // Отменяем автоматическое закрытие
        if (toast.timeout) {
            clearTimeout(toast.timeout);
        }

        // Запускаем анимацию скрытия
        toast.element.classList.add('hide');
        
        // Удаляем элемент после завершения анимации
        setTimeout(() => {
            if (toast.element.parentNode) {
                toast.element.parentNode.removeChild(toast.element);
            }
            this.toasts.delete(toastId);
        }, 300);
    }

    /**
     * Скрытие всех активных уведомлений
     */
    hideAll() {
        this.toasts.forEach((toast, toastId) => {
            this.hide(toastId);
        });
    }

    /**
     * Воспроизведение звукового уведомления
     * @param {string} type - Тип уведомления для выбора звука
     */
    playNotificationSound(type) {
        // Создаем аудио контекст для веб-аудио
        if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
            try {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();

                // Настройки звука в зависимости от типа
                const soundConfig = {
                    success: { frequency: 800, duration: 200 },
                    error: { frequency: 300, duration: 300 },
                    info: { frequency: 600, duration: 150 },
                    warning: { frequency: 500, duration: 250 }
                };

                const config = soundConfig[type] || soundConfig.info;

                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);

                oscillator.frequency.value = config.frequency;
                gainNode.gain.value = 0.1;

                oscillator.start();
                oscillator.stop(audioContext.currentTime + config.duration / 1000);
            } catch (e) {
                console.warn('Web Audio API не поддерживается:', e);
            }
        }
    }

    // ==========================================
    // УДОБНЫЕ МЕТОДЫ ДЛЯ РАЗЛИЧНЫХ ТИПОВ УВЕДОМЛЕНИЙ
    // ==========================================

    /**
     * Показать уведомление об успехе
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {Object} options - Дополнительные опции
     */
    success(title, message = '', options = {}) {
        return this.show('success', title, message, {
            duration: 4000,
            ...options
        });
    }

    /**
     * Показать уведомление об ошибке
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {Object} options - Дополнительные опции
     */
    error(title, message = '', options = {}) {
        return this.show('error', title, message, {
            duration: 6000,
            sound: true,
            ...options
        });
    }

    /**
     * Показать информационное уведомление
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {Object} options - Дополнительные опции
     */
    info(title, message = '', options = {}) {
        return this.show('info', title, message, {
            duration: 5000,
            ...options
        });
    }

    /**
     * Показать предупреждение
     * @param {string} title - Заголовок
     * @param {string} message - Сообщение
     * @param {Object} options - Дополнительные опции
     */
    warning(title, message = '', options = {}) {
        return this.show('warning', title, message, {
            duration: 5000,
            ...options
        });
    }
}

// ============================================
// ИНИЦИАЛИЗАЦИЯ ГЛОБАЛЬНОГО ЭКЗЕМПЛЯРА
// ============================================

/**
 * Создаем глобальный экземпляр ToastManager
 * Доступен через window.toast во всех частях приложения
 */
window.ToastManager = ToastManager;

// Инициализируем глобальный экземпляр при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    if (!window.toast) {
        window.toast = new ToastManager();
        console.log('✅ Система уведомлений инициализирована');
    }
});

// Экспорт для модульных систем
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ToastManager;
}