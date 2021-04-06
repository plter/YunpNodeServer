const Server = require("../../index");
const path = require("path");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    await res.render(path.join(__dirname, "tpls", "index.twig"), { name: "yunp" });
});