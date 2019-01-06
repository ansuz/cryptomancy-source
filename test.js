var source = require(".");

var timer = function () {
    var start = +new Date();
    return function () { return +new Date() - start; };
};

var ROUNDS = 1000000;
[
    'deterministic', // 1000000 deterministic samples taken in 9170ms
    'insecure', // 1000000 insecure samples taken in 69ms
    'secure', // 1000000 secure samples taken in 6219ms
].forEach(function (k, i) {
    var end = timer();
    var src = source[k](523);
    var i = ROUNDS;
    while (i--) { src(); }
    console.log("%s %s samples taken in %sms", ROUNDS, k, end());
});

