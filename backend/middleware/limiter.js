const express = require('express');  
const rateLimit = require('express-rate-limit');
const app = express();  
module.exports = function(){
    app.set('trust proxy', 1); 
    const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 30,
    message: {
        error: 'Слишком много запросов, попробуйте позже'
    }
});
}