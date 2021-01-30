var net, joints1 = [], joints2 = [], weights1 = [], weights2 = [];

async function loadModel() {
  net = await posenet.load({
      architecture: 'MobileNetV1',
      outputStride: 16,
      inputResolution: { width: 100, height: 80 },
      multiplier: 0.5,
      quantBytes: 1
  });
}

async function runModel(img) {
    const pose = await net.estimateSinglePose(img, {
      flipHorizontal: false
  });
    return pose;
}

function time(fu, args) {
    const t0 = performance.now();
    fu(args);
    const t1 = performance.now();
    console.log(t1 - t0 + "milliseconds");
}

async function getJoints(img1, img2) {
  model1 = await runModel(img1);
  model2 = await runModel(img2);
  for (let i = 0; i < 17; ++i) {
    joints1[2 * i] = model1["keypoints"][i]["position"]["x"];
    joints1[2 * i + 1] = model1["keypoints"][i]["position"]["y"];
    joints2[2 * i] = model2["keypoints"][i]["position"]["x"];
    joints2[2 * i + 1] = model2["keypoints"][i]["position"]["y"];
    weights1[i] = model1["keypoints"][i]["score"];
    weights2[i] = model2["keypoints"][i]["score"];
}
}

async function compare1() {
    console.log(similarity(joints1, joints2));
}

async function compare2() {
    let sumW = 0, res = 0;
    for (let i = 0; i < weights1.length; ++i) {
        sumW += weights1[i];
    }
    for (let i = 0; i < weights2.length; ++i) {
        sumW += weights2[i];
    }
    for (let i = 0; i < joints1.length / 2; ++i) {
        res += (weights1[i] + weights2[i]) * (Math.abs(joints1[2*i] - joints2[2*i]) + Math.abs(joints1[2*i+1] - joints2[2*i+1]));
    }
    console.log(1 / sumW * res)
}

async function testy() {
    let a = document.getElementById("stand");
    let b = document.getElementById("man");
    await getJoints(a, b);
    console.log(l2norm(joints1));
    console.log(l2norm(joints2));
    for (let i = 0; i < joints1.length; ++i) {
        joints1[i] /= l2norm(joints1);
        joints2[i] /= l2norm(joints2);
    }
    console.log(joints1);
    console.log(joints2);
    compare1();
    // compare2();
}

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