import React, { useEffect, useState } from 'react';
import { IoStarSharp, IoStarHalfSharp, IoStarOutline, IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { NavLink } from 'react-router-dom';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Autoplay, Navigation } from 'swiper/modules';
import { useLocation } from 'react-router-dom';
import img from '../../assets/placeholder.jpg';

const RatingStars = ({ rating }) => {
  const totalStars = 5;
  const stars = [];

  for (let i = 0; i < totalStars; i++) {
    if (i < Math.floor(rating)) {
      stars.push(<IoStarSharp key={i} />);
    } else if (i < rating) {
      stars.push(<IoStarHalfSharp key={i} />);
    } else {
      stars.push(<IoStarOutline key={i} />);
    }
  }

  return <div className="flex text-yellow-300 text-3xl">{stars}</div>;
};

const PlaceholderImage = ({ name, size = "size-56" }) => {
  return (
    <div className={`${size} rounded-full overflow-hidden`}>
      <img
        src={img}
        alt={name ? `${name}'s profile` : 'Profile'}
        className="w-full h-full object-cover"
        onError={(e) => {
          e.target.onerror = null;
          // Fallback to text initials if image fails to load
          const initials = name 
            ? name
                .split(' ')
                .map(word => word.charAt(0))
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'US';
          
          // Create a colored background based on the name
          const colors = [
            'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
            'bg-indigo-500', 'bg-red-500', 'bg-yellow-500', 'bg-teal-500'
          ];
          const colorIndex = name ? name.length % colors.length : 0;
          
          // Replace the image with a div containing initials
          e.target.outerHTML = `
            <div class="${size} rounded-full ${colors[colorIndex]} flex items-center justify-center">
              <span class="text-white text-3xl font-bold">${initials}</span>
            </div>
          `;
        }}
      />
    </div>
  );
};

const Review = ({ serviceSlug }) => {
  // Static fallback data
  const staticReviews = [
    {
      _id: 'static-1',
      name: 'John Smith',
      designation: 'CEO, TechCorp',
      rating: 5,
      testimony: 'Outstanding service and exceptional quality. The team delivered beyond our expectations and provided innovative solutions that transformed our business operations.',
      photo: null,
      video: null,
      alt: 'John Smith CEO TechCorp',
      title: 'John Smith Review'
    },
    {
      _id: 'static-2',
      name: 'Sarah Johnson',
      designation: 'CTO, InnovateHub',
      rating: 4.5,
      testimony: 'Professional team with deep technical expertise. They understood our requirements perfectly and delivered a robust solution on time and within budget.',
      photo: null,
      video: null,
      alt: 'Sarah Johnson CTO InnovateHub',
      title: 'Sarah Johnson Review'
    },
    {
      _id: 'static-3',
      name: 'Michael Brown',
      designation: 'Product Manager, StartupXYZ',
      rating: 5,
      testimony: 'Incredible attention to detail and user experience. The final product exceeded our expectations and has significantly improved our customer engagement.',
      photo: null,
      video: null,
      alt: 'Michael Brown Product Manager',
      title: 'Michael Brown Review'
    },
    {
      _id: 'static-4',
      name: 'Emily Davis',
      designation: 'Marketing Director, GrowthCo',
      rating: 4.8,
      testimony: 'Excellent communication throughout the project. The team was responsive, professional, and delivered high-quality work that aligned perfectly with our brand vision.',
      photo: null,
      video: null,
      alt: 'Emily Davis Marketing Director',
      title: 'Emily Davis Review'
    }
  ];

  const [reviews, setReviews] = useState(staticReviews);
  const [loading, setLoading] = useState(true);
  const [usingStaticData, setUsingStaticData] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [swiperInstance, setSwiperInstance] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const slug = serviceSlug || location.pathname.split('/').filter(Boolean).pop();

        const response = await axios.get(`/api/testimonial/getTestimonialsHigh/${slug}`, { 
          withCredentials: true 
        });
        
        const reviewData = response.data.data;
        
        if (reviewData && reviewData.length > 0) {
          setReviews(reviewData);
          setUsingStaticData(false);
        } else {
          // Use static data if no reviews returned
          setReviews(staticReviews);
          setUsingStaticData(true);
        }
      } catch (error) {
        console.error("Error fetching reviews:", error);
        // Use static data on error
        setReviews(staticReviews);
        setUsingStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [location.pathname, serviceSlug]);

  const handleImageError = (reviewId) => {
    setImageErrors(prev => ({
      ...prev,
      [reviewId]: true
    }));
  };

  const goToPrevSlide = () => {
    if (swiperInstance) {
      swiperInstance.slidePrev();
    }
  };

  const goToNextSlide = () => {
    if (swiperInstance) {
      swiperInstance.slideNext();
    }
  };

  const handleSlideChange = (swiper) => {
    setCurrentSlide(swiper.realIndex);
  };

  if (loading) {
    return (
      <div className='bg-[#333333] lg:bg-cover w-full bg-no-repeat'>
        <div className="p-6 lg:p-10 mx-auto w-[80%] mt-4">
          <div className="animate-pulse">
            <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10">
              <div className="size-56 bg-gray-600 rounded-full"></div>
              <div className="flex flex-col w-full items-center lg:items-start md:mr-12">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 bg-gray-600 rounded"></div>
                  ))}
                </div>
                <div className="space-y-2 w-full">
                  <div className="h-4 bg-gray-600 rounded w-full"></div>
                  <div className="h-4 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-600 rounded w-1/2"></div>
                </div>
                <div className="h-4 bg-gray-600 rounded w-64 mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Always render the component, whether using API data or static data
  return (
    <div className='bg-[#333333] lg:bg-cover w-full bg-no-repeat relative'>
      {/* Show indicator if using static data */}
      {usingStaticData && (
        <div className="text-center pt-4">
          <span className="text-xs text-gray-400 bg-gray-700 px-3 py-1 rounded-full">
            Showing sample reviews
          </span>
        </div>
      )}
      
      <div className="p-6 lg:p-10 mx-auto w-[95%] mt-4 relative">
        {/* Custom Navigation Arrows */}
        {reviews.length > 1 && (
          <>
            <button
              onClick={goToPrevSlide}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToPrevSlide();
                }
              }}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 group"
              aria-label="Previous review"
              tabIndex={0}
            >
              <IoChevronBack 
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
                aria-hidden="true"
              />
            </button>
            
            <button
              onClick={goToNextSlide}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  goToNextSlide();
                }
              }}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 group"
              aria-label="Next review"
              tabIndex={0}
            >
              <IoChevronForward 
                className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" 
                aria-hidden="true"
              />
            </button>
          </>
        )}

        <Swiper
          spaceBetween={30}
          loop={reviews.length > 1}
          autoplay={reviews.length > 1 ? { delay: 5000, disableOnInteraction: false } : false}
          speed={1000}
          modules={[Autoplay, Navigation]}
          onSwiper={setSwiperInstance}
          onSlideChange={handleSlideChange}
          className="mySwiper"
        >
          {reviews.map((review, index) => (
            <SwiperSlide key={review._id}>
              <div 
                className="flex flex-col lg:flex-row items-center lg:items-start gap-10"
                role="article"
                aria-labelledby={`review-${index}-title`}
              >
                <div className="flex justify-center lg:justify-end">
                  {review.photo && !imageErrors[review._id] ? (
                    <div>
                      <img
                        src={`/api/image/download/${review.photo}`}
                        alt={review.alt || `${review.name} testimonial`}
                        title={review.title || `${review.name} review`}
                        className="size-56 rounded-full object-cover"
                        onError={() => handleImageError(review._id)}
                        loading="lazy"
                      />
                    </div>
                  ) : review.video && !review.photo ? (
                    <div>
                      <video
                        width="100%"
                        height="240"
                        controls
                        src={`/api/video/download/${review.video}`}
                        title={review.title || `${review.name} video review`}
                        className="rounded-2xl"
                        onError={() => console.error('Video failed to load')}
                      >
                        <div className="size-56 bg-gray-600 rounded-2xl flex items-center justify-center">
                          <span className="text-white">Video unavailable</span>
                        </div>
                      </video>
                    </div>
                  ) : (
                    <PlaceholderImage name={review.name} />
                  )}
                </div>
                <div className="flex flex-col w-full items-center lg:items-start md:mr-12">
                  <div aria-label={`Rating: ${review.rating || 5} out of 5 stars`}>
                    <RatingStars rating={review.rating || 5} />
                  </div>
                  <blockquote 
                    className="mt-4 text-lg text-white text-center lg:text-left" 
                    dangerouslySetInnerHTML={{ 
                      __html: review.testimony || 'Great service and professional team!' 
                    }}
                  />
                  <div className="flex flex-col lg:flex-row lg:justify-between items-center lg:items-center mt-4 w-full">
                    <cite 
                      id={`review-${index}-title`}
                      className="text-lg font-semibold text-center lg:text-left text-white not-italic"
                    >
                      {review.name || 'Anonymous'}, {review.designation || 'Satisfied Customer'}
                    </cite>
                    <NavLink 
                      to="/all-reviews" 
                      className="mt-2 text-white hover:underline lg:ml-4 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-1"
                    >
                      See all reviews →
                    </NavLink>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Pagination Indicators Info */}
        {reviews.length > 1 && (
          <div className="sr-only" aria-live="polite" aria-atomic="true">
            Review {currentSlide + 1} of {reviews.length}
          </div>
        )}
      </div>

      {/* Custom Styles for better pagination visibility */}
      <style jsx>{`
        /* Keep any other styles you might need */
      `}</style>
    </div>
  );
};

export default Review;