const cookie = require("cookie");
const uuid = require("uuid");
const MemorySessionStorage = require("./MemorySessionStorage");
const YNS2SID_KEY = "yns2sid";

class Request {

    constructor(yns, node_req, node_res) {
        this._yns = yns;
        this._node_req = node_req;
        this._node_res = node_res;
        this._cookies = cookie.parse(node_req.headers.cookie || '') || {};

        let sid = this.cookie(YNS2SID_KEY);
        if (!sid) {
            sid = uuid.v4().replace(/-/g, "");
            this.cookie(YNS2SID_KEY, sid);
        }
        this._session = MemorySessionStorage.session(sid);
        if (!this._session) {
            this._session = new Map();
            MemorySessionStorage.session(sid, this._session);
        }
    }

    /**
     * Only send name to get a session value, send name and value to set a session value, leave all arguments undefined to get the session Map object
     * @param {*} name 
     * @param {*} value 
     * @returns 
     */
    session(name, value) {
        if (name) {
            if (!value) {
                return this._session.get(name);
            } else {
                this._session.set(name, value);
            }
        } else {
            return this._session;
        }
    }

    get cookies() {
        return this._cookies;
    }

    get body() {
        return this._node_req.body;
    }

    get files() {
        return this._node_req.files;
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