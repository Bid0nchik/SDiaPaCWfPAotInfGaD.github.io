const express = require('express'); 
const router = express.Router(); 
const validateArticleData = require('./routes/validate');
const validateSection = require('./routes/validSection');

module.exports = function(db){
    router.patch('/:newSection/:oldSection/:id', validateSection, async (req, res) => {
        try {
            const { title, content, image } = req.body;
            const oldSection = req.params.oldSection;
            const newSection = req.params.newSection;
            const articleId = req.params.id;
            const oldDocRef = db.collection(oldSection).doc(articleId);
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
            if (oldSection !== newSection) {
                const newDocRef = await db.collection(newSection).add(updateData);
                const newDoc = await newDocRef.get();
                await oldDocRef.delete();

                const updatedArticle = {
                    id: newDoc.id,
                    ...newDoc.data()
                };
                res.json(updatedArticle);
            } else {
            await oldDocRef.update(updateData);
                const updatedDoc = await oldDocRef.get();
                const updatedArticle = {
                    id: updatedDoc.id,
                    ...updatedDoc.data()
                };
                res.json(updatedArticle);
            }
        } catch (error) {
            res.status(500).json({
                error: 'Не удалось обновить статью',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
    return router;
}