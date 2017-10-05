const {Driver} = require('./../models/driver');

const authenticate = (req , res , next) => {
    var token = req.header('x-auth');
    
    Driver.findByToken(token)
    .then((driver) => {
        if (!driver) {
            Promise.reject();
        }
        req.driver = driver;
        req.token = token;
        next();
    }).catch((e) => {
        res.status(401).send();
    });
};

module.exports = {
    authenticate
}