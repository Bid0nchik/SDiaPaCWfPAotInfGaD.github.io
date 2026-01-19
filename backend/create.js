const express = require('express');
const router = express.Router();
const validateArticleData = require('./routes/validate');
const validateSection = require('./routes/validSection');

module.exports = function(db){
    router.post('/:section', validateSection, async (req, res) => {
            try {
            const { title, content, image } = req.body;
            const section = req.params.section;
            const articleData = {
                title: title,
                content: content,
                image: image || null,
                date: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            const validate = validateArticleData(articleData, false);
            if (!validate.isValid) {
                return res.status(400).json({
                    error: 'Неверные данные',
                    details: validate.errors
                });
            }

            const docRef = await db.collection(section).add(articleData);
            const responseArticle = {
                id: docRef.id,
                ...articleData
            };
            res.status(201).json(responseArticle);
        } catch (error) {
            res.status(500).json({ 
                error: 'Не удалось создать статью',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
    return router;
}