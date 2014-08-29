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
        return Users.getAll(username.toLowerCase(), {index: 'username'}
        ).pluck('id').execute().then(function (cursor) {
            return cursor.toArray();
        }).then(function (user) {
            if (!user[0].id) {
                throw new er.NonExistingUserErr(username);
            }
            return user[0].id;
        }).catch(function (err) {
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
        }).then(function (saltAndHash) {
            newUser.passHash = saltAndHash[1];
            newUser.passSalt = saltAndHash[0];

            return Users.save(newUser);
        }).then(function (res) {
            return res[0].id;
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
        ).execute().then(function (cursor) {
            return cursor.toArray();
        }).then(function (user) {
            if (!user.length) {
                throw new er.NonExistingUserErr(username);
            }
            return checkPass(user[0].passHash, password, user[0].passSalt);
        }).catch(function (err) {
            if (err instanceof er.PassHashErr || err instanceof er.NonExistingUserErr) {
                throw err;
            } else {
                throw new er.DatabaseErr('isCorrectCredentials', err);
            }
        });
    };
    p.changePassword = function (id, newPass) {
        return hashPass(newPass).then(function (saltAndHash) {
            return Users.get(id).update({
                "passHash": saltAndHash[1],
                "passSalt": saltAndHash[0]
            }).execute().then(function () {
                return null;
            }).catch(function (err) {
                console.l(err)
                if (!(err instanceof er.PassHashErr)) {
                    throw new er.DatabaseErr('changePassword', err);
                } else {
                    throw err;
                }
            });
        });
    };
    p.deleteUser = function (id) {
        return Users.get(id).delete().execute().then(function (res) {
            if (res.skipped) {
                throw new er.NonExistingUserErr(id);
            }
            return null;
        }).catch(function (err) {
            if (err instanceof er.NonExistingUserErr) {
                throw err;
            } else {
                throw new er.DatabaseErr('deleteUser', err);
            }
        });
    };
    p.changeUsername = function (id, newUsername) {
        p.isExistantUsername(newUsername).then(function (bool) {
            if (!bool) {
                throw new er.NonExistingUserErr(newUsername);
            } else {
                return Users.get(id).update({
                    username: newUsername.toLowerCase(),
                    displayName: newUsername
                }).execute();
            }
        }).then(function () {
            return null;
        }).catch(function (err) {
            throw new er.DatabaseErr('changeUsername', err);
        });
    }

    if (options.alsoServer) {
        p.server = ldServer(options.alsoServer, p);
    };

    return p;
}