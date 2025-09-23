const mongoose = require("mongoose");

const heroSectionSchema = new mongoose.Schema({
  heading: String,
  title: String,
  subheading: String,
  category: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceCategory", 
    required: true
  },
  subcategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceCategory"
  },
  subsubcategory: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "ServiceCategory"
  },
  slug: String,
  isVisible: { type: Boolean, default: true },
  headingType: { type: String, enum: ["main", "sub", "subsub"] },
  createdAt: { type: Date, default: Date.now },
}, {
  autoIndex: false // Disable automatic index creation
});

// Create indexes with explicit names
heroSectionSchema.index({ category: 1 }, { name: "category_idx", background: true });
heroSectionSchema.index({ subcategory: 1 }, { name: "subcategory_idx", background: true });
heroSectionSchema.index({ subsubcategory: 1 }, { name: "subsubcategory_idx", background: true });
heroSectionSchema.index(
  { category: 1, subcategory: 1, subsubcategory: 1 },
  { name: "compound_idx", background: true }
);

const HeroSection = mongoose.model("HeroSection", heroSectionSchema);

// Function to handle index creation
async function initializeIndexes() {
  try {
    // Drop existing indexes first
    try {
      await HeroSection.collection.dropIndexes();
      console.log('Dropped existing indexes');
    } catch (dropError) {
      if (dropError.codeName !== 'NamespaceNotFound') {
        throw dropError;
      }
    }
    
    // Create new indexes
    await HeroSection.createIndexes();
    console.log('Created new indexes');
  } catch (err) {
    console.error('Error initializing indexes:', err);
  }
}

// Run the initialization
initializeIndexes();

module.exports = HeroSection;