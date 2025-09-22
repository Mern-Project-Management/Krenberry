const NewsCategory = require("../model/newsCategory");
const ServiceCategory = require("../model/serviceCategory");
const PackageCategory = require("../model/packagecategory");
const PortfolioCategory = require("../model/portfoliocategory");
const Industriescategory = require("../model/industriescategory");

const getFormattedCategoriesFromAllSchemas = async () => {
  try {
    // Fetch data from all schemas
    // const newsCategories = await NewsCategory.find().lean();
    const serviceCategories = await ServiceCategory.find({status:"active"}).lean();
    const packageCategories = await PackageCategory.find({status:"active"}).lean();
    const portfolioCategories = await PortfolioCategory.find({status:"active"}).lean();
    const industryCategories = await Industriescategory.find({status:"active"}).lean();

    // Sort serviceCategories to prioritize "Graphic Designing"
    const sortedServiceCategories = serviceCategories.sort((a, b) => {
      const aName = (a.category || '').trim();
      const bName = (b.category || '').trim();
      if (aName === "Graphic Designing") return -1;
      if (bName === "Graphic Designing") return 1;
      return aName.localeCompare(bName);
    });

    // Sort packageCategories to prioritize "Graphic Designing"
    const sortedPackageCategories = packageCategories.sort((a, b) => {
      const aName = (a.category || '').trim();
      const bName = (b.category || '').trim();
      if (aName === "Graphic Designing") return -1;
      if (bName === "Graphic Designing") return 1;
      return aName.localeCompare(bName);
    });
console.log(sortedPackageCategories)
    // Recursive function to format the categories into the desired structure
    const formatCategories = (items, parentId = '', parentName = '') => {
      return items
        .filter(item => item && item.status === 'active')  // Only include active items
        .map((item, index) => {
          const id = parentId ? `${parentId}-${index + 1}` : `${index + 1}`;
          const formattedItem = {
            id,
            name: item.category || parentName,
            slug: item.slug,
            component: item.component || 'DefaultComponent',
          };

          // Filter and process subCategories (only active ones)
          if (item.subCategories && Array.isArray(item.subCategories)) {
            const activeSubs = item.subCategories.filter(sub => sub && sub.status === 'active');
            if (activeSubs.length > 0) {
              formattedItem.subItems = formatCategories(activeSubs, id, item.category);
            }
          }

          // Filter and process subSubCategory (only active ones)
          if (item.subSubCategory && Array.isArray(item.subSubCategory)) {
            const activeSubSubs = item.subSubCategory.filter(sub => sub && sub.status === 'active');
            if (activeSubSubs.length > 0) {
              if (!formattedItem.subItems) {
                formattedItem.subItems = [];
              }
              formattedItem.subItems = [
                ...(formattedItem.subItems || []),
                ...formatCategories(activeSubSubs, id, item.category),
              ];
            }
          }

          return formattedItem;
        });
    };

    const formatPortfolioCategories = (items, parentId = '', parentName = '') => {
      return items.map((item, index) => {
        const id = parentId ? `${parentId}-${index + 1}` : `${index + 1}`;
        const formattedItem = {
          id,
          name: item.category || parentName, // Use 'category' as the main name
          slug: item.slug,
          component: item.component || 'DefaultComponent', // Fallback to 'DefaultComponent' if undefined
        };
        return formattedItem;
      });
    };

    // Create the formatted structure based on the provided example format
    const formattedData = [
      {
        id: '1',
        name: 'About Us',
        slug: 'about-us',
        component: 'Aboutus',
      },
      {
        id: '2',
        name: 'Services',
        slug: 'websites',
        component: 'MainService',
        subItems: formatCategories(sortedServiceCategories, '2'), // Use sortedServiceCategories
      },
      // {
      //   id: '3',
      //   name: 'Packages',
      //   slug: 'website-packages',
      //   component: 'MainPackage',
      //   subItems: formatCategories(sortedPackageCategories, '3'), // Use sortedPackageCategories
      // },
      {
        id: '4',
        name: 'Industries',
        slug: 'educational-marketing',
        component: 'MainIndustries',
        subItems: formatCategories(industryCategories, '4'),
      },
      {
        id: '5',
        name: 'Blog',
        slug: 'blogs',
        component: 'MainBlogs',
        // subItems: formatCategories(newsCategories, '5'),
      },
      {
        id: '6',
        name: 'Contact Us',
        slug: 'contact-us',
        component: 'ContactUs',
      },
      {
        id: '7',
        name: 'Portfolio',
        slug: 'portfolio',
        component: 'ProjectSection',
        subItems: formatPortfolioCategories(portfolioCategories, '7'),
      },
    ];

    return {
      success: true,
      data: formattedData,
    };

  } catch (err) {
    console.error('Error fetching categories:', err);
    throw new Error('Failed to fetch categories.');
  }
};

module.exports = getFormattedCategoriesFromAllSchemas;