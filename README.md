# Lock-Up
Easy, secure, opinionated authentication

## Features
- Crazy secure password hashing (using [scrypt](https://www.npmjs.org/package/scrypt)
and [PBKDF2](http://nodejs.org/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_callback))
- Simple API, high level of abstraction
- Easy to scale out
- Has 3 modes: plugin, server, and client
- Enforces high level security
- Uses [A+ spec](http://promisesaplus.com/) promises! (Don't know what promises are?
[You're missing out!!](https://github.com/petkaantonov/bluebird#what-are-promises-and-why-should-i-use-them))
- Full encryption. Nothing goes over the wire unencrypted

## Who's this great for?
Anyone! It's designed to be easy and stay secure no matter what.

This was, however, designed especially for those who do not host their database on the
same server as their app. This can be very insecure (though most people don't know why.
Read more about the security in the explanation) and eventually leads to
the exploitation of sensitive user data! This module allows your app to be remote (not on
the database server) while remaining as secure as possible.

## Philosophy
My goal for this project was to create a simple API for authentication that wouldn't
allow compromises in security.

Lock-Up maintains a very opinionated and secure way of managing users passwords so you
don't have to. Of course, the way this module works is not without reason, so make sure
to read the
**[Build Explanation](https://github.com/mkeedlinger/lock-up_node/blob/master/EXPLANATION.md)**
on why Lock-Up is built the way it is.

**NOTE**: If something seems odd, there's probably a reason for it!
Please read the Explanation!

## Quick start ([full API](https://github.com/mkeedlinger/lock-up_node/blob/master/API.md))
Using Lock-Up in your node app is crazy easy.

```javascript
var lu = require('lock-up');
lu = lu({
    port: 8888,
    db: 'LockUp'
});

lu.addUser('username', 'password').then(function (id) {
    console.log('The new users id is: ' + id);
}).catch(function (err) {
    console.log('Oh no! A wild error approaches!', err);
});
```

This is just a quick rundown. For the full API, go **[HERE](https://github.com/mkeedlinger/lock-up_node/blob/master/API.md)**

**NOTE**: All functions return a promise. When I say 'returns', I really mean that's what you'll get when you run `.then`

- `isExistantUsername(String)` -> `Boolean`
    - Takes a username
    - Returns true or false
- `getId(String)` -> `String`
    - Takes a username
    - Returns their ID ([UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29))
- `addUser(String, String)` -> `String`
    - Takes a username and a password
    - Returns new users ID ([UUIDv4](https://en.wikipedia.org/wiki/Universally_unique_identifier#Version_4_.28random.29))
- `getUserInfo(String)` -> `Object`
    - Takes an ID
    - Returns an object with:
        - `id`: The users UUID
        - `username`: The users username
        - `createdAt`: A timestamp of when the user was created
- `isCorrectCredentials(String, String)` -> `Boolean`
    - Takes a username and password
    - Returns true or false
- `changePassword(String, String)` -> `Null`
    - Takes an ID and a password
    - Returns Null
- `deleteUser(String)` -> `Null`
    - Takes an ID
    - Returns Null
- `changeUsername(String, String)` -> `Null`
    - Takes an ID and a username
    - Returns Null

## Use cases
There are three main ways you can use this module
### As a plugin
This is the most secure way to use this plugin because there is no over the wire
communication. You probably fit this use case if:
- Your app and database can be hosted on the same server
- You don't feel the need to scale out anytime soon
Since this is the most secure and easiest to use, this is something you should really
consider

### As a server and client combo
This way is a must have if you can't host your app and the database on the same server.
You probably fit this use case if you:
- Can't host your app and the database on the same server
- Need to provide the same authentication to many app servers
- Need to scale out quickly
Even though this is "less" secure than the plugin, it's still as impregnable as you can
get and fixes a lot of common security errors found in most authentication schemes.

## Requirements
What you'll need depends on the setup you're using:

### Plugin:
- [RethinkDB](http://rethinkdb.com/) *(Read about it, you'll fall in love)*
    - [How to install](http://rethinkdb.com/docs/install/)
    - [How to keep it secure](http://rethinkdb.com/docs/security/)
- Your app must be hosted on the same server as RethinkDB

### Server and Client:
- [RethinkDB](http://rethinkdb.com/) *(For the server)*
    - [How to install](http://rethinkdb.com/docs/install/)
    - [How to keep it secure](http://rethinkdb.com/docs/security/)
- A self signed SSL private key and certificate *(for both the server and client)*
    - [Here's how](https://github.com/mkeedlinger/lock-up_node/blob/master/SSL-HOW-TO.md)
    - Think this is insecure? [Read the explanation.](https://github.com/mkeedlinger/lock-up_node/blob/master/EXPLANATION.md) It's not.

## Issues and Contributing
Find a bug? Please tell me about it! It's easy, and you can submit the bug
**[HERE](https://github.com/mkeedlinger/lock-up_node/issues)**

Have something to contribute? Great! [Fork my project](https://github.com/mkeedlinger/lock-up_node/fork)
and send me a pull request. If your code is up to par, I'll accept it!

## Todo
- Add an even tighter level of security by encrypting all data once more (on top of SSL)
- Allow plugins to add greater functionality to the API

## License
Here it is, just because...
[GNU GPL v3.0](https://github.com/mkeedlinger/lock-up_node/blob/master/LICENSE.txt)