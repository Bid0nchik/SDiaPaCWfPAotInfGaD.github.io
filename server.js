const express = require('express');  
const app = express();  
const cors = require('cors');                   
const admin = require('firebase-admin');        
const rateLimit = require('express-rate-limit');
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: ['https://sdiapacwfpaotinfgad.github.io', 'https://bid0nchik.github.io'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

app.options('*', cors());

app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', 'public, max-age=30');
    }
    next();
});

// Лимит запросов: на скоко блок, сколько макс запросов, что пишем
const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        error: 'Слишком много запросов, попробуйте позже'
    }
});

app.use(limiter);
app.use(express.json({ limit: '10mb' }));

// Валидация переменных окружения
const requiredEnvVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID',
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_CLIENT_CERT_URL',
    'ADMIN_PASSWORD'
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`❌ Отсутствует обязательная переменная окружения: ${envVar}`);
        process.exit(1);
    }
}

// Firebase Admin инициализация
const serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

try {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
} catch (error) {
    process.exit(1);
}

const db = admin.firestore();

const get_art = require('./backend/get')(db);
const create_art = require('./backend/create')(db);
const update_art = require('./backend/update')(db);
const delete_art = require('./backend/delete')(db);

app.post('/auth/check-password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Пароль обязателен' 
            });
        }
        if (password === process.env.ADMIN_PASSWORD) {
            res.json({ 
                success: true,
                message: 'Авторизация успешна'
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: 'Неверный пароль' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка сервера' 
        });
    }
})

app.use('/articles', get_art);
app.use('/articles', create_art);
app.use('/articles', update_art);
app.use('/articles', delete_art);

// Health check
app.get('/health', async (req, res) => {
    try {
        const snapshot = await db.collection('Prog').count().get();
        const articleCount = snapshot.data().count;
        
        res.json({ 
            status: 'OK', 
            database: 'Firebase Firestore',
            articlesCount: articleCount,
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({ 
            error: 'Database connection failed',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});


// Обработка ошибок
app.use((error, req, res, next) => {
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});
app.listen(PORT);
module.exports = app;
