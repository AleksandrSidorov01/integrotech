/**
 * =====================================================
 * ПАНЕЛЬ УПРАВЛЕНИЯ С УВЕДОМЛЕНИЯМИ
 * =====================================================
 * 
 * Обновленный файл menu.js для панели управления
 * с интеграцией системы всплывающих уведомлений.
 * 
 * Функциональность:
 * - Управление данными в таблицах (CRUD операции)
 * - Уведомления о успешных операциях
 * - Уведомления об ошибках
 * - Подтверждения действий
 * - Валидация данных перед отправкой
 * 
 * Добавлено для проекта "Интегротех"
 */

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu-item');
    const contentTitle = document.getElementById('content-title');
    const contentDescription = document.getElementById('content-description');
    const tableContent = document.getElementById('table-content');
    const addRecordBtn = document.getElementById('add-record-btn');
    
    // Модальные окна
    const recordModal = document.getElementById('record-modal');
    const deleteModal = document.getElementById('delete-modal');
    const recordForm = document.getElementById('record-form');
    const modalTitle = document.getElementById('modal-title');
    const formFields = document.getElementById('form-fields');
    
    // Кнопки модальных окон
    const closeModalBtns = document.querySelectorAll('.modal-close');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    
    let currentTable = '';
    let currentRecord = null;
    let isEditMode = false;

    /**
     * Функция инициализации системы уведомлений
     * Создает экземпляр ToastManager если он еще не создан
     */
    function initToastSystem() {
        if (!window.toast) {
            window.toast = new ToastManager();
        }
    }

    const tableNames = {
        'clients': 'Клиенты',
        'employees': 'Сотрудники', 
        'reports': 'Отчёты',
        'devices': 'Устройства',
        'devicemaintenance': 'Обслуживание устройств',
        'devicedata': 'Данные устройств',
        'dataerrors': 'Ошибки данных'
    };

    // Словарь для перевода заголовков колонок
    const columnTranslations = {
        // Общие поля
        'id': 'ID',
        'ID': 'ID',
        'password': 'Пароль',
        'Password': 'Пароль',
        'created_at': 'Дата создания',
        'updated_at': 'Дата обновления',
        'status': 'Статус',
        'Status': 'Статус',
        
        // Клиенты
        'FullName': 'ФИО',
        'fullname': 'ФИО',
        'full_name': 'ФИО',
        'Email': 'Почта',
        'email': 'Почта',
        'Phone': 'Телефон',
        'phone': 'Телефон',
        'CompanyName': 'Компания',
        'company_name': 'Компания',
        'company': 'Компания',
        'ClientType': 'Тип клиента',
        'client_type': 'Тип клиента',
        'type': 'Тип',
        'RegistrationDate': 'Дата регистрации',
        'registration_date': 'Дата регистрации',
        
        // Сотрудники
        'FirstName': 'Имя',
        'first_name': 'Имя',
        'LastName': 'Фамилия',
        'last_name': 'Фамилия',
        'Position': 'Должность',
        'position': 'Должность',
        'Department': 'Отдел',
        'department': 'Отдел',
        'HireDate': 'Дата трудоустройства',
        'hire_date': 'Дата трудоустройства',
        'Salary': 'Зарплата',
        'salary': 'Зарплата',
        
        // Устройства
        'DeviceName': 'Название устройства',
        'device_name': 'Название устройства',
        'name': 'Название',
        'DeviceType': 'Тип устройства',
        'device_type': 'Тип устройства',
        'Model': 'Модель',
        'model': 'Модель',
        'SerialNumber': 'Серийный номер',
        'serial_number': 'Серийный номер',
        'Location': 'Местоположение',
        'location': 'Местоположение',
        'InstallationDate': 'Дата установки',
        'installation_date': 'Дата установки',
        'LastMaintenance': 'Последнее обслуживание',
        'last_maintenance': 'Последнее обслуживание',
        
        // Данные устройств
        'DeviceID': 'ID устройства',
        'device_id': 'ID устройства',
        'Timestamp': 'Время',
        'timestamp': 'Время',
        'DataValue': 'Значение',
        'data_value': 'Значение',
        'value': 'Значение',
        'data': 'Тип данных',
        'data_type': 'Тип данных',
        'Quality': 'Качество',
        'quality': 'Качество',
        
        // Обслуживание устройств
        'MaintenanceDate': 'Дата обслуживания',
        'maintenance_date': 'Дата обслуживания',
        'MaintenanceType': 'Тип обслуживания',
        'maintenance_type': 'Тип обслуживания',
        'Description': 'Описание',
        'description': 'Описание',
        'employee_id': 'Сотрудник',
        'Technician': 'Техник',
        'technician': 'Техник',
        'Cost': 'Стоимость',
        'cost': 'Стоимость',
        
        // Отчёты
        'ReportName': 'Название отчёта',
        'report_name': 'Название отчёта',
        'ReportType': 'Тип отчёта',
        'report_type': 'Тип отчёта',
        'GeneratedDate': 'Дата создания',
        'generated_date': 'Дата создания',
        'GeneratedBy': 'Создал',
        'generated_by': 'Создал',
        'FilePath': 'Путь к файлу',
        'file_path': 'Путь к файлу',
        'content': 'Содержание',
        
        // Ошибки данных
        'ErrorCode': 'Код ошибки',
        'error_code': 'Код ошибки',
        'ErrorMessage': 'Сообщение об ошибке',
        'error_message': 'Сообщение об ошибке',
        'ErrorDate': 'Дата ошибки',
        'error_timestamp': 'Дата ошибки',
        'error_date': 'Дата ошибки',
        'Resolved': 'Решено',
        'resolved': 'Решено',
        'ResolvedBy': 'Решил',
        'resolved_by': 'Решил',
        'ResolvedDate': 'Дата решения',
        'resolved_date': 'Дата решения'
    };

    // Конфигурация полей для каждой таблицы
    const tableFields = {
        'clients': [
            { name: 'full_name', type: 'text', required: true, placeholder: 'Введите ФИО клиента' },
            { name: 'email', type: 'email', required: true, placeholder: 'client@example.com' },
            { name: 'phone', type: 'tel', required: true, placeholder: '+7 (999) 123-45-67' },
            { name: 'status', type: 'select', required: true, options: ['Активен', 'Неактивен'] }
        ],
        'employees': [
            { name: 'full_name', type: 'text', required: true, placeholder: 'ФИО' },
            { name: 'phone', type: 'tel', required: false, placeholder: '+7 (999) 123-45-67' },
            { name: 'email', type: 'email', required: true, placeholder: 'employee@company.com' },
            { name: 'position', type: 'text', required: true, placeholder: 'Должность' },
            { name: 'department', type: 'select', required: true, options: ['IT', 'Продажи', 'Маркетинг', 'HR', 'Бухгалтерия', 'Техподдержка'] }
        ],
        'devices': [
            { name: 'name', type: 'text', required: true, placeholder: 'Название устройства' },
            { name: 'type', type: 'select', required: true, options: ['Сенсор', 'Контроллер', 'Модем', 'Камера', 'Датчик'] },
            { name: 'status', type: 'select', required: true, options: ['Активно', 'Неактивно', 'На обслуживании', 'Неисправно'] },
            { name: 'installation_date', type: 'date', required: true }
        ],
        'devicemaintenance': [
            { name: 'serial_number', type: 'text', required: true, placeholder: 'Серийный номер' },
            { name: 'maintenance_date', type: 'date', required: true },
            { name: 'maintenance_type', type: 'select', required: true, options: ['Плановое', 'Внеплановое', 'Аварийное', 'Профилактическое'] },
            { name: 'employee_id', type: 'number', required: false, placeholder: 'ID сотрудника', min: '1' },
            { name: 'description', type: 'textarea', required: true, placeholder: 'Описание выполненных работ' }
        ],
        'devicedata': [
            { name: 'serial_number', type: 'text', required: true, placeholder: 'Серийный номер' },
            { name: 'timestamp', type: 'datetime-local', required: true },
            { name: 'data', type: 'text', required: true, placeholder: 'Значение данных' },
            { name: 'status', type: 'select', required: true, options: ['Хорошее', 'Удовлетворительное', 'Плохое'] }
        ],
        'dataerrors': [
            { name: 'serial_number', type: 'text', required: true, placeholder: 'Серийный номер' },
            { name: 'error_timestamp', type: 'datetime-local', required: true },
            { name: 'description', type: 'textarea', required: true, placeholder: 'Описание ошибки' },
            { name: 'status', type: 'select', required: true, options: ['Исправлено', 'В процессе'] }
        ],
        'reports': [
            { name: 'report_name', type: 'text', required: true, placeholder: 'Название отчёта' },
            { name: 'created_at', type: 'date', required: true },
            { name: 'content', type: 'textarea', required: false, placeholder: 'Содержание отчёта' }
        ]
    };

    /**
     * Функция для перевода заголовка колонки
     * @param {string} header - Заголовок для перевода
     * @returns {string} - Переведенный заголовок
     */
    function translateHeader(header) {
        return columnTranslations[header] || header;
    }

    /**
     * Валидация данных формы перед отправкой
     * @param {FormData} formData - Данные формы
     * @param {string} tableName - Название таблицы
     * @returns {Object} - Результат валидации
     */
    function validateFormData(formData, tableName) {
        const result = { isValid: true, errors: [] };
        const fields = tableFields[tableName] || [];
        
        for (const field of fields) {
            const value = formData.get(field.name);
            
            // Проверка обязательных полей
            if (field.required && (!value || value.trim() === '')) {
                result.errors.push(`Поле "${translateHeader(field.name)}" обязательно для заполнения`);
                result.isValid = false;
                continue;
            }
            
            // Валидация email
            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    result.errors.push(`Поле "${translateHeader(field.name)}" содержит некорректный email`);
                    result.isValid = false;
                }
            }
            
            // Валидация телефона
            if (field.type === 'tel' && value) {
                const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
                    result.errors.push(`Поле "${translateHeader(field.name)}" содержит некорректный номер телефона`);
                    result.isValid = false;
                }
            }
            
            // Валидация числовых полей
            if (field.type === 'number' && value) {
                const numValue = parseInt(value);
                if (isNaN(numValue) || numValue < 1) {
                    result.errors.push(`Поле "${translateHeader(field.name)}" должно содержать положительное число`);
                    result.isValid = false;
                }
            }
        }
        
        return result;
    }

    /**
     * Создание формы для добавления/редактирования записи
     * @param {string} tableName - Название таблицы
     * @param {Object} record - Запись для редактирования (null для нового)
     */
    function createForm(tableName, record = null) {
        const fields = tableFields[tableName] || [];
        let formHTML = '';

        fields.forEach(field => {
            const label = translateHeader(field.name);
            const value = record ? (record[field.name] || '') : '';
            
            let inputHTML = '';
            
            if (field.type === 'select') {
                inputHTML = `<select name="${field.name}" ${field.required ? 'required' : ''}>
                    <option value="">Выберите ${label.toLowerCase()}</option>
                    ${field.options.map(option => 
                        `<option value="${option}" ${value === option ? 'selected' : ''}>${option}</option>`
                    ).join('')}
                </select>`;
            } else if (field.type === 'textarea') {
                inputHTML = `<textarea name="${field.name}" ${field.required ? 'required' : ''} 
                    placeholder="${field.placeholder || ''}">${value}</textarea>`;
            } else {
                const attributes = [
                    `type="${field.type}"`,
                    `name="${field.name}"`,
                    `value="${value}"`,
                    field.required ? 'required' : '',
                    field.placeholder ? `placeholder="${field.placeholder}"` : '',
                    field.min ? `min="${field.min}"` : '',
                    field.max ? `max="${field.max}"` : '',
                    field.step ? `step="${field.step}"` : ''
                ].filter(Boolean).join(' ');
                
                inputHTML = `<input ${attributes}>`;
            }

            formHTML += `
                <div class="form-group">
                    <label for="${field.name}">${label}${field.required ? ' *' : ''}</label>
                    ${inputHTML}
                </div>
            `;
        });

        formFields.innerHTML = formHTML;
    }

    /**
     * Функция для показа модального окна с анимацией
     * @param {HTMLElement} modal - Модальное окно
     */
    function showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Инициализируем уведомления при показе модального окна
        initToastSystem();
    }

    /**
     * Функция для скрытия модального окна
     * @param {HTMLElement} modal - Модальное окно
     */
    function hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    /**
     * Функция для загрузки данных таблицы с обработкой ошибок
     * @param {string} tableName - Название таблицы
     */
    async function loadTableData(tableName) {
        // Инициализируем систему уведомлений
        initToastSystem();
        
        try {
            const response = await fetch(`/panel/data?table=${tableName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const data = await response.json();

            if (data.error) {
                // Показываем уведомление об ошибке
                if (window.toast) {
                    window.toast.error(
                        'Ошибка загрузки данных',
                        data.error,
                        { duration: 5000 }
                    );
                }
                
                tableContent.innerHTML = `<div class="error-message">${data.error}</div>`;
                return;
            }

            if (!data || data.length === 0) {
                const displayName = tableNames[tableName] || tableName;
                tableContent.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <h3>Нет данных</h3>
                        <p>В разделе "${displayName}" пока нет записей</p>
                    </div>
                `;
                
                // Показываем информационное уведомление
                if (window.toast) {
                    window.toast.info(
                        'Раздел пуст',
                        `В разделе "${displayName}" пока нет записей`,
                        { duration: 3000 }
                    );
                }
                return;
            }

            renderTable(data, tableName);
            
            // Показываем уведомление об успешной загрузке
            if (window.toast) {
                window.toast.success(
                    'Данные загружены',
                    `Загружено ${data.length} записей из раздела "${tableNames[tableName]}"`,
                    { duration: 2000 }
                );
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            
            // Показываем уведомление о сетевой ошибке
            if (window.toast) {
                window.toast.error(
                    'Ошибка соединения',
                    'Не удалось загрузить данные. Проверьте соединение с сервером',
                    { duration: 6000 }
                );
            }
            
            tableContent.innerHTML = `
                <div class="error-message">
                    Ошибка при загрузке данных. Проверьте соединение с сервером.
                </div>
            `;
        }
    }

    /**
     * Функция для отображения таблицы
     * @param {Array} data - Данные для отображения
     * @param {string} tableName - Название таблицы
     */
    function renderTable(data, tableName) {
        const allHeaders = Object.keys(data[0]);
        const headers = allHeaders.filter(header => 
            header.toLowerCase() !== 'id' && header.toLowerCase() !== 'password'
        );
        
        let tableHTML = `
            <div class="table-container">
                <table id="data-table">
                    <thead>
                        <tr>
                            ${headers.map(header => `<th>${translateHeader(header)}</th>`).join('')}
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${data.map(row => `
                            <tr data-id="${row.id}">
                                ${headers.map(header => `<td>${row[header] || '-'}</td>`).join('')}
                                <td>
                                    <div class="action-buttons">
                                        <button class="btn-edit" onclick="editRecord('${tableName}', ${row.id})">
                                        ✏️ Изменить
                                        </button>
                                        <button class="btn-delete" onclick="deleteRecord('${tableName}', ${row.id})">
                                        🗑️ Удалить
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;

        tableContent.innerHTML = tableHTML;
    }

    /**
     * Глобальная функция для редактирования записи
     * @param {string} tableName - Название таблицы
     * @param {number} recordId - ID записи
     */
    window.editRecord = async function(tableName, recordId) {
        // Инициализируем систему уведомлений
        initToastSystem();
        
        try {
            const response = await fetch(`/panel/data?table=${tableName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();
            
            const record = data.find(r => (r.ID || r.id) == recordId);
            if (record) {
                currentTable = tableName;
                currentRecord = record;
                isEditMode = true;
                
                modalTitle.textContent = `Редактировать запись - ${tableNames[tableName]}`;
                createForm(tableName, record);
                showModal(recordModal);
                
                // Показываем информационное уведомление
                if (window.toast) {
                    window.toast.info(
                        'Режим редактирования',
                        'Измените необходимые поля и нажмите "Сохранить"',
                        { duration: 3000 }
                    );
                }
            }
        } catch (error) {
            console.error('Error loading record:', error);
            
            // Показываем уведомление об ошибке
            if (window.toast) {
                window.toast.error(
                    'Ошибка загрузки',
                    'Не удалось загрузить данные записи для редактирования',
                    { duration: 5000 }
                );
            }
        }
    };

    /**
     * Глобальная функция для удаления записи
     * @param {string} tableName - Название таблицы
     * @param {number} recordId - ID записи
     */
    window.deleteRecord = function(tableName, recordId) {
        // Инициализируем систему уведомлений
        initToastSystem();
        
        currentTable = tableName;
        currentRecord = { id: recordId };
        showModal(deleteModal);
        
        // Показываем предупреждение
        if (window.toast) {
            window.toast.warning(
                'Подтверждение удаления',
                'Убедитесь, что действительно хотите удалить эту запись',
                { duration: 4000 }
            );
        }
    };

    // ==========================================
    // ОБРАБОТЧИКИ СОБЫТИЙ МЕНЮ И ИНТЕРФЕЙСА
    // ==========================================

    /**
     * Обработчики событий для пунктов меню
     */
    menuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Снимаем активность с других пунктов меню
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            const tableName = item.getAttribute('data-table');
            currentTable = tableName;
            const displayName = tableNames[tableName] || tableName;

            contentTitle.textContent = displayName;
            contentDescription.textContent = `Управление данными раздела "${displayName}"`;
            
            // Показать кнопку добавления записи
            addRecordBtn.style.display = 'flex';

            // Показываем индикатор загрузки
            tableContent.innerHTML = '<div class="loading">Загрузка данных...</div>';
            
            // Загружаем данные таблицы
            await loadTableData(tableName);
        });
    });

    /**
     * Обработчик для кнопки добавления записи
     */
    addRecordBtn.addEventListener('click', () => {
        if (currentTable) {
            // Инициализируем систему уведомлений
            initToastSystem();
            
            isEditMode = false;
            currentRecord = null;
            modalTitle.textContent = `Добавить запись - ${tableNames[currentTable]}`;
            createForm(currentTable);
            showModal(recordModal);
            
            // Показываем подсказку
            if (window.toast) {
                window.toast.info(
                    'Добавление записи',
                    'Заполните все обязательные поля и нажмите "Сохранить"',
                    { duration: 3000 }
                );
            }
        }
    });

    /**
     * Обработчики для закрытия модальных окон
     */
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            hideModal(modal);
        });
    });

    cancelBtn.addEventListener('click', () => hideModal(recordModal));
    cancelDeleteBtn.addEventListener('click', () => hideModal(deleteModal));

    /**
     * Закрытие модального окна при клике вне его
     */
    [recordModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    /**
     * Обработчик отправки формы записи
     */
    recordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Инициализируем систему уведомлений
        initToastSystem();
        
        const formData = new FormData(recordForm);
        const data = {};
        
        // Преобразуем FormData в объект
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Валидируем данные
        const validation = validateFormData(formData, currentTable);
        if (!validation.isValid) {
            if (window.toast) {
                window.toast.error(
                    'Ошибка валидации',
                    validation.errors.join('. '),
                    { duration: 6000 }
                );
            }
            return;
        }

        try {
            const url = isEditMode ? 
                `/panel/data/${currentTable}/${currentRecord.ID || currentRecord.id}` : 
                `/panel/data/${currentTable}`;
            
            const method = isEditMode ? 'PUT' : 'POST';
            
            // Показываем индикатор загрузки
            const saveButton = document.getElementById('save-btn');
            if (saveButton) {
                saveButton.disabled = true;
                saveButton.textContent = 'Сохранение...';
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                hideModal(recordModal);
                await loadTableData(currentTable);
                
                // Показываем уведомление об успехе
                const action = isEditMode ? 'обновлена' : 'добавлена';
                const actionPast = isEditMode ? 'обновления' : 'добавления';
                
                if (window.toast) {
                    window.toast.success(
                        `Запись ${action}!`,
                        `Данные успешно сохранены в разделе "${tableNames[currentTable]}"`,
                        { 
                            duration: 4000,
                            sound: true 
                        }
                    );
                }
            } else {
                const errorText = await response.text();
                
                // Показываем уведомление об ошибке
                if (window.toast) {
                    window.toast.error(
                        'Ошибка сохранения',
                        `Не удалось сохранить запись: ${errorText}`,
                        { duration: 6000 }
                    );
                }
            }
        } catch (error) {
            console.error('Error saving record:', error);
            
            // Показываем уведомление о сетевой ошибке
            if (window.toast) {
                window.toast.error(
                    'Ошибка соединения',
                    'Не удалось сохранить запись. Проверьте соединение с сервером',
                    { duration: 6000 }
                );
            }
        } finally {
            // Восстанавливаем кнопку
            const saveButton = document.getElementById('save-btn');
            if (saveButton) {
                saveButton.disabled = false;
                saveButton.textContent = 'Сохранить';
            }
        }
    });

    /**
     * Обработчик подтверждения удаления
     */
    confirmDeleteBtn.addEventListener('click', async () => {
        // Инициализируем систему уведомлений
        initToastSystem();
        
        try {
            // Показываем индикатор загрузки
            confirmDeleteBtn.disabled = true;
            confirmDeleteBtn.textContent = 'Удаление...';
            
            const response = await fetch(`/panel/data/${currentTable}/${currentRecord.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                hideModal(deleteModal);
                await loadTableData(currentTable);
                
                // Показываем уведомление об успешном удалении
                if (window.toast) {
                    window.toast.success(
                        'Запись удалена!',
                        `Запись успешно удалена из раздела "${tableNames[currentTable]}"`,
                        { 
                            duration: 4000,
                            sound: true 
                        }
                    );
                }
            } else {
                const errorText = await response.text();
                
                // Показываем уведомление об ошибке
                if (window.toast) {
                    window.toast.error(
                        'Ошибка удаления',
                        `Не удалось удалить запись: ${errorText}`,
                        { duration: 6000 }
                    );
                }
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            
            // Показываем уведомление о сетевой ошибке
            if (window.toast) {
                window.toast.error(
                    'Ошибка соединения',
                    'Не удалось удалить запись. Проверьте соединение с сервером',
                    { duration: 6000 }
                );
            }
        } finally {
            // Восстанавливаем кнопку
            confirmDeleteBtn.disabled = false;
            confirmDeleteBtn.textContent = 'Удалить';
        }
    });

    // ==========================================
    // ИНИЦИАЛИЗАЦИЯ СИСТЕМЫ
    // ==========================================

    // Инициализируем систему уведомлений при загрузке страницы
    initToastSystem();
    /**
     * Приветственные уведомления при входе в панель
    */
    function showWelcomeNotifications() {
        initToastSystem();
        
        // Приветственное сообщение
        setTimeout(() => {
            const currentHour = new Date().getHours();
            let greeting;
            
            if (currentHour < 12) {
                greeting = 'Доброе утро!';
            } else if (currentHour < 18) {
                greeting = 'Добрый день!';
            } else {
                greeting = 'Добрый вечер!';
            }
            
            window.toast.success(
                greeting,
                'Добро пожаловать в панель управления InteGroTech',
                { duration: 4000, sound: true }
            );
        }, 500);

        // Подсказка по навигации
        setTimeout(() => {
            window.toast.info(
                'Навигация',
                'Используйте меню слева для перехода между разделами',
                { duration: 5000, closable: true }
            );
        }, 3000);

        // Показываем статус системы
        setTimeout(() => {
            window.toast.success(
                'Система готова',
                'Все модули загружены и готовы к работе',
                { duration: 3000 }
            );
        }, 5000);
    }

    /**
     * Уведомления для операций с данными
     */
    function enhanceDataOperations() {
        // При начале загрузки данных
        const originalLoadTableData = loadTableData;
        
        window.loadTableData = async function(tableName) {
            initToastSystem();
            
            // Уведомление о начале загрузки
            window.toast.info(
                'Загрузка данных',
                `Получаем данные из раздела "${tableNames[tableName]}"...`,
                { duration: 2000 }
            );
            
            return originalLoadTableData(tableName);
        };
        
        // Улучшенные уведомления для операций CRUD
        const originalShowModal = showModal;
        
        window.showModal = function(modal) {
            if (modal.id === 'record-modal') {
                if (isEditMode) {
                    window.toast.info(
                        'Режим редактирования',
                        'Измените нужные поля и сохраните изменения',
                        { duration: 4000 }
                    );
                } else {
                    window.toast.info(
                        'Добавление записи',
                        'Заполните все обязательные поля',
                        { duration: 4000 }
                    );
                }
            } else if (modal.id === 'delete-modal') {
                window.toast.warning(
                    'Подтверждение удаления',
                    'Это действие нельзя будет отменить',
                    { duration: 5000 }
                );
            }
            
            return originalShowModal(modal);
        };
    }

    /**
     * Уведомления о состоянии сессии
     */
    function setupSessionNotifications() {
        // Предупреждение о неактивности
        let inactivityTimer;
        let warningShown = false;
        
        function resetInactivityTimer() {
            clearTimeout(inactivityTimer);
            warningShown = false;
            
            // 15 минут бездействия
            inactivityTimer = setTimeout(() => {
                if (!warningShown) {
                    window.toast.warning(
                        'Долгое бездействие',
                        'Сессия может завершиться через 5 минут бездействия',
                        { duration: 8000, closable: true }
                    );
                    warningShown = true;
                }
            }, 15 * 60 * 1000);
        }
        
        // Отслеживаем активность пользователя
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetInactivityTimer, true);
        });
        
        resetInactivityTimer();
    }

    /**
     * Уведомления о производительности
     */
    function setupPerformanceNotifications() {
        // Мониторинг времени загрузки данных
        const originalFetch = window.fetch;
        
        window.fetch = async function(...args) {
            const startTime = Date.now();
            
            try {
                const response = await originalFetch(...args);
                const endTime = Date.now();
                const duration = endTime - startTime;
                
                // Если запрос долгий
                if (duration > 3000) {
                    window.toast.warning(
                        'Медленное соединение',
                        'Данные загружаются дольше обычного',
                        { duration: 4000 }
                    );
                }
                
                return response;
            } catch (error) {
                window.toast.error(
                    'Ошибка сети',
                    'Проблемы с подключением к серверу',
                    { duration: 6000 }
                );
                throw error;
            }
        };
    }

    /**
     * Контекстные подсказки для разных разделов
     */
    function addContextualHints() {
        const sectionHints = {
            'clients': 'В этом разделе вы можете управлять информацией о клиентах компании',
            'employees': 'Здесь хранятся данные о сотрудниках и их должностях',
            'devices': 'Управление IoT устройствами и их характеристиками',
            'devicedata': 'Просмотр данных, поступающих с устройств',
            'devicemaintenance': 'Планирование и учёт технического обслуживания',
            'reports': 'Создание и просмотр аналитических отчётов',
            'dataerrors': 'Мониторинг и исправление ошибок в данных'
        };
        
        // При переключении между разделами показываем подсказки
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const tableName = item.getAttribute('data-table');
                const hint = sectionHints[tableName];
                
                if (hint) {
                    setTimeout(() => {
                        window.toast.info(
                            `Раздел: ${tableNames[tableName]}`,
                            hint,
                            { duration: 5000, closable: true }
                        );
                    }, 1000);
                }
            });
        });
    }

    /**
     * Уведомления о горячих клавишах
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + H для показа подсказок
            if (e.ctrlKey && e.key === 'h') {
                e.preventDefault();
                window.toast.info(
                    'Горячие клавиши',
                    'Ctrl+H - эта подсказка, Esc - закрыть модальные окна',
                    { duration: 6000, closable: true }
                );
            }
            
            // Esc для закрытия модальных окон
            if (e.key === 'Escape') {
                const activeModal = document.querySelector('.modal-overlay.show');
                if (activeModal) {
                    hideModal(activeModal);
                    window.toast.info(
                        'Модальное окно закрыто',
                        'Используйте Esc для быстрого закрытия окон',
                        { duration: 2000 }
                    );
                }
            }
        });
    }
    showWelcomeNotifications();
    enhanceDataOperations();
    setupSessionNotifications();
    setupPerformanceNotifications();
    addContextualHints();
    setupKeyboardShortcuts();

    console.log('✅ Панель управления с уведомлениями инициализирована');
});