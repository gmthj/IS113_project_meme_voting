const express = require("express");
const session = require("express-session");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const { connectDB } = require("./utils/utils");
const { PORT, HOSTNAME } = require("./config");

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

    const imageDoc = await Image.findById(imageId).select("data mimeType");
    if (!imageDoc) {
      return res.status(404).send("Image not found");
    }

    let imageBuffer = imageDoc.data;
    // Defensive conversion in case data is returned as a plain object shape.
    if (
      !Buffer.isBuffer(imageBuffer) &&
      imageBuffer?.type === "Buffer" &&
      Array.isArray(imageBuffer.data)
    ) {
      imageBuffer = Buffer.from(imageBuffer.data);
    }

    if (!Buffer.isBuffer(imageBuffer)) {
      return res.status(500).send("Invalid image data");
    }

    res.set("Content-Type", imageDoc.mimeType || "application/octet-stream");
    res.set("Cache-Control", "public, max-age=86400");
    return res.send(imageBuffer);
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
    let backURL = req.get("Referrer") || "/";
    backURL = backURL.split("?")[0];
    // console.log(backURL)
    return res.redirect(`${backURL}`);
  } catch (error) {
    return res.render("error", { sessionUser: {}, error });
  }
});
// #################################

// catch all
server.use((req, res) => {
  const sessionUser = req.session.sessionUser || {};
  res.render("error", { error: "Unknown route", sessionUser });
});

connectDB().then(() => {
  server.listen(PORT, HOSTNAME, () => {
    console.log(
      `Adjust HOSTNAME/PORT in config.js\nServer running at http://${HOSTNAME}:${PORT}`,
    );
  });
});
