const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Driver} = require('./../models/driver');

const idOne = new ObjectID();
const idTwo = new ObjectID(); 

var drivers = [{
    _id: idOne,
    name: "Driver1",
    email: "driver1@example.com",
    password: 'driverone',
    driving: true,
    geometry: { type: 'Point' , coordinates: [77.1580929 , 28.6779655] },
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: idOne.toHexString() , access: 'auth'} , process.env.JWT_SECRET).toString()
    }]
} , {
    _id: idTwo,
    name: 'Driver2',
    email: 'driver2@example.com',
    password: 'drivertwo',
    driving: false,
    geometry: { type: 'Point' , coordinates: [-66.885417 , 71.5388001] }
}];

const populateDrivers = (done) => {
    Driver.remove( {} )
    .then(() => {
        var driverOne = new Driver(drivers[0]);
        var driverTwo = new Driver(drivers[1]);
        
        return Promise.all([driverOne.save() , driverTwo.save()]);
    }).then(() => done());
};

module.exports = {
    drivers,
    populateDrivers
};