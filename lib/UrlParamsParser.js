const UrlParamsParser = {

    parse: (urlParamsString) => {
        let kvs = urlParamsString.split("&");
        let params = {};
        for (let kvString of kvs) {
            let kv = kvString.split("=");
            params[kv[0]] = kv[1];
        }
        return params;
    }
};

module.exports = UrlParamsParser;