const express = require('express');
const path = require('path');

const { connectDB } = require("./config/db");

const server = express();


server.set("view engine", "ejs");

server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());


server.use('/home', require('./routes/home-route'))
server.use('/account', require('./routes/account-route'))
server.use('/user', require('./routes/user-route'))
server.use('/upload', require('./routes/upload-route'))
server.use('/fullpost', require('./routes/fullpost-route'))
server.use('/delete', require('./routes/delete-route'))
server.use('/vote', require('./routes/vote-route'))


server.get("/", (req, res) => res.redirect("/home"))





connectDB().then(() => { //startServer
  const hostname = 'localhost'
  const port = 8000
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    // console.log(`dirname: ${__dirname}`)
  });
});