var encryption = require('./crypto'),
    scrypt = encryption.scrypt,
    crypto = encryption.crypto,
    er = require('./errors');

module.exports = function (storedHash, checkPass, salt) {
    return crypto.pbkdf2(new Buffer(checkPass), salt,
        1000, // iterations
        512 // hash size
    ).then(function (hash) {
        return scrypt.verifyHashPro(storedHash, hash.toString('base64'));
    }).catch(function (err) {
        throw new er.PassHashErr('checkPass', err);
    });
}