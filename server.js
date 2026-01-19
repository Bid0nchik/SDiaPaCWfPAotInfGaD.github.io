const express = require('express');  
const app = express();  
const cors = require('cors');                   
const admin = require('firebase-admin');
const PORT = process.env.PORT || 3001;

const limiter = require('./backend/middleware/limiter');
const cash = require('./backend/middleware/cash');

const firebase_env = require('./backend/firebase/firebase');
const serviceAccount = require('./backend/firebase/firebase_config.json');

//middleware
app.use(cash);
app.use(limiter);
app.use(firebase_env);
app.use(express.json({ limit: '10mb' }));

app.use(cors({
    origin: ['https://sdiapacwfpaotinfgad.github.io', 'https://bid0nchik.github.io'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.options('*', cors());

// аутентификация
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    process.exit(1);
}
const db = admin.firestore();

//импорт эндпоинтов
const check_password = require('./backend/auth/password');
const get_art = require('./backend/crud/get')(db);
const create_art = require('./backend/crud/create')(db);
const update_art = require('./backend/crud/update')(db);
const delete_art = require('./backend/crud/delete')(db);

// эндпоинты
app.use('/auth', check_password);
app.use('/articles', get_art);
app.use('/articles', create_art);
app.use('/articles', update_art);
app.use('/articles', delete_art);

// Обработка ошибок
app.use((error, req, res, next) => {
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

app.listen(PORT);
module.exports = app;