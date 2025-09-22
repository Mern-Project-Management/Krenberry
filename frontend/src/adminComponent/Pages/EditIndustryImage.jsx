import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams, useLocation } from "react-router-dom";

const EditServiceCategoryForm = () => {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState("");
  const [alt, setAlt] = useState("");
  const [imgtitle, setImgtitle] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});

  const { categoryId: categoryIdFromParams } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const id = queryParams.get('id');
  const photoType = queryParams.get('photoType');

  // Validation rules
  const validateField = (name, value, file = null) => {
    let error = "";

    switch (name) {
      case 'alt':
        if (!value || value.trim().length === 0) {
          error = "Alt text is required";
        } else if (value.trim().length < 3) {
          error = "Alt text must be at least 3 characters long";
        } else if (value.trim().length > 100) {
          error = "Alt text must not exceed 100 characters";
        }
        break;

      case 'imgtitle':
        if (!value || value.trim().length === 0) {
          error = "Title text is required";
        } else if (value.trim().length < 3) {
          error = "Title text must be at least 3 characters long";
        } else if (value.trim().length > 150) {
          error = "Title text must not exceed 150 characters";
        }
        break;

      case 'categoryId':
        if (!value || value.trim().length === 0) {
          error = "Category ID is required";
        }
        break;

      case 'image':
        if (!previewImage && !file) {
          error = "An image is required";
        } else if (file) {
          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
          if (!allowedTypes.includes(file.type)) {
            error = "Please upload a valid image file (JPEG, PNG, GIF, or WebP)";
          }
          // Validate file size (5MB limit)
          else if (file.size > 5 * 1024 * 1024) {
            error = "Image size must not exceed 5MB";
          }
        }
        break;

      default:
        break;
    }

    return error;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    
    newErrors.alt = validateField('alt', alt);
    newErrors.imgtitle = validateField('imgtitle', imgtitle);
    newErrors.categoryId = validateField('categoryId', categoryId || categoryIdFromParams);
    newErrors.image = validateField('image', null, image);

    // Remove empty errors
    Object.keys(newErrors).forEach(key => {
      if (!newErrors[key]) {
        delete newErrors[key];
      }
    });

    return newErrors;
  };

  // Handle field blur for real-time validation
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, 
      fieldName === 'alt' ? alt : 
      fieldName === 'imgtitle' ? imgtitle :
      fieldName === 'categoryId' ? (categoryId || categoryIdFromParams) : null,
      fieldName === 'image' ? image : null
    );

    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };

  // Handle field changes with validation
  const handleFieldChange = (fieldName, value) => {
    // Update field value
    switch (fieldName) {
      case 'alt':
        setAlt(value);
        break;
      case 'imgtitle':
        setImgtitle(value);
        break;
      case 'categoryId':
        setCategoryId(value);
        break;
    }

    // Clear error if field becomes valid
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  // Fetch the current gallery item
  const fetchGallery = async () => {
    try {
      const response = await axios.get(`/api/industryImages/getGalleryById?id=${id}&categoryId=${categoryIdFromParams}&photoType=${photoType}`, { withCredentials: true });
      const gallery = response.data;
      setAlt(gallery.alt || "");
      setImgtitle(gallery.imgtitle || "");
      setCategoryId(gallery.categoryId || "");
      setPreviewImage(`/api/industryImages/download/${gallery.images}`);
    } catch (error) {
      console.error("Error fetching gallery:", error);
      setErrors({ general: "Failed to load gallery data. Please try again." });
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({
      alt: true,
      imgtitle: true,
      categoryId: true,
      image: true
    });

    // Validate form
    const formErrors = validateForm();
    setErrors(formErrors);

    // Don't submit if there are errors
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('categoryId', categoryId || categoryIdFromParams);
      formData.append('alt', alt.trim());
      formData.append('imgtitle', imgtitle.trim());
      formData.append('photoType', photoType);
      
      if (image) {
        formData.append('images', image);
      }

      await axios.put(`/api/industryImages/updateGallery?id=${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      navigate('/industries');
    } catch (error) {
      console.error("Error updating gallery:", error);
      setErrors({ 
        general: error.response?.data?.message || "Failed to update gallery. Please try again." 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    
    if (file) {
      setPreviewImage(URL.createObjectURL(file));
      
      // Validate file immediately
      const error = validateField('image', null, file);
      setErrors(prev => ({
        ...prev,
        image: error
      }));
      setTouched(prev => ({ ...prev, image: true }));
    } else {
      // If no file selected and no existing preview, show error
      if (!previewImage) {
        setErrors(prev => ({
          ...prev,
          image: "An image is required"
        }));
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 max-w-4xl ">
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center mb-6">
        Edit Gallery
      </h1>

      {/* General Error Message */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.general}
        </div>
      )}

      {/* Current Image */}
      <div className="mb-4">
        <label className="block font-semibold mb-2">Current Image <span className="text-red-500">*</span> </label>
        {previewImage ? (
          <img
            src={previewImage}
            alt="Current"
            className="w-56 h-32 object-cover border rounded"
          />
        ) : (
          <div className="w-56 h-32 bg-gray-200 border rounded flex items-center justify-center text-gray-500">
            No image available
          </div>
        )}
        {errors.image && touched.image && (
          <p className="text-red-500 text-sm mt-1">{errors.image}</p>
        )}
      </div>

      {/* Alt Text */}
      <div className="mb-4">
        <label htmlFor="alt" className="block font-semibold mb-2">
          Alt Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="alt"
          value={alt}
          onChange={(e) => handleFieldChange('alt', e.target.value)}
          onBlur={() => handleBlur('alt')}
          className={`w-56 p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.alt && touched.alt 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-blue-200'
          }`}
          placeholder="Enter descriptive alt text"
          maxLength={100}
        />
        {errors.alt && touched.alt && (
          <p className="text-red-500 text-sm mt-1">{errors.alt}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">{alt.length}/100 characters</p>
      </div>

      {/* Title Text */}
      <div className="mb-4">
        <label htmlFor="imgtitle" className="block font-semibold mb-2">
          Title Text <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="imgtitle"
          value={imgtitle}
          onChange={(e) => handleFieldChange('imgtitle', e.target.value)}
          onBlur={() => handleBlur('imgtitle')}
          className={`w-56 p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.imgtitle && touched.imgtitle 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-blue-200'
          }`}
          placeholder="Enter image title"
          maxLength={150}
        />
        {errors.imgtitle && touched.imgtitle && (
          <p className="text-red-500 text-sm mt-1">{errors.imgtitle}</p>
        )}
        <p className="text-gray-500 text-xs mt-1">{imgtitle.length}/150 characters</p>
      </div>

      {/* Upload New Image */}
      <div className="mb-4">
        <label htmlFor="image" className="block font-semibold mb-2">
          Upload New Image <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          id="image"
          onChange={handleFileChange}
          accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
          className={`w-56 p-2 border rounded focus:outline-none focus:ring-2 ${
            errors.image && touched.image 
              ? 'border-red-500 focus:ring-red-200' 
              : 'border-gray-300 focus:ring-blue-200'
          }`}
        />
        <p className="text-gray-500 text-xs mt-1">
          Accepted formats: JPEG, PNG, GIF, WebP (max 5MB)
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-6">
        <button
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          className={`w-56 px-4 py-2 rounded font-semibold transition-colors ${
            isSubmitting || Object.keys(errors).length > 0
              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
              : 'bg-blue-500 text-white hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-200'
          }`}
        >
          {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
        </button>
      </div>

      {/* Required Fields Note */}
      <p className="text-gray-500 text-sm mt-4 text-center">
        * All fields are required
      </p>
    </form>
  );
};

export default EditServiceCategoryForm;