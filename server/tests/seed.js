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
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: idOne.toHexString() , access: 'auth'} , "abc123").toString()
    }]
} , {
    _id: idTwo,
    name: 'Driver2',
    email: 'driver2@example.com',
    password: 'drivertwo'
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
}