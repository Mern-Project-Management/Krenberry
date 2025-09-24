import React, { useState, useRef, useEffect } from "react";
import { MdKeyboardArrowRight, MdKeyboardArrowDown } from "react-icons/md";
import axios from "axios";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import "react-quill/dist/quill.snow.css";
import placeholder from "../../assets/placeholder.jpg"
// Dummy data to show when no data is available
const dummyServiceData = {
  heading: "<h2>Our Premium Service</h2>",
  description: "<p>Experience the best in class service with our expert team. We deliver exceptional results that exceed expectations.</p>",
  questions: [
    {
      question: "What services do you offer?",
      answer: "<p>We provide a wide range of professional services tailored to meet your specific needs and requirements.</p>"
    },
    {
      question: "How can I get started?",
      answer: "<p>Getting started is easy! Simply contact our team and we'll guide you through the process.</p>"
    },
    {
      question: "What makes you different?",
      answer: "<p>Our commitment to excellence and customer satisfaction sets us apart from the competition.</p>"
    }
  ],
  photo: [placeholder]
};

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

export default function CraftLeft() {
  const [openIndex, setOpenIndex] = useState(null);
  const answerRefs = useRef([]);
  const [service, setService] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [useDummyData, setUseDummyData] = useState(false);
  const location = useLocation();
  const faqData = service?.questions || [];

  // Fetch data effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/serviceDetails/front/${slug}`, {
          withCredentials: true,
        });

        // Ensure data exists and has the expected structure
        const data =
          response.data.data && response.data.data.length > 0
            ? response.data.data[1]
            : null;

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

  // Animation effect for FAQ toggles
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  // If no service data is available
  if (!service) {
    return (
      <div className="flex items-center justify-center py-20 bg-white">
        <div className="text-center p-8 max-w-2xl mx-auto">
          <div className="w-32 h-32 mx-auto mb-6 text-gray-300">
            <svg 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              className="w-full h-full"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Service Unavailable</h2>
          <p className="text-gray-600 mb-8 text-lg">
            We're having trouble loading this content. Please try again later.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex xl:flex-col items-center">
      <div className="flex flex-col lg:flex-row-reverse gap-10 lg:px-28 w-full">
        {/* Text Content for Large Screens */}
        <div className="w-full lg:w-[60%] px-4 flex flex-col justify-center order-1">
          {useDummyData && <DummyDataNotice />}
          <div className="max-w-full overflow-hidden">
            {service.heading ? (
              <div
                dangerouslySetInnerHTML={{ __html: service.heading }}
                className="text-2xl text-semibold px-4 sm:mt-0 sm:text-3xl md:text-5xl lg:text-4xl font-bold sm:pb-6 break-words leading-tight"
              />
            ) : (
              <h2 className="text-4xl font-bold pb-6">Default Heading</h2>
            )}
          </div>

          <p className="mt-4 text-lg pb-4 px-4 text-justify">
            {service.description ? (
              <div dangerouslySetInnerHTML={{ __html: service.description }} />
            ) : (
              "Easily manage your design projects with our convenient portal. Provide important details like design briefs and backlogs, and add an unlimited number of design requests. Our talented designers will promptly get to work on fulfilling your requests, all while enjoying the ease and efficiency of managing your projects in one place."
            )}
          </p>

          {faqData.map((faq, index) => (
            <div key={index} className="mb-2 sm:mb-4">
              <div
                className="flex justify-between items-center px-4 sm:px-7 md:px-10 lg:px-14 bg-[#f9f7f1] rounded-[20px] py-3 sm:py-4 lg:py-[17px] cursor-pointer"
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-base sm:text-lg lg:text-xl font-inter font-medium">
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
                className={`overflow-hidden ${
                  openIndex === index ? "block" : "hidden"
                }`}
              >
                <div 
                  className="pt-4 px-8 sm:px-10 lg:px-12 font-inter text-sm sm:text-base lg:text-base text-justify"
                  dangerouslySetInnerHTML={{ __html: faq.answer }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Video Content */}
        <div className="w-full lg:w-[40%] flex items-center justify-center order-2">
          <div className="relative px-3 sm:px-0 xl:border-[3px] overflow-hidden group transition-all duration-300 mx-4 my-4">
            {videoUrl ? (
              <video
                src={videoUrl}
                title={service.videotitle}
                autoPlay
                muted
                loop
                className="w-[450px] h-[450px] transition-all duration-300 object-cover"
              />
            ) : (
              (service.photo && service.photo.length > 0) ? (
                <img
                  src={service.photo[0].startsWith('http') ? service.photo[0] : `/api/image/download/${service.photo[0]}`}
                  alt="Service Image"
                  className="w-full max-w-[750px] h-[450px] object-cover"
                  onError={(e) => {
                    // If image fails to load, use local placeholder
                    e.target.onerror = null;
                    e.target.src = placeholder;
                  }}
                />
              ) : (
                <div className="w-[450px] h-[450px] bg-gray-100 flex items-center justify-center">
                  <img 
                    src="https://placehold.co/600x400/f9f7f1/2d2d2d/png?text=No+Image+Available" 
                    alt="No media available"
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            )}
            <div className="absolute inset-0 border-4 border-transparent m-10 transition-all duration-300"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
