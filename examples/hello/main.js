const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", (req, res) => {
    res.end(`Hello World`);
});