import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { IoMdClose, IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

// Dummy data for fallback
const dummyProjects = [
  {
    _id: "dummy1",
    photo: ["https://picsum.photos/400/300?random=1", "https://picsum.photos/800/600?random=1"],
    imgtitle: ["Social Media Campaign - Brand A"],
    alt: "Social Media Marketing Project",
    link: null
  },
  {
    _id: "dummy2",
    photo: ["https://picsum.photos/400/300?random=2", "https://picsum.photos/800/600?random=2"],
    imgtitle: ["Instagram Growth Strategy"],
    alt: "Instagram Marketing Project",
    link: null
  },
  {
    _id: "dummy3",
    photo: ["https://picsum.photos/400/300?random=3", "https://picsum.photos/800/600?random=3"],
    imgtitle: ["Facebook Ad Campaign"],
    alt: "Facebook Advertising Project",
    link: null
  },
  {
    _id: "dummy4",
    photo: ["https://picsum.photos/400/300?random=4", "https://picsum.photos/800/600?random=4"],
    imgtitle: ["LinkedIn Marketing"],
    alt: "LinkedIn B2B Marketing",
    link: null
  },
  {
    _id: "dummy5",
    photo: ["https://picsum.photos/400/300?random=5", "https://picsum.photos/800/600?random=5"],
    imgtitle: ["Twitter Engagement Boost"],
    alt: "Twitter Marketing Campaign",
    link: null
  },
  {
    _id: "dummy6",
    photo: ["https://picsum.photos/400/300?random=6", "https://picsum.photos/800/600?random=6"],
    imgtitle: ["YouTube Channel Growth"],
    alt: "YouTube Marketing Strategy",
    link: null
  }
];

export default function LatestProject() {
  const [latestProject, setProjects] = useState([]);
  const [fullscreenImage, setFullscreenImage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDummyData, setUsingDummyData] = useState(false);
  const imageRefs = useRef({});
  const location = useLocation();
  const { slug } = useParams();

  const [scrollPosition, setScrollPosition] = useState(0);
  
  const NextArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute top-1/2 right-0 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 px-2 rounded-full hover:bg-opacity-75"
    >
      <IoIosArrowForward size={24} color="white" />
    </button>
  );
  
  const PrevArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      className="absolute top-1/2 left-0 transform -translate-y-1/2 z-10 bg-black bg-opacity-50 px-2 rounded-full hover:bg-opacity-75"
    >
      <IoIosArrowBack size={24} color="white" />
    </button>
  );

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      setUsingDummyData(false);
      
      try {
        const response = await axios.get(
          `/api/Portfolio/getPortfolioByServiceSlug?slug=smm-services`,
          { withCredentials: true }
        );
        
        if (response.data?.data && response.data.data.length > 0) {
          setProjects(response.data.data);
        } else {
          // No data found, use dummy data
          console.log("No projects found, using dummy data");
          setProjects(dummyProjects);
          setUsingDummyData(true);
        }
      } catch (error) {
        console.error("Error fetching service data:", error);
        // API call failed, use dummy data
        setProjects(dummyProjects);
        setUsingDummyData(true);
        setError("Using sample data - API unavailable");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [slug, location]);

  const handleImageClick = (image) => {
    setScrollPosition(window.scrollY);
    setFullscreenImage(image);
    document.body.style.overflow = "hidden";
  };

  const closeFullscreen = () => {
    setFullscreenImage(null);
    document.body.style.overflow = "auto";
    window.scrollTo({ top: scrollPosition, behavior: "instant" });
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />, 
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 3,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          initialSlide: 2,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  // Now we always show content (either real data or dummy data)
  const ProjectCard = ({ project, onClick }) => (
    <div className="relative cursor-pointer group">
      <img
        src={usingDummyData ? project.photo[0] : `/api/image/download/${project.photo[0]}`}
        alt={project.alt || "Project Image"}
        className="w-full sm:h-96 sm:object-cover object-contain rounded-lg shadow-xl border"
        loading="lazy"
      />
      <div
        onClick={() => onClick(usingDummyData ? project.photo[1] || project.photo[0] : project.photo[1] || project.photo[0])}
        className="absolute inset-0 flex items-center justify-center bg-gray-700 bg-opacity-40 opacity-0 group-hover:opacity-100 rounded-lg transition-opacity duration-300 ease-in-out"
      >
        <div className="text-center">
          <h3 className="text-white text-2xl font-semibold p-2">{project.imgtitle[0]}</h3>
          {project.link ? (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="px-4 py-2 bg-[#ec2127] text-white rounded-lg hover:bg-red-600 transition-colors">
                Visit Website
              </button>
            </a>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(usingDummyData ? project.photo[1] || project.photo[0] : project.photo[1] || project.photo[0]);
              }}
              className="px-4 py-2 bg-[#ec2127] text-white rounded-lg hover:bg-red-600 transition-colors mt-2"
            >
              View  
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="pb-16 -mt-4">
      <h2 className="heading font-semibold px-4 text-center">
        Latest <span className="text-[#ec2127]">Projects</span>
      </h2>
      <p className="subheading px-4 md:px-20 text-gray-600 text-center">
        Discover Our Latest Project Milestones
        {usingDummyData && (
          <span className="block text-sm text-orange-500 mt-1">
            * Showing sample projects
          </span>
        )}
      </p>

      <div className="mx-auto w-[85%] px-2 pt-16">
        {latestProject.length > 8 ? (
          <Slider {...settings}>
            {latestProject.map((project) => (
              <div key={project._id} className="px-2">
                <ProjectCard project={project} onClick={handleImageClick} />
              </div>
            ))}
          </Slider>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {latestProject.map((project) => ( 
              <ProjectCard
                key={project._id}
                project={project}
                onClick={handleImageClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 overflow-auto">
          <img
            src={usingDummyData ? fullscreenImage : `/api/image/download/${fullscreenImage}`}
            alt="Fullscreen view"
            className="w-full h-auto sm:object-cover object-contain select-none pointer-events-none"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
          />
          <button
            className="absolute top-4 right-4 text-white text-3xl md:text-4xl p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-75"
            onClick={closeFullscreen}
          >
            <IoMdClose />
          </button>
        </div>
      )}
    </div>
  );
}