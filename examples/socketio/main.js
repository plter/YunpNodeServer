const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    res.redirect("/static/index.html");
});