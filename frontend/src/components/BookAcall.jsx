import React, { useState, useEffect } from "react";
import axios from "axios";
import data from "../data/Bookacall.json"; // Adjust the path as needed
import { Link } from "react-router-dom";

export default function BookAcall() {
  const [call, setCall] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Static fallback data
  const staticData = {
    heading: "Book a Call with Our Experts",
    description: "Connect with our professional team to discuss your needs and get personalized solutions. Schedule a consultation today and take the first step towards achieving your goals.",
    photo: ["default-expert-image.jpg"],
    photoAlt: "Professional consultation",
    imgtitle: "Book a call with experts"
  };

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get(`/api/content/types/bookcall`, {
          withCredentials: true,
        });
        const expertData = response.data;

        if (expertData && expertData.length > 0) {
          setCall(expertData[0]);
        } else {
          // Use static data if no API data is available
          setCall(staticData);
        }
      } catch (error) {
        console.error("Error fetching experts:", error);
        // Use static data on API error
        setCall(staticData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExperts();
  }, []);

  // Show loading state or return null while loading
  if (isLoading) {
    return (
      <div className="relative bg-[#134C6C] m-12 sm:mb-16 text-white rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 flex items-center justify-center mx-4 sm:mx-6 md:mx-8 lg:mx-16 xl:mx-24">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!call) {
    return null;
  }

  return (
    <div className="relative bg-[#134C6C] m-12 sm:mb-16 text-white rounded-2xl p-5 sm:p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between mx-4 sm:mx-6 md:mx-8 lg:mx-16 xl:mx-24 overflow-hidden ">
      <div className="absolute -bottom-1/2 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-[#155376] rounded-t-full"></div>

      <div className="lg:w-1/2 mb-6 lg:mb-0 relative z-10">
        <h2
          className="text-2xl sm:text-3xl lg:text-4xl capitalize font-semibold mb-3 sm:mb-4"
          dangerouslySetInnerHTML={{ __html: call.heading }}
        ></h2>
        <p
          className="mb-6 text-sm sm:text-base lg:text-lg opacity-90"
          dangerouslySetInnerHTML={{ __html: call.description }}
        ></p>
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Link to="/contact">
            <button
              className={`bg-[#ec2127] text-white hover:bg-red-600 text-base py-3 px-6 rounded-lg font-semibold`}
            >
              Get Started
            </button>
          </Link>
        </div>
      </div>

      <div className="lg:w-1/2 xl:flex justify-center xl:justify-end relative z-10 hidden lg:block">
        <img
          src={
            call.photo && call.photo[0] 
              ? `/api/image/download/${call.photo[0]}` 
              : "/images/default-expert.jpg" // Fallback image path
          }
          alt={call.photoAlt}
          title={call.imgtitle}
          className="w-full h-auto max-w-[320px] sm:max-w-[380px] lg:max-w-[420px] xl:max-w-[460px] mx-auto object-contain"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = "/images/default-expert.jpg";
          }}
        />
      </div>
    </div>
  );
}