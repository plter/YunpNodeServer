const ErrorPages = {

    handle404: (req, res) => {
        res.statusCode = 404;
        res.end("Not found");
    },

    handle501: (req, res) => {
        res.statusCode = 501;
        res.end("Unsupported http method!");
    },

    handle503: (req, res) => {
        res.statusCode = 503;
        res.end("Service Unavailable");
    },

    handleUnsupportedContentType: (req, res) => {
        res.statusCode = 500;
        res.end("Unsupported content type");
    },

    handleCannotListContent: (req, res) => {
        res.statusCode = 200;
        res.end("Can not list content");
    }

};

module.exports = ErrorPages;