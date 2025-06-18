const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const session = require('express-session'); // ДОБАВЛЕНО: Подключение express-session

const app = express();

// ============================================
// НАСТРОЙКА СЕССИЙ - ДОБАВЛЕНО ДЛЯ БЕЗОПАСНОСТИ
// ============================================
app.use(session({
    secret: 'integrotech_secret_key_2025', // Секретный ключ для подписи сессий
    resave: false,              // Не пересохранять сессию, если она не изменилась
    saveUninitialized: false,   // Не сохранять неинициализированные сессии
    cookie: { 
        secure: false,          // true только для HTTPS
        maxAge: 24 * 60 * 60 * 1000 // Сессия живет 24 часа
    }
}));

// Настройка статической обработки файлов из папки public и её подпапок
app.use(express.static(path.join(__dirname, 'public')));
app.use('/panel_menu', express.static(path.join(__dirname, 'public', 'panel_menu')));

const upload = multer();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'integrotech'
});

connection.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL');
});

// ============================================
// MIDDLEWARE ДЛЯ ПРОВЕРКИ АВТОРИЗАЦИИ
// ============================================
/**
 * Middleware для проверки авторизации пользователя
 * Перенаправляет неавторизованных пользователей на страницу входа
 */
function requireAuth(req, res, next) {
    if (req.session && req.session.userId) {
        // Пользователь авторизован, продолжаем
        return next();
    } else {
        // Пользователь не авторизован, перенаправляем на страницу входа
        return res.redirect('/');
    }
}

/**
 * Middleware для проверки, авторизован ли пользователь уже
 * Перенаправляет авторизованных пользователей в панель
 */
function redirectIfAuthenticated(req, res, next) {
    if (req.session && req.session.userId) {
        // Пользователь уже авторизован, перенаправляем в панель
        return res.redirect('/panel');
    } else {
        // Пользователь не авторизован, продолжаем
        return next();
    }
}

// ============================================
// МАРШРУТЫ АВТОРИЗАЦИИ И РЕГИСТРАЦИИ
// ============================================

// Маршрут для формы авторизации
app.get('/', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

/**
 * ИСПРАВЛЕННЫЙ маршрут для обработки авторизации
 * Теперь правильно работает с AJAX запросами и сессиями
 */
app.post('/login', upload.none(), (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        // НЕ res.redirect! Возвращаем на ту же страницу с ошибкой
        return res.status(400).render || res.status(400).sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
    }

    const { username, password } = req.body;

    connection.query('SELECT id, password FROM users WHERE username = ? ORDER BY id DESC LIMIT 1', [username], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            // НЕ редирект! Отправляем обратно на страницу входа
            return res.status(500).sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
        }
        
        if (results.length === 0) {
            // НЕ редирект! Остаемся на странице входа
            return res.status(401).sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
        }
        
        const user = results[0];
        const hashedPassword = user.password;
        
        if (bcrypt.compareSync(password, hashedPassword)) {
            // УСПЕХ - создаем сессию и редиректим на панель
            req.session.userId = user.id;
            req.session.username = username;
            req.session.loginTime = new Date();
            
            console.log('✅ Пользователь авторизован:', username);
            
            // ТОЛЬКО при успехе редиректим
            return res.redirect('/panel');
        } else {
            // НЕ редирект! Остаемся на странице входа
            return res.status(401).sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
        }
    });
});

// Маршрут для формы регистрации
app.get('/register', redirectIfAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register', 'register.html'));
});

/**
 * ИСПРАВЛЕННЫЙ маршрут для обработки регистрации
 */
app.post('/register', (req, res) => {
    // Проверяем наличие всех необходимых полей
    if (!req.body || !req.body.username || !req.body.password || !req.body.confirmPassword ||
        !req.body.firstName || !req.body.lastName || !req.body.email) {
        return res.status(400).json({ 
            success: false, 
            message: 'Введите информацию во все поля' 
        });
    }

    const { username, password, confirmPassword, firstName, lastName, email } = req.body;

    // Проверяем совпадение паролей
    if (password !== confirmPassword) {
        return res.status(400).json({ 
            success: false, 
            message: 'Пароли не совпадают' 
        });
    }

    // Проверяем существование пользователя
    connection.query('SELECT username FROM users WHERE username = ? OR email = ?', [username, email], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка сервера' 
            });
        }

        if (results.length > 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Это имя пользователя или email уже существует' 
            });
        }

        // Хэшируем пароль
        const hashedPassword = bcrypt.hashSync(password, 10);

        if (!hashedPassword || hashedPassword === '0') {
            return res.status(500).json({ 
                success: false, 
                message: 'Ошибка хэширования пароля' 
            });
        }

        // Добавляем пользователя в базу данных
        connection.query(
            'INSERT INTO users (username, password, firstName, lastName, email) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, firstName, lastName, email],
            (err, result) => {
                if (err) {
                    console.error('Insert error:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Ошибка при регистрации: ' + err.message 
                    });
                }

                console.log('✅ Новый пользователь зарегистрирован:', username, 'ID:', result.insertId);

                // Успешная регистрация
                return res.status(200).json({ 
                    success: true, 
                    message: 'Аккаунт создан!' 
                });
            }
        );
    });
});

// ============================================
// ЗАЩИЩЕННЫЕ МАРШРУТЫ (ТРЕБУЮТ АВТОРИЗАЦИИ)
// ============================================

// Маршрут для дашборда - ТЕПЕРЬ ЗАЩИЩЕН СЕССИЕЙ
app.get('/panel', requireAuth, (req, res) => {
    console.log('🔐 Доступ к панели для пользователя:', req.session.username);
    res.sendFile(path.join(__dirname, 'public', 'panel_menu', 'panel.html'));
});

// Маршрут для получения данных таблиц - ЗАЩИЩЕН
app.get('/panel/data', requireAuth, (req, res) => {
    const tableName = req.query.table;
    const tableMap = {
        clients: 'clients',
        employees: 'employees',
        reports: 'reports',
        devices: 'devices',
        devicemaintenance: 'devicemaintenance',
        devicedata: 'devicedata',
        dataerrors: 'dataerrors'
    };

    if (!tableMap[tableName]) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const sqlTable = tableMap[tableName];
    connection.query(`SELECT * FROM ${sqlTable}`, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при загрузке данных' });
        }
        res.json(results);
    });
});

// Маршрут для добавления записи - ЗАЩИЩЕН
app.post('/panel/data/:table', requireAuth, (req, res) => {
    const tableName = req.params.table;
    const tableMap = {
        clients: 'clients',
        employees: 'employees',
        reports: 'reports',
        devices: 'devices',
        devicemaintenance: 'devicemaintenance',
        devicedata: 'devicedata',
        dataerrors: 'dataerrors'
    };

    if (!tableMap[tableName]) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const sqlTable = tableMap[tableName];
    const data = req.body;
    let query, values;

    switch (sqlTable) {
        case 'clients':
            query = 'INSERT INTO clients (full_name, email, phone, status) VALUES (?, ?, ?, ?)';
            values = [data.full_name || '', data.email || '', data.phone || '', data.status || 'Активен'];
            break;
        case 'employees':
            query = 'INSERT INTO employees (full_name, phone, email, position, department) VALUES (?, ?, ?, ?, ?)';
            values = [data.full_name || '', data.phone || '', data.email || '', data.position || '', data.department || ''];
            break;
        case 'reports':
            query = 'INSERT INTO reports (report_name, created_at, content) VALUES (?, ?, ?)';
            values = [data.report_name || '', data.created_at || new Date().toISOString(), data.content || ''];
            break;
        case 'devices':
            query = 'INSERT INTO devices (name, type, status, installation_date) VALUES (?, ?, ?, ?)';
            values = [data.name || '', data.type || '', data.status || 'Активен', data.installation_date || new Date().toISOString().split('T')[0]];
            break;
        case 'devicemaintenance':
            query = 'INSERT INTO devicemaintenance (serial_number, maintenance_date, maintenance_type, employee_id, description) VALUES (?, ?, ?, ?, ?)';
            values = [data.serial_number || '', data.maintenance_date || new Date().toISOString().split('T')[0], data.maintenance_type || '', data.employee_id || null, data.description || ''];
            break;
        case 'devicedata':
            query = 'INSERT INTO devicedata (serial_number, timestamp, data, status) VALUES (?, ?, ?, ?)';
            values = [data.serial_number || '', data.timestamp || new Date().toISOString(), data.data || '', data.status || ''];
            break;
        case 'dataerrors':
            query = 'INSERT INTO dataerrors (serial_number, error_timestamp, description, status) VALUES (?, ?, ?, ?)';
            values = [data.serial_number || '', data.error_timestamp || new Date().toISOString(), data.description || '', data.status || ''];
            break;
        default:
            return res.status(400).json({ error: 'Таблица не поддерживается' });
    }

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Ошибка при добавлении записи:', err);
            return res.status(500).json({ error: 'Ошибка при добавлении записи' });
        }
        
        console.log(`✅ Пользователь ${req.session.username} добавил запись в ${tableName}`);
        res.status(201).json({ success: true, id: result.insertId });
    });
});

// Маршрут для редактирования записи - ЗАЩИЩЕН
app.put('/panel/data/:table/:id', requireAuth, (req, res) => {
    const tableName = req.params.table;
    const id = req.params.id;
    const tableMap = {
        clients: 'clients',
        employees: 'employees',
        reports: 'reports',
        devices: 'devices',
        devicemaintenance: 'devicemaintenance',
        devicedata: 'devicedata',
        dataerrors: 'dataerrors'
    };

    if (!tableMap[tableName]) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const sqlTable = tableMap[tableName];
    const data = req.body;
    let query, values;

    switch (sqlTable) {
        case 'clients':
            query = 'UPDATE clients SET full_name = ?, email = ?, phone = ?, status = ? WHERE id = ?';
            values = [data.full_name || '', data.email || '', data.phone || '', data.status || 'Активен', id];
            break;
        case 'employees':
            query = 'UPDATE employees SET full_name = ?, phone = ?, email = ?, position = ?, department = ? WHERE id = ?';
            values = [data.full_name || '', data.phone || '', data.email || '', data.position || '', data.department || '', id];
            break;
        case 'reports':
            query = 'UPDATE reports SET report_name = ?, created_at = ?, content = ? WHERE id = ?';
            values = [data.report_name || '', data.created_at || new Date().toISOString(), data.content || '', id];
            break;
        case 'devices':
            query = 'UPDATE devices SET name = ?, type = ?, status = ?, installation_date = ? WHERE id = ?';
            values = [data.name || '', data.type || '', data.status || 'Активен', data.installation_date || new Date().toISOString().split('T')[0], id];
            break;
        case 'devicemaintenance':
            query = 'UPDATE devicemaintenance SET serial_number = ?, maintenance_date = ?, maintenance_type = ?, employee_id = ?, description = ? WHERE id = ?';
            values = [data.serial_number || '', data.maintenance_date || new Date().toISOString().split('T')[0], data.maintenance_type || '', data.employee_id || null, data.description || '', id];
            break;
        case 'devicedata':
            query = 'UPDATE devicedata SET serial_number = ?, timestamp = ?, data = ?, status = ? WHERE id = ?';
            values = [data.serial_number || '', data.timestamp || new Date().toISOString(), data.data || '', data.status || '', id];
            break;
        case 'dataerrors':
            query = 'UPDATE dataerrors SET serial_number = ?, error_timestamp = ?, description = ?, status = ? WHERE id = ?';
            values = [data.serial_number || '', data.error_timestamp || new Date().toISOString(), data.description || '', data.status || '', id];
            break;
        default:
            return res.status(400).json({ error: 'Таблица не поддерживается' });
    }

    connection.query(query, values, (err, result) => {
        if (err) {
            console.error('Ошибка при обновлении записи:', err);
            return res.status(500).json({ error: 'Ошибка при обновлении записи' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        
        console.log(`✅ Пользователь ${req.session.username} обновил запись в ${tableName}`);
        res.json({ success: true });
    });
});

// Маршрут для удаления записи - ЗАЩИЩЕН
app.delete('/panel/data/:table/:id', requireAuth, (req, res) => {
    const tableName = req.params.table;
    const id = req.params.id;
    const tableMap = {
        clients: 'clients',
        employees: 'employees',
        reports: 'reports',
        devices: 'devices',
        devicemaintenance: 'devicemaintenance',
        devicedata: 'devicedata',
        dataerrors: 'dataerrors'
    };

    if (!tableMap[tableName]) {
        return res.status(400).json({ error: 'Неверное имя таблицы' });
    }

    const sqlTable = tableMap[tableName];
    const query = `DELETE FROM ${sqlTable} WHERE id = ?`;

    connection.query(query, [id], (err, result) => {
        if (err) {
            console.error('Ошибка при удалении записи:', err);
            return res.status(500).json({ error: 'Ошибка при удалении записи' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Запись не найдена' });
        }
        
        console.log(`✅ Пользователь ${req.session.username} удалил запись из ${tableName}`);
        res.json({ success: true });
    });
});

// ============================================
// МАРШРУТ ДЛЯ ВЫХОДА ИЗ СИСТЕМЫ
// ============================================
app.get('/logout', (req, res) => {
    const username = req.session.username;
    
    // Уничтожаем сессию
    req.session.destroy((err) => {
        if (err) {
            console.error('Ошибка при выходе:', err);
            return res.status(500).send('Ошибка при выходе');
        }
        
        console.log('🚪 Пользователь вышел из системы:', username);
        res.redirect('/');
    });
});

// ============================================
// ЗАПУСК СЕРВЕРА
// ============================================
app.listen(3000, () => {
    console.log('🚀 Server running on http://localhost:3000');
    console.log('🔐 Sessions enabled for security');
});