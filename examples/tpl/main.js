const Server = require("../../index");
const path = require("path");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    await res.render("index.twig", { name: "yunp" });
});