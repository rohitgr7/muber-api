const mongoose = require('mongoose');
const {Schema} = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const _ = require('lodash');

const {pointSchema} = require('./pointSchema');
const func = require('./../functions/function');

const driverSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2
    },

    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: '{VALUE} is not a valid email'
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },

    driving: {
        type: Boolean,
        default: false
    },

    geometry: pointSchema,

    tokens: [{
        access: {
            type: String,
        },

        token: {
            type: String,
        }
    }]
});

driverSchema.methods.toJSON = function() {
    const driver = this;
    const driverObj = driver.toObject();

    return _.pick(driver , ['name' , 'email' , '_id' , 'driving']);
};

driverSchema.methods.generateAuthToken = function() {
    const driver = this;
    const access = 'auth';
    const token = jwt.sign({_id: driver._id.toHexString() , access} , process.env.JWT_SECRET).toString();

    driver.driving = true;
    driver.tokens.push({
        access,
        token
    });

    return driver.save().then(() => token);
};

driverSchema.methods.removeToken = function(token) {
    const driver = this;

    if (driver.tokens.length === 1) {
        driver.driving = false;
        driver.save();
    }

    return driver.update({
        $pull: {
            tokens: {token}
        }
    });
};

driverSchema.statics.findByToken = function(token) {
    const Driver = this;
    var decoded;

    try {
        decoded = jwt.verify(token , process.env.JWT_SECRET);
    }
    catch(e) {
        return Promise.reject();
    }

    return Driver.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

driverSchema.statics.findByCredentials = function(email , password) {
    const Driver = this;

    return Driver.findOne( {email} )
        .then(driver => {
        if(!driver) {
            return Promise.reject();
        }
        
        return func.verifyPassword(driver , password);
    });
};

driverSchema.pre('save' , function(next) {
    const driver = this;

    if(driver.isModified('password')) {
        bcrypt.genSalt(10 , (err , salt) => {
            bcrypt.hash(driver.password , salt , (err , hash) => {
                driver.password = hash;
                next();
            });
        });
    }
    else {
        next();
    }
});

const Driver = mongoose.model('driver' , driverSchema);

module.exports = {
    Driver
};