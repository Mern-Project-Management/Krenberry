import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams, useLocation } from "react-router-dom";

const NewGalleryForm = () => {
    const { categoryId } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const photoType = queryParams.get('photoType');
    const navigate = useNavigate();

    const [alt, setAlt] = useState("");
    const [imgtitle, setImgtitle] = useState("");
    const [images, setImages] = useState(null);
    const [errors, setErrors] = useState({});

    // Validation function
    const validateForm = () => {
        const newErrors = {};
        if (!alt.trim()) newErrors.alt = "Alternative text is required";
        if (!imgtitle.trim()) newErrors.imgtitle = "Title text is required";
        if (!images) newErrors.images = "Please select an image";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setImages(file);
        // Clear image error when a file is selected
        if (file) {
            setErrors((prev) => ({ ...prev, images: null }));
        }
    };

    const handleDeleteImage = () => {
        setImages(null);
        setErrors((prev) => ({ ...prev, images: "Please select an image" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        try {
            const formData = new FormData();
            formData.append('categoryId', categoryId);
            formData.append('alt', alt);
            formData.append('imgtitle', imgtitle);
            formData.append('images', images);
            formData.append('photoType', photoType);

            await axios.post('/api/serviceImages/createGallery', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                withCredentials: true
            });

            setAlt("");
            setImgtitle("");
            setImages(null);
            setErrors({});
            navigate('/services');
        } catch (error) {
            console.error(error);
            setErrors((prev) => ({
                ...prev,
                submit: "Failed to create gallery. Please try again."
            }));
        }
    };

    const renderCategoryOptions = (category) => (
        <option key={category._id} value={category._id}>
            {category.category}
        </option>
    );

    return (
        <form onSubmit={handleSubmit} className="p-4">
            <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">
                Create Gallery
            </h1>

            <div className="mb-8">
                <label htmlFor="images" className="block font-semibold mb-2">
                    Photo <span className="text-red-500">*</span>
                </label>
                <input
                    type="file"
                    name="images"
                    id="images"
                    onChange={handlePhotoChange}
                    className={`border rounded focus:outline-none ${errors.images ? 'border-red-500' : ''}`}
                    accept="image/*"
                />
                {errors.images && (
                    <p className="text-red-500 text-sm mt-1">{errors.images}</p>
                )}

                <div className="mb-4">
                    <label htmlFor="alt" className="block font-semibold mb-2">
                        Alternative Text <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="alt"
                        value={alt}
                        onChange={(e) => {
                            setAlt(e.target.value);
                            if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, alt: null }));
                            }
                        }}
                        className={`w-56 p-2 border rounded focus:outline-none ${errors.alt ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.alt && (
                        <p className="text-red-500 text-sm mt-1">{errors.alt}</p>
                    )}
                </div>

                <div className="mb-4">
                    <label htmlFor="imgtitle" className="block font-semibold mb-2">
                        Title Text <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="imgtitle"
                        value={imgtitle}
                        onChange={(e) => {
                            setImgtitle(e.target.value);
                            if (e.target.value.trim()) {
                                setErrors((prev) => ({ ...prev, imgtitle: null }));
                            }
                        }}
                        className={`w-56 p-2 border rounded focus:outline-none ${errors.imgtitle ? 'border-red-500' : ''}`}
                        required
                    />
                    {errors.imgtitle && (
                        <p className="text-red-500 text-sm mt-1">{errors.imgtitle}</p>
                    )}
                </div>

                {images && (
                    <div className="mt-2 w-56 relative group">
                        <img
                            src={URL.createObjectURL(images)}
                            alt="Gallery"
                            className="h-32 w-56 object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleDeleteImage}
                            className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                        >
                            X
                        </button>
                    </div>
                )}
            </div>

            {errors.submit && (
                <p className="text-red-500 text-sm mb-4">{errors.submit}</p>
            )}

            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
            >
                Add Gallery
            </button>
        </form>
    );
};

export default NewGalleryForm;