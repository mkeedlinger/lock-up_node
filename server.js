// depends
var // http
    express = require('express'),
    request = require('request'),
    https = require('https'),

    // schema
    schema = require('./module/objSchema'),

    // system
    fs = require('fs'),

    // helpers
    Promise = require('bluebird')
    er = require('./module/errors');

module.exports = function (options, api) {
    // check options
    var optionErrors = schema.check(options, schema.serverSchema);
    if (optionErrors) {
        throw new BadOptionsErr(optionErrors);
    }

    ////
    // meat
    ////
    if (api === undefined) {
        var api = require('./plugin')(options);
    }
    var httpsOptions = {
            key: fs.readFileSync(options.https.privateKey),
            cert: fs.readFileSync(options.https.certificate)
        },
        app = express();
    app.use(function (req, res, next) {
        var parts = req.headers['authorization']||'',
            creds = {};
        parts = parts.split(/\s+/).pop()||'';
        parts = new Buffer(parts, 'base64').toString();
        parts = parts.split(/:/);
        creds.name = parts[0];
        creds.pass = parts[1];

        if (creds.name && creds.pass) {
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
            res.status(200).json({result: bool});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/getId/:username', function (req, res) {
        api.getId(req.params.username).then(function (id) {
            res.status(200).json({result: id});
        }).catch(er.NonExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/addUser/:username/:password', function (req, res) {
        api.addUser(req.params.username, decodeURIComponent(req.params.password))
        .then(function (id) {
            res.status(200).json({result: id});
        }).catch(er.ExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/getUserInfo/:id', function (req, res) {
        api.getUserInfo(req.params.id).then(function (user) {
            res.status(200).json({result: user});
        }).catch(er.NonExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/isCorrectCredentials/:username/:password', function (req, res) {
        api.isCorrectCredentials(
            req.params.username,
            decodeURIComponent(req.params.password)
        ).then(function (bool) {
            res.status(200).json({result: bool});
        }).catch(er.NonExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/changePassword/:id/:password', function (req, res) {
        api.changePassword(
            decodeURIComponent(req.params.id),
            decodeURIComponent(req.params.password)
        ).then(function () {
            res.status(200).json({result: null});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/deleteUser/:id', function (req, res) {
        api.deleteUser(req.params.id).then(function () {
            res.status(200).json({result: null});
        }).catch(er.NonExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('/api/changeUsername/:id/:username', function (req, res) {
        api.changeUsername(req.params.id, req.params.username)
        .then(function () {
            res.status(200).json({result: null});
        }).catch(er.ExistingUserErr, function (err) {
            res.status(409).json({result: err});
        }).catch(function (err) {
            res.status(500).json({result: err});
        });
    });
    app.get('*', function (req, res) {
        res.status(400).json({result: "Bad API Request"});
    });

    var httpsServer = https.createServer(httpsOptions, app);
    httpsServer.listen(options.port || 8080);
}