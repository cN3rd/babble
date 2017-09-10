const statuses = require('statuses');
const deep_equals = require('deep-equals');
// debugging mode
const debug = true;

// wrapper function to allow only the use of certain methods via express.js
const onlyAllow = app => function (path, methods = ['GET'], ...callbacks) {
    app.all(path, function (req, res, next) {
        if (!methods.includes(req.method)) {
            respondWithError(res, 405, {
                expected: methods,
                method: req.method
            });
        }
        else {
            return next();
        }
    }, ...callbacks);
}

// allows json parsing
const jsonParser = function (req, res, next) {
    let rawBody = [];
    req.on('data', (chunk) => {
        rawBody.push(chunk);
    }).on('end', () => {
        req.rawBody = Buffer.concat(rawBody).toString()
        req.body = JSON.parse(req.rawBody);
        next();
    });
}

// helper function to generate page/json for errors
let respondWithError = function (res, code = 404, data = {}) {
    if (!debug) {
        res.sendStatus(code);
    }
    else {
        res.status(code).send({
            code: code,
            error: statuses[code],
            data: data
        });
    }
}

const onlyKeys = (property) => (keys) => function (req, res, next) {
    const actualKeys = Object.keys(req[property]);

    if (deep_equals(Object.keys(req[property]), keys)) {
        return next();
    }
    else {
        respondWithError(res, 400, {
            expected: keys,
            actualKeys: actualKeys
        });
    }
};


const customCheck = (checkFunc, errorMessage = "") => function (req, res, next) {
    if (checkFunc(req, res, next)) {
        return next();
    }
    else {
        respondWithError(res, 400, errorMessage);
    }
};

// only allows a given set of keys
const onlyQueryKeys = onlyKeys('query');
// only allows for a certain pattern. similar to only query keys, but for body
const onlyBodyKeys = onlyKeys('body');

// a function that burns the changes directly onto the Express app object.
let extend = app => {
    app.onlyAllow = onlyAllow(app);
    return app;
}

module.exports.respondWithError = respondWithError;
module.exports.extend = extend;
module.exports.onlyQueryKeys = onlyQueryKeys;
module.exports.onlyBodyKeys = onlyBodyKeys;
module.exports.noQueryKeys = onlyQueryKeys([]);
module.exports.noBodyKeys = onlyBodyKeys([]);
module.exports.customCheck = customCheck;
module.exports.jsonParser = jsonParser;