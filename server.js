const express = require('express');
const session = require('express-session');
const path = require('path');
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./utils/utils");

const server = express();


server.set("view engine", "ejs");

server.use(express.urlencoded({ extended: true }));
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());

const secret = process.env.SECRET;
server.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));

server.use('/home', require('./routes/home-route'));
server.use('/account', require('./routes/account-route'));
server.use('/user', require('./routes/user-route'));
server.use('/upload', require('./routes/upload-route'));
server.use('/fullpost', require('./routes/fullpost-route'));
server.use('/delete', require('./routes/delete-route'));
server.use('/vote', require('./routes/vote-route'));


server.get("/", (req, res) => res.redirect("/home"));
server.get("/index.html", (req, res) => res.redirect("/home"));


server.all('/:a', (req, res) => res.render('error', {error: "Unknown route"}));



connectDB().then(() => { //startServer
  const port = process.env.PORT || 8000;
  const hostname = (process.env.NODE_ENV === 'production') ? '0.0.0.0' : 'localhost';
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`)
    // console.log(`dirname: ${__dirname}`)
  });
});