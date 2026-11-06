const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    department: {
      type: String,
      required: true
    },

    category: {
      type: String,
      enum: ["Government", "Private"],
      required: true
    },

    qualification: {
      type: String,
      required: true
    },

    salary: {
      type: String,
      default: "As per rules"
    },

    location: {
      type: String,
      default: "All India"
    },

    vacancies: {
      type: Number,
      default: 0
    },

    lastDate: {
      type: Date,
      required: true
    },

    applicationFee: {
      type: String,
      default: "As per notification"
    },

    officialNotification: {
      type: String,
      default: ""
    },

    officialApplyLink: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Job", jobSchema);