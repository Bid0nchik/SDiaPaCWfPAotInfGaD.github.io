const express = require('express');  
const app = express();  

const cors = require('cors');                   
const admin = require('firebase-admin');
const PORT = process.env.PORT || 3001;

const limiter = require('./backend/middleware/limiter');
const cash = require('./backend/middleware/cash');

const firebase_env = require('./backend/firebase/firebase_main');
const serviceAccount = require('./backend/firebase/firebase_config');

app.use(express.json({ limit: '10mb' }));

app.use(cors({
    origin: ['https://sdiapacwfpaotinfgad.github.io', 'https://bid0nchik.github.io'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.options('*', cors());

//middleware
app.use(cash);
app.use(limiter);
firebase_env();

// аутентификация
try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    process.exit(1);
}
const db = admin.firestore();

app.post('/api/verify-token', async (req, res) => {
  const idToken = req.body.idToken;

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    // Пользователь подтвержден! 
    res.json({ status: 'success', uid: decodedToken.uid });

  } catch (error) {
    res.status(401).send('Unauthorized');
  }
});

//импорт эндпоинтов
const check_password = require('./backend/auth/passwordAdmin')(db);
const register = require('./backend/auth/register')(db);
const get_art = require('./backend/crud/get')(db);
const create_art = require('./backend/crud/create')(db);
const update_art = require('./backend/crud/update')(db);
const delete_art = require('./backend/crud/delete')(db);

// эндпоинты
app.use('/auth', check_password);
app.use('/auth', register);
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

app.use((req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const log = {
        time: new Date().toISOString(),
        ip: ip,
        method: req.method,
        url: req.url,
        userAgent: req.headers['user-agent']
    };
    console.log("Новый посетитель:", log);
    next();
});

app.listen(PORT);
module.exports = app;