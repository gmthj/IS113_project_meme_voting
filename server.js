<<<<<<< HEAD
const express = require('express');
const session = require('express-session');
const path = require('path');
=======
const express = require("express");
const session = require("express-session");
const path = require("path");
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./utils/utils");

const server = express();

server.set("view engine", "ejs");

server.use(express.urlencoded({ extended: true, limit: "5mb" }));
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());

const secret = process.env.SECRET;
<<<<<<< HEAD
server.use(session({
    secret: secret,
    resave: false,
    saveUninitialized: false
}));
=======
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8

server.use(
  session({
    secret: secret,
    resave: false,
    saveUninitialized: false,
  }),
);

server.use("/home", require("./routes/home-route"));
server.use("/account", require("./routes/account-route"));
server.use("/user", require("./routes/user-route"));
server.use("/upload", require("./routes/upload-route"));
server.use("/fullpost", require("./routes/fullpost-route"));
server.use("/delete", require("./routes/delete-route"));
server.use("/vote", require("./routes/vote-route"));

<<<<<<< HEAD
server.get("/", (req, res) => res.redirect("/home"));
server.get("/index.html", (req, res) => res.redirect("/home"));
=======
// #################################
// TODO: remove after login implemented
const { getUserByEmail } = require("./services/userService");
server.get("/testlogin/:userEmail", async (req, res) => {
  const userEmail = req.params.userEmail;
  const sessionUser = await getUserByEmail(userEmail);
  req.session.sessionUser = sessionUser;
  res.redirect("/home");
});
// #################################
>>>>>>> 112a76e8974af3150b5001d8f1f701e962e1a5a8

server.get("/", (req, res) => {
  // console.log("/home - sessionUser:", req.session)
  res.redirect("/home");
});
server.get("/index.html", (req, res) => res.redirect("/home"));

server.all("/:a", (req, res) => {
  const sessionUser = req.session.sessionUser || {};
  res.render("error", { error: "Unknown route", sessionUser });
});

connectDB().then(() => {
  //startServer
  const port = 8000;
  const hostname = "localhost";
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
    // console.log(`dirname: ${__dirname}`)
  });
});
