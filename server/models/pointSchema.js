const {Schema} = require('mongoose');

const pointSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },

    coordinates: {
        type: [Number],
        index: '2dsphere'
    }
});

module.exports = {
    pointSchema
};