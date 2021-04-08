const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    req.session("count", (req.session('count') || 0) + 1);
    await res.write(`Count ${req.session('count')}`);
});