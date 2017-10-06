const request = require('supertest');
const expect = require('chai').expect;

const {app} = require('./../server');
const {drivers} = require('./seed');
const {populateDrivers} = require('./seed');
const {Driver} = require('./../models/driver');

beforeEach(populateDrivers);

describe('POST /drivers' , () => {

    it('should create a new driver' , (done) => {
        const name = 'test';
        const email = 'test@test.com';
        const password = 'abc1234';

        request(app)
            .post('/drivers')
            .send( {name , email , password} )
            .end((err , res) => {
            if(err) {
                return done(err);
            }

            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal(name);
            expect(res.body.email).to.equal(email);

            Driver.findOne({email})
                .then((driver) => {
                expect(driver.password).to.not.equal(password);
                done();
            }).catch(e => done(e));
        });
    });

    it('should send a 400 if request is invalid' , (done) => {
        const name = "test";
        const email = "test@example";
        const password = "abc12334";

        request(app)
            .post('/drivers')
            .send( {name , email , password} )
            .end((err , res) => {
            expect(res.status).to.equal(400);
            done();
        });
    });

    it('should send a 400 if email already in use' , (done) => {
        request(app)
            .post('/drivers')
            .send( {name: 'test' , email: drivers[0].email , password: 'qwqwqwqw'} )
            .end((err , res) => {
            expect(res.status).to.equal(400);
            done();
        });
    });

});

describe('GET /drivers/me' , () => {

    it('should get the driver' , (done) => {
        request(app)
            .get('/drivers/me')
            .set('x-auth' , drivers[0].tokens[0].token)
            .end((err , res) => {
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal(drivers[0].name);
            expect(res.body.email).to.equal(drivers[0].email);
            expect(res.body._id).to.equal(drivers[0]._id.toHexString());
            done();
        });
    });

    it('should send a 401 for invalid request' , (done) => {
        request(app)
            .get('/drivers/me')
            .end((err , res) => {
            expect(res.status).to.equal(401);
            done();
        });
    });

});

describe('PATCH /drivers/me' , () => {

    it('should update the driver' , (done) => {
        request(app)
            .patch('/drivers/me')
            .set('x-auth' , drivers[0].tokens[0].token)
            .send( {password: drivers[0].password , name: "NewTest1"} )
            .end((err , res) => {
            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal("NewTest1");
            done();
        });
    });

    it('should send a 401 for incorrect password' , (done) => {
        request(app)
            .patch('/drivers/me')
            .set('x-auth' , drivers[0].tokens[0].token)
            .send( {password: drivers[1].password , name: 'NewTest1'} )
            .end((err , res) => {
            expect(res.status).to.equal(401);
            done();
        });
    });

    it('should send a 401 for invalid request' , (done) => {
        request(app)
            .patch('/drivers/me')
            .send( {password: drivers[1].password , name: 'NewTest2'} )
            .end((err , res) => {
            expect(res.status).to.equal(401);
            done();
        });
    });

});

describe('DELETE /drivers/me' , () => {

    it('should delete the driver' , (done) => {
        request(app)
            .delete('/drivers/me')
            .set('x-auth' , drivers[0].tokens[0].token)
            .end((err , res) => {
            if (err) {
                return done(err);
            }

            expect(res.status).to.equal(200);
            expect(res.body.name).to.equal(drivers[0].name);
            expect(res.body.email).to.equal(drivers[0].email);
            expect(res.body._id).to.equal(drivers[0]._id.toHexString());

            Driver.findOne( {email: drivers[0].email} )
                .then((driver) => {
                expect(driver).to.not.exist;
                done();
            }).catch(e => done(e));
        });
    });

    it('should send a 4001for unauthorised deletion' , (done) => {
        request(app)
            .delete('/drivers/me')
            .end((err , res) => {
            expect(res.status).to.equal(401);
            done();
        });
    });

});

describe('POST /drivers/login' , () => {

    it('should add a auth token on login' , (done) => {
        request(app)
            .post('/drivers/login')
            .send( {email: drivers[1].email , password: drivers[1].password} )
            .end((err , res) => {
            if (err) {
                return done(err);
            }

            expect(res.status).to.equal(200);
            expect(res.headers['x-auth']).to.exist;
            
            Driver.findById(drivers[1]._id.toHexString())
                .then(driver => {
                expect(driver.tokens.length).to.equal(1);
                expect(driver.tokens[0]).to.include({
                    access: 'auth',
                    token: res.headers['x-auth']
                });
                done();

            }).catch(e => done(e));
        });
    });

    it('should send a 400 for invalid login' , (done) => {
        request(app)
            .post('/drivers/login')
            .send( {email: drivers[0].email , password: drivers[1]} )
            .end((err , res) => {
            if (err) {
                return done(err);
            }

            expect(res.status).to.equal(400);
            done();
        });
    });

});

describe('DELETE /drivers/logout' , () => {

    it('should remove auth token on logout' , (done) => {
        request(app)
            .delete('/drivers/logout')
            .set('x-auth' , drivers[0].tokens[0].token)
            .end((err , res) => {
            if (err) {
                return done(err);
            }

            expect(res.status).to.equal(200);

            Driver.findById(drivers[0]._id.toHexString())
                .then(driver => {
                expect(driver.tokens.length).to.equal(0);
                done();
            }).catch(e => done(e));
        });
    });

});

describe('GET /drivers/:location' , () => {
   
    it('should return the drivers nearby' , (done) => {
        request(app)
        .get('/drivers/trinagar')
        .end((err , res) => {
            expect(res.status).to.equal(200);
            expect(res.body.length).to.equal(1);
            expect(res.body[0].email).to.equal(drivers[0].email);
            done();
        });
    });
    
});












