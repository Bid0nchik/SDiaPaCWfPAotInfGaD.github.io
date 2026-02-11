router.post('/sms', validateSection, async (req, res) => {
    try {
        let { username } = req.body;
        
        // Валидация
        if (!username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username не указан' 
            });
        }
        
        // Очищаем username
        username = username.replace('@', '').trim();
        
        // Проверка длины
        if (username.length < 5) {
            return res.status(400).json({ 
                success: false, 
                error: 'Слишком короткий username' 
            });
        }
        
        // Генерируем код
        const code = Math.floor(100000 + Math.random() * 900000);
        
        // 👇 ВАЖНО: ЖДЕМ ответ от Telegram!
        await bot.sendMessage(
            username, 
            `🔐 Код подтверждения: ${code}\nНикому не сообщайте его!`
        );
        
        // 👇 Отправляем ответ ТОЛЬКО после успешной отправки
        res.json({ 
            success: true, 
            message: 'Код отправлен в Telegram',
            username: `@${username}`
        });
        
    } catch (error) {
        console.error('Ошибка Telegram:', error.code, error.message);
        
        // Понятное сообщение об ошибке
        let errorMessage = 'Не удалось отправить код';
        
        if (error.code === 'ETELEGRAM') {
            if (error.response?.statusCode === 400) {
                errorMessage = 'Пользователь не найден в Telegram';
            } else if (error.response?.statusCode === 403) {
                errorMessage = 'Бот заблокирован пользователем';
            }
        }
        
        res.status(500).json({ 
            success: false, 
            error: errorMessage 
        });
    }
});