const express = require('express');
const router = express.Router();

router.post('/check-password', async (req, res) => {
    try {
        const { password } = req.body;
        if (!password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Пароль обязателен' 
            });
        }
        if (password === process.env.ADMIN_PASSWORD) {
            res.json({ 
                success: true,
                message: 'Авторизация успешна'
            });
        } else {
            res.status(401).json({ 
                success: false, 
                error: 'Неверный пароль' 
            });
        }
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: 'Ошибка сервера' 
        });
    }
})

module.exports = router;