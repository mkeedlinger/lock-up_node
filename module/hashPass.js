var encryption = require('./crypto'),
    scrypt = encryption.scrypt,
    crypto = encryption.crypto,
    er = require('./errors'),
    Promise = require('bluebird');

module.exports = function (pass) {
    var salt;
    return crypto.randomBytes(32).then(function (randomBytes) {
        salt = randomBytes.toString('base64');
        return crypto.pbkdf2(new Buffer(pass), salt,
            1000, // iterations
            512 // hash size
        );
    }).then(function (hash) {
        hash = hash.toString('base64');
        return scrypt.passwordHash(hash, scrypt.p);
    }).then(function (finalHash) {
        return Promise.resolve(salt, finalHash);
    }, function (err) {
        throw new er.PassHashErr(null, err);
    });
}
