import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import placeholder from '../../assets/placeholder.jpg';

// Static fallback data
const staticServices = [
  {
    slug: 'web-development',
    photo: placeholder,
    alt: 'Web Development Services',
    imgtitle: 'Professional Web Development',
    category: 'Web Development'
  },
  {
    slug: 'mobile-app-development',
    photo: placeholder,
    alt: 'Mobile App Development Services',
    imgtitle: 'Mobile App Development',
    category: 'Mobile App Development'
  },
  {
    slug: 'digital-marketing',
    photo: placeholder,
    alt: 'Digital Marketing Services',
    imgtitle: 'Digital Marketing Solutions',
    category: 'Digital Marketing'
  },
  {
    slug: 'cloud-services',
    photo: placeholder,
    alt: 'Cloud Services',
    imgtitle: 'Cloud Solutions',
    category: 'Cloud Services'
  },
  {
    slug: 'ai-solutions',
    photo: placeholder,
    alt: 'AI Solutions',
    imgtitle: 'Artificial Intelligence Solutions',
    category: 'AI Solutions'
  },
  {
    slug: 'data-analytics',
    photo: placeholder,
    alt: 'Data Analytics Services',
    imgtitle: 'Data Analytics Solutions',
    category: 'Data Analytics'
  }
];

function IndustryServiceSlider() {
  const [services, setServices] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingStaticData, setUsingStaticData] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/industries/getIndustryServiceBySlug?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();

        // Check if the fetched data is an array and has items
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          setUsingStaticData(false);
        } else {
          // Use static data if API returns empty array or invalid data
          setServices(staticServices);
          setUsingStaticData(true);
        }
      } catch (error) {
        console.error('API Error:', error);
        setError(error.message);
        // Use static data on error
        setServices(staticServices);
        setUsingStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="mb-12 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold">
            Our <span className="text-[#ec2127]">Services</span>
          </h2>
          <h3 className="mt-4 text-lg md:text-xl">
            Visualizing Success Through Our Work
          </h3>
        </div>
        <div className="text-center">
          <div className="animate-pulse text-lg">Loading services...</div>
        </div>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1280,
        settings: {
          slidesToShow: 4,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ],
    centerMode: false,
    variableWidth: false,
    centerPadding: '20px',
    rows: 1,
    slidesPerRow: 1
  };

  const getImageSrc = (service) => {
    // If using static data, use the placeholder directly
    if (usingStaticData) {
      return service.photo;
    }
    
    // If service has a photo property, return the API endpoint
    if (service?.photo) {
      return `/api/logo/download/${service.photo}`;
    }
    
    // Fallback to a placeholder with the service category
    return placeholder;
  };

  const ImageWithFallback = ({ service }) => {
    const [imgSrc, setImgSrc] = useState(getImageSrc(service));
    const [hasError, setHasError] = useState(false);

    // Reset image source when service changes
    useEffect(() => {
      setImgSrc(getImageSrc(service));
      setHasError(false);
    }, [service]);

    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(placeholder);
      }
    };

    return (
      <div className="relative aspect-square overflow-hidden  rounded-xl bg-gray-100 flex items-center justify-center">
        <img
          src={imgSrc}
          alt={service.alt || service.category || 'Service'}
          title={service.imgtitle || service.category || 'Service'}
          className="w-full h-full object-cover transition-transform duration-300 transform hover:scale-105"
          onError={handleError}
          loading="lazy"
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
            <span className="text-gray-400 text-sm text-center">
              {service.category || 'Service Image'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h2 className="text-4xl md:text-5xl font-semibold">
          Our <span className="text-[#ec2127]">Services</span>
        </h2>
        <h3 className="mt-4 text-lg md:text-xl">
          Visualizing Success Through Our Work
        </h3>
        {usingStaticData && (
          <p className="mt-2 text-sm text-gray-500 italic">
            Showing demo services
          </p>
        )}
      </div>

      {services.length > 5 ? (
        // Slider for more than 5 services
        <div className="service-slider relative px-4">
          <Slider {...settings}>
            {services.map((service) => (
              <div key={service.slug || service.category} className="px-2">
                <div className="service-card p-4 mb-2 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300">
                  <Link to={`/${service.slug || '#'}`} className="block">
                    <ImageWithFallback service={service} />
                  </Link>
                  <div className="mt-4 text-center">
                    <Link
                      to={`/${service.slug || '#'}`}
                      className="text-gray-800 font-medium text-sm md:text-base hover:text-[#ec2127] transition-colors duration-200"
                    >
                      {service.category || 'Our Service'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </Slider>
        </div>
      ) : (
        // Grid for 5 or fewer services
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 px-4 w-full">
          {services.map((service) => (
            <div
              key={service.slug || service.category}
              className="w-full"
            >
              <div className="service-card p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 h-full flex flex-col">
                <Link to={`/${service.slug || '#'}`} className="block flex-1">
                  <ImageWithFallback service={service} />
                </Link>
                <div className="mt-4 text-center">
                  <Link
                    to={`/${service.slug || '#'}`}
                    className="text-gray-800 font-medium text-sm md:text-base hover:text-[#ec2127] transition-colors duration-200"
                  >
                    {service.category || 'Our Service'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && !usingStaticData && (
        <div className="mt-4 text-center text-sm text-orange-600">
          Note: Using fallback data due to connection issues
        </div>
      )}
    </div>
  );
}

const NextArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 -right-6 transform -translate-y-1/2 bg-white rounded-full shadow-lg cursor-pointer z-10"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors" />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="absolute top-1/2 -left-6 transform -translate-y-1/2 bg-white rounded-full shadow-lg cursor-pointer z-10"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors" />
  </div>
);

export default IndustryServiceSlider;