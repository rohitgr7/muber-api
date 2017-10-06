const _ = require('lodash');
const bcrypt = require('bcryptjs');

const {Driver} = require('./../models/driver');
const func = require('./../functions/function');

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
                res.header('x-auth' , token).send(driver);
            });
        }).catch(e => {
            res.status(400).send();
        });
    },

    logout(req , res) {
        req.driver.removeToken(req.token)
            .then(() => {
            res.send();
        }).catch((e) => {
            res.status(400).send();
        });
    },

    getDrivers(req , res) {
        const address = req.params.location;
        const encodedAddress = encodeURIComponent(address);

        func.getLocation(encodedAddress).then(location => {
            return Driver.geoNear(
                { type: 'Point' , coordinates: [parseFloat(location.longitude) , parseFloat(location.latitude)] },
                { spherical: true , maxDistance: 200000}
            )
                .then(drivers => {
                drivers = func.driversToSend(drivers);
                res.send(drivers);
            });
        }).catch(e => {
            res.status(400).send();
        });
    },

    updateLocation(req , res) {
        const address = req.params.location;
        const encodedAddress = encodeURIComponent(address);

        func.getLocation(encodedAddress).then(location => {
            return req.driver.update( {$set: {
                geometry: {
                    type: 'Point',
                    coordinates: [ parseFloat(location.longitude) , parseFloat(location.latitude) ]
                }
            } } ).then(driver => {
                res.send();
            });
        }).catch(e => {
            res.status(400).send(); 
        });
    }
};