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

////
//export
////

def.plugin = function (options) {
    ////
    // meat
    ////
    var _p = {}, p = {};
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