import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axios from "axios";
import { FaCheckCircle } from "react-icons/fa";

gsap.registerPlugin(ScrollTrigger);

// Static fallback data for headings
const staticHeadingData = {
  heading: "How R&D Can Help Your Business",
  subheading: "Discover innovative solutions and cutting-edge technologies that drive your business forward through strategic research and development initiatives.",
  alt: "R&D Innovation",
  imgTitle: "Research and Development Solutions",
  // Using a placeholder image that would typically work
  photo: "placeholder-innovation.jpg"
};

// Static fallback data for cards
const staticCardsData = [
  {
    id: 1,
    title: "Technology Innovation",
    icon: "tech-icon.svg",
    questionsAndAnswers: [
      {
        question: "Advanced Research Solutions",
        answer: "Leverage cutting-edge research methodologies to develop breakthrough technologies that give your business a competitive advantage in the market."
      },
      {
        question: "Digital Transformation",
        answer: "Modernize your operations with digital solutions that streamline processes, improve efficiency, and enhance customer experiences."
      },
      {
        question: "AI & Machine Learning",
        answer: "Implement intelligent systems that automate complex tasks, provide predictive insights, and enable data-driven decision making."
      }
    ]
  },
  {
    id: 2,
    title: "Product Development",
    icon: "product-icon.svg",
    questionsAndAnswers: [
      {
        question: "Rapid Prototyping",
        answer: "Transform your ideas into tangible prototypes quickly using advanced development methodologies and cutting-edge tools."
      },
      {
        question: "Market Analysis",
        answer: "Conduct comprehensive market research to ensure your products meet customer needs and market demands effectively."
      },
      {
        question: "Quality Assurance",
        answer: "Implement rigorous testing protocols to ensure your products meet the highest standards of quality and reliability."
      }
    ]
  },
  {
    id: 3,
    title: "Process Optimization",
    icon: "process-icon.svg",
    questionsAndAnswers: [
      {
        question: "Efficiency Analysis",
        answer: "Analyze existing processes to identify bottlenecks, inefficiencies, and opportunities for improvement and automation."
      },
      {
        question: "Cost Reduction",
        answer: "Implement strategic solutions that reduce operational costs while maintaining or improving service quality and output."
      },
      {
        question: "Scalability Solutions",
        answer: "Design processes and systems that can grow with your business and adapt to changing market conditions."
      }
    ]
  },
  {
    id: 4,
    title: "Strategic Consulting",
    icon: "consulting-icon.svg",
    questionsAndAnswers: [
      {
        question: "Business Strategy",
        answer: "Develop comprehensive business strategies that align with your goals and position you for long-term success in your industry."
      },
      {
        question: "Risk Assessment",
        answer: "Identify potential risks and develop mitigation strategies to protect your business from unforeseen challenges."
      },
      {
        question: "Growth Planning",
        answer: "Create detailed growth plans that outline clear pathways for expansion and market penetration strategies."
      }
    ]
  }
];

export default function HowRndHelp() {
  const containerRef = useRef(null);
  const fadeInContainerRef = useRef(null);
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [existingPhoto, setExistingPhoto] = useState(null);
  const [imgTitle, setImgTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [cards, setCards] = useState([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [useStaticData, setUseStaticData] = useState(false);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=howrndhelp', { withCredentials: true });
      const { heading, subheading, photo, alt, imgTitle } = response.data;
      
      if (heading || subheading) {
        setHeading(heading || '');
        setSubheading(subheading || '');
        setAlt(alt || '');
        setImgTitle(imgTitle || '');
        setExistingPhoto(photo);
        setUseStaticData(false);
      } else {
        // Use static data if API returns empty data
        setHeading(staticHeadingData.heading);
        setSubheading(staticHeadingData.subheading);
        setAlt(staticHeadingData.alt);
        setImgTitle(staticHeadingData.imgTitle);
        setExistingPhoto(staticHeadingData.photo);
        setUseStaticData(true);
      }
    } catch (error) {
      console.error('Error fetching headings:', error);
      // Use static data on API failure
      setHeading(staticHeadingData.heading);
      setSubheading(staticHeadingData.subheading);
      setAlt(staticHeadingData.alt);
      setImgTitle(staticHeadingData.imgTitle);
      setExistingPhoto(staticHeadingData.photo);
      setUseStaticData(true);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await axios.get('/api/card/getAllCards');
      
      if (response.data && response.data.length > 0) {
        setCards(response.data);
      } else {
        // Use static data if API returns empty data
        setCards(staticCardsData);
        setUseStaticData(true);
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      // Use static data on API failure
      setCards(staticCardsData);
      setUseStaticData(true);
    } finally {
      setDataLoaded(true);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchHeadings(), fetchCards()]);
    };
    
    loadData();
    
    // Check screen size on mount and window resize
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 768); // 768px is typically md breakpoint
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    // Only run animations on large screens and after data is loaded
    if (!isLargeScreen || !dataLoaded) return;

    const animationDelay = setTimeout(() => {
      const applyAnimation = (elements) => {
        elements.forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 30, scale: 0 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 80%",
                end: "bottom 60%",
                scrub: true,
              },
            }
          );
        });
      };

      // Apply animations to both container sections only if elements exist
      if (containerRef.current) {
        const mainElements = containerRef.current.querySelectorAll(".fade-in");
        if (mainElements.length > 0) {
          applyAnimation(mainElements);
        }
      }

      if (fadeInContainerRef.current) {
        const cardElements = fadeInContainerRef.current.querySelectorAll(".fade-in");
        if (cardElements.length > 0) {
          applyAnimation(cardElements);
        }
      }
    }, 300);

    return () => clearTimeout(animationDelay);
  }, [isLargeScreen, cards, dataLoaded]); // Add dataLoaded to dependency array

  // Show loading state while data is being fetched
  if (!dataLoaded) {
    return (
      <div className="relative bg-[#1b1b1b] py-4 md:p-8 min-h-screen">
        {/* Top SVG */}
        <div className="absolute inset-x-0 top-0">
          <svg
            className="w-full"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1000 100"
            preserveAspectRatio="none"
          >
            <path
              className="fill-current text-white"
              d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
            />
          </svg>
        </div>
        
        {/* Loading spinner */}
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-[#1b1b1b] py-4 md:p-8">
      {/* Top SVG */}
      <div className="absolute inset-x-0 top-0">
        <svg
          className="w-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
        >
          <path
            className="fill-current text-white"
            d="M421.9,6.5c22.6-2.5,51.5,0.4,75.5,5.3c23.6,4.9,70.9,23.5,100.5,35.7c75.8,32.2,133.7,44.5,192.6,49.7c23.6,2.1,48.7,3.5,103.4-2.5c54.7-6,106.2-25.6,106.2-25.6V0H0v30.3c0,0,72,32.6,158.4,30.5c39.2-0.7,92.8-6.7,134-22.4c21.2-8.1,52.2-18.2,79.7-24.2C399.3,7.9,411.6,7.5,421.9,6.5z"
          />
        </svg>
      </div>

      {/* Main content */}
      <div
        ref={containerRef}
        className="flex flex-col mx-4 md:mx-20 lg:mx-40 md:flex-row items-center mt-12 md:mt-40 space-y-6 md:space-y-0 md:space-x-8"
      >
        <div className={`flex flex-col items-center md:items-start md:w-2/3 space-y-4 m-2 ${isLargeScreen ? 'fade-in' : ''}`}>
          <h2 className="text-2xl md:text-5xl capitalize text-white font-bold text-center md:text-left">{heading}</h2>
          <p className="text-white text-lg md:text-xl text-center md:text-left">{subheading}</p>
          {useStaticData && (
            <p className="text-sm text-gray-400 mt-2 text-center md:text-left">
              * Showing sample content
            </p>
          )}
        </div>
        <div className={`md:flex justify-center md:w-1/2 hidden ${isLargeScreen ? 'fade-in' : ''}`}>
          {useStaticData ? (
            // Show placeholder div when using static data
            <div className="w-32 h-32 md:w-60 md:h-60 max-w-sm md:max-w-md rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <div className="text-white text-center p-4">
                <div className="text-4xl mb-2">🔬</div>
                <div className="text-sm font-semibold">R&D Innovation</div>
              </div>
            </div>
          ) : (
            <img
              src={`/api/logo/download/${existingPhoto}`}
              alt={alt}
              title={imgTitle}
              className="w-32 h-32 md:w-60 md:h-60 max-w-sm md:max-w-md rounded-lg"
            />
          )}
        </div>
      </div>

      {/* Cards grid */}
      <div
        ref={fadeInContainerRef}
        className="grid lg:grid-cols-2 justify-center items-stretch gap-4 w-[80%] mx-auto mt-12  my-20"
      >
        {cards.map((card, index) => (
          <div key={card.id || index} className="flex flex-col h-full">
            <div className={`bg-white text-gray-900 p-6 md:p-12 rounded-3xl shadow-lg transition-transform duration-300 w-full h-full min-h-[500px] flex flex-col ${isLargeScreen ? 'fade-in' : 'opacity-100'}`}>
              {useStaticData ? (
                // Show icon placeholder when using static data
                <div className="h-12 w-12 mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-2xl">
                    {index === 0 && '💡'}
                    {index === 1 && '🚀'}
                    {index === 2 && '⚙️'}
                    {index === 3 && '📊'}
                  </span>
                </div>
              ) : (
                <img src={`/api/icon/download/${card.icon}`} alt={card.title} className="h-12 w-12 mb-4" />
              )}
              <h3 className="text-xl md:text-3xl capitalize font-bold mb-4">{card.title}</h3>
              <div className="flex-1">
                {card.questionsAndAnswers.map((feature, i) => (
                  <div key={i} className="flex flex-col gap-3 mb-2">
                    <div className="flex items-center gap-2 justify-start">
                      <FaCheckCircle className="text-xl text-green-400" />
                      <span className="text-lg md:text-xl capitalize font-bold text-black" dangerouslySetInnerHTML={{ __html: feature.question }}></span>
                    </div>
                    <span className="pl-6" dangerouslySetInnerHTML={{ __html: feature.answer }}></span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom SVG - Fixed to remove visible line */}
      <div className="absolute inset-x-0 bottom-0 translate-y-px">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1000 100"
          preserveAspectRatio="none"
        >
          <path
            className="fill-current text-white"
            d="M421.9,93.5c22.6,2.5,51.5-0.4,75.5-5.3c23.6-4.9,70.9-23.5,100.5-35.7c75.8-32.2,133.7-44.5,192.6-49.7c23.6-2.1,48.7-3.5,103.4,2.5c54.7,6,106.2,25.6,106.2,25.6V100H0V69.7c0,0,72-32.6,158.4-30.5c39.2,0.7,92.8,6.7,134,22.4c21.2,8.1,52.2,18.2,79.7,24.2C399.3,92.1,411.6,92.5,421.9,93.5z"
          />
        </svg>
      </div>
    </div>
  );
}