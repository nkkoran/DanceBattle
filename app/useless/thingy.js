function partial(fn, j) {
return function accessor(d, i) {
return fn(d, i, j);
};
} // end FUNCTION partial()

similarity = function(x, y, clbk) {
    var a, b, c;
    if (!isArray(x)) {
        throw new TypeError('cosine-similarity()::invalid input argument. First argument must be an array. Value: `' + x + '`.');
    }
    if (!isArray(y)) {
        throw new TypeError('cosine-similarity()::invalid input argument. Second argument must be an array. Value: `' + y + '`.');
    }
    if (arguments.length > 2) {
        if (!isFunction(clbk)) {
            throw new TypeError('cosine-similarity()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.');
        }
    }
    if (x.length !== y.length) {
        throw new Error('cosine-similarity()::invalid input argument. Input arrays must have the same length.');
    }
    if (!x.length) {
        return null;
    }
    if (clbk) {
        a = dot(x, y, clbk);
        b = l2norm(x, partial(clbk, 0));
        c = l2norm(y, partial(clbk, 1));
    } else {
        a = dot(x, y);
        b = l2norm(x);
        c = l2norm(y);
    }
    return a / (b * c);
} // end FUNCTION similarity()

function dot(x, y, clbk) {
    if (!isArray(x)) {
        throw new TypeError('dot()::invalid input argument. First argument must be an array. Value: `' + x + '`.');
    }
    if (!isArray(y)) {
        throw new TypeError('dot()::invalid input argument. Second argument must be an array. Value: `' + y + '`.');
    }
    if (arguments.length > 2) {
        if (!isFunction(clbk)) {
            throw new TypeError('dot()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.');
        }
    }
    var len = x.length,
        sum = 0,
        i;

    if (len !== y.length) {
        throw new Error('dot()::invalid input argument. Arrays must be of equal length.');
    }
    if (!len) {
        return null;
    }
    if (clbk) {
        for (i = 0; i < len; i++) {
            sum += clbk(x[i], i, 0) * clbk(y[i], i, 1);
        }
    } else {
        for (i = 0; i < len; i++) {
            sum += x[i] * y[i];
        }
    }
    return sum;
} // end FUNCTION dot()

function l2norm(arr, clbk) {
    if (!isArray(arr)) {
        throw new TypeError('l2norm()::invalid input argument. Must provide an array.  Value: `' + arr + '`.');
    }
    if (arguments.length > 1) {
        if (!isFunction(clbk)) {
            throw new TypeError('l2norm()::invalid input argument. Accessor must be a function. Value: `' + clbk + '`.');
        }
    }
    var len = arr.length,
        t = 0,
        s = 1,
        r,
        val,
        abs,
        i;

    if (!len) {
        return null;
    }
    if (clbk) {
        for (i = 0; i < len; i++) {
            val = clbk(arr[i], i);
            abs = (val < 0) ? -val : val;
            if (abs > 0) {
                if (abs > t) {
                    r = t / val;
                    s = 1 + s * r * r;
                    t = abs;
                } else {
                    r = val / t;
                    s = s + r * r;
                }
            }
        }
    } else {
        for (i = 0; i < len; i++) {
            val = arr[i];
            abs = (val < 0) ? -val : val;
            if (abs > 0) {
                if (abs > t) {
                    r = t / val;
                    s = 1 + s * r * r;
                    t = abs;
                } else {
                    r = val / t;
                    s = s + r * r;
                }
            }
        }
    }
    return t * Math.sqrt(s);
} // end FUNCTION l2norm()

function isArray(value) {
    return Object.prototype.toString.call(value) === '[object Array]';
} // end FUNCTION isArray()

function isFunction(value) {
    return (typeof value === 'function');
} // end FUNCTION isFunction()

console.log(similarity([1, 2], [4, 5]));