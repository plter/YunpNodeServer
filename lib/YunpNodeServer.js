const http = require("http");
const fs = require("fs");
const ErrorPages = require("./ErrorPages");
const UrlParamsParser = require("./UrlParamsParser");
const FormDataParser = require("./FormDataParser");
const YunpNodeServerOptions = require("./YunpNodeServerOptions");
const yfs = require("./promises/YunpFS");
const nodePathTool = require("path");


class YunpNodeServer {
    get defaultDocument() {
        return this._defaultDocument;
    }

    get options() {
        return this._options;
    }

    /**
     *
     * @param options {YunpNodeServerOptions}
     */
    constructor(options = new YunpNodeServerOptions()) {
        this._port = options.port;
        this._staticRoot = options.staticRoot;
        this._defaultDocument = options.defaultDocument;
        this._pages = [];
        this._options = options;
    }


    addPage(requestUri, callback) {
        this._pages.push({requestUri: requestUri, callback: callback});
    }

    serve() {
        let server = http.createServer(async (req, res) => {
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
            } else {
                let pages = this._pages.filter(value => req.url.startsWith(value.requestUri));
                if (pages.length) {
                    let page = pages[0];

                    let index = req.url.indexOf("?");
                    if (index > -1) {
                        let queryString = req.url.substring(index + 1);
                        req.params = UrlParamsParser.parse(queryString);
                    }

                    switch (req.method) {
                        case "GET":
                            page.callback(req, res);
                            break;
                        case "POST":
                            let buffer = Buffer.alloc(0);
                            req.on("data", data => {
                                buffer = Buffer.concat([buffer, data]);
                            });
                            req.on("end", () => {
                                req.bodyData = buffer;
                                let contentType = req.headers['content-type'];
                                if (contentType.startsWith("application/x-www-form-urlencoded")) {
                                    req.params = UrlParamsParser.parse(buffer.toString());
                                    page.callback(req, res);
                                } else if (contentType.startsWith("text/plain")) {
                                    req.body = buffer.toString();
                                    page.callback(req, res);
                                } else if (contentType.startsWith("multipart/form-data")) {
                                    FormDataParser.parse(req, res);
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
        server.listen(this._port, () => {
            console.log(`Server started at port ${this.port}`);
        });
    }

    get port() {
        return this._port;
    }

    get staticRoot() {
        return this._staticRoot;
    }
}

YunpNodeServer.Options = YunpNodeServerOptions;
module.exports = YunpNodeServer;