import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const photoType = "company"; // Logic for filtering the photoType

        const response = await axios.get(
          `/api/serviceImages/front/${slug}/${photoType}`,
          { withCredentials: true }
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [location.pathname]);

  if (isLoading) {
    return null; // or a loading spinner if you prefer
  }

  if (companies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="w-48 h-48 mb-6 text-gray-400">
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="1" 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="w-full h-full"
          >
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
            <line x1="12" y1="22.08" x2="12" y2="12"></line>
          </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-700 mb-2">No Companies Found</h3>
        <p className="text-gray-500 max-w-md">
          We couldn't find any companies using this service yet. Check back later for updates!
        </p>
      </div>
    );
  }
  
  return (
    <div className="mb-10">
      <div className="py-6 lg:pt-16 pt-5 px-4  ">
        <h2 className="sm:text-4xl md:text-5xl text-4xl capitalize text-black font-semibold text-center ">
          Companies using this{" "}
          <span className="text-[#ec2127]">service</span>
        </h2>
      </div>
      <div className="py-3 mx-4 sm:mx-8 lg:mx-16 ">
        <div className="flex flex-wrap gap-8 justify-center items-center">
          {companies.map((company, index) => (
            <img
              key={index}
              src={`/api/serviceImages/download/${company.images}`} // Ensure the correct path
              alt={company.alt}
              title={company.imgtitle}
              className="object-contain w-full h-auto max-w-[120px] sm:max-w-[150px] lg:max-w-[180px]" // Responsive image sizing
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Companies;
