const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

const PORT = process.env.PORT || 3001;

// Функция для получения всей возможной информации о посетителе
function getVisitorInfo(req) {
    const timestamp = new Date().toISOString();
    const time = new Date(timestamp).toLocaleString('ru-RU');
    
    // Получаем IP через все возможные методы
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.headers['x-client-ip'] ||
               req.headers['cf-connecting-ip'] ||
               req.connection.remoteAddress || 
               req.socket.remoteAddress ||
               req.connection.socket?.remoteAddress ||
               'unknown';

    // Очищаем IP
    const cleanIp = String(ip).split(',')[0].trim().replace('::ffff:', '').replace('::1', 'localhost');

    // Получаем информацию о браузере и ОС
    const userAgent = req.get('User-Agent') || 'Unknown';
    
    // Получаем все возможные заголовки
    const headers = {};
    Object.keys(req.headers).forEach(key => {
        headers[key] = req.headers[key];
    });

    // Определяем тип устройства
    let deviceType = 'Desktop';
    if (userAgent.includes('Mobile')) deviceType = 'Mobile';
    if (userAgent.includes('Tablet')) deviceType = 'Tablet';
    if (userAgent.includes('Android')) deviceType = 'Android';
    if (userAgent.includes('iPhone') || userAgent.includes('iPad')) deviceType = 'iOS';

    // Определяем браузер
    let browser = 'Unknown';
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('OPR')) browser = 'Opera';
    else if (userAgent.includes('Trident')) browser = 'Internet Explorer';

    // Определяем ОС
    let os = 'Unknown';
    if (userAgent.includes('Windows NT 10')) os = 'Windows 10/11';
    else if (userAgent.includes('Windows NT 6.3')) os = 'Windows 8.1';
    else if (userAgent.includes('Windows NT 6.2')) os = 'Windows 8';
    else if (userAgent.includes('Windows NT 6.1')) os = 'Windows 7';
    else if (userAgent.includes('Windows NT 6.0')) os = 'Windows Vista';
    else if (userAgent.includes('Windows NT 5.1')) os = 'Windows XP';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

    return {
        // Основная информация
        ip: cleanIp,
        timestamp: timestamp,
        time: time,
        
        // Информация о запросе
        url: req.url,
        method: req.method,
        protocol: req.protocol,
        secure: req.secure,
        host: req.get('Host'),
        
        // Источник трафика
        referer: req.get('Referer') || 'direct',
        origin: req.get('Origin'),
        userAgent: userAgent,
        
        // Информация о клиенте
        browser: browser,
        operatingSystem: os,
        deviceType: deviceType,
        language: req.get('Accept-Language'),
        encoding: req.get('Accept-Encoding'),
        
        // Дополнительные заголовки
        headers: headers,
        
        // Сетевые данные
        connection: {
            remoteAddress: req.connection.remoteAddress,
            remotePort: req.connection.remotePort,
            localAddress: req.connection.localAddress,
            localPort: req.connection.localPort
        }
    };
}

// Middleware для детального логирования
server.use((req, res, next) => {
    const visitor = getVisitorInfo(req);
    
    // Красивое логирование в консоль
    console.log('🌐 НОВЫЙ ПОСЕТИТЕЛЬ ======================');
    console.log('📋 ОСНОВНАЯ ИНФОРМАЦИЯ:');
    console.log(`   📍 IP адрес: ${visitor.ip}`);
    console.log(`   🕐 Время: ${visitor.time}`);
    console.log(`   🌐 URL: ${visitor.url}`);
    console.log(`   🔗 Метод: ${visitor.method}`);
    console.log(`   🛡️  Протокол: ${visitor.protocol} (${visitor.secure ? 'secure' : 'not secure'})`);
    console.log(`   🏠 Хост: ${visitor.host}`);
    
    console.log('📱 ИНФОРМАЦИЯ О КЛИЕНТЕ:');
    console.log(`   🔍 Браузер: ${visitor.browser}`);
    console.log(`   💻 Операционная система: ${visitor.operatingSystem}`);
    console.log(`   📟 Тип устройства: ${visitor.deviceType}`);
    console.log(`   🈯 Язык: ${visitor.language}`);
    console.log(`   📏 Кодировка: ${visitor.encoding}`);
    
    console.log('📊 ИСТОЧНИК ТРАФИКА:');
    console.log(`   🔗 Referer: ${visitor.referer}`);
    console.log(`   🎯 Origin: ${visitor.origin}`);
    
    console.log('🌐 СЕТЕВАЯ ИНФОРМАЦИЯ:');
    console.log(`   📡 Remote Address: ${visitor.connection.remoteAddress}`);
    console.log(`   🔌 Remote Port: ${visitor.connection.remotePort}`);
    console.log(`   🖥️  Local Address: ${visitor.connection.localAddress}`);
    console.log(`   ⚡ Local Port: ${visitor.connection.localPort}`);
    
    console.log('📨 ВСЕ ЗАГОЛОВКИ:');
    Object.keys(visitor.headers).forEach(key => {
        if (!key.toLowerCase().includes('authorization') && !key.toLowerCase().includes('cookie')) {
            console.log(`   ${key}: ${visitor.headers[key]}`);
        }
    });
    
    console.log('===========================================');
    
    // Логируем в упрощенном формате для быстрого просмотра
    console.log(`👤 ${visitor.ip} | ${visitor.browser} on ${visitor.operatingSystem} | ${visitor.url}`);
    
    next();
});

// Endpoint для получения гео-информации по IP (если доступно)
server.get('/geo/:ip', async (req, res) => {
    const ip = req.params.ip;
    
    try {
        // Пробуем получить гео-информацию
        const geoResponse = await fetch(`http://ip-api.com/json/${ip}`);
        const geoData = await geoResponse.json();
        
        res.json({
            ip: ip,
            geo: geoData,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            ip: ip,
            geo: { error: 'Geo information not available' },
            timestamp: new Date().toISOString()
        });
    }
});

// Debug endpoint со всей информацией
server.get('/debug-full', (req, res) => {
    const visitor = getVisitorInfo(req);
    
    res.json({
        message: '🔧 Full Debug Information',
        visitor: visitor,
        server: {
            time: new Date().toISOString(),
            timestamp: Date.now(),
            port: PORT,
            environment: process.env.NODE_ENV || 'development'
        }
    });
});

// Endpoint для статистики посещений
server.get('/stats/visitors', (req, res) => {
    const db = router.db;
    const articles = db.get('articles').value();
    
    // Собираем статистику
    const stats = {
        totalArticles: articles.length,
        totalViews: articles.reduce((sum, article) => sum + (article.views || 0), 0),
        mostPopular: articles
            .filter(a => a.views > 0)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, 5)
            .map(a => ({ title: a.title, views: a.views || 0 })),
        recentActivity: articles
            .filter(a => a.lastViewed)
            .sort((a, b) => new Date(b.lastViewed) - new Date(a.lastViewed))
            .slice(0, 10)
            .map(a => ({ 
                title: a.title, 
                lastViewed: a.lastViewed,
                views: a.views || 0 
            }))
    };
    
    res.json(stats);
});

// Основные endpoint'ы
server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
    console.log('🚀 ==================================');
    console.log('✅ JSON Server запущен!');
    console.log(`📍 Порт: ${PORT}`);
    console.log('📊 ДЕТАЛЬНОЕ ЛОГИРОВАНИЕ ВКЛЮЧЕНО');
    console.log('🔧 Endpoints:');
    console.log('   /debug-full - полная отладочная информация');
    console.log('   /geo/:ip - гео-информация по IP');
    console.log('   /stats/visitors - статистика посещений');
    console.log('   /articles - основные данные');
    console.log('🚀 ==================================');
    console.log('📈 Каждый посетитель будет детально логироваться');
    console.log('===========================================');
});

//cd C:\Users\Илья\htm
//git pull origin master --allow-unrelated-histories
//git add .
//git push origin master