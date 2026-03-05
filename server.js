const express = require('express');
const path = require('path');

const { connectDB } = require("./config/db");

const server = express();

server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));

server.set("view engine", "ejs");




const mainRoutes = require("./routes/main-routes");
server.use('/', mainRoutes);




connectDB().then(() => { //startServer
  const hostname = 'localhost'
  const port = 8000
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    // console.log(`dirname: ${__dirname}`)
  });
});