const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    req.cookie("count", parseInt(req.cookie('count') || "0") + 1);
    await res.write(`Count ${req.cookie('count')}`);
});