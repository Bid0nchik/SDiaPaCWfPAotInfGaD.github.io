const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Middleware для отслеживания посещений
server.use((req, res, next) => {
    // Получаем данные посетителя
    const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    const timestamp = new Date().toISOString();
    
    // Очищаем IP от префиксов
    const cleanIp = ip.replace('::ffff:', '').replace('::1', 'localhost');
    
    const visitorData = {
        ip: cleanIp,
        userAgent: userAgent,
        url: req.url,
        method: req.method,
        timestamp: timestamp,
        time: new Date(timestamp).toLocaleString('ru-RU'),
        referer: req.get('Referer') || 'direct'
    };
    
    // Красивое логирование в консоль
    console.log('🎯 НОВЫЙ ЗАПРОС');
    console.log('├─ 📍 IP:', visitorData.ip);
    console.log('├─ 🌐 URL:', visitorData.url);
    console.log('├─ ⏰ Время:', visitorData.time);
    console.log('├─ 📱 Браузер:', getBrowserInfo(visitorData.userAgent));
    console.log('├─ 🔗 Метод:', visitorData.method);
    console.log('└─ 📍 Источник:', visitorData.referer);
    console.log('─────────────────────────────────────');
    
    next();
});

// Функция для определения браузера и ОС
function getBrowserInfo(userAgent) {
    let browser = 'Unknown';
    let os = 'Unknown';
    
    // Определяем браузер
    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';
    
    // Определяем ОС
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'Mac OS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';
    
    return `${browser} on ${os}`;
}

// Специальный endpoint для проверки работы
server.get('/ping', (req, res) => {
    const clientIP = req.ip.replace('::ffff:', '').replace('::1', 'localhost');
    res.json({
        message: '✅ Server is working!',
        yourIP: clientIP,
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
    console.log('📊 Статистика посещений АКТИВИРОВАНА');
    console.log('🔍 Тестовый endpoint: /ping');
    console.log('📚 Основной endpoint: /articles');
    console.log('🚀 ==================================');
    console.log('ℹ️  Каждый посетитель будет отображаться здесь');
    console.log('─────────────────────────────────────');
});
