import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { CgCalendarDates } from "react-icons/cg";
import { FaEye, FaArrowRight } from "react-icons/fa";

export default function HowRndHelp() {
  const [blogData, setBlogData] = useState([]);
  const [visibleCount, setVisibleCount] = useState(4);
  const [selectedCategory, setSelectedCategory] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/news/getNewsFront`, {
          withCredentials: true,
        });
        setBlogData(response.data.data);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };

    fetchBlogData();
  }, [location]);

  const categories = [...new Set(blogData.map((blog) => blog.serviceCategoryName))];

  const filteredData = selectedCategory
    ? blogData.filter((blog) => blog.serviceCategoryName === selectedCategory)
    : blogData;

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 4);
  };

  const handleCardClick = async (e, blogSlug) => {
    // Prevent the default link behavior if the click is on a button or link
    if (e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.tagName === 'A' || e.target.closest('a')) {
      return;
    }
    
    try {
      await axios.put(`/api/news/updateBlogVisits?slug=${blogSlug}`);
      navigate(`/blog/${blogSlug}`);
    } catch (error) {
      console.error("Error updating visits:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
      {/* Filter section */}
      <div className="mb-6">
        <label htmlFor="category-select" className="sr-only">Select Category</label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full sm:w-auto p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors bg-white text-gray-800"
          aria-label="Filter blog posts by category"
        >
          <option value="">All Categories</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredData.slice(0, visibleCount).map((blog) => (
          <div 
            key={blog._id} 
            className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={(e) => handleCardClick(e, blog.slug)}
          >
            <div className="relative h-48">
              <img 
                src={blog.photo?.[0] ? `/api/image/download/${blog.photo[0]}` : '/placeholder.jpg'} 
                alt={blog.title}
                className="w-full h-full  object-fill"
                loading="lazy"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-[#ec2127]  text-white text-xs font-medium rounded">
                  {blog.serviceCategoryName}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                <Link to={`/blog/${blog.slug}`} className="hover: transition-colors">
                  {blog.title}
                </Link>
              </h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                {blog?.details ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.details }} />
                ) : (
                  "Easily manage your design projects with our convenient portal. Provide important details like"
                )}
              </p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <div className="flex gap-2 items-center">
                  <CgCalendarDates size={18} aria-hidden="true" />
                  <time dateTime={blog.date}>
                    {format(new Date(blog.date), "MMMM d, yyyy")}
                  </time>
                </div>
                <Link 
                  to={`/blog/${blog.slug}`}
                  className=" hover: font-medium text-sm flex text-[#ec2127] items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  Read More
                  <FaArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleCount < filteredData.length && (
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLoadMore}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
            aria-label="Load more blog posts"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}