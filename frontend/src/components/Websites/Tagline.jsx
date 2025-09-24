import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom';
import axios from 'axios'

export default function Tagline() {
    // Static fallback data
    const staticHeroData = {
        subheading: "We create user-centric digital experiences"
    };

    const [heroSection, setHeroSection] = useState(staticHeroData);
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchHeroSection = async () => {
            try {
                // Extract the last part of the URL
                const slug = location.pathname.split('/').filter(Boolean).pop();

                // Fetch data from the API using the slug
                const response = await axios.get(`/api/heroSection/front/${slug}`, { withCredentials: true });
                const heroData = response.data;
                
                // Check if data exists and has content
                if (heroData && Object.keys(heroData).length > 0) {
                    setHeroSection(heroData);
                } else {
                    // Use static data if response is empty
                    setHeroSection(staticHeroData);
                }

                // Simulate loading delay of 2 seconds
                setTimeout(() => {
                    setIsLoading(false);
                }, 2000);
            } catch (error) {
                console.error("Error fetching hero section:", error);
                // Set static data in case of error
                setHeroSection(staticHeroData);
                setIsLoading(false);
            }
        };

        fetchHeroSection();
    }, [location]);

    // Loading state
    if (isLoading) {
        return (
            <div className="bg-[#333333] my-16 flex flex-col items-center justify-center text-center p-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-600 rounded w-96 mx-auto"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#333333] my-16 flex flex-col items-center justify-center text-center p-6">
            <p className="text-white text-base md:text-lg lg:text-xl xl:text-2xl">
                {heroSection.subheading || staticHeroData.subheading}
            </p>
        </div>
    )
}