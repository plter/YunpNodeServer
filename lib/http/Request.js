const cookie = require("cookie");

class Request {

    constructor(yns, node_req, node_res) {
        this._yns = yns;
        this._node_req = node_req;
        this._node_res = node_res;
        this._cookies = cookie.parse(node_req.headers.cookie || '') || {};
    }

    get cookies() {
        return this._cookies;
    }

    cookie(name, value) {
        if (name) {
            if (value) {
                this._cookies[name] = value;
                this._node_res.setHeader('Set-Cookie', cookie.serialize(name, value, {
                    maxAge: 60 * 60 * 24 * 7 // 1 week
                }));
            } else {
                return this.cookies[name];
            }
        } else {
            throw new Error("Arguments error");
        }
    }
}

module.exports = Request;