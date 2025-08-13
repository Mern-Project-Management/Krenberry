import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { IoStarSharp, IoStarHalfSharp, IoStarOutline } from 'react-icons/io5';

const RatingStars = ({ rating }) => {
  const totalStars = 5;
  const stars = [];

  for (let i = 0; i < totalStars; i++) {
    if (i < Math.floor(rating)) {
      stars.push(<IoStarSharp key={i} className="text-yellow-300 w-6 h-6" />);
    } else if (i < rating) {
      stars.push(<IoStarHalfSharp key={i} className="text-yellow-300 w-6 h-6" />);
    } else {
      stars.push(<IoStarOutline key={i} className="text-yellow-300 w-6 h-6" />);
    }
  }

  return <div className="flex items-center">{stars}</div>;
};

export default function HeroSection({ serviceGridRef }) {
  const [heroSection, setHeading] = useState("");
  const [rating, setRating] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const fetchHeadings = async () => {
      try {
        const response = await axios.get('/api/pageHeading/heading?pageType=testimonial', { withCredentials: true });
        const { heading } = response.data;
        setHeading(heading || '');
      } catch (error) {
        console.error(error);
      }
    };

    const fetchRating = async () => {
      try {
        const response = await axios.get('/api/testimonial/getTestimonialRating', { withCredentials: true });
        const { averageRating } = response.data;
        setRating(Number(averageRating) || 0);
      } catch (error) {
        console.error(error);
      }
    };

    fetchHeadings();
    fetchRating();
  }, []);

  const scrollToServices = () => {
    if (serviceGridRef.current) {
      serviceGridRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-24 md:pt-36 pb-20 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="text-center mx-4 md:mx-10 lg:mx-20">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-semibold mb-7 font-serif">
          {heroSection || "Testimonials"}
        </h1>
        {rating !== null && (
          <div className="flex items-center justify-center gap-4 mt-4">
            <RatingStars rating={rating} />
            <p className="text-white text-lg md:text-xl font-medium">{rating.toFixed(1)} out of 5</p>
          </div>
        )}
      </div>
    </div>
  );
}