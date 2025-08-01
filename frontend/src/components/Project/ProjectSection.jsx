import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import gsap from "gsap";
import { IoMdClose, IoMdFunnel } from "react-icons/io";
import { useParams } from "react-router-dom";

const ProjectsSection = () => {
  const [categories, setCategories] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState({
    slug: "all",
    category: "All",
  });
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const imageRefs = useRef([]); 
  const { slug } = useParams();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    fetchCategories();
  }, [slug]);

  useEffect(() => {
    if (selectedCategory) {
      fetchPortfolios();
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setPortfolios([]);
      const response = await axios.get(`/api/Portfolio/getAllSubcategoriesBySlug?slug=${slug}`);
      const fetchedCategories = response.data.subcategories;
      const allCategories = [
        { slug: "all", category: "All" },
        ...fetchedCategories,
      ];
      setCategories(allCategories);
      setSelectedCategory(allCategories[0]);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchPortfolios = async () => {
    if (!selectedCategory) return;

    try {
      let response;
      if (selectedCategory.slug === "all") {
        response = await axios.get(`/api/Portfolio/getCategoryPortfolio?categoryId=${slug}`);
      } else {
        response = await axios.get(`/api/Portfolio/getSubcategoryPortfolio?subcategoryId=${selectedCategory.slug}`);
      }
      setPortfolios(response.data);

      gsap.to(imageRefs.current, {
        scale: 0,
        opacity: 0,
        duration: 0,
        onComplete: () => {
          gsap.to(imageRefs.current, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
          });
        },
      });
    } catch (error) {
      console.error("Error fetching portfolios:", error);
    }
  };

  const handleCategoryClick = (category) => {
    if (selectedCategory?.slug === category.slug) return;

    gsap.to(imageRefs.current, {
      scale: 0,
      opacity: 0,
      duration: 0.5,
      onComplete: () => {
        setSelectedCategory(category);
        setIsFilterOpen(false);
      },
    });
  };

 const handleImageClick = (image) => {
    setScrollPosition(window.scrollY); // store current scroll
    setFullscreenImage(image);
    document.body.style.overflow = "hidden"; // prevent background scroll
  };


  const closeFullscreen = () => {
    setFullscreenImage(null);
    document.body.style.overflow = "auto"; // enable scroll
    window.scrollTo({ top: scrollPosition, behavior: "instant" }); // restore position
  };

  return (
    <div className="flex flex-col items-center justify-center my-8 sm:my-12 md:my-16 relative bg-white overflow-hidden px-4 sm:px-6 md:px-8">
      {/* Filter Button for Mobile */}
      <div className="flex justify-between items-center w-full max-w-7xl mb-4 sm:mb-6">
        <button
          className="sm:hidden flex items-center justify-center px-4 py-2 text-base font-medium font-inter bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <IoMdFunnel className="mr-2" />
          Filter
        </button>
        <div className="sm:hidden text-red-500 text-base pl-5 font-medium">
          Current Filter: {selectedCategory?.category}
        </div>
      </div>

      {/* Category Buttons for Desktop */}
      <div className="hidden sm:flex flex-wrap justify-center gap-4 mb-6">
        {categories.map((item) => (
          <button
            key={item.slug}
            onClick={() => handleCategoryClick(item)}
            className={`px-4 py-2 sm:text-lg md:text-xl lg:text-2xl font-inter focus:outline-none ${
              selectedCategory?.slug === item.slug
                ? "text-red-500"
                : "text-gray-800 border-transparent"
            }`}
          >
            {item.category}
          </button>
        ))}
      </div>

      {/* Filter Menu for Mobile */}
      {isFilterOpen && (
        <div className="sm:hidden fixed inset-0 bg-white z-50 p-4 flex flex-col">
          <button
            className="absolute top-4 right-4 text-gray-800 text-2xl"
            onClick={() => setIsFilterOpen(false)}
          >
            <IoMdClose />
          </button>
          <div className="flex flex-col space-y-3 mt-12 max-w-md mx-auto">
            {categories.map((item) => (
              <button
                key={item.slug}
                onClick={() => handleCategoryClick(item)}
                className={`px-4 py-2 text-base font-medium font-inter rounded-md transition-colors ${
                  selectedCategory?.slug === item.slug
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {item.category}
              </button>
            ))}
            <button
              className="px-4 py-2 text-base font-medium font-inter bg-red-500 text-white rounded-md hover:bg-red-600 mt-4"
              onClick={() => setIsFilterOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Grid */}
      {selectedCategory && (
        <div className="w-full max-w-7xl mt-6 sm:mt-8">
          {portfolios.length === 0 ? (
            <p className="text-center text-gray-500 text-base md:text-lg">
              No projects available for this category.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {portfolios.filter((item)=> item.status ==='active').map((item, index) => (
                item.photo[0] ? (
                  <div
                    key={index}
                    className="relative cursor-pointer group"
                    ref={(el) => (imageRefs.current[index] = el)}
                  >
                    <img
                      src={`/api/image/download/${item.photo[0]}`}
                      alt={item.alt || "Project Image"}
                      className="w-full h-64 sm:h-72 md:h-80  object-contain md:object-cover rounded-lg shadow-md border border-gray-200"
                      loading="lazy"
                    />
                    <div
                      onClick={() =>
                        handleImageClick(item.photo[1] ? item.photo[1] : item.photo[0])
                      }
                      className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 ease-in-out"
                    >
                      <div className="text-center p-4">
                        <h3 className="text-white text-lg sm:text-xl font-semibold mb-2 truncate">
                          {item.imgtitle[0]}
                        </h3>
                        {item.link ? (
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button className="px-4 py-2 bg-red-500 text-white text-sm sm:text-base rounded-lg hover:bg-red-600 transition-colors">
                              Visit Website
                            </button>
                          </a>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleImageClick(item.photo[1] ? item.photo[1] : item.photo[0]);
                            }}
                            className="px-4 py-2 bg-red-500 text-white text-sm sm:text-base rounded-lg hover:bg-red-600 transition-colors"
                          >
                            View
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}
        </div>
      )}

      {/* Fullscreen Image Viewer */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto">
          <img
            src={`/api/image/download/${fullscreenImage}`}
            alt="Fullscreen view"
            className="w-full h-auto object-cover"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl md:text-4xl p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
            onClick={closeFullscreen}
          >
            <IoMdClose />
          </button>
        </div>
      )}
    </div>
  );
};

export default ProjectsSection;