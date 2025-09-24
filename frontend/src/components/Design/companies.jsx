import React, { useEffect, useState } from "react";
import axios from "axios";
import placeholder from "../../assets/placeholder.jpg";
// Static fallback data
const staticCompanies = [
  {
    images:placeholder,
    alt: "Google",
    name: "Google"
  },
  {
    images:placeholder, 
    alt: "Microsoft",
    name: "Microsoft"
  },
  {
    images:placeholder,
    alt: "Amazon", 
    name: "Amazon"
  },
  {
    images:placeholder,
    alt: "Apple",
    name: "Apple"
  },
  {
    images:placeholder,
    alt: "Meta (Facebook)",
    name: "Meta"
  },
  {
    images:placeholder,
    alt: "Netflix",
    name: "Netflix"
  },
 
  {
    images:placeholder,
    alt: "Adobe",
    name: "Adobe"
  }
];

const Companies = ({ serviceSlug }) => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingStaticData, setUsingStaticData] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const photoType = "company"; 

        const response = await axios.get(
          `/api/serviceImages/front/${serviceSlug}/${photoType}`,
          { withCredentials: true }
        );
        
        // Check if the response has data and it's an array with items
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          setCompanies(response.data);
          setUsingStaticData(false);
        } else {
          // Use static data if API returns empty or invalid data
          setCompanies(staticCompanies);
          setUsingStaticData(true);
        }
      } catch (error) {
        console.error("Error fetching company data:", error);
        setError("Failed to load companies from server");
        // Use static data on error
        setCompanies(staticCompanies);
        setUsingStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    if (serviceSlug) {
      fetchData();
    } else {
      // If no serviceSlug, show static data
      setCompanies(staticCompanies);
      setUsingStaticData(true);
      setLoading(false);
    }
  }, [serviceSlug]);

  // Show loading state while maintaining UI structure
  if (loading) {
    return (
      <div className="mb-4">
        <div className="px-4 ">
          <h1 className="heading text-black text-center font-semibold">
            Companies Using This{" "}
            <span className="text-[#ec2127]">Service</span>
          </h1>
        </div>
        
        <div className="py-6 mx-4 sm:mx-8 lg:mx-16 mt-8">
          <div className="flex flex-wrap justify-center gap-8">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-56 h-36 flex items-center justify-center p-4"
              >
                <div className="w-32 h-20 bg-gray-200 animate-pulse rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Get the appropriate image source with fallback
  const getImageSrc = (company) => {
    // If using static data, use the placeholder
    if (usingStaticData) {
      return company.images || placeholder;
    }
    
    // If company has an image, return the API endpoint
    if (company?.images) {
      return `/api/industryImages/download/${company.images}`;
    }
    
    // Fallback to a placeholder with the company name
    return placeholder;
  };

  // Handle image loading and error states
  const CompanyLogo = ({ company }) => {
    const [imgSrc, setImgSrc] = useState(getImageSrc(company));
    const [hasError, setHasError] = useState(false);

    // Reset image source when company changes
    useEffect(() => {
      setImgSrc(getImageSrc(company));
      setHasError(false);
    }, [company]);

    const handleError = () => {
      if (!hasError) {
        setHasError(true);
        setImgSrc(placeholder);
      }
    };

    return (
      <div className="w-full h-full flex items-center justify-center p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-300">
        <img
          src={imgSrc}
          alt={company.alt || company.name || 'Company Logo'}
          className="max-w-full max-h-full object-contain select-none pointer-events-none transition-transform duration-200 hover:scale-105"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onError={handleError}
          loading="lazy"
        />
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 p-4">
            <span className="text-gray-400 text-sm text-center">
              {company.name || 'Company Logo'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mb-4">
      <div className=" px-4 ">
        <h1 className="heading text-black text-center font-semibold">
          Companies Using This{' '}
          <span className="text-[#ec2127]">Service</span>
        </h1>
        {usingStaticData && (
          <p className="text-center mt-2 text-sm text-gray-500 italic">
            Showing example companies
          </p>
        )}
      </div>

      <div className="py-6 mx-4 sm:mx-8 lg:mx-16">
        <div className="flex flex-wrap justify-center gap-6">
          {companies.map((company, index) => (
            <div
              key={`${company.id || company.name || index}`}
              className="w-56 h-36 flex items-center justify-center"
            >
              <CompanyLogo company={company} />
            </div>
          ))}
        </div>
      </div>

      {error && usingStaticData && (
        <div className="text-center pb-4">
          <p className="text-sm text-orange-600">
            Note: Showing example data due to connection issues
          </p>
        </div>
      )}
    </div>
  );
};

export default Companies;