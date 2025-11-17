// server.js (простой и рабочий)
const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Middleware
server.use(middlewares);
server.use(router);

// Простое логирование
server.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

server.listen(PORT, () => {
    console.log(`✅ JSON Server is running on port ${PORT}`);
    console.log(`📍 API available at: http://localhost:${PORT}`);
});
