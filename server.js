const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Базовый middleware
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Простой логгер
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health check endpoint
server.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Основные endpoint'ы
server.use(router);

// Обработка ошибок
server.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
});

server.listen(PORT, () => {
    console.log(`✅ JSON Server is running on port ${PORT}`);
    console.log(`📍 Health check: http://localhost:${PORT}/health`);
});
