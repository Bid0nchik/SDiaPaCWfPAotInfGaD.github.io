// server.js
const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Получаем пароль из переменных окружения
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Если пароль не установлен, используем демо-пароль для тестирования
const actualPassword = ADMIN_PASSWORD || 'admin123';

console.log('✅ Server starting...');
console.log('📍 Admin password:', actualPassword ? 'SET' : 'NOT SET');

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
    
    console.log('Password check:', { received: password, expected: actualPassword });
    
    if (password === actualPassword) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, error: 'Invalid password' });
    }
});

// GET /articles - доступно всем
server.get('/articles', (req, res) => {
    res.json(db.articles);
});

// POST /articles - требует проверки пароля
server.post('/articles', (req, res) => {
    const { password, ...articleData } = req.body;
    
    if (password !== actualPassword) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const article = {
        id: Date.now().toString(),
        ...articleData,
        date: new Date().toISOString()
    };
    db.articles.unshift(article);
    res.status(201).json(article);
});

// PATCH /articles/:id - требует проверки пароля
server.patch('/articles/:id', (req, res) => {
    const { password, ...articleData } = req.body;
    
    if (password !== actualPassword) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    
    const index = db.articles.findIndex(a => a.id === req.params.id);
    if (index !== -1) {
        db.articles[index] = { ...db.articles[index], ...articleData };
        res.json(db.articles[index]);
    } else {
        res.status(404).json({ error: 'Article not found' });
    }
});

// DELETE /articles/:id - требует проверки пароля
server.delete('/articles/:id', (req, res) => {
    const { password } = req.body;
    
    if (password !== actualPassword) {
        return res.status(401).json({ error: 'Admin authentication required' });
    }
    
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
    console.log(`📍 Admin authentication: ${actualPassword ? 'ENABLED' : 'DISABLED'}`);
    console.log(`📊 Total articles: ${db.articles.length}`);
    console.log(`🌐 Endpoints available:`);
    console.log(`   GET /articles - Public`);
    console.log(`   POST /articles - Admin only`);
    console.log(`   PATCH /articles/:id - Admin only`);
    console.log(`   DELETE /articles/:id - Admin only`);
});
