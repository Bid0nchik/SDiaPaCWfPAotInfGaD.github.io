const app = require('express')();
app.use((req, res, next) => {
    if (req.method === 'GET') {
        res.set('Cache-Control', 'public, max-age=30');
    }
    next();
});
module.exports = app;