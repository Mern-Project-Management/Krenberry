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
      <style jsx global>{`
        .blog-content {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #1a1a1a;
          line-height: 1.8;
          font-size: 1.1rem;
        }
        .blog-content h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 2.5rem 0 1.2rem;
          color: #1a1a1a;
          line-height: 1.3;
        }
        .blog-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 2rem 0 1rem;
          color: #1a1a1a;
        }
        .blog-content p {
          margin-bottom: 1.5rem;
          color: #333;
        }
        .blog-content a {
          color: #ec2127;
          text-decoration: none;
          font-weight: 500;
          border-bottom: 1px solid #ec2127;
          transition: all 0.2s ease;
        }
        .blog-content a:hover {
          color: #c41a1f;
          border-bottom-color: transparent;
        }
        .blog-content ul, .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 1.8rem;
        }
        .blog-content li {
          margin-bottom: 0.5rem;
        }
        .blog-content blockquote {
          border-left: 4px solid #ec2127;
          padding: 1rem 0 1rem 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: #555;
          background-color: #f9f9f9;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          margin: 2rem 0;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .blog-content pre {
          background: #2d2d2d;
          color: #f8f8f2;
          padding: 1.2rem;
          border-radius: 6px;
          overflow-x: auto;
          margin: 1.5rem 0;
          font-family: 'Fira Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .blog-content code {
          font-family: 'Fira Code', 'Source Code Pro', Menlo, Monaco, Consolas, monospace;
          background: rgba(236, 33, 39, 0.1);
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
          color: #ec2127;
        }
        .blog-content pre code {
          background: transparent;
          padding: 0;
          color: inherit;
          font-size: inherit;
        }
        
        /* Enhanced Unordered Lists */
        .blog-content ul {
          margin: 1.5rem 0;
          padding-left: 2rem;
          list-style-type: none;
        }
        
        .blog-content ul > li {
          position: relative;
          padding-left: 1.8rem;
          margin-bottom: 0.8rem;
          color: #333;
        }
        
        .blog-content ul > li:before {
          content: '•';
          position: absolute;
          left: 0;
          color: #ec2127;
          font-weight: bold;
          font-size: 1.4em;
          line-height: 1;
        }
        
        /* Nested Unordered Lists */
        .blog-content ul ul {
          margin: 0.8rem 0 0.8rem 1.5rem;
        }
        
        .blog-content ul ul > li:before {
          content: '◦';
          color: #666;
          font-size: 1.2em;
        }
        
        /* Ordered Lists */
        .blog-content ol {
          margin: 1.5rem 0;
          padding-left: 2.2rem;
          counter-reset: item;
        }
        
        .blog-content ol > li {
          position: relative;
          margin-bottom: 0.8rem;
          counter-increment: item;
          padding-left: 0.5rem;
        }
        
        .blog-content ol > li:before {
          content: counter(item) '.';
          position: absolute;
          left: -2rem;
          color: #ec2127;
          font-weight: 600;
          font-size: 1em;
        }
        
        /* Nested Ordered Lists */
        .blog-content ol ol {
          margin: 0.8rem 0 0.8rem 1.5rem;
          counter-reset: subitem;
        }
        
        .blog-content ol ol > li {
          counter-increment: subitem;
        }
        
        .blog-content ol ol > li:before {
          content: counter(item) '.' counter(subitem);
          left: -2.5rem;
          color: #666;
        }
        
        /* List Items Common Styles */
        .blog-content li > p {
          margin-bottom: 0.5rem;
        }
        
        .blog-content li > ul,
        .blog-content li > ol {
          margin-top: 0.5rem;
        }
        
        /* Task Lists */
        .blog-content ul.task-list {
          list-style-type: none;
          padding-left: 0;
        }
        
        .blog-content .task-list-item {
          display: flex;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }
        
        .blog-content .task-list-item:before {
          content: '';
          display: inline-block;
          width: 1.2em;
          height: 1.2em;
          border: 2px solid #ec2127;
          border-radius: 3px;
          margin-right: 0.8rem;
          margin-top: 0.2em;
          flex-shrink: 0;
        }
        
        .blog-content .task-list-item[checked] {
          text-decoration: line-through;
          color: #666;
        }
        
        .blog-content .task-list-item[checked]:before {
          background-color: #ec2127;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='20 6 9 17 4 12'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: center;
          background-size: 0.8em;
        }
      `}</style>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Main content section */}
        <article className="col-span-1 lg:col-span-2">
          <div className="blog-content">
            {details ? (
              <div
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