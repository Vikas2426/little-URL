const mongoose = require("mongoose");

const dbSchema = new mongoose.Schema({
  slug: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
});

const Url = new mongoose.model("URL", dbSchema);

module.exports = Url;
