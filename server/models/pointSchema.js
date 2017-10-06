const {Schema} = require('mongoose');

const pointSchema = new Schema({
    type: {
        type: String,
        default: 'Point'
    },

    coordinates: {
        required: true,
        type: [Number],
        index: '2dsphere'
    }
});

module.exports = {
    pointSchema
};