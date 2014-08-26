// depends
var // http
    express = require('express'),
    request = require('request'),
    https = require('https'),
    httpAuth = require('basic-auth'),

    // schema
    schema = require('./module/objSchema'),

    // system
    fs = require('fs'),

    // helpers
    config = require('./config'),
    Promise = require('bluebird'),

    plugin = require('./plugin.js');

var def = function (options, api) {
    // check options
    var optionErrors = schema.check(options, schema.serverSchema);
    if (optionErrors) {
        throw new BadOptionsErr(optionErrors);
    }

    ////
    // meat
    ////
    if (!api) {
        api = plugin(options.db);
    }
    var httpsOptions = {
            key: fs.readFileSync(options.https.privateKey),
            cert: fs.readFileSync(options.https.certificate)
        },
        app = express();
    app.use(function (req, res, next) {
        var creds = httpAuth(req);
        if (creds) {
            for (var i = 0; i < options.apiAuth.length; i++) {
                if (options.apiAuth[i].username === creds.name
                    && options.apiAuth[i].password === creds.pass) {
                    next();
                    break;
                } else if (i === options.apiAuth.length - 1) {
                    res.status(401).end();
                }
            }
        } else {
            res.status(401).end();
        }
    });
    app.get('/api/isExistantUsername/:username', function (req, res) {
        api.isExistantUsername(req.params.username).then(function (bool) {
            res.status(200).json(result: bool);
        }).catch(function (err) {
            res.status(500).json(err: err);
        });
    });
    app.get('/api/getId/:username', function (req, res) {
        api.getId(req.params.username).then(function (id) {
            res.status(200).json(result: id);
        }).catch(function (err) {
            res.status(500).json(err: err);
        });
    });
    app.get('/api/addUser/:username/:password', function (req, res) {
        api.addUser(req.params.username, decodeURIComponent(req.params.password))
        .then(function (argument) {
            // body...
        })
    })
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
  this.message = message || "User did not exist";
}
NonExistingUserErr.prototype = new Error();
NonExistingUserErr.prototype.constructor = NonExistingUserErr;

function BadOptionsErr(message) {
  this.name = "BadOptionsErr";
  this.message = message || "Existing user with that name";
}
BadOptionsErr.prototype = new Error();
BadOptionsErr.prototype.constructor = BadOptionsErr;