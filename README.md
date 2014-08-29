# Lock-Up
Easy, secure, opinionated authentication

## Features
- Crazy secure password hashing (using scrypt and PBKDF2)
- Simple API, high level of abstraction
- Easy to scale out
- Has 3 modes: plugin, server, and client
- Enforces high level security
- Uses [A+ spec](http://promisesaplus.com/) promises! (Don't know what promises are? [You're missing out!!](https://github.com/petkaantonov/bluebird#what-are-promises-and-why-should-i-use-them))

## Philosophy
My goals for this project was to create a simple API for authentication that wouldn't allow compromises in security.

Lock-Up maintains a very opinionated and secure way of managing users passwords so you don't have to. Of course, the way this module works is not without reason, so make sure to read the **Build Explanation** *(link coming soon)* on why Lock-Up is built the way it is

## Quick start
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