import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

export default function WeAreExpert() {
  // Static fallback data
  const staticData = {
    heading: "We Are <span class='text-blue-600'>Experts</span> In",
    subheading: "Our team consists of skilled professionals with expertise in various technologies and domains",
    experts: [
      { id: 1, title: "React", imageUrl: null },
      { id: 2, title: "Node.js", imageUrl: null },
      { id: 3, title: "Python", imageUrl: null },
      { id: 4, title: "JavaScript", imageUrl: null },
      // { id: 5, title: "TypeScript", imageUrl: null },
      // { id: 6, title: "AWS", imageUrl: null },
      // { id: 7, title: "Docker", imageUrl: null },
      // { id: 8, title: "MongoDB", imageUrl: null },
      // { id: 9, title: "PostgreSQL", imageUrl: null },
      // { id: 10, title: "GraphQL", imageUrl: null },
      // { id: 11, title: "Vue.js", imageUrl: null },
      // { id: 12, title: "Angular", imageUrl: null },
      // { id: 13, title: "Laravel", imageUrl: null },
      // { id: 14, title: "Django", imageUrl: null },
      // { id: 15, title: "Flutter", imageUrl: null }
    ]
  };

  const [experts, setExperts] = useState(staticData.experts);
  const [heading, setHeading] = useState(staticData.heading);
  const [subheading, setSubheading] = useState(staticData.subheading);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingStaticData, setUsingStaticData] = useState(false);
  const { slug } = useParams();

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Pass undefined as slug if it's "about-us"
        const response = await axios.get(
          `/api/content/getToolsByServiceSlug?slug=${slug === "about-us" ? undefined : slug}`,
          {
            withCredentials: true,
          }
        );

        if (!response.data?.data) {
          throw new Error("Invalid response format");
        }

        const apiHeading = response.data.data.heading;
        const apiSubheading = response.data.data.subheading;
        const fetchedExperts = response.data.data.subsections || [];

        // Check if API returned meaningful data
        if (!apiHeading && !apiSubheading && fetchedExperts.length === 0) {
          throw new Error("No data received from API");
        }

        setHeading(apiHeading || staticData.heading);
        setSubheading(apiSubheading || staticData.subheading);

        if (fetchedExperts.length > 0) {
          // Process images in parallel
          const expertsWithImages = await Promise.all(
            fetchedExperts.map(async (expert) => {
              if (!expert.photo) {
                return { ...expert, imageUrl: null };
              }

              try {
                const imageResponse = await axios.get(
                  `/api/image/download/${expert.photo}`,
                  {
                    responseType: "blob",
                    withCredentials: true,
                  }
                );
                const imageUrl = URL.createObjectURL(imageResponse.data);
                return { ...expert, imageUrl };
              } catch (imageError) {
                console.error(`Error loading image for expert: ${expert.title}`, imageError);
                return { ...expert, imageUrl: null };
              }
            })
          );

          setExperts(expertsWithImages);
          setUsingStaticData(false);
        } else {
          // Use static experts if no experts returned from API
          setExperts(staticData.experts);
          setUsingStaticData(true);
        }
      } catch (err) {
        console.error("Error fetching expert data:", err);
        setError("API failed, showing default content");
        
        // Use static data as fallback
        setHeading(staticData.heading);
        setSubheading(staticData.subheading);
        setExperts(staticData.experts);
        setUsingStaticData(true);
      } finally {
        setLoading(false);
      }
    };

    fetchExperts();

    // Cleanup function to revoke object URLs
    return () => {
      experts.forEach(expert => {
        if (expert.imageUrl && !usingStaticData) {
          URL.revokeObjectURL(expert.imageUrl);
        }
      });
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-8xl mx-auto xl:px-28 px-4 my-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-300 rounded w-96 mx-auto mb-12"></div>
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {Array(10).fill(0).map((_, index) => (
              <div key={index} className="flex flex-col items-center">
                <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Always render the component, whether using API data or static data
  const renderExpertImage = (expert) => (
    expert.imageUrl ? (
      <img
        src={expert.imageUrl}
        alt={expert.title || "Expert"}
        className="w-20 h-20 md:w-28 md:h-28 rounded-full object-cover shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg"
      />
    ) : (
      <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center shadow-md transition-transform duration-300 hover:scale-110 hover:shadow-lg">
        <span className="text-xs md:text-sm font-semibold text-white text-center px-2">
          {expert.title || "Expert"}
        </span>
      </div>
    )
  );

  return (
    <div className="max-w-8xl mx-auto xl:px-28 px-4 my-12">
      {/* Show indicator if using static data */}
      {usingStaticData && (
        <div className="mb-4 text-center">
          <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            Showing default content
          </span>
        </div>
      )}
      
      <h2
        dangerouslySetInnerHTML={{ __html: heading }}
        className="capitalize heading font-semibold text-center mt-8 md:mt-12"
      />
      <p
        dangerouslySetInnerHTML={{ __html: subheading }}
        className="subheading text-center mt-4 mb-12"
      />
      
      {/* Grid container with responsive gap and padding */}
      <div className="space-y-8 md:space-y-10">
        {/* First row - up to 10 experts */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-6">
          {experts.slice(0, 10).map((expert, index) => (
            <div key={`row1-${expert.id || index}`} className="flex flex-col items-center">
              {renderExpertImage(expert)}
            </div>
          ))}
        </div>

        {/* Second row - next 11 experts (if available) */}
        {experts.length > 10 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {experts.slice(10, 21).map((expert, index) => (
              <div key={`row2-${expert.id || index}`} className="flex flex-col items-center">
                {renderExpertImage(expert)}
              </div>
            ))}
          </div>
        )}

        {/* Third row - next 10 experts (if available) */}
        {experts.length > 21 && (
          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            {experts.slice(21, 31).map((expert, index) => (
              <div key={`row3-${expert.id || index}`} className="flex flex-col items-center">
                {renderExpertImage(expert)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}