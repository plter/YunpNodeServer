const Parsers = {

    /**
     * 记录一个参数，如果同名参数已存在，则创建一个数组用于存放该参数
     * @param dist
     * @param paramName
     * @param paramValue
     */
    addParam: (dist, paramName, paramValue) => {
        let original = dist[paramName];
        if (!original) {
            dist[paramName] = paramValue;
        } else {
            if (Array.isArray(original)) {
                original.push(paramValue);
            } else {
                let a = [];
                a.push(original);
                a.push(paramValue);
                dist[paramName] = a;
            }
        }
    },

    parseUrlParams: (req, res, urlParamsString) => {
        req.params = req.params || {};
        let kvs = urlParamsString.split("&");
        for (let kvString of kvs) {
            let kv = kvString.split("=");
            Parsers.addParam(req.params, kv[0], kv[1]);
        }
        return req.params;
    },

    parseFormData: (req, res) => {
        let boundary = /multipart\/form-data; boundary=(.+)/.exec(req.headers['content-type'])[1];
        let index = req.bodyData.indexOf(boundary);
        if (index > -1) {
            while (true) {
                index += boundary.length + 2;
                let start = index;
                let end = req.bodyData.indexOf("\r\n\r\n", start);
                if (end > -1) {
                    let headerString = req.bodyData.slice(start, end).toString();
                    let nameResult = /name="([^"]+)"/.exec(headerString);
                    if (nameResult && nameResult.length >= 2) {
                        let name = nameResult[1];
                        let fileNameResult = /filename="([^"]+)"/.exec(headerString);
                        let fileName;
                        if (fileNameResult && fileNameResult.length >= 2) {
                            fileName = fileNameResult[1];
                        }

                        start = end + 4;
                        index = req.bodyData.indexOf(boundary, start);
                        if (index > -1) {
                            end = index - 4;
                            let bodyBuffer = req.bodyData.slice(start, end);

                            if (!fileName) {
                                req.params = req.params || {};
                                Parsers.addParam(req.params, name, bodyBuffer.toString());
                            } else {
                                req.files = req.files || {};
                                Parsers.addParam(req.files, name, {fileName: fileName, data: bodyBuffer});
                            }
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
        }
    }
};

module.exports = Parsers;