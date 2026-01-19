const express = require('express'); 
const router = express.Router(); 
const validateSection = require('../middleware/validSection');

module.exports = function(db){
    router.delete('/:section/:id', validateSection, async (req, res) => {
        try {
            const section = req.params.section;
            const articleId = req.params.id;
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
    return router;
};