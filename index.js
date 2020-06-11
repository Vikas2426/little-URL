require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");
const yup = require("yup");
const { nanoid } = require("nanoid");
const mongoose = require("mongoose");
const Url = require("./schema.js");

//MongoDB connection
mongoose.connect(
  process.env.MONGODB_URI || "mongodb://localhost:27018/littleUrl",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const app = express();
app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(cors());
app.use(express.static("./public"));

//Schema for request body
const reqSchema = yup.object().shape({
  slug: yup
    .string()
    .trim()
    .matches(/[\w\-]/i),
  url: yup.string().trim().url().required(),
});

//Create a new document and save the slug and URL in it
function saveToDB(slug, url) {
  const newURL = new Url({
    slug,
    url,
  });
  newURL.save();
}


app.get('/admin2712', async (req, res) => {   //get all DB entries
  try {
    const allUrls = await Url.find();
    if (allUrls.length != 0) {
      res.send(allUrls);
    }
    else {
      res.send("No url shortcuts present");
    }

  } catch (error) {
    res.json({
      message: error.message
    })
  }
});

//handle new URL shortening request
app.post("/url", async (req, res, next) => {
  console.log(req.body);
  let { slug, url } = req.body;
  try {
    await reqSchema.validate({ slug, url });  //validate the request body

    if (!slug) {                   //if request body has no slug then generate one
      slug = nanoid(5);
    }

    slug = slug.toLowerCase();
    const slugExists = await Url.findOne({ slug });

    if (slugExists) {           //if received slug already exists in DB then send error msg
      res.status(400);
      res.json({
        message: `Provided shortcut already exists for another url.
            Please enter new shortcut.`,
        slug,
        url
      });
    } else {                    //if received slug does not exist in DB then save and send reply
      saveToDB(slug, url);
      res.json({
        shortUrl: `http://localhost:3000/${slug}`
      });
    }
  } catch (error) {
    next(error);
  }
});

app.get("/:slug", async (req, res) => {
  const { slug } = req.params;
  const doc = await Url.findOne({ slug });
  if (doc) {
    res.redirect(doc.url);
  }
  else {
    res.send("Url not valid. Create shortcut.")
  }
})

app.use(require("./middlewares"));

// app.get("/:id", (req, res) => {});

const port = process.env.PORT || 5000;

app.listen(port, (error) => {
  if (!error) {
    console.log(`Server started and listening on port ${port} !!`);
  } else {
    console.log(error);
  }
});