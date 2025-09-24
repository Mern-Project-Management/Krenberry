import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import { gsap } from "gsap";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";

// Static fallback data
const staticFallbackData = {
  heading: "Frequently Asked Questions",
  subheading: "Find answers to common questions about our services and solutions",
  faqs: [
    {
      _id: "static-1",
      question: "What services do you provide?",
      answer: "We offer a comprehensive range of digital services including web development, mobile app development, digital marketing, cloud solutions, and IT consulting. Our team specializes in creating custom solutions tailored to your business needs."
    },
    {
      _id: "static-2",
      question: "How long does a typical project take?",
      answer: "Project timelines vary depending on complexity and scope. A simple website typically takes 2-4 weeks, while more complex applications can take 3-6 months. We provide detailed project timelines during our initial consultation and keep you updated throughout the development process."
    },
    {
      _id: "static-3",
      question: "Do you provide ongoing support and maintenance?",
      answer: "Yes, we offer comprehensive support and maintenance packages. This includes regular updates, security patches, performance monitoring, and technical support. We believe in building long-term partnerships with our clients to ensure their continued success."
    },
    {
      _id: "static-4",
      question: "What is your pricing model?",
      answer: "Our pricing is project-based and depends on the specific requirements, complexity, and timeline. We provide transparent, detailed quotes with no hidden costs. We also offer flexible payment terms and can work within various budget ranges to deliver maximum value."
    },
    {
      _id: "static-5",
      question: "Can you work with our existing systems?",
      answer: "Absolutely! We have extensive experience integrating with existing systems, databases, and third-party services. Our team will assess your current infrastructure and recommend the best approach for seamless integration while maintaining data integrity and system performance."
    },
    {
      _id: "static-6",
      question: "Do you provide training for our team?",
      answer: "Yes, we provide comprehensive training sessions for your team to ensure they can effectively use and manage the solutions we develop. This includes user manuals, video tutorials, and hands-on training sessions tailored to different user roles and skill levels."
    },
    {
      _id: "static-7",
      question: "What technologies do you work with?",
      answer: "We work with a wide range of modern technologies including React, Node.js, Python, PHP, mobile frameworks like React Native and Flutter, cloud platforms like AWS and Azure, and various databases. We stay updated with the latest technologies to provide cutting-edge solutions."
    },
    {
      _id: "static-8",
      question: "How do you ensure project quality?",
      answer: "We follow industry best practices including thorough testing, code reviews, quality assurance processes, and regular client feedback sessions. Our team uses agile methodology to ensure transparency and deliver high-quality results that meet your expectations."
    }
  ]
};

const FAQ = () => {
  const [faqs, setFaqs] = useState([]);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [openIndex, setOpenIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const answerRefs = useRef([]);
  const location = useLocation();
  const { slug } = useParams();

  useEffect(() => {
    // Fetch FAQ data
    const fetchFAQData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `/api/faq/getFAQByServiceSlug${slug ? `?slug=${slug}` : ""}`,
          { timeout: 5000 } // 5 second timeout
        );
        
        if (response.data && response.data.data && response.data.data.length > 0) {
          setFaqs(response.data.data);
          setIsUsingFallback(false);
        } else {
          throw new Error('No FAQ data received from API');
        }
      } catch (error) {
        console.error("Error fetching FAQ data, using static fallback:", error);
        setFaqs(staticFallbackData.faqs);
        setIsUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    // Fetch page heading and subheading
    const fetchHeadingData = async () => {
      try {
        const response = await axios.get(
          "/api/pageHeading/heading?pageType=faq",
          { timeout: 5000 } // 5 second timeout
        );
        
        if (response.data && response.data.heading) {
          setHeading(response.data.heading);
          setSubheading(response.data.subheading || "");
        } else {
          throw new Error('No heading data received from API');
        }
      } catch (error) {
        console.error("Error fetching page heading data, using static fallback:", error);
        setHeading(staticFallbackData.heading);
        setSubheading(staticFallbackData.subheading);
      }
    };

    fetchFAQData();
    fetchHeadingData();
  }, [slug, location.pathname]);

  useEffect(() => {
    if (openIndex !== null && answerRefs.current[openIndex]) {
      gsap.fromTo(
        answerRefs.current[openIndex],
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.4, ease: "power1.out" }
      );
    }
  }, [openIndex]);

  const toggleFAQ = (index) => {
    if (openIndex === index) {
      if (answerRefs.current[openIndex]) {
        gsap.to(answerRefs.current[openIndex], {
          height: 0,
          opacity: 0,
          duration: 0.4,
          ease: "power1.out",
          onComplete: () => setOpenIndex(null),
        });
      }
    } else {
      setOpenIndex(index);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto mb-16 pt-16 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if no FAQs (shouldn't happen now with fallback)
  if (faqs.length === 0) {
    return null;
  }

  return (
    <div className="max-w-7xl sm:w-[63%] md:w-[97%] lg:w-full mx-auto mb-16 pt-16 lg:max-w-7xl xl:max-w-7xl">
      {/* Development indicator - remove in production */}
      {isUsingFallback && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3 mb-6 text-sm rounded">
          <p>⚠️ Using static fallback data (API unavailable)</p>
        </div>
      )}

      <h2 className="text-4xl md:text-5xl text-center font-semibold">
        {heading}
      </h2>
      <h3 className="md:text-[23px] text-center pb-16 mt-4 text-gray-700">
        {subheading}
      </h3>
      
      {faqs.map((faq, index) => (
        <div key={faq._id} className="mb-2 sm:mb-4">
          <div
            className="flex justify-between items-center px-4 sm:px-7 md:px-10 lg:px-14 bg-[#f9f7f1] rounded-[20px] py-3 sm:py-4 lg:py-[17px] cursor-pointer hover:bg-[#f5f3ed] transition-colors duration-200"
            onClick={() => toggleFAQ(index)}
          >
            <h3 className="text-base sm:text-lg lg:text-xl font-inter font-medium pr-4">
              {faq.question}
            </h3>
            <span className="text-lg sm:text-xl lg:text-2xl flex-shrink-0 transition-transform duration-200">
              {openIndex === index ? <FaMinus /> : <FaPlus />}
            </span>
          </div>
          <div
            ref={(el) => (answerRefs.current[index] = el)}
            className={`overflow-hidden ${
              openIndex === index ? "block" : "hidden"
            }`}
          >
            <div
              className="p-3 sm:p-4 lg:p-5 px-8 sm:px-10 lg:px-12 font-inter text-sm sm:text-base lg:text-base text-justify leading-relaxed"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default FAQ;