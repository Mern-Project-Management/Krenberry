import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import PropTypes from 'prop-types';
import { IoStarSharp, IoStarHalfSharp, IoStarOutline } from 'react-icons/io5';



export default function HeroSection({ 
  serviceGridRef,
  // Static page props
  faq = false,
  collaboration = false,
  title,
  subtitle,
  backgroundGradient = "bg-gradient-to-br from-gray-900 via-gray-800 to-black",
  useStaticBackground = false
}) {
  const [heading, setHeading] = useState("");
  const [subHeading, setsubHeading] = useState(null);
  const [photo, setPhoto] = useState(null)
  const [alt, setAlt] = useState("")
  const [imgTitle, setImgTitle] = useState("")
  const location = useLocation();

  // Predefined content for different page types
  const getStaticPageContent = () => {
    if (faq) {
      return {
        title: "Frequently Asked Questions",
        subtitle: "Find answers to common questions about our services and solutions"
      };
    }
    if (collaboration) {
      return {
        title: "Let's Collaborate",
        subtitle: "Partner with us to create amazing digital experiences and innovative solutions"
      };
    }
    if (title || subtitle) {
      return {
        title: title || "Welcome",
        subtitle: subtitle || "Discover amazing solutions"
      };
    }
    return null;
  };

  const staticContent = getStaticPageContent();
  const isStaticPage = faq || collaboration || title || subtitle || useStaticBackground;

  useEffect(() => {
    // Only fetch API data if not a static page
    if (!isStaticPage) {
      const fetchHeadings = async () => {
        try {
          const response = await axios.get('/api/pageHeading/heading?pageType=aboutcompany', { withCredentials: true });
          const { heading, subheading, photo, alt, imgTitle } = response.data;
          setHeading(heading || '');
          setsubHeading(subheading || '')
          setPhoto(photo || null);
          setAlt(alt || '');
          setImgTitle(imgTitle || '')
        } catch (error) {
          console.error(error);
        }
      };
      fetchHeadings();
    }
  }, [isStaticPage]);

  const scrollToServices = () => {
    if (serviceGridRef.current) {
      serviceGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Render static page version or dynamic version
  if (isStaticPage) {
    return (
      <div className={`flex flex-col items-center justify-center py-24 md:pt-36 pb-20 ${backgroundGradient}`}>
        <div className="text-center mx-10 md:mx-35% mt-12">
          <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold mb-7">
            {staticContent?.title || "Welcome"}
          </h1>
          <p className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-6">
            {staticContent?.subtitle || "Discover amazing solutions"}
          </p>
        </div>
      </div>
    );
  }

  // Original dynamic version for AboutUs page
  return (
    <div className="relative">
      <img src={`/api/logo/download/${photo}`} alt={alt} title={imgTitle} className="w-full h-[55vh] object-cover" />
      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col gap-8 pt-16 md:pt-32">
        <h1 className="text-white text-4xl md:text-7xl font-semibold capitalize">{heading}</h1>
        <p className="text-xl md:text-2xl text-white text-center">{subHeading}</p>
      </div>
    </div>
  );
}

HeroSection.propTypes = {
  serviceGridRef: PropTypes.object,
  faq: PropTypes.bool,
  collaboration: PropTypes.bool,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  backgroundGradient: PropTypes.string,
  useStaticBackground: PropTypes.bool
}
