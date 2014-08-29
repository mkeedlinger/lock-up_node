var lu = require('./index').server;
lu = lu({
    port: 8000,
    apiAuth: [{
        username: 'banana', password: 'bananabanana'
    }],
    db: 'test',
    https: {
        privateKey: 'server.key',
        certificate: 'server.crt'
    }
});
