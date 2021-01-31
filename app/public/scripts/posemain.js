var net;
var customWeights = [ 5 , 1 , 1 , 1 , 1 , 3 , 3 , 8 , 8 , 10 , 10 , 6 , 6 , 0 , 0 , 0 , 0]

// 0   nose
// 1   leftEye
// 2   rightEye
// 3   leftEar
// 4   rightEar
// 5   leftShoulder
// 6   rightShoulder
// 7   leftElbow
// 8   rightElbow
// 9   leftWrist
// 10  rightWrist
// 11  leftHip
// 12  rightHip
// 13  leftKnee
// 14  rightKnee
// 15  leftAnkle
// 16  rightAnkle

function normalizeCustomWeights() {
    let sum = 0;
    for (let i = 0; i < customWeights.length; ++i) {
        sum += customWeights[i];
    }
    for (let i = 0; i < customWeights.length; ++i) {
        customWeights[i] /= sum;
    }
}

async function loadModel() {
  net = await posenet.load({
      architecture: 'ResNet50',
      outputStride: 16,
      quantBytes: 4
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

async function getJW(img) {
    let joints = [], weights = [];
    model = await runModel(img);
    for (let i = 0; i < 17; ++i) {
        joints[2 * i] = model["keypoints"][i]["position"]["x"];
        joints[2 * i + 1] = model["keypoints"][i]["position"]["y"];
        weights[i] = model["keypoints"][i]["score"];
    }
    return joints.concat(weights);
}

function compare1(jw1, jw2) {
    joints1 = jw1.slice(0, 34);
    joints2 = jw2.slice(0, 34);
    for (let i = 0; i < joints1.length; ++i) {
        joints1[i] /= l2norm(joints1);
        joints2[i] /= l2norm(joints2);
    }
    return similarity(joints1, joints2);
}

function compare2(jw1, jw2) {
    joints1 = jw1.slice(0, 34);
    joints2 = jw2.slice(0, 34);
    weights1 = jw1.slice(34, 51);
    weights2 = jw2.slice(34, 51);
    normalizeCustomWeights();
    for (let i = 0; i < joints1.length; ++i) {
        joints1[i] /= l2norm(joints1);
        joints2[i] /= l2norm(joints2);
    }
    let sumW = 0, res = 0;
    for (let i = 0; i < weights1.length; ++i) {
        sumW += weights1[i];
    }
    for (let i = 0; i < weights2.length; ++i) {
        sumW += weights2[i];
    }
    for (let i = 0; i < joints1.length / 2; ++i) {
        res += customWeights[i] * (weights1[i] + weights2[i]) * (Math.abs(joints1[2*i] - joints2[2*i]) + Math.abs(joints1[2*i+1] - joints2[2*i+1]));
    }
    return 1 - 1 / sumW * res;
}

function compare3(jw1, jw2) {
    joints1 = jw1.slice(0, 34);
    joints2 = jw2.slice(0, 34);
    return similarity(joints1, joints2);
}

function dtw(jwl1, jwl2, comp) {
    console.log(comp);
    let dtw = new DynamicTimeWarping(jwl1, jwl2, comp);
    return dtw.getDistance();
}

async function testy() {
    // tl = ["A", "J", "T"];
    // tn = ["1", "2", "3", "4"];
    // testyy = [], hehe = [];
    // for (let i = 0; i < tl.length; ++i) {
    //     for (let j = 0; j < tn.length; ++j) {
    //         testyy.push(tl[i] + tl[i] + "_" + tn[j] + ".png");
    //     }
    // }
    // for (let i = 0; i < 10; ++i) {
    //     let a = document.getElementById(testyy[i]);
    //     let jw = await getJW(a);
    //     hehe.push(jw);
    // }
    // jwl1 = hehe.slice(0, 5);
    // jwl2 = hehe.slice(5, 10);
    // let d = dtw(jwl1, jwl2, compare);
    // console.log(d);
    
    // let a = document.getElementById("AA_7.png");
    // let jwa = await getJW(a);
    // let b = document.getElementById("AA_8.png");
    // let jwb = await getJW(b);
    // console.log(jwa);
    // console.log(jwb);
    // console.log(compare2(jwa, jwb));
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