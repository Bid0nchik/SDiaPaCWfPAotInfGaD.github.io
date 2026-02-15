const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const router = express.Router();
const validateSection = require('../middleware/validSection');

const TOKEN = '8351714545:AAERHeq51FbIWJGs-EWLjlhE_q9iyF3y4SA';
const bot = new TelegramBot(TOKEN, {polling:false});
module.exports = function(){
    router.post('/sms', validateSection, async (req, res) => {
    try {
        let { username } = req.body;
        if (!username) {
            return res.status(400).json({ 
                success: false, 
                error: 'Username не указан' 
            });
        }
        username = username.replace('@', '').trim();
        const code = Math.floor(100000 + Math.random() * 900000);
        await bot.sendMessage(
            username, 
            `Код подтверждения: ${code}\nНикому не сообщайте его!`
        );
        res.json({ 
            success: true, 
            message: 'Код отправлен в Telegram',
            username: `@${username}`
        });
        
    } catch (error) {
        console.error('Ошибка Telegram:', error.code, error.message);
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
return router
}
