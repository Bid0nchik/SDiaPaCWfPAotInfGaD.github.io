const jsonServer = require('json-server');
const server = jsonServer.create();
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Создаем базу данных в памяти
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
    db.articles.unshift(article); // Добавляем в начало
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

// Статистика
server.get('/stats', (req, res) => {
    res.json({
        totalArticles: db.articles.length,
        server: 'Memory DB',
        uptime: process.uptime()
    });
});
