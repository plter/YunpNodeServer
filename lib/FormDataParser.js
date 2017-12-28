const FormDataParser = {
    parse: (req, res) => {
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
                                req.params[name] = bodyBuffer.toString();
                            } else {
                                req.files = req.files || {};
                                req.files[name] = {fileName: fileName, data: bodyBuffer};
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

module.exports = FormDataParser;