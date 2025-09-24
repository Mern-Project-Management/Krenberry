import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import placeholderImage from '../../assets/placeholder.jpg';

// Custom styles for mobile-optimized slider dots
const sliderStyles = `
  .slick-dots {
    bottom: -50px;
  }
  .slick-dots li button:before {
    font-size: 12px;
    color: #d1d5db;
    opacity: 0.5;
  }
  .slick-dots li.slick-active button:before {
    color: #ec2127;
    opacity: 1;
  }
  @media (max-width: 640px) {
    .slick-dots { display: none !important; }
    .slick-dots {
      bottom: -20px;
    }
    .slick-dots li {
      margin: 0 6px;
    }
    .slick-dots li button:before {
      font-size: 10px;
    }
  }
`;

// Static fallback data
const staticServices = [
  {
    slug: 'web-development',
    category: 'Web Development',
    photo: placeholderImage,
    alt: 'Web Development Services',
    imgtitle: 'Custom Web Development'
  },
  {
    slug: 'mobile-apps',
    category: 'Mobile Apps',
    photo: placeholderImage,
    alt: 'Mobile App Development',
    imgtitle: 'iOS & Android Apps'
  },
  {
    slug: 'ui-ux-design',
    category: 'UI/UX Design',
    photo: placeholderImage,
    alt: 'UI/UX Design Services',
    imgtitle: 'User Experience Design'
  },
  {
    slug: 'ecommerce',
    category: 'E-commerce',
    photo: placeholderImage,
    alt: 'E-commerce Solutions',
    imgtitle: 'Online Store Development'
  },
  {
    slug: 'digital-marketing',
    category: 'Digital Marketing',
    photo: placeholderImage,
    alt: 'Digital Marketing Services',
    imgtitle: 'Online Marketing Solutions'
  }
];

function ServiceSlider() {
  const [services, setServices] = useState(staticServices); // Initialize with static data
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/services/getServicesBySlug?slug=${slug}`);
        if (!response.ok) throw new Error('Failed to fetch services');
        
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          setUsingFallback(false);
        } else {
          setServices(staticServices);
          setUsingFallback(true);
        }
      } catch (error) {
        console.error('Error fetching services:', error);
        setError('Failed to load services. Showing sample data.');
        setServices(staticServices);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-8 text-center md:py-12">
        <div className="animate-pulse text-base md:text-lg">Loading services...</div>
      </div>
    );
  }

  // If there's an error but we have static data, show the services with a notice
  if (error && usingFallback) {
    return (
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                {error} Sample services are being shown.
              </p>
            </div>
          </div>
        </div>
        <ServiceList services={services} />
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="py-8 text-center text-gray-600 md:py-12">
        No services available at the moment.
      </div>
    );
  }

  return <ServiceList services={services} />;
}

// Extracted service list component for better readability
function ServiceList({ services }) {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: Math.min(5, services.length),
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    adaptiveHeight: true,
    swipeToSlide: true,
    touchThreshold: 10,
    pauseOnHover: true,
    lazyLoad: 'ondemand',
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 1536,
        settings: { slidesToShow: Math.min(5, services.length), slidesToScroll: 1 },
      },
      {
        breakpoint: 1280,
        settings: { slidesToShow: Math.min(4, services.length), slidesToScroll: 1 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(3, services.length), slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: Math.min(2, services.length), slidesToScroll: 1, arrows: false, dots: false },
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1, slidesToScroll: 1, arrows: false, dots: false },
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 pb-16">
      <style>{sliderStyles}</style>
      <div className="mb-8 text-center md:mb-12">
        <h2 className="font-semibold heading">
          Our <span className="text-[#ec2127]">Services</span>
        </h2>
        <p className="mt-4 subheading text-[#39b54a]">
          Visualizing Success Through Our Work
        </p>
      </div>

      {services.length > 1 ? (
        <div className="service-slider relative overflow-visible mx-0 sm:mx-4 md:mx-8 lg:mx-12 mb-10 md:mb-12">
          <Slider {...settings}>
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </Slider>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4  justify-center items-center md:gap-6">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      )}
    </div>
  );
}

// Extracted service card component
function ServiceCard({ service }) {
  return (
    <div className="service-card p-2 md:p-4 mb-3 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 relative z-10 mx-4">
      <Link to={`/${service.slug}`}>
        <div className="relative aspect-square overflow-hidden mx-auto rounded-xl bg-gray-100">
          <img
            src={service.photo}
            alt={service.alt}
            title={service.imgtitle}
            className="w-full h-full max-w-[220px] mx-auto object-cover p-2 transition-transform duration-300 transform hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placeholderImage;
            }}
          />
        </div>
      </Link>
      <div className="mt-3 text-center md:mt-4">
        <Link
          to={`/${service.slug}`}
          className="text-gray-800 font-medium text-base hover:text-[#ec2127] transition-colors duration-200 md:text-lg text-ellipsis"
        >
          {service.category}
        </Link>
      </div>
    </div>
  );
}

const NextArrow = ({ onClick }) => (
  <div
    className="hidden md:flex absolute top-1/2 -right-4 md:-right-10 -translate-y-1/2 items-center justify-center bg-white rounded-full shadow-lg cursor-pointer z-30 p-2 md:p-3 hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <ChevronRightIcon className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors md:w-6 md:h-6" />
  </div>
);

const PrevArrow = ({ onClick }) => (
  <div
    className="hidden md:flex absolute top-1/2 -left-4 md:-left-10 -translate-y-1/2 items-center justify-center bg-white rounded-full shadow-lg cursor-pointer z-30 p-2 md:p-3 hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <ChevronLeftIcon className="w-5 h-5 text-gray-500 hover:text-gray-700 transition-colors md:w-6 md:h-6" />
  </div>
);

export default ServiceSlider;