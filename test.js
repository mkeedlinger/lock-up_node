var lu = require('./index');
lu = lu({
    db: 'test'
});
lu.addUser('sqfsdfsdf','sdsfsdfs').then(function (re) {
    return lu.getUserInfo(re);
}).then(function (ob) {
    console.log(ob);
}).catch(function (er) {
    console.error(er);
});