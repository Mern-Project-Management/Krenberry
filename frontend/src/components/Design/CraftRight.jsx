import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import gsap from "gsap";
import placeholder from "../../assets/placeholder.jpg"

// Dummy data to show when no data is available
const dummyServiceData = {
  heading: "<h2>Our Professional Services</h2>",
  description: "<p>We provide comprehensive solutions tailored to meet your business needs. Our expert team delivers high-quality services with innovative approaches and cutting-edge technology to help your business grow and succeed in today's competitive market.</p>",
  questions: [
    {
      question: "What services do you offer?",
      answer: "<p>We offer a comprehensive range of professional services including consulting, development, implementation, and ongoing support. Our team specializes in delivering customized solutions that align with your business objectives and drive measurable results.</p>"
    },
    {
      question: "How long does a typical project take?",
      answer: "<p>Project timelines vary depending on scope and complexity. Most projects range from 2-12 weeks. We provide detailed project timelines during our initial consultation phase and keep you updated throughout the entire process.</p>"
    },
    {
      question: "Do you provide ongoing support?",
      answer: "<p>Yes, we offer comprehensive ongoing support and maintenance services. Our support packages include regular updates, technical assistance, performance monitoring, and continuous optimization to ensure your solution remains effective and up-to-date.</p>"
    },
    {
      question: "What makes your approach different?",
      answer: "<p>Our approach combines industry expertise with innovative technology solutions. We focus on understanding your unique business challenges and developing tailored strategies that deliver sustainable results and long-term value for your organization.</p>"
    }
  ],
  photo: [placeholder]
};

export default function CraftRight() {
  const [openIndex, setOpenIndex] = useState(null);
  const answerRefs = useRef([]);
  const [service, setService] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useDummyData, setUseDummyData] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/industiesDetails/front/${slug}`, {
          withCredentials: true,
        });
        
        // Ensure data exists and has the expected structure
        const data = response.data.data && response.data.data.length > 0 ? response.data.data[0] : null;
        
        if (data) {
          setService(data);
          setVideoUrl(data.video ? `/api/video/download/${data.video}` : null);
          setUseDummyData(false);
        } else {
          // If no data found, use dummy data
          setService(dummyServiceData);
          setUseDummyData(true);
        }
      } catch (error) {
        console.error("Error fetching service data. Using dummy data instead.", error);
        // On error, use dummy data
        setService(dummyServiceData);
        setUseDummyData(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);

  useEffect(() => {
    if (openIndex !== null) {
      gsap.fromTo(
        answerRefs.current[openIndex],
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.3, ease: "power1.out" }
      );
    }
  }, [openIndex]);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      gsap.to(answerRefs.current[openIndex], {
        height: 0,
        opacity: 0,
        duration: 0.3,
        ease: "power1.out",
        onComplete: () => setOpenIndex(null),
      });
    } else {
      setOpenIndex(index);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse w-full max-w-4xl h-96 bg-gray-800 rounded-lg"></div>
      </div>
    );
  }

  // If no service data is available (shouldn't happen with dummy data, but just in case)
  if (!service) {
    return (
      <div className="flex items-center justify-center py-20 bg-white">
        <div className="text-center p-8 max-w-2xl mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-full h-full"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Service Unavailable</h2>
          <p className="text-gray-600 mb-8 text-lg">
            We're having trouble loading this content. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-gradient-to-r from-[#ec2127] to-red-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Add a notice when using dummy data
  const DummyDataNotice = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex justify-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-yellow-700">
            Showing sample content. The actual service details will be displayed here when available.
          </p>
        </div>
      </div>
    </div>
  );

  const faqData = service.questions || [];

  return (
    <div className="flex xl:flex-col items-center py-16 ">
      <div className="flex flex-col lg:flex-row gap-10 px-5 lg:px-28 w-full">
        
        {/* Text Content for Large Screens */}
        <div className="w-full lg:w-[60%] px-4 flex flex-col justify-center order-1">
          {/* Show notice when using dummy data */}
          <div className="max-w-full overflow-hidden">
            {useDummyData && <DummyDataNotice />}
            
            {/* Render the heading */}
            {service.heading ? (
              <div
                dangerouslySetInnerHTML={{ __html: service.heading }}
                className="sm:text-4xl text-2xl font-bold pb-6 break-words leading-tight"
              />
            ) : (
              <h2 className="sm:text-4xl text-2xl font-bold pb-6">Our Professional Services</h2>
            )}
          </div>

          <p className="mt-4 text-lg pb-4 text-justify">
            {service.description ? (
              <div dangerouslySetInnerHTML={{ __html: service.description }} />
            ) : (
              "We provide comprehensive solutions tailored to meet your business needs. Our expert team delivers high-quality services with innovative approaches and cutting-edge technology to help your business grow and succeed in today's competitive market."
            )}
          </p>

          {faqData.map((faq, index) => (
            <div key={index} className="mb-2 sm:mb-4">
              <div
                className="flex justify-between items-center px-4 sm:px-7 md:px-10 lg:px-14 bg-[#f9f7f1] rounded-[20px] py-3 sm:py-4 lg:py-[17px] cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg sm:text-lg lg:text-xl font-inter font-medium">
                  {faq.question}
                </h3>
                <span className="text-lg sm:text-xl lg:text-2xl">
                  {openIndex === index ? (
                    <MdKeyboardArrowDown />
                  ) : (
                    <MdKeyboardArrowRight />
                  )}
                </span>
              </div>
              <div
                ref={(el) => (answerRefs.current[index] = el)}
                className={`overflow-hidden ${openIndex === index ? "block" : "hidden"}`}
              >
                <div className="p-3 sm:p-4 lg:p-5 px-8 sm:px-10 lg:px-12 font-inter text-md sm:text-base lg:text-base text-justify">
                  <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Video Content */}
        <div className="w-full lg:w-[40%] flex items-center justify-center order-2">
          <div className="relative rounded-2xl border-[3px] overflow-hidden group transition-all duration-300 mx-4 my-4">
            {videoUrl ? (
              <video
                src={videoUrl}
                title={service.videotitle}
                autoPlay
                muted
                loop
                className="w-[450px] h-[450px] rounded-2xl transition-all duration-300 object-cover"
              />
            ) : (
              (service.photo && service.photo.length > 0) ? (
                <img
                  src={service.photo[0].startsWith ? 
                    (service.photo[0].startsWith('http') ? service.photo[0] : `/api/image/download/${service.photo[0]}`) : 
                    service.photo[0]
                  }
                  alt="Service Image"
                  className="w-full max-w-[750px] sm:h-[400px] h-[200px] aspect-[15/8] xl:object-cover lg:object-cover md:object-contain object-cover rounded-2xl"
                  onError={(e) => {
                    // If image fails to load, use local placeholder
                    e.target.onerror = null;
                    e.target.src = placeholder;
                  }}
                />
              ) : (
                <div className="w-[450px] h-[450px] bg-gray-100 rounded-2xl flex items-center justify-center">
                  <img 
                    src={placeholder}
                    alt="No media available"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
              )
            )}
            <div className="absolute inset-0 rounded-2xl border-4 border-transparent m-10 transition-all duration-300"></div>
          </div>
        </div>

      </div>
    </div>
  );
}