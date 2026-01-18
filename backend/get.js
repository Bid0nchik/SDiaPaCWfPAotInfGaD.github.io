const express = require('express');
const router = express.Router();
const validateSection = require('./routes/validSection');

module.exports = function(db){
    router.get('/:section', validateSection, async (req, res) => {
        try {
            let section = req.params.section;
            let query = db.collection(section);
            const snapshot = await query
                .orderBy('date', 'desc')
                .get();
            const articles = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            res.json(articles);
        } catch (error) {
            res.status(500).json({ 
                error: 'Не удалось загрузить статьи',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    });
    return router;
}