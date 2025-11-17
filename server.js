// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Получаем пароль из переменных окружения
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Проверяем что пароль установлен
if (!ADMIN_PASSWORD) {
    console.error('❌ ERROR: ADMIN_PASSWORD environment variable is not set');
    console.error('Please set ADMIN_PASSWORD in Render environment variables');
    process.exit(1);
}

let db = {
  articles: []
};

// Middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Логирование
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Эндпоинт для проверки пароля администратора
server.post('/verify-admin', (req, res) => {
    const { password } = req.body;
    
    if (password === ADMIN_PASSWORD) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// GET /articles
server.get('/articles', (req, res) => {
    res.json(db.articles);
});

// POST /articles
server.post('/articles', (req, res) => {
    const article = {
        id: Date.now().toString(),
        ...req.body,
        date: new Date().toISOString()
    };
    db.articles.unshift(article);
    res.status(201).json(article);
});

// PATCH /articles/:id
server.patch('/articles/:id', (req, res) => {
    const index = db.articles.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        db.articles[index] = { ...db.articles[index], ...req.body };
        res.json(db.articles[index]);
    } else {
        res.status(404).json({ error: 'Article not found' });
    }
});

// DELETE /articles/:id
server.delete('/articles/:id', (req, res) => {
    const index = db.articles.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        db.articles.splice(index, 1);
        res.status(204).send();
    } else {
        res.status(404).json({ error: 'Article not found' });
    }
});

// Health check
server.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        articlesCount: db.articles.length,
        timestamp: new Date().toISOString()
    });
});

server.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📍 Admin authentication: ENABLED`);
    console.log(`📊 Total articles: ${db.articles.length}`);
});
