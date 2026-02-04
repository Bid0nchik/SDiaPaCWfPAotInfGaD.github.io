const express = require('express');
const router = express.Router();

module.exports = function(db){
    router.post('/register', async (req,res)=>{
        try{
            const { number, login, password } = req.body;
            const NewAccount = {
                number: number,
                login: login,
                password: password
            }
            await db.collection('Accounts').add(NewAccount);
            res.status(204).send();
        }catch(error){
            res.status(500).json({ 
                error: 'Не удалось создать аккаунт',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    })
    return router
}