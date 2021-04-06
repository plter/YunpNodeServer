const util = require("util");
const Twig = require("twig");

class Response {
    constructor(node_res) {
        this._node_res = node_res;
        this._node_res_write_async = util.promisify(this._node_res.write.bind(this._node_res));
        this._node_res_end_async = util.promisify(this._node_res.end.bind(this._node_res));
    }

    async write(data, encoding) {
        return await this._node_res_write_async(data, encoding);
    }

    async end(data, encoding) {
        return await this._node_res_end_async(data, encoding);
    }

    async render(tpl, data) {
        let text = await new Promise((resolve, reject) => {
            Twig.renderFile(tpl, data, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        await this.write(text);
    }
}

module.exports = Response;