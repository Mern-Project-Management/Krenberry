import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Wave3 from '../../images/Wave3.svg';

// Static fallback data
const staticFallbackData = {
  heading: "Why Partner <span style='color: #4F46E5;'>With Us</span>",
  description: "We bring together cutting-edge technology, industry expertise, and personalized service to help your business thrive in today's competitive landscape. Our comprehensive solutions are designed to drive growth and deliver measurable results.",
  photo: ['static-main-image.jpg'],
  photoAlt: "Partnership collaboration illustration",
  imgtitle: "Why choose us as your business partner",
  subsections: [
    {
      title: "Expert Team",
      description: "Our experienced professionals bring deep industry knowledge and technical expertise to every project, ensuring high-quality deliverables.",
      photo: 'expert-team-icon.svg',
      photoAlt: "Expert team icon",
      imgtitle: "Professional expertise"
    },
    {
      title: "Proven Results",
      description: "We have a track record of delivering successful projects that drive business growth and improve operational efficiency.",
      photo: 'results-icon.svg',
      photoAlt: "Proven results icon",
      imgtitle: "Measurable outcomes"
    },
    {
      title: "24/7 Support",
      description: "Round-the-clock support ensures your business operations run smoothly with minimal downtime and maximum reliability.",
      photo: 'support-icon.svg',
      photoAlt: "24/7 support icon",
      imgtitle: "Continuous support"
    },
    {
      title: "Custom Solutions",
      description: "Tailored solutions that fit your unique business requirements and scale with your growth objectives.",
      photo: 'custom-solutions-icon.svg',
      photoAlt: "Custom solutions icon",
      imgtitle: "Personalized approach"
    },
    {
      title: "Innovation Focus",
      description: "We stay ahead of technology trends to provide innovative solutions that give you a competitive advantage.",
      photo: 'innovation-icon.svg',
      photoAlt: "Innovation focus icon",
      imgtitle: "Technology leadership"
    },
    {
      title: "Cost Effective",
      description: "Optimize your investment with our cost-effective solutions that deliver maximum value for your budget.",
      photo: 'cost-effective-icon.svg',
      photoAlt: "Cost effective icon",
      imgtitle: "Value optimization"
    }
  ],
  video: null
};

// Static placeholder image URLs (using placeholder services or local fallbacks)
const getStaticImageUrl = (imageName) => {
  // You can replace these with actual local images or use placeholder services
  const imageMap = {
    'static-main-image.jpg': 'https://via.placeholder.com/400x400/4F46E5/FFFFFF?text=Partnership',
    'expert-team-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=👥',
    'results-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=📈',
    'support-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=🔧',
    'custom-solutions-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=⚙️',
    'innovation-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=💡',
    'cost-effective-icon.svg': 'https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=💰'
  };
  
  return imageMap[imageName] || `https://via.placeholder.com/40x40/4F46E5/FFFFFF?text=${imageName.charAt(0).toUpperCase()}`;
};

const WhyPartnerWithUs = () => {
  const [webSolutionData, setWebSolutionData] = useState(null);
  const [videoUrl, setVideoUrl] = useState('');
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/content/types/whyPartnerus', { 
          withCredentials: true,
          timeout: 5000 // 5 second timeout
        });
        
        if (response.data && response.data[0]) {
          const data = response.data[0];
          setWebSolutionData(data);
          setIsUsingFallback(false);
          
          if (data.video) {
            setVideoUrl(`/api/image/download/${data.video}`);
          }
        } else {
          throw new Error('No data received from API');
        }
      } catch (error) {
        console.error('Error fetching web solution data, using static fallback:', error);
        setWebSolutionData(staticFallbackData);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if no data (shouldn't happen now with fallback)
  if (!webSolutionData) {
    return null;
  }

  const getImageSrc = (imagePath, isMainImage = false) => {
    if (isUsingFallback) {
      if (isMainImage) {
        return getStaticImageUrl(imagePath);
      }
      return getStaticImageUrl(imagePath);
    }
    return `/api/image/download/${imagePath}`;
  };

  return (
    <div>
      {/* Development indicator - remove in production */}
      {isUsingFallback && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-2 text-sm">
          <p>⚠️ Using static fallback data (API unavailable)</p>
        </div>
      )}

      <div className="relative leading-none -mb-1">
        <img
          src={Wave3}
          alt="background"
          className="w-full h-auto transform rotate-180 block"
        />
      </div>

      <section className="relative bg-[#333] overflow-hidden py-12 md:py-16 lg:py-20">
        {/* Content Section */}
        <div className="flex flex-col md:flex-row justify-between items-start p-6 mx-4 sm:mx-10 md:mx-16 lg:mx-20 text-white">
          <div className="md:w-[60%]">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold mb-4 font-playfair"
              dangerouslySetInnerHTML={{ __html: webSolutionData.heading }}
            />
            <p
              className="text-base sm:text-lg lg:text-xl mb-4 font-inter pt-6 lg:pt-8"
              dangerouslySetInnerHTML={{ __html: webSolutionData.description }}
            />
          </div>
          <div className="md:w-[40%] flex justify-center">
            <img
              src={getImageSrc(webSolutionData.photo[0], true)}
              alt={webSolutionData.photoAlt}
              title={webSolutionData.imgtitle}
              className="w-40 h-40 mt-6 md:mt-0 hidden md:block object-cover rounded-lg"
              onError={(e) => {
                // Fallback if image fails to load
                e.target.src = getStaticImageUrl('static-main-image.jpg');
              }}
            />
          </div>
        </div>

        {/* Subsections Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12 lg:gap-16 p-6 mx-4 sm:mx-10 md:mx-16 lg:mx-20 text-white">
          {webSolutionData.subsections.map((subsection, index) => (
            <div key={index} className="flex items-start">
              <img
                src={getImageSrc(subsection.photo)}
                alt={subsection.photoAlt}
                title={subsection.imgtitle}
                className="h-10 w-10 mr-4 flex-shrink-0"
                onError={(e) => {
                  // Fallback if individual subsection image fails to load
                  e.target.src = getStaticImageUrl(`fallback-icon-${index}.svg`);
                }}
              />
              <div className="flex flex-col">
                <h3 className="text-xl sm:text-2xl font-bold font-inter mb-2">
                  {subsection.title}
                </h3>
                <p
                  className="text-base sm:text-lg md:text-left"
                  dangerouslySetInnerHTML={{ __html: subsection.description }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default WhyPartnerWithUs;