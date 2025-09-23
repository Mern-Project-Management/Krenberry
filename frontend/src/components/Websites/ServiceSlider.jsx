import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

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

function ServiceSlider() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { slug } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/services/getServicesBySlug?slug=${slug}`);
        const data = await response.json();

        if (Array.isArray(data)) {
          setServices(data);
        } else {
          setServices([]);
        }
      } catch (error) {
        setError(error.message);
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

  if (error) {
    return (
      <div className="py-8 text-center text-red-600 md:py-12">
        {error}
      </div>
    );
  }

  if (services.length === 0) {
    return null;
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 5,
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
        settings: { slidesToShow: 5, slidesToScroll: 1 },
      },
      {
        breakpoint: 1280,
        settings: { slidesToShow: 4, slidesToScroll: 1 },
      },
      {
        breakpoint: 1024,
        settings: { slidesToShow: 3, slidesToScroll: 1 },
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 2, slidesToScroll: 1, arrows: false, dots: false },
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

      {services.length > 5 ? (
        <div className="service-slider relative overflow-visible mx-0 sm:mx-4 md:mx-8 lg:mx-12 mb-10 md:mb-12">
          <Slider {...settings}>
            {services.map((service) => (
              <div
                key={service.slug}
                className="service-card p-2 md:p-4 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 relative z-10 mx-4"
              >
                <Link to={`/${service.slug}`}>
                  <div className="relative aspect-square overflow-hidden mx-auto rounded-xl bg-white">
                    <img
                      src={`/api/logo/download/${service.photo}`}
                      alt={service.alt}
                      title={service.imgtitle}
                      className="w-full h-full max-w-[220px] mx-auto object-contain p-2 transition-transform duration-300 transform hover:scale-105"
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
            ))}
          </Slider>
        </div>
      ) : (
        <div className="flex flex-wrap gap-4 justify-center items-center md:gap-6">
          {services.map((service) => (
            <div
              key={service.slug}
              className="service-card md:p-7 bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 w-full max-w-[200px] md:max-w-[250px]"
            >
              <Link to={`/${service.slug}`}>
                <div className="relative aspect-square overflow-hidden rounded-xl bg-white">
                  <img
                    src={`/api/logo/download/${service.photo}`}
                    alt={service.alt}
                    title={service.imgtitle}
                    className="w-full h-full max-w-[220px] mx-auto object-contain p-2 md:max-w-[250px] transition-transform duration-300 transform hover:scale-105"
                  />
                </div>
              </Link>
              <div className="mt-3 text-center md:mt-4">
                <Link
                  to={`/${service.slug}`}
                  className="text-gray-800 font-medium text-base hover:text-[#ec2127] transition-colors duration-200 md:text-lg"
                >
                  {service.category}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
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