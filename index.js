// depends
var // db
    thinky = require('thinky'),
    r = thinky.r,

    // http
    express = require('express'),
    req = require('request'),

    // cryptography
    crypto = require('crypto'),
    scrypt = require('scrypt'),
    scryptParams = scrypt.params(0.1),

    // validation
    val = require('validator'),
    schema = require('validate-obj'),

    // helpers
    config = require('./config'),
    Promise = require('bluebird');

// promisify
crypto.randomBytes = Promise.promisify(crypto.randomBytes);
crypto.pbkdf2 = Promise.promisify(crypto.pbkdf2);
scrypt.passwordHash = Promise.promisify(scrypt.passwordHash);
scrypt.verifyHashPro = function (oldHash, newHash) {
    return new Promise(function (resolve, reject) {
        scrypt.verifyHash(oldHash, newHash function (err, isValid) {
            if (err && err.err_code !== 4) {
                reject(err);
            } else {
                if (isValid) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }
        });
    });
}

////
// schema help
////
schema.register('isSecURL', schema.build(
    function (url, par) {
        return val.isURL(url, {protocols:['https'], require_protocol: true});
    }, function (it) {
        return it + " is not a URL (must be HTTPS)";
    }
));
schema.register('isAlphanumeric', schema.build(
    function (leString, par) {
        return val.isAlphanumeric(leString)
        && par ? par.length > par-1 : true
        && typeof leString === 'string';
    }, function (it, params) {
        if (params) {
            return typeof it + " is not an alphanumeric string >= " + params;
        } else {
            return it + " is not an alphanumeric string";
        }
    }
));

var clientSchema = {
    host: schema.isSecURL,
    username: schema.isAlphanumeric([5]),
    password: schema.minLength([10])
};
var serverSchema = {
    port: schema.isNumber,
    apiAuth: [{
        username: schema.isAlphanumeric([5]), password: schema.minLength([10])
    }],
    db: {
        port: schema.isNumber,
        db: schema.isAlphanumeric,
        authKey: schema.isString,
        min: schema.isNumber,
        max: schema.isNumber,
        bufferSize: schema.isNumber,
        timeoutError: 1000,
        timeoutGb: 60*1000
    },
    cluster: schema.isBool,
    https: {
        privateKey: schema.isString,
        certificate: schema.isString
    },
    oauth: {
        open: schema.isBool,
        maxKeyPerAccount: schema.isNumber
    }
};
var pluginSchema = {
    db: {
        db: schema.isAlphanumeric,
        port: schema.isNumber,
        authKey: schema.isString,
        min: schema.isNumber,
        max: schema.isNumber,
        bufferSize: schema.isNumber,
        timeoutError: 1000,
        timeoutGb: 60*1000
    },
    settings: {
        usernameMaxLength: schema.isNumber,
        userNameCaseSensitive: schema.isBool
    }
}
////
//export
////
var def = {};
def.client = function (options) {
    schema.hasErrors(options, clientSchema);
}

def.server = function (options) {
    //
}

def.plugin = function (options) {
    // check options..
    var optionErrors;
    if (options.hasOwnProperty('alsoServer')) {
        optionErrors = schema.hasErrors(options.alsoServer, serverSchema);
        if (optionErrors) {
            throw optionErrors;
        }
    }
    optionErrors = schema.hasErrors(options, pluginSchema);
    if (optionErrors) {
        throw optionErrors;
    }

    ////
    // meat
    ////
    var _p = {}, p = {};
    _p.hashPass = function (pass) {
        var salt;
        return crypto.randomBytes(32).then(function (randomBytes) {
            salt = randomBytes.toString('base64');
            return crypto.pbkdf2(new Buffer(password), salt,
                1000, // iterations
                512 // hash size
            );
        }).then(function (hash) {
            hash = hash.toString('base64');
            return scrypt.passwordHash(hash, scryptParams);
        }).then(function (finalHash) {
            return Promise.resolve(salt, finalHash);
        });
    }
    _p.db = thinky({
        db: options.alsoServer.db.db || options.db.db,
        host: 'localhost',
        authKey: options.alsoServer.db.authKey || options.db.authKey,
        port: options.alsoServer.db.port || options.db.port,
        min: options.alsoServer.db.min || options.db.min,
        max: options.alsoServer.db.max || options.db.max,
        bufferSize: options.alsoServer.db.bufferSize || options.db.bufferSize,
        timeoutError: options.alsoServer.db.timeoutError || options.db.timeoutError,
        timeoutGb: options.alsoServer.db.timeoutGb || options.db.timeoutGb
    });
    _p.Users = _p.db.createModel("User", {
        id: String,
        username: {
            _type: String,
            validator: function (name) {
                return name.length >= 3
                && name.length <= options.settings.usernameMaxLength || 256
                && val.isAlphanumeric(name)
            }
        },
        passHash: {
            _type: String,
            validator: function (hash) {
                return hash.length === 128;
            }
        },
        passSalt: {
            _type: String,
            validator: function(salt) {
                return salt.length === 44;
            }
        },
        lockupVersion: {
            _type: Number,
            default: 1
        },
        created: {
            _type: Date,
            default: r.now(),
            options: {
                enforce_extra: false
            }
        }
    }, {
        enforce_type: 'strict',
        enforce_extra: true
    });
    _p.Users.ensureIndex('username');

    p.isExistantUsername = function (username) {
        return _p.Users.getAll(!options.settings.userNameCaseSensitive
            ? username.toLowerCase() : username, {index: 'username'}
        ).pluck('username').run().then(function (dupe) {
            console.l(dupe.length, '<- that should be undefined or 0');
            if (dupe.length) {
                return true;
            } else {
                return false;
            }
        });
    };
    p.getId = function (username) {
        _p.Users.getAll(!options.settings.userNameCaseSensitive
            ? username.toLowerCase() : username, {index: 'username'}
        ).pluck('id').run();
    }
    p.addUser = function (username, password) {
        var newUser = {
            username: !options.settings.userNameCaseSensitive
            ? username.toLowerCase() : username
        };
        return p.isExistantUsername(username).then(function (bool) {
            if (!bool) {
                return _p.hashPass(password);
            } else {
                throw new ExistingUserErr(username);
            }
        }).then(function (salt, finalHash) {
            newUser.passHash = finalHash;
            newUser.passSalt = salt;

            return _p.Users.save(newUser);
        });
    };
    p.getUserInfo = function (id) {
        return _p.Users.get(id).without(
            'passHash',
            'passSalt',
            'lockupVersion'
        ).run();
    };
    p.isCorrectCredentials = function (username, password) {
        return _p.Users.getAll(username, {index: 'username'}).pluck(
            'passHash',
            'passSalt'
        ).run().then(function (user) {
            console.l(user, "<- this should be a single object");
            if (user.length) {
                throw new NonExistingUserErr(username);
            }
            return crypto.pbkdf2(new Buffer(password), salt,
                1000, // iterations
                512 // hash size
            );
        }).then(function (hash) {
            return scrypt.verifyHashPro(user.passHash, hash.toString('base64'));
        });
    };
    p.changePassword = function (id, newPass) {
        return _p.hashPass(newPass).then(function (newSalt, newHash) {
            return _p.Users.get(id).update({
                "passHash": newHash,
                "passSalt": newSalt
            }).run();
        });
    }

    return p;
}

////
// Custom errors
////
/*
    there seems to be a lot of "right" ways to do this. I decided that I would
    use the way provided by MDN, they seem reliable :)
    http://goo.gl/1qvOzK
*/
function ExistingUserErr(message) {
  this.name = "ExistingUserErr";
  this.message = message || "Existing user with that name";
}
ExistingUserErr.prototype = new Error();
ExistingUserErr.prototype.constructor = ExistingUserErr;

function NonExistingUserErr(message) {
  this.name = "NonExistingUserErr";
  this.message = message || "Existing user with that name";
}
NonExistingUserErr.prototype = new Error();
NonExistingUserErr.prototype.constructor = NonExistingUserErr;