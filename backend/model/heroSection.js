const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema({
  heading: String,
  title: String,
  subheading: String,
  category: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory", required: true },
  subcategory: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
  subsubcategory: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
  slug: String,
  isVisible: { type: Boolean, default: true },
  headingType: { type: String, enum: ["main", "sub", "subsub"] },
  createdAt: { type: Date, default: Date.now },
});

// ✅ Add compound unique index
heroSectionSchema.index(
  { category: 1, subcategory: 1, subsubcategory: 1 },
  { unique: true }
);

const HeroSection = mongoose.model("HeroSection", heroSectionSchema);
module.exports = HeroSection;