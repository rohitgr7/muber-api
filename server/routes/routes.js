const DriverController = require('./../controller/driver-controller');
const {authenticate} = require('./../middleware/authenticate');

module.exports = app => {
    app.post('/drivers' , DriverController.create);
    app.get('/drivers/me' , authenticate , DriverController.get);
    app.patch('/drivers/me' , authenticate , DriverController.update);
    app.delete('/drivers/me' , authenticate , DriverController.delete);
    app.post('/drivers/login' , DriverController.login);
    app.delete('/drivers/logout' , authenticate , DriverController.logout);
}