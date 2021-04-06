const Server = require("../../index");

let s = new Server();
s.serve();

s.addPage("/", async (req, res) => {
    await res.write(`Hello World`);
});