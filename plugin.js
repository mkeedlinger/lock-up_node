// depends
var //schema
    schema = require('./module/objSchema'),

    // lock-up server
    ldServer = require('./server'),

    // db
    dbConn = require('./module/dbConnection'),
    userTable = require('./module/userTable'),

    // crypto
    hashPass = require('./module/hashPass'),
    checkPass = require('./module/checkPass'),

    // helpers
    Promise = require('bluebird'),
    er = require('./module/errors');

module.exports = function (options) {
    // check options..
    var optionErrors;
    if (options.hasOwnProperty('alsoServer')) {
        optionErrors = schema.check(options.alsoServer, schema.serverSchema);
        if (optionErrors) {
            throw new er.BadOptionsErr(optionErrors);
        }
    }
    optionErrors = schema.check(options, schema.pluginSchema);
    if (optionErrors) {
        throw new er.BadOptionsErr(optionErrors);
    }

    ////
    // db meat
    ////
    var dbConn = require('./module/dbConnection')(options.db),
        Users = userTable(dbConn);

    ////
    // API
    ////
    var p = {};
    p.isExistantUsername = function (username) {
        return Users.getAll(username.toLowerCase(), {index: 'username'}
        ).pluck('username').execute().then(function (cursor) {
            return cursor.toArray();
        }).then(function (dupe) {
            // dupe is an array
            if (dupe.length) {
                return true;
            } else {
                return false;
            }
        }, function (err) {
            throw new er.DatabaseErr('isExistantUsername', err);
        });
    };
    p.getId = function (username) {
        Users.getAll(username.toLowerCase(), {index: 'username'}
        ).pluck('id').run().then(function (user) {
            console.l('if this is a list, you need to change your code', user);
            if (!user) {
                throw new er.NonExistingUserErr(username);
            }
            return user.id;
        }, function (err) {
            throw new er.DatabaseErr('getId', err);
        });
    }
    p.addUser = function (username, password) {
        var newUser = {
            username: username.toLowerCase(),
            displayName: username
        };
        return p.isExistantUsername(username).then(function (bool) {
            if (!bool) {
                return hashPass(password);
            } else {
                throw new er.ExistingUserErr(username);
            }
        }).then(function (salt, finalHash) {
            newUser.passHash = finalHash;
            newUser.passSalt = salt;

            return Users.insert(newUser).execute();
        }).then(function (res) {
            return res.generated_keys[0];
        }).catch(function (err) {
            if (!(err instanceof er.ExistingUserErr)) {
                throw new er.DatabaseErr('addUser', err);
            } else {
                throw err;
            }
        });
    };
    p.getUserInfo = function (id) {
        return Users.get(id).execute().then(function (user) {
            if (user) {
                delete user.passHash;
                delete user.passSalt;
                delete user.lockupVersion;
                delete user.username;
                return user
            } else {
                throw new er.NonExistingUserErr(id);
            }
        }).then(function (user) {
            user.username = user.displayName;
            delete user.displayName;
            return user;
        }).catch(function (err) {
            if (!(err instanceof er.NonExistingUserErr)) {
                throw new er.DatabaseErr('getUserInfo', err);
            } else {
                throw err;
            }
        });
    };
    p.isCorrectCredentials = function (username, password) {
        return Users.getAll(username.toLowerCase(), {index: 'username'}).pluck(
            'passHash',
            'passSalt'
        ).run().then(function (user) {
            console.l(user, "<- this should be a single object");
            if (user.length) {
                throw new er.NonExistingUserErr(username);
            }
            return checkPass(user.passHash, password, user.passSalt);
        }).catch(function (err) {
            if (!(err instanceof PassHashErr)) {
                throw new er.DatabaseErr('isCorrectCredentials', err);
            } else {
                throw err;
            }
        });
    };
    p.changePassword = function (id, newPass) {
        return hashPass(newPass).then(function (newSalt, newHash) {
            return Users.get(id).update({
                "passHash": newHash,
                "passSalt": newSalt
            }).run().catch(function (err) {
                if (!(err instanceof er.PassHashErr)) {
                    throw new er.DatabaseErr('changePassword', err);
                } else {
                    throw err;
                }
            });
        });
    };
    p.deleteUser = function (id) {
        return Users.get(id).delete().run().then(function (res) {
            if (res.skipped) {
                throw new er.NonExistingUserErr(id);
            }
            return res;
        }).catch(function (err) {
            throw new er.DatabaseErr('deleteUser', err);
        });
    };
    p.changeUsername = function (id, newUsername) {
        p.isExistantUsername(newUsername).then(function (bool) {
            if (bool) {
                throw new er.ExistingUserErr(newUsername);
            } else {
                return Users.get(id).update({
                    username: newUsername.toLowerCase(),
                    displayName: newUsername
                });
            }
        }).catch(function (err) {
            throw new er.DatabaseErr('changeUsername', err);
        });
    }

    if (options.alsoServer) {
        p.server = ldServer(options.alsoServer, p);
    };

    return p;
}