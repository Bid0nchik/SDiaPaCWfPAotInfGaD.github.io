const express = require('express'); 
const router = express.Router(); 
const validateArticleData = require('../middleware/validate');
const validateSection = require('../middleware/validSection');

module.exports = function(db){
    router.patch('/:section/:id', validateSection, async (req, res) => {
        try {
            const { title, content, image } = req.body;
            const section = req.params.section;
            const articleId = req.params.id;
            const oldDocRef = db.collection(section).doc(articleId);
            const updateData = {
                title: title,
                content: content,
                image: image,
                updatedAt: new Date().toISOString()
            };

            const validate = validateArticleData(updateData, true);
            if (!validate.isValid) {
                return res.status(400).json({
                    error: 'Неверные данные',
                    details: validate.errors
                });
            }
            
            await oldDocRef.update(updateData);
                const updatedDoc = await oldDocRef.get();
                const updatedArticle = {
                    id: updatedDoc.id,
                    ...updatedDoc.data()
                };
                res.json(updatedArticle);
            }
            catch (error) {
            res.status(500).json({
                error: 'Не удалось обновить статью',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
    return router;
}