const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/user", (req, res) => {
    res.end(JSON.stringify(req.params));
});