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

    // Функция для перевода заголовка колонки
    function translateHeader(header) {
        return columnTranslations[header] || header;
    }

    // Функция создания формы для добавления/редактирования записи
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

    // Функция для показа модального окна
    function showModal(modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }

    // Функция для скрытия модального окна
    function hideModal(modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }

    // Функция для загрузки данных таблицы
    async function loadTableData(tableName) {
        try {
            const response = await fetch(`/panel/data?table=${tableName}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            const data = await response.json();

            if (data.error) {
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
                return;
            }

            renderTable(data, tableName);

        } catch (error) {
            console.error('Error fetching data:', error);
            tableContent.innerHTML = `
                <div class="error-message">
                    Ошибка при загрузке данных. Проверьте соединение с сервером.
                </div>
            `;
        }
    }

    // Функция для отображения таблицы
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

    // Глобальные функции для кнопок действий
    window.editRecord = async function(tableName, recordId) {
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
            }
        } catch (error) {
            console.error('Error loading record:', error);
            alert('Ошибка при загрузке записи');
        }
    };

    window.deleteRecord = function(tableName, recordId) {
        currentTable = tableName;
        currentRecord = { id: recordId };
        showModal(deleteModal);
    };

    // Обработчики событий для меню
    menuItems.forEach(item => {
        item.addEventListener('click', async (e) => {
            e.preventDefault();
            
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');

            const tableName = item.getAttribute('data-table');
            currentTable = tableName;
            const displayName = tableNames[tableName] || tableName;

            contentTitle.textContent = displayName;
            contentDescription.textContent = `Управление данными раздела "${displayName}"`;
            
            // Показать кнопку добавления записи
            addRecordBtn.style.display = 'flex';

            tableContent.innerHTML = '<div class="loading">Загрузка данных...</div>';
            await loadTableData(tableName);
        });
    });

    // Обработчик для кнопки добавления записи
    addRecordBtn.addEventListener('click', () => {
        if (currentTable) {
            isEditMode = false;
            currentRecord = null;
            modalTitle.textContent = `Добавить запись - ${tableNames[currentTable]}`;
            createForm(currentTable);
            showModal(recordModal);
        }
    });

    // Обработчики для закрытия модальных окон
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal-overlay');
            hideModal(modal);
        });
    });

    cancelBtn.addEventListener('click', () => hideModal(recordModal));
    cancelDeleteBtn.addEventListener('click', () => hideModal(deleteModal));

    // Закрытие модального окна при клике вне его
    [recordModal, deleteModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Обработчик отправки формы
    recordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(recordForm);
        const data = {};
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        try {
            const url = isEditMode ? 
                `/panel/data/${currentTable}/${currentRecord.ID || currentRecord.id}` : 
                `/panel/data/${currentTable}`;
            
            const method = isEditMode ? 'PUT' : 'POST';
            
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
                alert(isEditMode ? 'Запись успешно обновлена!' : 'Запись успешно добавлена!');
            } else {
                const errorText = await response.text();
                alert('Ошибка при сохранении: ' + errorText);
            }
        } catch (error) {
            console.error('Error saving record:', error);
            alert('Ошибка при сохранении записи');
        }
    });

    // Обработчик подтверждения удаления
    confirmDeleteBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(`/panel/data/${currentTable}/${currentRecord.id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                hideModal(deleteModal);
                await loadTableData(currentTable);
                alert('Запись успешно удалена!');
            } else {
                const errorText = await response.text();
                alert('Ошибка при удалении: ' + errorText);
            }
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Ошибка при удалении записи');
        }
    });
});