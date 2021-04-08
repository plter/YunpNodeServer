const http = require("http");
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
    constructor(options = { port: 9000, staticRoot: "", defaultDocument: "", logLevel: "", tplRoot: "" }) {
        this._port = options.port || 9000;
        this._staticRoot = options.staticRoot || "/static";
        this._defaultDocument = options.defaultDocument || "index.html";
        this._pages = [];
        this._options = options;
        this._tplRoot = options.tplRoot || "tpls";

        this._log = log4js.getLogger("YNS");
        this._log.level = options.logLevel || "debug";
    }

    get log() {
        return this._log;
    }

    get tplRoot() {
        return this._tplRoot;
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
        this._relatedNodeServer = http.createServer(async (req, res) => {
            if (req.url.startsWith(this._staticRoot)) {
                let path = req.url.substring(1);
                let stat = await yfs.stat(path);
                if (stat) {
                    if (stat.isFile()) {
                        fs.createReadStream(path).pipe(res);
                    } else if (stat.isDirectory()) {
                        let defaultDocPath = nodePathTool.join(path, this.defaultDocument);
                        stat = await yfs.stat(defaultDocPath);
                        if (stat && stat.isFile()) {
                            fs.createReadStream(defaultDocPath).pipe(res);
                        } else {
                            ErrorPages.handleCannotListContent(req, res);
                        }
                    } else {
                        ErrorPages.handle404(req, res);
                    }
                } else {
                    ErrorPages.handle404(req, res);
                }
            } else if (req.url.startsWith("/favicon.ico")) {
                ErrorPages.handle404(req, res);
            } else {
                let pages = this._pages.filter(value => req.url.startsWith(value.requestUri));
                if (pages.length) {
                    let page = pages[0];

                    let index = req.url.indexOf("?");
                    if (index > -1) {
                        let queryString = req.url.substring(index + 1);
                        Parsers.parseUrlParams(req, res, queryString);
                    }

                    switch (req.method) {
                        case "GET":
                            page.callback(req, res);
                            break;
                        case "POST":
                            let buffer = Buffer.alloc(0);
                            // TODO limit the post size
                            req.on("data", data => {
                                buffer = Buffer.concat([buffer, data]);
                            });
                            req.on("end", () => {
                                req.bodyData = buffer;
                                let contentType = req.headers['content-type'];
                                if (contentType.startsWith("application/x-www-form-urlencoded")) {
                                    Parsers.parseUrlParams(req, res, buffer.toString());
                                    page.callback(req, res);
                                } else if (contentType.startsWith("text/plain")) {
                                    req.body = buffer.toString();
                                    page.callback(req, res);
                                } else if (contentType.startsWith("multipart/form-data")) {
                                    Parsers.parseFormData(req, res);
                                    page.callback(req, res);
                                } else {
                                    ErrorPages.handleUnsupportedContentType(req, res);
                                }
                            });
                            break;
                        default:
                            ErrorPages.handle501(req, res);
                            break;
                    }
                } else {
                    ErrorPages.handle404(req, res);
                }
            }
        });
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