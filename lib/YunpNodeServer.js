const http = require("http");
const https = require("https");
const fs = require("fs");
const ErrorPages = require("./ErrorPages");
const Parsers = require("./Parsers");
const yfs = require("./promises/YunpFS");
const nodePathTool = require("path");
const Response = require("./http/Response");
const log4js = require("log4js");
const Request = require("./http/Request");
const cookie = require('cookie');
const socketio = require("socket.io");
const url = require("url");
const path = require("path");
const YnsHandler = require("./YnsHandler");


class YunpNodeServer {
    get defaultDocument() {
        return this._defaultDocument;
    }

    get options() {
        return this._options;
    }

    /**
     *
     * @param options
     */
    constructor(options = { port: 9000, staticRoot: "", defaultDocument: "", logLevel: "", tplRoot: "", sslCert: "", sslKey: "" }) {
        this._port = options.port || 9000;
        this._staticRoot = options.staticRoot || "/static";
        this._defaultDocument = options.defaultDocument || "index.html";
        this._pages = [];
        this._options = options;
        this._tplRoot = options.tplRoot || "tpls";
        this._sslCert = options.sslCert;
        this._sslKey = options.sslKey;

        this._log = log4js.getLogger("YNS");
        this._log.level = options.logLevel || "debug";
    }

    get log() {
        return this._log;
    }

    get tplRoot() {
        return this._tplRoot;
    }

    get sslCert() {
        return this._sslCert;
    }

    get sslKey() {
        return this._sslKey;
    }

    addPage(requestUri, pageCallback) {
        let that = this;
        this._pages.push({
            requestUri,
            pageCallback,
            async callback(node_req, node_res) {
                try {
                    let response = new Response(that, node_res);
                    let request = new Request(that, node_req, node_res);

                    await this.pageCallback(request, response);
                    await response.end();
                } catch (e) {
                    that.log.error(e);
                    ErrorPages.handle503(node_req, node_res);
                }
            }
        });
    }

    serve() {
        if (this.sslCert && this.sslKey) {
            this._relatedNodeServer = https.createServer({
                cert: this.sslCert,
                key: this.sslKey
            }, YnsHandler.bind(this));
        } else {
            this._relatedNodeServer = http.createServer(YnsHandler.bind(this));
        }
        this._socketIO = socketio(this._relatedNodeServer);
        this._relatedNodeServer.listen(this._port, () => {
            console.log(`Server started at port ${this.port}`);
        });
    }

    /**
     * Get the socket.io object
     */
    get socketIO() {
        return this._socketIO;
    }

    /**
     * Get the related node server instance
     */
    get relatedNodeServer() {
        return this._relatedNodeServer;
    }

    get port() {
        return this._port;
    }

    get staticRoot() {
        return this._staticRoot;
    }
}

module.exports = YunpNodeServer;