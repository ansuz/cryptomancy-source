var util = require("cryptomancy-util");
var nacl = require("tweetnacl");

/* implement different flavours of 'randomness'

1. cheap randomness, to be used for non-critical values
2. secure randomness, to be used for values which absolutely must be evenly distributed and unguessable
3. deterministic randomness, to be used where the stream of bytes must be reproduceable

all three flavours have the same behaviour:

return a function which returns a number between 0 and MAX_SAFE_INTEGER -1

Source.deterministic is notable because it requires a 'seed' for initialization */

var Source = module.exports;

var insecure = function () {
    return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
};

Source.insecure = function () {
    return insecure;
};

Source.insecure._ = Source.insecure();

Source.secure = function () {
    return function () {
        return util.int_from_buffer(nacl.randomBytes(7));
    };
};

Source.bytes = {};
Source.bytes.secure = function () {
    return nacl.randomBytes;
};

Source.bytes.insecure = function () {
    return function (n) {
        var A = new Uint8Array(n);
        for (var i = 0; i < n; i++) { A[i] = Math.floor(Math.random() * 256); }
        return A;
    };
};

Source.secure._ = Source.secure();

var det_buffer = Source.bytes.deterministic = function (seed) {
    var buffer;
    if (typeof(seed) === 'number') {
        buffer = util.slice(nacl.hash(util.buffer_from_int(seed)));
    } else if (Array.isArray(seed) || seed instanceof(Uint8Array)) {
        buffer = util.slice(nacl.hash(new Buffer(seed)));
    } else {
        throw new Error('expected number, array, or Uint8Array');
    }

    var chunk = 32;
    return function take (n) { // take a random integer
        if (buffer.length < 128 || buffer.length <= n) {
            util.push(buffer, util.slice(nacl.hash(new Uint8Array(buffer))));
        }

        if (n > chunk) {
            var parts = Math.floor(n / chunk);
            var rem = n - (parts * chunk);

            var res = [];
            for (var i = 0; i < parts; i++) { res.push(chunk); }
            res.push(rem);

            var x = util.concat(res.map(function (part) {
                return take(part);
            }));

            return x;
        }

        var temp = buffer.slice(0, n);
        buffer.splice(0, n);
        return new Uint8Array(temp);
    };
};

Source.deterministic = function (seed) {
    var bytes = Source.bytes.deterministic(seed);

    return function () {
        return util.int_from_buffer(bytes(7));
    };
};

