import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams, useLocation } from "react-router-dom";

const NewGalleryForm = () => {
    const { categoryId } = useParams(); // Get categoryId from URL params
    const location = useLocation(); // Get current location
    const queryParams = new URLSearchParams(location.search); // Parse query parameters
    const photoType = queryParams.get('photoType'); // Get photoType from query params

    const [alt, setAlt] = useState("");
    const [imgtitle, setImgtitle] = useState("");
    const [images, setImages] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // Validation function
    const validateForm = () => {
        const newErrors = {};

        // Validate alt text
        if (!alt.trim()) {
            newErrors.alt = "Alternative text is required";
        } else if (alt.trim().length < 3) {
            newErrors.alt = "Alternative text must be at least 3 characters long";
        } else if (alt.trim().length > 100) {
            newErrors.alt = "Alternative text must be less than 100 characters";
        }

        // Validate title
        if (!imgtitle.trim()) {
            newErrors.imgtitle = "Title text is required";
        } else if (imgtitle.trim().length < 3) {
            newErrors.imgtitle = "Title text must be at least 3 characters long";
        } else if (imgtitle.trim().length > 100) {
            newErrors.imgtitle = "Title text must be less than 100 characters";
        }

        // Validate image
        if (!images) {
            newErrors.images = "Please select an image";
        } else {
            // Validate file type
            const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!validTypes.includes(images.type)) {
                newErrors.images = "Please select a valid image file (JPEG, PNG, GIF, or WebP)";
            }
            // Validate file size (5MB limit)
            else if (images.size > 5 * 1024 * 1024) {
                newErrors.images = "Image file size must be less than 5MB";
            }
        }

        // Validate URL parameters
        if (!categoryId) {
            newErrors.categoryId = "Category ID is missing from URL";
        }

        if (!photoType) {
            newErrors.photoType = "Photo type is missing from URL parameters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Clear specific field error when user starts typing
    const clearFieldError = (fieldName) => {
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldName];
                return newErrors;
            });
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0]; // Get the first selected file
        setImages(file);
        clearFieldError('images');
    };

    const handleDeleteImage = () => {
        setImages(null);
        setErrors(prev => ({ ...prev, images: "Please select an image" }));
    };

    const handleAltChange = (e) => {
        setAlt(e.target.value);
        clearFieldError('alt');
    };

    const handleTitleChange = (e) => {
        setImgtitle(e.target.value);
        clearFieldError('imgtitle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form before submission
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);
        
        try {
            const formData = new FormData();
            formData.append('categoryId', categoryId); // Use categoryId from URL params
            formData.append('alt', alt.trim());
            formData.append('imgtitle', imgtitle.trim());
            formData.append('images', images);
            formData.append('photoType', photoType); // Use photoType from query params

            await axios.post('/api/industryImages/createGallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            // Reset form fields after successful submission
            setAlt("");
            setImgtitle("");
            setImages(null);
            setErrors({});
            navigate('/industries');
        } catch (error) {
            console.error('Submission error:', error);
            
            // Handle server-side validation errors
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({ submit: "Failed to create gallery. Please try again." });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    // Check for missing URL parameters on component mount
    useEffect(() => {
        const newErrors = {};
        if (!categoryId) {
            newErrors.categoryId = "Category ID is missing from URL";
        }
        if (!photoType) {
            newErrors.photoType = "Photo type is missing from URL parameters";
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
        }
    }, [categoryId, photoType]);

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Create Gallery</h1>
            <span className="text-red-500">*</span> Required fields
            {/* Display URL parameter errors */}
            {(errors.categoryId || errors.photoType) && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.categoryId && <p>{errors.categoryId}</p>}
                    {errors.photoType && <p>{errors.photoType}</p>}
                </div>
            )}

            {/* Display general submission error */}
            {errors.submit && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {errors.submit}
                </div>
            )}

            <div className="mb-8">
                <label htmlFor="images" className="block font-semibold mb-2">
                    Photo <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    name="images"
                    id="images"
                    onChange={handlePhotoChange}
                    className={`border rounded focus:outline-none ${errors.images ? 'border-red-500' : 'border-gray-300'}`}
                    accept="image/*"
                />
                {errors.images && (
                    <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                )}

                <div className="mb-4 mt-4">
                    <label htmlFor="alt" className="block font-semibold mb-2">
                        Alternative Text <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="alt"
                        value={alt}
                        onChange={handleAltChange}
                        className={`w-56 p-2 border rounded focus:outline-none ${errors.alt ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Describe the image for accessibility"
                        maxLength="100"
                    />
                    {errors.alt && (
                        <p className="text-red-500 text-sm mt-1">{errors.alt}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                        {alt.length}/100 characters
                    </p>
                </div>

                <div className="mb-4">
                    <label htmlFor="imgtitle" className="block font-semibold mb-2">
                        Title Text <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="imgtitle"
                        value={imgtitle}
                        onChange={handleTitleChange}
                        className={`w-56 p-2 border rounded focus:outline-none ${errors.imgtitle ? 'border-red-500' : 'border-gray-300'}`}
                        placeholder="Enter image title"
                        maxLength="100"
                    />
                    {errors.imgtitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.imgtitle}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-1">
                        {imgtitle.length}/100 characters
                    </p>
                </div>

                {images && (
                    <div className="mt-2 w-56 relative group">
                        <img
                            src={URL.createObjectURL(images)}
                            alt="Gallery preview"
                            className="h-32 w-56 object-cover border rounded"
                        />
                        <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                            aria-label="Delete image"
                        >
                            ×
                        </button>
                    </div>
                )}
            </div>

            <button 
                type="submit" 
                disabled={isSubmitting || !categoryId || !photoType}
                className={`py-2 px-4 rounded font-medium ${
                    isSubmitting || !categoryId || !photoType
                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                        : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                }`}
            >
                {isSubmitting ? 'Adding Gallery...' : 'Add Gallery'}
            </button>

            <p className="text-gray-600 text-sm mt-2">
               
            </p>
        </form>
    );
};

export default NewGalleryForm;