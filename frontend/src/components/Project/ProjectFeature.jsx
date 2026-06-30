import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import Marquee from "./Marquee";

const ProjectFeatures = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [backgroundImage, setBackgroundImage] = useState("");
  const location = useLocation();

  useEffect(() => {
    const fetchHeroData = async () => {
      try {
        const response = await axios.get(
          "/api/pageHeading/heading?pageType=portfolio",
          { withCredentials: true }
        );
        const { heading, subheading, photo } = response.data;
        setHeading(heading || "");
        setSubheading(subheading || "");
        if (photo) {
          setBackgroundImage(`/api/logo/download/${photo}`);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchHeroData();
  }, [location]);

  const heroStyle = backgroundImage
    ? {
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImage})`,
      }
    : {};

  return (
    <div
      className="relative flex flex-col items-center justify-center py-32 md:pt-40 bg-gradient-to-br from-gray-900 via-gray-800 to-black bg-cover bg-center overflow-hidden"
      style={heroStyle}
    >
      <div className="relative z-10 text-center mx-10 md:mx-35%">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold mb-7">
          {heading}
        </h1>
        <p className="text-gray-300 text-lg md:text-xl lg:text-2xl mb-6">
          {subheading || "We create user-centric digital experiences"}
        </p>

        {/* <button className="relative mt-6 py-2 px-7 text-lg font-bold bg-[#ec2127] text-white rounded-3xl overflow-hidden group">
          <span className="absolute inset-0 bg-gradient-to-r from-[#ec2127] to-yellow-800 transform origin-left scale-x-0 transition-transform duration-500 ease-out group-hover:scale-x-100" />
          <span className="relative z-10">Get Started</span>
        </button> */}

        {/* <p className="mt-12 text-lg text-[#114038] font-inter font-medium">
          Designs commonly featured by
        </p> */}
      </div>
      {/* <div className="w-full mt-8 relative z-10">
        <Marquee />
      </div> */}
    </div>
  );
};

export default ProjectFeatures;