const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

const app = express();

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

// Маршрут для формы авторизации
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login', 'login.html'));
});

app.post('/login', upload.none(), (req, res) => {
    if (!req.body || !req.body.username || !req.body.password) {
        return res.status(400).send('Заполните все поля');
    }

    const { username, password } = req.body;

    connection.query('SELECT password FROM users WHERE username = ? ORDER BY id DESC LIMIT 1', [username], (err, results) => {
        if (err) {
            return res.status(500).send('Ошибка сервера');
        }
        if (results.length === 0) {
            return res.status(401).send('Неверные данные');
        }
        const hashedPassword = results[0].password;
        if (bcrypt.compareSync(password, hashedPassword)) {
            res.redirect('/panel');
        } else {
            res.status(401).send('Неверные данные');
        }
    });
});

// Маршрут для формы регистрации
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'register', 'register.html'));
});

app.post('/register', upload.none(), (req, res) => {
    if (!req.body || !req.body.username || !req.body.password || !req.body.confirmPassword ||
        !req.body.firstName || !req.body.lastName || !req.body.email) {
        return res.status(400).send('Введите информацию сначала');
    }

    const { username, password, confirmPassword, firstName, lastName, email } = req.body;

    if (password !== confirmPassword) {
        return res.status(400).send('Пароли не совпадают');
    }

    connection.query('SELECT username FROM users WHERE username = ?', [username], (err, results) => {
        if (err) {
            return res.status(500).send('Ошибка сервера');
        }
        if (results.length > 0) {
            return res.status(400).send('Это имя пользователя уже существует');
        }

        const hashedPassword = bcrypt.hashSync(password, 10);

        if (!hashedPassword || hashedPassword === '0') {
            return res.status(500).send('Ошибка хэширования пароля');
        }

        connection.query(
            'INSERT INTO users (username, password, firstName, lastName, email) VALUES (?, ?, ?, ?, ?)',
            [username, hashedPassword, firstName, lastName, email],
            (err) => {
                if (err) {
                    return res.status(500).send('Ошибка при регистрации: ' + err.message);
                }
                res.status(200).send('Аккаунт создан!');
            }
        );
    });
});

// Маршрут для дашборда
app.get('/panel', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'panel_menu', 'panel.html'));
});

// Маршрут для получения данных таблиц
app.get('/panel/data', (req, res) => {
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

// Маршрут для добавления записи
app.post('/panel/data/:table', (req, res) => {
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
        res.status(201).json({ success: true, id: result.insertId });
    });
});

// Маршрут для редактирования записи
app.put('/panel/data/:table/:id', (req, res) => {
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
        res.json({ success: true });
    });
});

// Маршрут для удаления записи
app.delete('/panel/data/:table/:id', (req, res) => {
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
        res.json({ success: true });
    });
});

// Маршрут для выхода
app.get('/logout', (req, res) => {
    res.redirect('/');
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});