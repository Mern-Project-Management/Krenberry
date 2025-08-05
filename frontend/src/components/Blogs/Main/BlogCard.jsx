import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";
import { useLocation, useNavigate } from "react-router-dom";
import { CgCalendarDates } from "react-icons/cg";
import { FaEye } from "react-icons/fa";

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

  const handleReadMore = async (blogslug) => {
    try {
      await axios.put(`/api/news/updateBlogVisits?slug=${blogslug}`);
      navigate(`/blog/${blogslug}`);
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
          <article
            key={blog._id}
            className="blog-card border border-gray-200 rounded-xl p-4 flex flex-col gap-4 bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 focus-within:-translate-y-1 focus-within:shadow-xl"
            tabIndex={0}
            role="article"
            aria-labelledby={`blog-title-${blog._id}`}
          >
            <div className="relative">
              <span className="absolute top-2 right-2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full font-medium">
                {blog.serviceCategoryName}
              </span>
              <img
                src={`/api/image/download/${blog.photo[0]}`}
                alt={blog.alt[0]}
                title={blog.imgtitle[0]}
                loading="lazy"
                className="w-full h-48 rounded-md object-cover mb-4"
                aria-describedby={`blog-description-${blog._id}`}
              />
            </div>
            <div className="flex flex-col flex-grow">
              <h3
                id={`blog-title-${blog._id}`}
                className="text-lg sm:text-xl font-semibold mb-2 text-gray-900"
              >
                {blog.title}
              </h3>
              <div
                id={`blog-description-${blog._id}`}
                className="text-sm sm:text-base text-gray-600 line-clamp-3 mb-4"
              >
                {blog?.details ? (
                  <div dangerouslySetInnerHTML={{ __html: blog.details }} />
                ) : (
                  "Easily manage your design projects with our convenient portal. Provide important details like"
                )}
              </div>
              <button
                onClick={() => handleReadMore(blog.slug)}
                className="mt-auto py-2 px-6 text-sm font-semibold bg-red-600 text-white rounded-full hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-300"
                aria-label={`Read more about ${blog.title}`}
              >
                Read More
              </button>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-500 mt-4">
              <div className="flex gap-2 items-center">
                <CgCalendarDates size={18} aria-hidden="true" />
                <time dateTime={blog.date}>
                  {format(new Date(blog.date), "MMMM d, yyyy")}
                </time>
              </div>
              <div className="flex gap-2 items-center">
                <FaEye aria-hidden="true" />
                <span>{blog.visits || 0} views</span>
              </div>
            </div>
          </article>
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