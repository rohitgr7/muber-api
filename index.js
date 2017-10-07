require('./server/config/config');
const {app} = require('./server/server');
const port = process.env.PORT;

app.listen(port , () => {
    console.log(`Starting up at port ${port}`); 
});