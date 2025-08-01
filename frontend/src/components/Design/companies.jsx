import React, { useEffect, useState } from "react";
import axios from "axios";

const Companies = ({ serviceSlug }) => {
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photoType = "company"; 

        const response = await axios.get(
          `/api/serviceImages/front/${serviceSlug}/${photoType}`,
          { withCredentials: true }
        );
        
        // Check if the response has data
        if (response.data) {
          setCompanies(response.data);
        } else {
          setCompanies([]);  // Ensure empty array if no data
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setError("Failed to load companies.");
      }
    };

    if (serviceSlug) { // Only fetch if serviceSlug exists
      fetchData();
    }
  }, [serviceSlug]); // Only re-run when serviceSlug changes

  if (error) {
    return (
      <div className="text-center py-16 text-gray-600">
        <p>{error}</p>
      </div>
    );
  }

  if (!companies.length) {
    return null; // Or you can display a loading spinner or message here
  }

  return (
    <div className="mb-4">
      <div className="py-6 px-4 mt-20">
        <h1 className="heading text-black text-center font-semibold">
          Companies Using This{" "}
          <span className="text-[#ec2127]">Service</span>
        </h1>
      </div>

      <div className="py-6 mx-4 sm:mx-8 lg:mx-16 mt-8">
        <div className="flex flex-wrap justify-center gap-8">
          {companies.map((company, index) => (
            <div
              key={index}
              className="w-56 h-36 flex items-center justify-center p-4"
            >
              <img
                src={`/api/industryImages/download/${company.images}`}
                alt={company.alt || "Company Logo"}
                className="max-w-full max-h-full object-contain select-none pointer-events-none"
                draggable={false}
                onContextMenu={(e) => e.preventDefault()}
              />
            </div>
          ))}
        </div>
      </div>
    </div>

  );
};

export default Companies;
