const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./utils/utils");
const mongoose = require("mongoose");
const Image = require("./models/Image-model");

const server = express();

server.set("view engine", "ejs");

server.use(express.urlencoded({ extended: true, limit: "10mb" }));
server.use(express.static(path.join(__dirname, "public")));
server.use(express.json());

server.get("/media/images/:imageId", async (req, res) => {
  try {
    const { imageId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).send("Invalid image id");
    }

    const imageDoc = await Image.findById(imageId).select("data mimeType").lean();
    if (!imageDoc) {
      return res.status(404).send("Image not found");
    }

    res.set("Content-Type", imageDoc.mimeType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(imageDoc.data);
  } catch (error) {
    console.error("Image fetch error:", error);
    return res.status(500).send("Image fetch failed");
  }
});

const secret = process.env.SECRET;

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
server.use("/editcomment", require("./routes/editcomment-route"));
server.use("/delete", require("./routes/delete-route"));
server.use("/vote", require("./routes/vote-route"));
server.use("/bookmark", require("./routes/bookmark-route"));
// server.use("/preference", require("./routes/preference-route"));

server.get("/", (req, res) => res.redirect("/home"));
server.get("/index.html", (req, res) => res.redirect("/home"));

// #################################
// TODO: comment out before submission - keep for demo
const { getUserByEmail } = require("./services/userService");
server.get("/testlogin/:userEmail", async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const sessionUser = await getUserByEmail(userEmail);
    req.session.sessionUser = sessionUser;
    let backURL = req.get('Referrer') || '/';
    backURL = backURL.split("?")[0]
    // console.log(backURL)
    return res.redirect(`${backURL}`)
  }
  catch (error) {
    return res.render('error', { sessionUser: {}, error });
  }
});
// #################################

// catch all
server.use((req, res) => {
  const sessionUser = req.session.sessionUser || {};
  res.render("error", { error: "Unknown route", sessionUser });
});

connectDB().then(() => {
  const port = 8000;
  const hostname = "localhost";
  server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`);
  });
});
