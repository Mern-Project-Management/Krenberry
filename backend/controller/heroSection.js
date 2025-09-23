const HeroSection = require('../model/heroSection'); 
const ServiceCategory = require('../model/serviceCategory'); 

// Get HeroSection by category ID
const getHeroSectionByCategory = async (req, res) => {
  const { categoryId } = req.params; 

  try {
    const heroSection = await HeroSection.findOne({ category: categoryId }).populate('category');
    if (heroSection) {
      return res.status(200).json({
        heading: heroSection.heading,
        subheading: heroSection.subheading,
        title:heroSection.title,
        category: heroSection.category,
      });
    } else {
      return res.status(404).json({ message: 'Hero section not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving hero section' });
  }
};

// Get HeroSection by category ID
const getHeroSectionByCategorySub = async (req, res) => {
  const { categoryId, subcategoryId} = req.params; 
   console.log(categoryId, subcategoryId)
  try {
    const heroSection = await HeroSection.findOne({ category: categoryId,subcategory:subcategoryId }).populate('category');
    if (heroSection) {
      return res.status(200).json({
        heading: heroSection.heading,
        subheading: heroSection.subheading,
        title:heroSection.title,
        category: heroSection.category,
      });
    } else {
      return res.status(404).json({ message: 'Hero section not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving hero section' });
  }
};
// Get HeroSection by category ID, subcategory ID, and subsubcategory ID
const getHeroSectionByCategorySubSub = async (req, res) => {
  const { categoryId, subcategoryId, subsubcategoryId } = req.params; 
  console.log(categoryId, subcategoryId, subsubcategoryId);

  try {
    // Find the hero section that matches the category, subcategory, and subsubcategory
    const heroSection = await HeroSection.findOne({
      category: categoryId,
      subcategory: subcategoryId,
      subsubcategory: subsubcategoryId, 
    }).populate('category').populate('subcategory').populate('subsubcategory');

    if (heroSection) {
      return res.status(200).json({
        heading: heroSection.heading,
        subheading: heroSection.subheading,
        title:heroSection.title,
        category: heroSection.category,
        subcategory: heroSection.subcategory,
        subsubcategory: heroSection.subsubcategory,
      });
    } else {
      return res.status(404).json({ message: 'Hero section not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error retrieving hero section' });
  }
};


const getHeroSectionBySlug = async (req, res) => {
  const { slug } = req.params; 
 console.log(slug)
  try {
    // Find the HeroSection directly by the slug
    const heroSection = await HeroSection.findOne({slug: slug });

    if (heroSection) {
      return res.status(200).json({
        heading: heroSection.heading,
        title:heroSection.title,
        subheading: heroSection.subheading,
      });
    } else {
      return res.status(404).json({ message: 'Hero section not found' });
    }
  } catch (err) {
    console.error("Error retrieving hero section:", err);
    res.status(500).json({ message: 'Error retrieving hero section' });
  }
};

const upsertHeroSection = async (req, res) => {
  try {
    const { category, heading, subheading, title, slug } = req.body;
    
    // Check if a hero section with this category already exists
    const existingHeroSection = await HeroSection.findOne({ category });
    
    if (existingHeroSection) {
      // Update existing record
      existingHeroSection.heading = heading || existingHeroSection.heading;
      existingHeroSection.subheading = subheading || existingHeroSection.subheading;
      existingHeroSection.title = title || existingHeroSection.title;
      existingHeroSection.slug = slug || existingHeroSection.slug;
      
      const updatedHeroSection = await existingHeroSection.save();
      return res.status(200).json({
        message: 'Hero section updated successfully',
        data: updatedHeroSection
      });
    } else {
      // Create new record
      const newHeroSection = new HeroSection({
        category,
        heading,
        subheading,
        title,
        slug
      });
      
      const savedHeroSection = await newHeroSection.save();
      return res.status(201).json({
        message: 'Hero section created successfully',
        data: savedHeroSection
      });
    }
  } catch (error) {
    console.error('Error in upsertHeroSection:', error);
    
    if (error.code === 11000) {
      // Handle duplicate key error
      return res.status(400).json({
        message: 'A hero section with this category already exists',
        error: error.message
      });
    }
    
    res.status(500).json({
      message: 'Error creating/updating hero section',
      error: error.message
    });
  }
};

const upsertHeroSectionSub = async (req, res) => {
  const { categoryId, subcategoryId } = req.params; 
  const { heading, subheading, title } = req.body;

  try {
    // Find the category in the ServiceCategory schema using the categoryId
    const category = await ServiceCategory.findById(categoryId);
    
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find the subcategory within the category's subCategories array
    const subcategory = category.subCategories.find(sub => sub._id.toString() === subcategoryId);

    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found in the specified category' });
    }

    // Extract the slug from the subcategory
    const subcategorySlug = subcategory.slug;

    // Use the subcategory slug as the unique slug
    const slug = `${subcategorySlug}`;

    // Search for an existing HeroSection with the same categoryId but different subcategoryId
    const existingHeroSection = await HeroSection.findOne({
      category: categoryId,
      subcategory: subcategoryId,
    });
  console.log(existingHeroSection)
    if (existingHeroSection) {
      // Update existing HeroSection
      if (heading) existingHeroSection.heading = heading;
      if (subheading) existingHeroSection.subheading = subheading;
      if (title) existingHeroSection.title = title;
      existingHeroSection.headingType = 'sub'; 
      existingHeroSection.slug = slug; 

      await existingHeroSection.save();
      return res.status(200).json({
        message: `Hero section updated for category ${categoryId} and subcategory ${subcategoryId || 'N/A'}`,
        heading: existingHeroSection.heading,
        title: existingHeroSection.title,
        subheading: existingHeroSection.subheading,
        slug: existingHeroSection.slug,
        headingType: existingHeroSection.headingType,
      });
    } else {
      // Create a new HeroSection if it doesn't exist
      const newHeroSection = new HeroSection({
        heading: heading,
        subheading: subheading ,
        category: categoryId,
        subcategory: subcategoryId,
        slug: slug, 
        headingType: 'sub', 
      });

      await newHeroSection.save();
      return res.status(201).json({
        message: `Hero section created for category ${categoryId} and subcategory ${subcategoryId || 'N/A'}`,
        heading: newHeroSection.heading,
        subheading: newHeroSection.subheading,
        title: newHeroSection.title,
        slug: newHeroSection.slug,
        headingType: newHeroSection.headingType,
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating or creating hero section' });
  }
};


const upsertHeroSectionSubSub = async (req, res) => {
  const { categoryId, subcategoryId, subsubcategoryId } = req.params;
  const { heading, subheading, title } = req.body;

  try {
    // Find the category in the ServiceCategory schema using the categoryId
    const category = await ServiceCategory.findById(categoryId);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Find the subcategory within the category's subCategories array
    const subcategory = category.subCategories.find(sub => sub._id.toString() === subcategoryId);

    if (!subcategory) {
      return res.status(404).json({ message: 'Subcategory not found in the specified category' });
    }

    // Find the subsubcategory within the subcategory's subSubCategories array
    const subsubcategory = subcategory.subSubCategory.find(subSub => subSub._id.toString() === subsubcategoryId);

    if (!subsubcategory) {
      return res.status(404).json({ message: 'Subsubcategory not found in the specified subcategory' });
    }

    const slug = subsubcategory.slug;

    // Use findOneAndUpdate with the upsert option
    const heroSection = await HeroSection.findOneAndUpdate(
      {
        category: categoryId,
        subcategory: subcategoryId,
        subsubcategory: subsubcategoryId,
      },
      {
        $set: {
          heading: heading ,
          subheading: subheading ,
          title: title ,
          headingType: 'subsub',
          slug: slug,
        },
      },
      { upsert: true, new: true } 
    );

    res.status(200).json({
      message: `Hero section upserted for category ${categoryId}, subcategory ${subcategoryId}, and subsubcategory ${subsubcategoryId}`,
      heading: heroSection.heading,
      subheading: heroSection.subheading,
      title: heroSection.title,
      slug: heroSection.slug,
      headingType: heroSection.headingType,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error upserting hero section' });
  }
};

module.exports = { 
  upsertHeroSectionSubSub,
  getHeroSectionByCategory,
  getHeroSectionByCategorySub,
  getHeroSectionByCategorySubSub,
  getHeroSectionBySlug,
  upsertHeroSectionSub,
  upsertHeroSection 
};
