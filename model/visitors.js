const mongoose = require("mongoose");

const visitorSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: "main", 
    },
    allVisits: {
      type: Number,
      default: 0,
    },
    uniqueVisits: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Visit", visitorSchema);
