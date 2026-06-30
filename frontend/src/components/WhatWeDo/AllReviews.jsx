import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { IoMdClose } from 'react-icons/io';
import { FaPlay, FaStar, FaStarHalfAlt, FaRegStar, FaUserCircle } from 'react-icons/fa';
import ReviweHeding from "../WhatWeDo/ReviewHeading";

const ITEMS_PER_PAGE = 8;

const Gallery = () => {
    const [fullscreenVideo, setFullscreenVideo] = useState(null);
    const [reviews, setReviews] = useState([]);
    const [selectedReview, setSelectedReview] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await axios.get(`/api/testimonial/getTestimonialsFront?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, { 
                    withCredentials: true 
                });
                setReviews(response.data.data);
                setTotalPages(Math.ceil(response.data.total / ITEMS_PER_PAGE));
            } catch (error) {
                console.error("Error fetching reviews:", error);
                setError("Failed to load reviews. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, [currentPage]);

    const renderRating = (rating) => {
        if (!rating) return null;
        const totalStars = 5;
        const filledStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const unfilledStars = totalStars - filledStars - (hasHalfStar ? 1 : 0);

        return (
            <div className="flex items-center mt-1">
                {[...Array(filledStars)].map((_, i) => (
                    <FaStar key={`filled-${i}`} className="text-yellow-400 w-4 h-4" />
                ))}
                {hasHalfStar && <FaStarHalfAlt className="text-yellow-400 w-4 h-4" />}
                {[...Array(unfilledStars)].map((_, i) => (
                    <FaRegStar key={`unfilled-${i}`} className="text-gray-300 w-4 h-4" />
                ))}
                <span className="ml-1 text-sm text-gray-500">({rating.toFixed(1)})</span>
            </div>
        );
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(date);
    };

    const openReviewModal = (review) => {
        setSelectedReview(review);
    };

    const closeReviewModal = () => {
        setSelectedReview(null);
    };

    const renderReviewCard = (item) => {
        const hasContent = item.testimony?.trim();
        const displayName = item.name || 'Anonymous';
        const displayDesignation = item.designation || 'Client';
        
        return (
            <div 
                key={item._id} 
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
            >
                <div className="relative pt-[75%] bg-gray-100">
                    {item.photo?.[0] ? (
                        <img
                            className="absolute top-0 left-0 w-full h-full object-fill"
                            src={`/api/image/download/${item.photo[0]}`}
                            alt={item.alt?.[0] || `Testimonial from ${displayName}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = './placeholder.webp';
                            }}
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                            <FaUserCircle className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                    {item.video && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setFullscreenVideo(`/api/video/download/${item.video}`);
                            }}
                            className="absolute bottom-3 right-3 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors duration-300 shadow-md"
                            aria-label="Play video testimonial"
                        >
                            <FaPlay className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-semibold text-gray-800">{displayName}</h4>
                                {displayDesignation && (
                                    <p className="text-sm text-gray-600">{displayDesignation}</p>
                                )}
                            </div>
                            {item.rating && renderRating(item.rating)}
                        </div>
                        
                        {hasContent ? (
                            <div className="relative">
                                <p 
                                    className="text-gray-600 text-sm mb-2 line-clamp-3" 
                                    dangerouslySetInnerHTML={{__html: item.testimony}}
                                >
                                </p>
                                {item.testimony.length > 150 && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openReviewModal(item);
                                        }}
                                        className="text-red-600 hover:text-red-700 text-sm font-medium inline-flex items-center"
                                    >
                                        Read More
                                    </button>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic">No review text available</p>
                        )}
                    </div>
                    
                    {item.createdAt && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                {formatDate(item.createdAt)}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen py-12">
            <div className="mb-16">
            <ReviweHeding />
            </div>
            
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
                </div>
            ) : error ? (
                <div className="text-center py-12">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-[90%] mx-auto">
                        {reviews.map(renderReviewCard)}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center mt-10 space-x-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border rounded-l-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 border-t border-b ${
                                            currentPage === pageNum 
                                                ? 'bg-red-600 text-white' 
                                                : 'bg-white hover:bg-gray-50'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="px-4 py-2 border rounded-r-lg disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modal for full review */}
            {selectedReview && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
                    onClick={closeReviewModal}
                >
                    <div 
                        className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="relative">
                            {selectedReview.photo?.[0] ? (
                                <img
                                    className="w-full h-64 object-contain pt-5 rounded-t-lg"
                                    src={`/api/image/download/${selectedReview.photo[0]}`}
                                    alt={selectedReview.alt?.[0] || `Testimonial from ${selectedReview.name || 'Client'}`}
                                />
                            ) : (
                                <div className="h-64 bg-gray-100 flex items-center justify-center rounded-t-lg">
                                    <FaUserCircle className="w-24 h-24 text-gray-400" />
                                </div>
                            )}
                            <button
                                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-100"
                                onClick={closeReviewModal}
                                aria-label="Close modal"
                            >
                                <IoMdClose className="w-5 h-5 text-gray-700" />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">
                                        {selectedReview.name || 'Anonymous'}
                                    </h3>
                                    {selectedReview.designation && (
                                        <p className="text-gray-600">{selectedReview.designation}</p>
                                    )}
                                    {selectedReview.createdAt && (
                                        <p className="text-sm text-gray-500 mt-1">
                                            {formatDate(selectedReview.createdAt)}
                                        </p>
                                    )}
                                </div>
                                {selectedReview.rating && renderRating(selectedReview.rating)}
                            </div>
                            
                            <div className="prose max-w-none text-gray-700">
                                {selectedReview.testimony ? (
                                    <div dangerouslySetInnerHTML={{ __html: selectedReview.testimony }} />
                                ) : (
                                    <p className="text-gray-400 italic">No review content available</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Video Player Modal */}
            {fullscreenVideo && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
                    <div className="relative w-full max-w-4xl">
                        <video
                            className="w-full max-h-[90vh]"
                            src={fullscreenVideo}
                            controls
                            autoPlay
                        />
                        <button
                            className="absolute -top-10 right-0 text-white hover:text-gray-300"
                            onClick={() => setFullscreenVideo(null)}
                            aria-label="Close video"
                        >
                            <IoMdClose className="w-8 h-8" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;