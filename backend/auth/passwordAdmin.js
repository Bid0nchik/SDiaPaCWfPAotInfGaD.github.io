const express = require('express');
const router = express.Router();

module.exports = function(db){
    router.post('/check-password', async (req, res) => {
        try {
            const { login, password } = req.body;

            const servLogins = await db.collection("Accounts")
                                .where('login', '==', login)
                                .get();

            if (password === process.env.ADMIN_PASSWORD) {
                res.json({ 
                    success: true,
                    message: 'Добро пожаловать, наш повелитель'
                });
            } else if(!snapshot.empty){
                const account = servLogins.docs[0].data();

                if(password === account.password){
                    res.json({
                        success: true,
                        message: 'Успешно!'
                    });
                }  else{
                    res.json({
                        success:false,
                        message:'Не найдено'
                    });
                }
            } else {
                res.status(401).json({ 
                    success: false, 
                    error: 'Неверный логин или пароль' 
                });
            }
        } catch (error) {
            console.error(error);
            res.status(500).json({ 
                success: false, 
                error: 'Ошибка сервера' 
            });
        }
    })
    return router
}