import { useState } from "react";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

const CreateContactInfo = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    imgTitle: "",
    alt: "",
    title: "",
    description: "",
    photo: null,
    type: "",
    address: "",
    phone1: "",
    phone2: "",
    email1: "",
    email2: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});

  // Validation functions
  const validateTitle = (title) => {
    if (!title) return "Title is required";
    if (title.length > 50) return "Title must be less than 50 characters";
    if (!/^[a-zA-Z\s]+$/.test(title)) 
      return "Title must contain only letters and single spaces. No special characters or numbers allowed.";
    return "";
  };

  const validatePhone = (phone) => {
    if (!phone) return "Phone number is required";
    if (!/^\d{10}$/.test(phone)) 
      return "Phone number must be a valid 10-digit number without spaces or symbols.";
    return "";
  };

  const validateEmail = (email) => {
    if (!email) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return "Please enter a valid email address in the format: name@example.com";
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate title
    const titleError = validateTitle(formData.title);
    if (titleError) newErrors.title = titleError;

    // Validate fields based on type
    if (formData.type === "Phone No") {
      const phone1Error = validatePhone(formData.phone1);
      if (phone1Error) newErrors.phone1 = phone1Error;
      
      if (formData.phone2) {
        const phone2Error = validatePhone(formData.phone2);
        if (phone2Error) newErrors.phone2 = phone2Error;
      }
    } 
    else if (formData.type === "Email") {
      const email1Error = validateEmail(formData.email1);
      if (email1Error) newErrors.email1 = email1Error;
      
      if (formData.email2) {
        const email2Error = validateEmail(formData.email2);
        if (email2Error) newErrors.email2 = email2Error;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clean input based on field type
    let cleanedValue = value;
    if (name === 'title') {
      // Only allow letters and single spaces
      cleanedValue = value.replace(/[^a-zA-Z\s]/g, '').replace(/\s+/g, ' ');
    } else if (name === 'phone1' || name === 'phone2') {
      // Only allow numbers, maximum 10 digits
      cleanedValue = value.replace(/\D/g, '').slice(0, 10);
    }
    
    setFormData(prevData => ({
      ...prevData,
      [name]: cleanedValue || value, // Use cleaned value if available, otherwise original value
    }));
  };

  const handleQuillChange = (field, value) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      photo: file,
    }));
    // Create a preview URL for the selected image
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return; // Don't submit if validation fails
    }
    
    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => {
      formDataToSend.append(key, formData[key]);
    });

    try {
      await axios.post(`/api/contactInfo/addContactInfo`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });
      navigate(`/contactinfo`);
    } catch (error) {
      console.error("Error creating contact info:", error);
    }
  };

  const renderConditionalFields = () => {
    switch (formData.type) {
      case "Head Office Address":
      case "Sales Office Address":
        return (
          <div className="mb-4">
            <label className="block mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="border rounded w-full p-2"
              required
            />
          </div>
        );
      case "Phone No":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-1">Phone 1</label>
              <input
                type="tel"
                name="phone1"
                value={formData.phone1}
                onChange={handleChange}
                className={`border rounded w-full p-2 ${errors.phone1 ? 'border-red-500' : ''}`}
                placeholder="1234567890"
                required
              />
              {errors.phone1 && <p className="text-red-500 text-sm mt-1">{errors.phone1}</p>}
            </div>
            <div className="mb-4">
              <label className="block mb-1">Phone 2 (Optional)</label>
              <input
                type="tel"
                name="phone2"
                value={formData.phone2}
                onChange={handleChange}
                className={`border rounded w-full p-2 ${errors.phone2 ? 'border-red-500' : ''}`}
                placeholder="1234567890"
              />
              {errors.phone2 && <p className="text-red-500 text-sm mt-1">{errors.phone2}</p>}
            </div>
          </>
        );
      case "Email":
        return (
          <>
            <div className="mb-4">
              <label className="block mb-1">Email 1</label>
              <input
                type="email"
                name="email1"
                value={formData.email1}
                onChange={handleChange}
                className={`border rounded w-full p-2 ${errors.email1 ? 'border-red-500' : ''}`}
                placeholder="example@domain.com"
                required
              />
              {errors.email1 && <p className="text-red-500 text-sm mt-1">{errors.email1}</p>}
            </div>
            <div className="mb-4">
              <label className="block mb-1">Email 2 (Optional)</label>
              <input
                type="email"
                name="email2"
                value={formData.email2}
                onChange={handleChange}
                className={`border rounded w-full p-2 ${errors.email2 ? 'border-red-500' : ''}`}
                placeholder="example@domain.com"
              />
              {errors.email2 && <p className="text-red-500 text-sm mt-1">{errors.email2}</p>}
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create Contact Info</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block mb-1">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          >
            <option value="">Select Type</option>
            <option value="Phone No">Phone No</option>
            <option value="Email">Email</option>
            <option value="Head Office Address">Head Office Address</option>
            <option value="Sales Office Address">Sales Office Address</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`border rounded w-full p-2 ${errors.title ? 'border-red-500' : ''}`}
            maxLength={50}
            required
          />
          {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Photo</label>
          <input
            type="file"
            name="photo"
            accept="image/*"
            onChange={handleFileChange}
            className="border rounded w-full p-2"
            required
          />
          {imagePreview && (
            <img src={imagePreview} alt="Selected" className="mt-2 w-32 h-32 object-cover" />
          )}
        </div>
        <div className="mb-4">
          <label className="block mb-1">Image Title</label>
          <input
            type="text"
            name="imgTitle"
            value={formData.imgTitle}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">Alt Text</label>
          <input
            type="text"
            name="alt"
            value={formData.alt}
            onChange={handleChange}
            className="border rounded w-full p-2"
            required
          />
        </div>
        {renderConditionalFields()}
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
          Create Contact Info
        </button>
      </form>
    </div>
  );
};

export default CreateContactInfo;
