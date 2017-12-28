class YunpNodeServerOptions {
    get port() {
        return this._port;
    }

    set port(value) {
        this._port = value;
    }

    get staticRoot() {
        return this._staticRoot;
    }

    set staticRoot(value) {
        this._staticRoot = value;
    }

    get defaultDocument() {
        return this._defaultDocument;
    }

    set defaultDocument(value) {
        this._defaultDocument = value;
    }

    constructor(port = 9000, staticRoot = "/static", defaultDocument = "index.html") {
        this._port = port;
        this._staticRoot = staticRoot;
        this._defaultDocument = defaultDocument;
    }
}

module.exports = YunpNodeServerOptions;