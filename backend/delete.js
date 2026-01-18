const express = require('express'); 
const router = express.Router(); 

router.delete('/articles/:section/:id', async (req, res) => {
    try {
        const section = req.params.section;
        const articleId = req.params.id;
        if (!['Prog', 'OSINT', 'Trol'].includes(section)) {
            return res.status(400).json({ 
                error: 'Неверный раздел. Допустимые значения: Prog, OSINT, Trol'
            });
        }
        const db = req.app.locals.db;
        const doc = await db.collection(section).doc(articleId).get();
        if (!doc.exists) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }
        await db.collection(section).doc(articleId).delete();
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ 
            error: 'Не удалось удалить статью',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
