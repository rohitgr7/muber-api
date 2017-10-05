const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {Driver} = require('./../models/driver');

module.exports = {
    create(req , res) {
        var body = _.pick(req.body , ['name' , 'email' , 'password']);

        var driver = new Driver(body);

        driver.save()
            .then(driver => {
            res.send(driver)
        }).catch(e => {
            res.status(400).send()
        });
    },

    get(req , res) {
        res.send(req.driver);
    },

    update(req , res) {
        var password = req.body.password;
        var body = {};

        if (req.body.name) {
            body.name = req.body.name;
        }

        if(req.body.newPassword) {
            body.password = bcrypt.hashSync(req.body.newPassword , 10);
        }

        req.driver.verifyPassword(password)
            .then(() => {
            if(req.body.newPassword) {
                if (req.body.newPassword.length < 6) {
                    return res.status(400).send();    
                }
                
                body.password = bcrypt.hashSync(req.body.newPassword , 10);
            }

            Driver.findByIdAndUpdate(req.driver._id.toHexString() , {$set: body} , {new: true})
                .then((driver) => {
                res.send(driver);
            });
        }).catch((e) => {
            res.status(401).send();
        })
    },

    delete(req , res) {
        Driver.findByIdAndRemove(req.driver._id.toHexString())
            .then((driver) => {
            res.send(driver);
        }).catch((e) => {
            res.status(401).send();
        });
    },

    login(req , res) {
        const body = _.pick(req.body , ['email' , 'password']);

        Driver.findByCredentials(body.email , body.password)
            .then(driver => {
            driver.generateAuthToken().then(token => {
                //req.driver.updateDriving();
                res.header('x-auth' , token).send(driver);
            });
        }).catch(e => {
            res.status(400).send();
        });
    },

    logout(req , res) {
        req.driver.removeToken(req.token)
            .then(() => {
            //req.driver.updateDriving();
            res.send();
        }).catch((e) => {
            res.status(400).send();
        });
    }
}