module.exports = function(req,res,next){
    const section = req.body;
    if (!['Prog', 'OSINT', 'Trol'].includes(section)) {
        return res.status(400).json({ 
            error: 'Неверный раздел. Допустимые значения: Prog, OSINT, Trol' 
        });
    }
    next();
};