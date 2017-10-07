const request = require('request');
const bcrypt = require('bcryptjs');

const getLocation = (address) => {
    return new Promise((resolve , reject) => {
        request({
            url: `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`,
            json: true
        } , (err , response , body) => {
            if (err) {
                reject();
            }
            else if (response.status === "ZERO_RESULTS") {
                reject();
            }
            else if (response.status === 'INVALID_REQUEST') {
                reject();
            }
            else {
                resolve({
                    longitude: body.results[0].geometry.location.lng,
                    latitude: body.results[0].geometry.location.lat
                });
            }
        });    
    });
};

const driversToSend = (drivers) => {
    drivers.forEach((curr , index , arr) => {
        if (curr.obj.driving === false) {
            arr.splice(index , 1);
        }
    });

    drivers.forEach((curr , index , arr) => {
        arr[index] = {
            name: curr.obj.name,
            email: curr.obj.email,
            driving: curr.obj.driving,
            _id: curr.obj._id
        }; 
    });

    return drivers;
};

const verifyPassword = (driver , password) => {
    return new Promise((resolve , reject) => {
        bcrypt.compare(password , driver.password , (err , res) => {
            if (err || !res) {
                reject();
            }
            else {
                resolve(driver);
            }
        });
    });  
};

module.exports = {
    getLocation,
    driversToSend,
    verifyPassword
}