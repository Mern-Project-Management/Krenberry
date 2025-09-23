import React, { useEffect, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const slug =   location.pathname.split("/").filter(Boolean).pop();
        const photoType = "company"; // Logic for filtering the photoType

        const response = await axios.get(
          `/api/serviceImages/front/${slug}/${photoType}`,
          { withCredentials: true }
        );
        setCompanies(response.data);
      } catch (error) {
        console.error("Error fetching company data:", error);
      }
    };

    fetchData();
  }, [location.pathname]);

  if(companies.length===0){
    return null;
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
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Companies;
