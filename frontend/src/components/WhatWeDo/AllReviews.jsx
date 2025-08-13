import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import { FaPlay, FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import ReviweHeding from "../WhatWeDo/ReviewHeading";

const Gallery = () => {
    const [fullscreenVideo, setFullscreenVideo] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await axios.get(`/api/testimonial/getTestimonialsFront`, { withCredentials: true });
                setReviews(response.data.data);
            } catch (error) {
                console.error("Error fetching reviews:", error);
            }
        };
        fetchReviews();
    }, []);

    const renderRating = (rating) => {
        const totalStars = 5;
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const unfilledStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center">
                {[...Array(filledStars)].map((_, i) => (
                    <FaStar key={`filled-${i}`} className="text-yellow-400 w-4 h-4" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-yellow-400 w-4 h-4" />}
                {[...Array(unfilledStars)].map((_, i) => (
                    <FaRegStar key={`unfilled-${i}`} className="text-yellow-400 w-4 h-4" />
                ))}
            </div>
        );
    };

    const formatDate = (createdAt) => {
        const date = new Date(createdAt);
        const options = {
            timeZone: 'Asia/Kolkata', // IST
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
        };
        return date.toLocaleString('en-IN', options);
    };

    const openReviewModal = (review) => {
        setSelectedReview(review);
    };

    const closeReviewModal = () => {
        setSelectedReview(null);
    };

    return (
        <div className="bg-gray-100">
            <div className="">
                <ReviweHeding />
                
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 w-[90%] mx-auto py-16">
                    {reviews.map((item) => (
                        <div 
                            key={item._id} 
                            className="bg-white rounded-lg shadow-lg overflow h-[580px] transition-transform duration-300 hover:scale-105"
                        >
                            <div className="relative h-[20rem]">
                                {item.photo && item.photo.length > 0 && item.photo[0] ? (
                                    <img
                                        className="w-full h-full object-cover"
                                        src={`/api/image/download/${item.photo[0]}`}
                                        alt={item.alt && item.alt[0] ? item.alt[0] : "testimonial-photo"}
                                    />
                                ) : (
                                    <img
                                        className="w-full h-full object-cover"
                                        src="./placeholder.webp"
                                        alt="placeholder"
                                    />
                                )}
                                {item.video && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFullscreenVideo(`/api/video/download/${item.video}`);
                                        }}
                                        className="absolute bottom-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors duration-300"
                                        aria-label="Play video"
                                    >
                                        <FaPlay className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <div className="p-6 h-[12rem] flex flex-col justify-between">
                                <div>
                                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm" dangerouslySetInnerHTML={{ __html: item.testimony }}></p>
                                    <button
                                        onClick={() => openReviewModal(item)}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium underline transition-colors duration-300"
                                        aria-label="Read more about this testimonial"
                                    >
                                        Read More
                                    </button>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-base">{item.name}</p>
                                        <p className="text-sm text-gray-500">{item.designation}</p>
                                        {item.createdAt && (
                                            <p className="text-sm text-gray-500">{formatDate(item.createdAt)}</p>
                                        )}
                                    </div>
                                    {item.rating && renderRating(item.rating)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {fullscreenVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
                    <div className="relative w-full h-full max-w-4xl max-h-screen p-4">
                        <video
                            className="w-full h-full object-contain"
                            src={fullscreenVideo}
                            controls
                            autoPlay
                        />
                        <button
                            className="absolute top-2 right-2 text-white bg-red-600 rounded-full p-2 hover:bg-red-700 transition-colors duration-300"
                            onClick={() => setFullscreenVideo(null)}
                            aria-label="Close video"
                        >
                            <IoMdClose className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}

            {selectedReview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
                    onClick={closeReviewModal}
                >
                    <div 
                        className="bg-white rounded-lg max-w-lg w-full mx-4 p-6 relative max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-2 right-2 text-gray-600 hover:text-red-600 transition-colors duration-300"
                            onClick={closeReviewModal}
                            aria-label="Close review modal"
                        >
                            <IoMdClose className="w-6 h-6" />
                        </button>
                        <div className="relative h-[20rem] mb-4">
                            {selectedReview.photo && selectedReview.photo.length > 0 && selectedReview.photo[0] ? (
                                <img
                                    className="w-full h-full object-contain rounded-lg"
                                    src={`/api/image/download/${selectedReview.photo[0]}`}
                                    alt={selectedReview.alt && selectedReview.alt[0] ? selectedReview.alt[0] : "testimonial-photo"}
                                />
                            ) : (
                                <img
                                    className="w-full h-full object-contain rounded-lg"
                                    src="./placeholder.webp"
                                    alt="placeholder"
                                />
                            )}
                            {selectedReview.video && (
                                <button
                                    onClick={() => setFullscreenVideo(`/api/video/download/${selectedReview.video}`)}
                                    className="absolute bottom-4 right-4 bg-red-600 text-white p-3 rounded-full hover:bg-red-700 transition-colors duration-300"
                                    aria-label="Play video"
                                >
                                    <FaPlay className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                        <div className="space-y-4 h-[16rem] flex flex-col justify-between">
                            <div>
                                <p className="font-semibold text-gray-800 text-lg">{selectedReview.name}</p>
                                <p className="text-sm text-gray-500">{selectedReview.designation}</p>
                                {selectedReview.createdAt && (
                                    <p className="text-sm text-gray-500">{formatDate(selectedReview.createdAt)}</p>
                                )}
                            </div>
                            {selectedReview.rating && (
                                <div className="flex items-center">
                                    {renderRating(selectedReview.rating)}
                                    <span className="ml-2 text-sm text-gray-600">{selectedReview.rating}/5</span>
                                </div>
                            )}
                            <div className="text-gray-600 text-sm overflow-y-auto" dangerouslySetInnerHTML={{ __html: selectedReview.testimony }}></div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;