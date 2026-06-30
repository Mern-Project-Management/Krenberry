import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function WhatYouGet() {
  const [plans, setPlans] = useState([]);
  const [heading, setHeading] = useState('');

  useEffect(() => {
    const fetchExperts = async () => {
      try {
        const response = await axios.get(`/api/content/types/everyplan`, { withCredentials: true });
        const expertData = response.data;
        setHeading(response.data[0].heading);

        if (expertData.length > 0) {
          const subsections = expertData[0].subsections;

          // Fetch images for each expert
          const expertsWithImages = await Promise.all(
            subsections.map(async (expert) => {
              try {
                const imageResponse = await axios.get(
                  `/api/image/download/${expert.photo}`,
                  { responseType: 'blob' }
                );
                const imageUrl = URL.createObjectURL(imageResponse.data);
                return { ...expert, imageUrl };
              } catch (error) {
                console.error("Error fetching image:", error);
                return { ...expert, imageUrl: null };
              }
            })
          );

          setPlans(expertsWithImages);
        }
      } catch (error) {
        console.error("Error fetching experts:", error);
      }
    };

    fetchExperts();
  }, []);

  if (plans.length === 0) {
    return null;
  }

  return (
    <div className='relative md:pt-0  md:pb-0'>
    
      <div className="relative max-w-8xl mx-auto xl:px-24 ">
        <div className="relative  mx-auto  px-6 z-10 ">
          <h2 className="text-4xl md:text-5xl sm:mx-16 font-semibold capitalize text-center mb-12" dangerouslySetInnerHTML={{ __html: heading }}>
          </h2>
          <div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {plans.map((plan, index) => (
                <li key={index} className="flex flex-col items-center text-center">
                  <img
                    src={plan.imageUrl || 'path_to_default_image.jpg'}
                    alt={plan.photoAlt}
                    title={plan.imgtitle}
                    className="mb-6 lg:w-24 lg:h-24 w-28 h-28 object-contain"
                  />
                  <h3 className="text-xl capitalize font-semibold pb-3">{plan.title}</h3>
                  <p dangerouslySetInnerHTML={{ __html: plan.description }}></p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
