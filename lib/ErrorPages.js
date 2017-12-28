const ErrorPages = {

    handle404: (req, res) => {
        res.statusCode = 404;
        res.end("Not found");
    },

    handle501: (req, res) => {
        res.statusCode = 501;
        res.end("Unsupported http method!");
    },

    handleUnsupportedContentType: (req, res) => {
        res.statusCode = 500;
        res.end("Unsupported content type");
    }

};

module.exports = ErrorPages;