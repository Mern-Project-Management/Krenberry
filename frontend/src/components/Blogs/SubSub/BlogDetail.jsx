import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

export default function BlogDetail() {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [latestBlogs, setLatestBlogs] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBlogData = async () => {
      setLoading(true);
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/news/getNewsBySlug/${slug}`);
        setBlogData(response.data);
      } catch (error) {
        setError("Error fetching blog data");
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [location]);

  useEffect(() => {
    const fetchLatestBlogs = async () => {
      try {
        const response = await axios.get("/api/news/getLatestBlogs");
        setLatestBlogs(response.data.blogs);
      } catch (error) {
        setError("Error fetching latest blogs");
        console.error("Error fetching latest blogs:", error);
      }
    };

    fetchLatestBlogs();
  }, [location]);

  const handleBlogClick = async (slug) => {
    try {
      await axios.put(`/api/news/updateBlogVisits?slug=${slug}`);
      navigate(`/blog/${slug}`);
    } catch (error) {
      console.error("Error updating visits:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
        <div role="status" className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
          <span className="sr-only">Loading blog content</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-600" role="alert">{error}</p>
      </div>
    );
  }

  if (!blogData) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-600" role="alert">No data found</p>
      </div>
    );
  }

  const { details } = blogData;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 lg:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main content section */}
        <article className="col-span-1 lg:col-span-2">
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none">
            {details ? (
              <div
                className="text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: details }}
                aria-label="Blog post content"
              />
            ) : (
              <p className="text-gray-600">
                Easily manage your design projects with our convenient portal. Provide important details like
              </p>
            )}
          </div>
        </article>

        {/* Sidebar section */}
        <aside className="col-span-1">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-6 shadow-md">
            <h2 className="heading text-center mb-6" id="latest-blogs-heading">
              Latest <span className="text-[#ec2127]">Blogs</span>
            </h2>
            <div className="flex flex-col gap-4" aria-labelledby="latest-blogs-heading">
              {latestBlogs.map((blog) => (
                <button
                  key={blog._id}
                  onClick={() => handleBlogClick(blog.slug)}
                  className="flex items-center gap-4 p-4 bg-white hover:bg-gray-50 transition-colors duration-300 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`Read blog post: ${blog.title}`}
                >
                  {blog.photo && blog.photo.length > 0 && (
                    <img
                      src={`/api/image/download/${blog.photo[0]}`}
                      alt={blog.alt?.[0] || blog.title}
                      title={blog.imgtitle?.[0] || blog.title}
                      loading="lazy"
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  <h3 className="text-sm sm:text-base font-semibold line-clamp-2 text-gray-800">
                    {blog.title}
                  </h3>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}