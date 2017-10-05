const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const routes = require('./routes/routes');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/mubernew' , {
    useMongoClient: true
});

const app = express();
app.use(bodyParser.json());
routes(app);

module.exports = {
    app
}