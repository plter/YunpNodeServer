const util = require("util");
const Twig = require("twig");
const path = require("path");

class Response {
    constructor(yns, node_res) {
        this._yns = yns;
        this._node_res = node_res;
        this._node_res_write_async = util.promisify(this._node_res.write.bind(this._node_res));
        this._node_res_end_async = util.promisify(this._node_res.end.bind(this._node_res));
    }

    get yns() {
        return this._yns;
    }

    async write(data, encoding) {
        return await this._node_res_write_async(data, encoding);
    }

    async end(data, encoding) {
        return await this._node_res_end_async(data, encoding);
    }

    async render(tpl, data) {
        let that = this;
        let text = await new Promise((resolve, reject) => {
            Twig.renderFile(path.join(that.yns.tplRoot, tpl), data, (err, result) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            });
        });
        await this.write(text);
    }

    setHeader(name, value) {
        this._node_res.setHeader(name, value);
        return this;
    }

    redirect(location) {
        this._node_res.writeHead(302, {
            'Location': location
        });
    }
}

module.exports = Response;