const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
app.options('*', cors());
app.use(cors({
    origin: ['https://sdiapacwfpaotinfgad.github.io', 'https://bid0nchik.github.io'],
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));
app.use((req, res, next) => {
    // Кэшируем GET запросы на 30 секунд
    if (req.method === 'GET') {
        res.set('Cache-Control', 'public, max-age=30');
    }
    next();
});
// Настройка лимита запросов
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        error: 'Слишком много запросов, попробуйте позже'
    }
});

app.use(limiter);
app.use(cors());
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
});

// Валидация данных статьи
function validateArticleData(articleData, isUpdate = false) {
    const errors = [];
    
    if (!isUpdate || articleData.title !== undefined) {
        const title = articleData.title?.trim();
        if (!title) {
            errors.push('Заголовок обязателен');
        } else if (title.length > 200) {
            errors.push('Заголовок не должен превышать 200 символов');
        }
    }
    
    if (!isUpdate || articleData.content !== undefined) {
        const content = articleData.content?.trim();
        if (!content) {
            errors.push('Содержание обязательно');
        } else if (content.length > 10000) {
            errors.push('Содержание не должно превышать 10000 символов');
        }
    }
    
    if (articleData.image !== undefined && articleData.image !== null) {
        if (!articleData.image.startsWith('data:image/')) {
            errors.push('Неверный формат изображения');
        } else if (articleData.image.length > 5 * 1024 * 1024) {
            errors.push('Размер изображения слишком большой');
        }
    }
    
    return errors;
}

// GET /articles - получить все статьи
app.get('/articles', async (req, res) => {
    try {
        const snapshot = await db.collection('articles')
            .orderBy('date', 'desc')
            .get();
        
        const articles = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        res.json(articles);
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось загрузить статьи',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// GET /articles/:id - получить конкретную статью
app.get('/articles/:id', async (req, res) => {
    try {
        const doc = await db.collection('articles').doc(req.params.id).get();
        
        if (!doc.exists) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }
        
        const article = {
            id: doc.id,
            ...doc.data()
        };
        
        res.json(article);
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось загрузить статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// POST /articles - создать статью
app.post('/articles', async (req, res) => {
    try {
        const { title, content, image } = req.body;

        const validationErrors = validateArticleData({ title, content, image });
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Неверные данные',
                details: validationErrors
            });
        }

        const articleData = {
            title: title.trim(),
            content: content.trim(),
            image: image || null,
            date: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        const docRef = await db.collection('articles').add(articleData);
        
        const responseArticle = {
            id: docRef.id,
            ...articleData
        };
        res.status(201).json(responseArticle);
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось создать статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// PATCH /articles/:id - обновить статью
app.patch('/articles/:id', async (req, res) => {
    try {
        const { title, content, image } = req.body;
        
        const doc = await db.collection('articles').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        const validationErrors = validateArticleData({ title, content, image }, true);
        if (validationErrors.length > 0) {
            return res.status(400).json({ 
                error: 'Неверные данные',
                details: validationErrors
            });
        }

        const updateData = {
            updatedAt: new Date().toISOString()
        };
        
        if (title !== undefined) updateData.title = title.trim();
        if (content !== undefined) updateData.content = content.trim();
        if (image !== undefined) updateData.image = image;

        await db.collection('articles').doc(req.params.id).update(updateData);
        
        const updatedDoc = await db.collection('articles').doc(req.params.id).get();
        const updatedArticle = {
            id: updatedDoc.id,
            ...updatedDoc.data()
        };
        res.json(updatedArticle);
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось обновить статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// DELETE /articles/:id - удалить статью
app.delete('/articles/:id', async (req, res) => {
    try {
        const doc = await db.collection('articles').doc(req.params.id).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        await db.collection('articles').doc(req.params.id).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось удалить статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Health check
app.get('/health', async (req, res) => {
    try {
        const snapshot = await db.collection('articles').count().get();
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

// Обработка несуществующих маршрутов
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Маршрут не найден',
        availableEndpoints: [
            'GET /articles',
            'GET /articles/:id',
            'POST /articles',
            'PATCH /articles/:id',
            'DELETE /articles/:id',
            'POST /auth/check-password',
            'GET /health'
        ]
    });
});

// Обработка ошибок
app.use((error, req, res, next) => {
    res.status(500).json({ 
        error: 'Внутренняя ошибка сервера',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

app.listen(PORT, () => {
    console.log(`📍 Port: ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});
module.exports = app;
