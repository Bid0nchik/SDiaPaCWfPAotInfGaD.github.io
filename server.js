const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Middleware для отслеживания посещений
server.use((req, res, next) => {
    // Получаем реальный IP через разные методы
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               'unknown';
    
    const userAgent = req.get('User-Agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    // Очищаем IP
    const cleanIp = String(ip).split(',')[0].trim().replace('::ffff:', '').replace('::1', 'localhost');
    
    const visitorData = {
        ip: cleanIp,
        userAgent: userAgent,
        url: req.url,
        method: req.method,
        timestamp: timestamp,
        time: new Date(timestamp).toLocaleString('ru-RU'),
        referer: req.get('Referer') || 'direct',
        host: req.get('Host') || 'unknown',
        origin: req.get('Origin') || 'unknown'
    };
    
    // Логируем ВСЕ заголовки для отладки
    console.log('🔍 ВСЕ ЗАГОЛОВКИ ЗАПРОСА:');
    Object.keys(req.headers).forEach(key => {
        console.log(`   ${key}: ${req.headers[key]}`);
    });
    
    // Красивое логирование
    console.log('🎯 НОВЫЙ ЗАПРОС ======================');
    console.log('├─ 📍 IP:', visitorData.ip);
    console.log('├─ 🌐 URL:', visitorData.url);
    console.log('├─ ⏰ Время:', visitorData.time);
    console.log('├─ 📱 User-Agent:', visitorData.userAgent);
    console.log('├─ 🔗 Метод:', visitorData.method);
    console.log('├─ 📍 Referer:', visitorData.referer);
    console.log('├─ 🏠 Host:', visitorData.host);
    console.log('└─ 🎯 Origin:', visitorData.origin);
    console.log('=======================================');
    
    next();
});

// Функция для определения браузера и ОС
function getBrowserInfo(userAgent) {
    if (!userAgent || userAgent === 'Unknown') return 'Unknown';
    
    let browser = 'Unknown';
    let os = 'Unknown';
    
    // Определяем браузер
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('OPR')) browser = 'Opera';
    
    // Определяем ОС
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac OS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    
    return `${browser} on ${os}`;
}

// Специальный endpoint для отладки
server.get('/debug', (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.headers['x-real-ip'] || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    'unknown';
    
    const cleanIp = String(clientIP).split(',')[0].trim().replace('::ffff:', '').replace('::1', 'localhost');
    
    res.json({
        message: '🔧 Debug Information',
        yourIP: cleanIp,
        headers: req.headers,
        connection: {
            remoteAddress: req.connection.remoteAddress,
            socketRemoteAddress: req.socket.remoteAddress
        },
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleString('ru-RU')
    });
});

// Endpoint для проверки работы
server.get('/ping', (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || 
                    req.connection.remoteAddress || 
                    'unknown';
    
    const cleanIp = String(clientIP).split(',')[0].trim().replace('::ffff:', '').replace('::1', 'localhost');
    
    res.json({
        message: '✅ Server is working!',
        yourIP: cleanIp,
        browser: getBrowserInfo(req.get('User-Agent')),
        timestamp: new Date().toISOString(),
        time: new Date().toLocaleString('ru-RU')
    });
});

// Основные endpoint'ы
server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
    console.log('🚀 ==================================');
    console.log('✅ JSON Server запущен!');
    console.log(`📍 Порт: ${PORT}`);
    console.log('📊 Улучшенное отслеживание включено');
    console.log('🔧 Debug endpoint: /debug');
    console.log('🔄 Ping endpoint: /ping');
    console.log('📚 Основной endpoint: /articles');
    console.log('🚀 ==================================');
});
