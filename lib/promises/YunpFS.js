let nodeFs = require("fs");

const Promises = {
    stat: path => {
        return new Promise((resolve, reject) => {
            nodeFs.stat(path, result => resolve(result));
        });
    }
};

module.exports = Promises;