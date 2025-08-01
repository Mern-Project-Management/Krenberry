import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const PremiumTemplatesSection = () => {
  const [content, setContent] = useState(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get(
          `/api/content/types/premiumtemplates`,
          { withCredentials: true }
        );
        const contentData = response.data;

        if (contentData.length > 0) {
          setContent(contentData[0]);
        }
      } catch (error) {
        console.error("Error fetching content:", error);
      }
    };

    fetchContent();
  }, []);

  if (!content) {
    return null; // or a loader/spinner component
  }

  return (
    <div className="relative bg-[#f9f7f1] text-black rounded-2xl py-10 px-6 lg:px-20 lg:flex flex-col lg:flex-row items-center justify-between mx-4 lg:mx-40 overflow-hidden mb-10 my-6">
      {/* Decorative background element similar to BookAcall */}
      <div className="absolute -bottom-1/2 left-1/2 transform -translate-x-1/2 w-[800px] h-[400px] bg-[#e5e3dd] rounded-t-full"></div>

      <div className="lg:w-1/2 mb-6 lg:mb-0 relative z-10">
        <h2
          className="text-3xl lg:text-4xl font-semibold mb-4 font-inter"
          dangerouslySetInnerHTML={{ __html: content.heading }}
        />
        <p
          className="text-base lg:text-lg mb-6 font-inter"
          dangerouslySetInnerHTML={{ __html: content.description }}
        />
        <div className="flex flex-col md:flex-row">
          <a
            target="_blank"
            href="https://codecanyon.net/user/rndtechnosoft/portfolio?sso=1&_gl=1*1x7xliu*_gcl_aw*R0NMLjE3Mjg5ODAzMDYuQ2owS0NRandnck80QmhDMkFSSXNBS1E3elVrdlNjNXJ1YVpfRTEyNkstNFoyZDd3RFRvNWVjSVdJMWRVbXltOTNCQlBnQ3otZXlYbldpd2FBalNnRUFMd193Y0I.*_gcl_au*MTkxMTIzNTE3MS4xNzI4OTExMjg1*_ga*NjI3NDIwNDc1LjE3Mjg5MTEyODU.*_ga_ZKBVC1X78F*MTczMDE3MjI0Ny4zLjEuMTczMDE3MjQxNy4xNi4wLjA.&_ga=2.201880597.585621995.1730172247-627420475.1728911285&_gac=1.186169947.1729055186.Cj0KCQjwgrO4BhC2ARIsAKQ7zUkvSc5ruaZ_E126K-4Z2d7wDTo5ecIWI1dUmymym93BBPgCz-eyXnWiwaAjSgEALw_wcB"
          >
            <button
              className="bg-[#ec2127] text-white hover:bg-red-600 text-md py-2 px-6 rounded-lg mr-4 mb-4 md:mb-0 font-semibold w-md"
            >
              Buy Now
            </button>
          </a>
        </div>
      </div>

      <div className="lg:w-1/2 xl:flex justify-center xl:justify-end relative z-10 hidden lg:block">
        <img
          src={`/api/image/download/${content.photo[0]}`}
          alt={content.photoAlt}
          title={content.imgtitle}
          className="w-full h-auto max-w-[400px] mx-auto rounded-lg"
        />
      </div>
    </div>
  );
};

export default PremiumTemplatesSection;