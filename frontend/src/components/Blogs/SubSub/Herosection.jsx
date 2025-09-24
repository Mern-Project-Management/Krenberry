import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCalendar, FaTags } from 'react-icons/fa';
import { format } from 'date-fns';
import { useLocation } from 'react-router-dom';

const BlogHeader = () => {
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const slug = location.pathname.split('/').filter(Boolean).pop();
        const response = await axios.get(`/api/news/getNewsBySlug/${slug}`, {
          withCredentials: true,
        });

        setBlogData(response.data);
      } catch (error) {
        setError('Error fetching data');
        console.error("Error fetching blog data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogData();
  }, [location]);

  if (loading) return null;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!blogData) return <p className="text-center text-gray-500">No data found</p>;

  const {
    title,
    date,
    categoryName,
    serviceCategoryName,
    photo,
    imgtitle,
    alt,
  } = blogData;

  return (
    <section className="bg-[#333] text-white pt-[120px] pb-12 px-4 md:pt-[180px] md:pb-20">
      <div className="max-w-screen-xl mx-auto px-6 container flex flex-col md:flex-row items-center gap-8">
        {/* Text Content */}
        <div className="w-full md:w-1/2">
          <h1 className="text-2xl text-left sm:text-3xl md:text-4xl  font-bold mb-4 leading-tight">
            {title}
          </h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 text-sm sm:text-base text-gray-200">
            <div className="flex items-center gap-2">
              <FaCalendar />
              <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
            </div>
            <div className="flex items-center gap-2">
              <FaTags />
              <span>{serviceCategoryName}</span>
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="w-full md:w-1/2">
          {photo?.length > 0 && (
            <div className="w-full aspect-[4/3] md:aspect-[4/3] overflow-hidden rounded-lg shadow-lg">
              <img
                src={`/api/image/download/${photo[0]}`}
                alt={alt?.[0] || 'blog image'}
                title={imgtitle?.[0] || ''}
                className="w-full h-full object-cover object-center"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BlogHeader;