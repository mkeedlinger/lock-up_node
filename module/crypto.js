var crypto = require('crypto'),
    scrypt = require('scrypt'),
    Promise = require('bluebird');

scrypt.p = scrypt.params(0.1);

// promisify
crypto.randomBytes = Promise.promisify(crypto.randomBytes);
crypto.pbkdf2 = Promise.promisify(crypto.pbkdf2);
scrypt.passwordHash = Promise.promisify(scrypt.passwordHash);
scrypt.verifyHashPro = function (oldHash, newHash) {
    return new Promise(function (resolve, reject) {
        scrypt.verifyHash(oldHash, newHash, function (err, isValid) {
            if (err && err.err_code !== 4) {
                reject(err);
            } else {
                resolve(!!isValid);
            }
        });
    });
}

module.exports.crypto = crypto;
module.exports.scrypt = scrypt;