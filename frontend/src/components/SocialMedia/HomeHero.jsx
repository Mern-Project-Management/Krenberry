import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { FaStarOfLife } from "react-icons/fa6";
import { X } from "lucide-react";
import axios from "axios";
import {
  validateName,
  validateEmail,
  validateMobileNo
} from "../../utiles/validations"; // Adjust path to validations.js as needed

const AutocompleteInput = ({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  loading,
  disabled,
  name,
  error, // Add error prop for validation messages
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredSuggestions = suggestions
    ?.filter((item) => item.toLowerCase().startsWith(search.toLowerCase()))
    .slice(0, 10);

  return (
    <div ref={wrapperRef} className="relative mb-4">
      <input
        type="text"
        value={search || value}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onChange({ target: { name, value: e.target.value } });
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={loading ? "Loading..." : placeholder}
        disabled={disabled || loading}
        className={`w-full px-3 py-1 rounded-lg bg-white/5 border ${
          error ? "border-red-500" : "border-white/20"
        } text-white placeholder:text-white/50 focus:outline-none focus:border-red-500 transition-colors duration-300`}
      />
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      {isOpen && filteredSuggestions?.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-40 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-3 hover:bg-white/10 cursor-pointer text-white/90 transition-colors duration-200"
              onClick={() => {
                onSelect(suggestion);
                setSearch(suggestion);
                setIsOpen(false);
              }}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const ContactForm = React.memo(({ isModal = false, onSubmit, loading: parentLoading = false }) => {
  const initialFormState = {
    name: "",
    email: "",
    phone: "",
    service: "",
    budget: "",
    city: "",
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    utmId: "",
    gclid: "",
    gcidSource: "",
    utmContent: "",
    utmTerm: "",
    ipaddress: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({}); // State for validation errors
  const [category, setCategory] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use parent loading prop if available, otherwise use local isSubmitting state
  const loading = parentLoading !== undefined ? parentLoading : isSubmitting;

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/api/services/getCategory`, {
          withCredentials: true,
        });
        setCategory(response.data.map((item) => item.category));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    const fetchAllCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get(
          "https://countriesnow.space/api/v0.1/countries"
        );
        const allCities = response.data.data.reduce((acc, country) => {
          if (country.cities) {
            acc.push(...country.cities);
          }
          return acc;
        }, []);
        const uniqueCities = [...new Set(allCities)].sort();
        setCities(uniqueCities);
      } catch (error) {
        console.error("Error fetching cities:", error);
        setCities([]);
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCategory();
    fetchAllCities();
  }, []);

  const validateForm = () => {
    const newErrors = {
      name: validateName(formData.name),
      email: validateEmail(formData.email),
      phone: validateMobileNo(formData.phone),
      city: !formData.city.trim() ? "City is required" : "",
      service: !formData.service.trim() ? "Service is required" : "",
      budget: !formData.budget.trim() ? "Budget is required" : "",
    };
    setErrors(newErrors);
    return Object.values(newErrors).every((error) => !error); // Returns true if no errors
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user types or selects a value
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleAutocompleteChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const isValid = validateForm();
    
    if (isValid) {
      // Only set local loading state if parent isn't managing it
      if (parentLoading === undefined) {
        setIsSubmitting(true);
      }
      
      try {
        await onSubmit(formData);
        setFormData(initialFormState);
        setErrors({});
        setResetKey((prev) => prev + 1);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
        }, 5000);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        if (parentLoading === undefined) {
          setIsSubmitting(false);
        }
      }
    } else {
      // Scroll to first error
      const firstError = Object.keys(errors).find(key => errors[key]);
      if (firstError) {
        document.querySelector(`[name="${firstError}"]`)?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  };

  const budgetOptions = [
    "CAD 165K and Above",
    "CAD 83K - 165K",
    "CAD 41K - 83K",
    "CAD 25K - 41K",
    "CAD 8K - 25K",
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className={`p-8 rounded-xl shadow-2xl border transition-transform duration-300 ${isModal
          ? "w-full  mx-auto bg-black"
          : "bg-white/10 backdrop-blur-lg border-white/10"
        }`}
    >
      <h3 className="text-2xl font-bold mb-6 text-white text-center">
        Get Started Today
      </h3>

      <div className="mb-4">
        <label className="block text-white mb-1 text-sm">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 rounded-lg bg-white/5 border ${
            errors.name ? "border-red-500" : "border-white/20"
          } text-white placeholder:text-white/50 focus:outline-none focus:border-[#ec2127] transition-colors duration-300`}
          required
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-white mb-1 text-sm">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 rounded-lg bg-white/5 border ${
            errors.email ? "border-red-500" : "border-white/20"
          } text-white placeholder:text-white/50 focus:outline-none focus:border-[#ec2127] transition-colors duration-300`}
          required
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-white mb-1 text-sm">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <input
          name="phone"
          type="tel"
          placeholder="Your Phone Number"
          value={formData.phone}
          onChange={handleInputChange}
          className={`w-full px-3 py-2 rounded-lg bg-white/5 border ${
            errors.phone ? "border-red-500" : "border-white/20"
          } text-white placeholder:text-white/50 focus:outline-none focus:border-[#ec2127] transition-colors duration-300`}
          required
          maxLength={10}
          minLength={10}
        />
        {errors.phone && (
          <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
        )}
      </div>

      <div className="mb-4">
        <label className="block text-white mb-1 text-sm">
          City <span className="text-red-500">*</span>
        </label>
        <AutocompleteInput
          value={formData.city}
          onChange={(e) => handleAutocompleteChange('city', e.target.value)}
          onSelect={(value) => handleAutocompleteChange('city', value)}
          suggestions={cities}
          placeholder="Select your city"
          loading={loadingCities}
          fieldName="city"
          resetKey={resetKey}
          error={errors.city}
        />
      </div>

      <div className="mb-4">
        <label className="block text-white mb-1 text-sm">
          Service <span className="text-red-500">*</span>
        </label>
        <AutocompleteInput
          value={formData.service}
          onChange={(e) => handleAutocompleteChange('service', e.target.value)}
          onSelect={(value) => handleAutocompleteChange('service', value)}
          suggestions={category}
          placeholder="Select a service"
          fieldName="service"
          resetKey={resetKey}
          error={errors.service}
        />
      </div>

      <div className="mb-6">
        <label className="block text-white mb-1 text-sm">
          Monthly Budget (CAD) <span className="text-red-500">*</span>
        </label>
        <AutocompleteInput
          value={formData.budget}
          onChange={(e) => handleAutocompleteChange('budget', e.target.value)}
          onSelect={(value) => handleAutocompleteChange('budget', value)}
          suggestions={budgetOptions}
          placeholder="Select your budget range"
          fieldName="budget"
          resetKey={resetKey}
          error={errors.budget}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full py-3 ${loading
            ? "bg-gray-400"
            : "bg-gradient-to-r from-[#ec2127] to-red-600"
          } text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg`}
      >
        {loading ? "Submitting..." : "Let's Connect"}
      </button>

      {showSuccessMessage && (
        <div className="mt-4 p-4 bg-green-500/20 border border-green-500/50 rounded-lg">
          <div className="flex items-center space-x-2">
            <svg
              className="w-5 h-5 text-green-500"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-500 text-sm">
              Thank you for your submission! We'll get back to you soon.
            </p>
          </div>
        </div>
      )}
    </form>
  );
});

export default function HeroSection() {
  const [heroSection, setHeroSection] = useState("");
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/industiesHeroSection/front/${slug}`, {
          withCredentials: true,
        });
        const heroData = response.data;
        setHeroSection(heroData);
        setTimeout(() => setIsLoading(false), 1000);
      } catch (error) {
        console.error("Error fetching hero section:", error);
        setIsLoading(false);
      }
    };

    fetchHeroSection();
  }, [location]);

  const handleFormSubmit = async (formData) => {
    setLoading(true);
    try {
      const response = await axios.post(
        "/api/herosectioninquiry/createHomesectionInquiry",
        formData
      );
      setSuccessMessage(response.data.message);
      setIsMessageVisible(true);
      setIsModalOpen(false);
      setTimeout(() => {
        setIsMessageVisible(false);
      }, 5000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const Modal = useCallback(
    () => (
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 ${
          isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div
          className={`relative w-full max-w-4xl transform transition-all duration-300 flex ${isModalOpen ? "scale-100" : "scale-95"} mx-auto`}
        >
          <div className="w-[50%] p-6 bg-white rounded-l-lg">
            {/* Left side content - 60% width */}
            <div className="h-full flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-4">Get In Touch</h3>
              <p className="text-gray-600 mb-6">Fill out the form and our team will get back to you within 24 hours.</p>
              {/* Add any additional content or image here */}
            </div>
          </div>
          
          <div className="w-[50%] relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -right-4 -top-4 z-10 bg-[#1111119f] p-1 rounded-full hover:bg-white/20 transition-colors duration-300"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="bg-[#1a1a1a] p-8 rounded-r-lg h-full">
              <ContactForm
                isModal={true}
                onSubmit={handleFormSubmit}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    [isModalOpen, loading]
  );

  const SkeletonLoader = () => (
    <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black min-h-screen flex items-center justify-between text-white">
      <div className="flex flex-col md:flex-row w-11/12 lg:w-4/5 mx-auto gap-12 py-20">
        <div className="md:w-[60%] space-y-6 animate-pulse">
          <div className="h-12 bg-slate-700 rounded-lg w-3/4"></div>
          <div className="h-8 bg-slate-700 rounded-lg w-full"></div>
          <div className="h-8 bg-slate-700 rounded-lg w-5/6"></div>
          <div className="h-8 bg-slate-700 rounded-lg w-4/5"></div>
          <div className="h-8 bg-slate-700 rounded-lg w-2/3"></div>
        </div>
        <div className="md:w-[25%] animate-pulse">
          <div className="bg-white/10 backdrop-blur-lg p-8 rounded-xl space-y-4">
            <div className="h-8 bg-slate-700 rounded-lg"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-slate-700 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading) return <SkeletonLoader />;

  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black md:min-h-[90vh] py-4 flex items-center justify-between text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative flex flex-col lg:pb-12 md:flex-row justify-center gap-10 xl:gap-20 w-11/12 lg:w-4/5 mx-auto sm:pt-44 md:pt-24 pt-24 pb-12 xl:pt-44">
        <div className="md:w-[50%] space-y-8">
        <div 
className="quill-content 
  [&_h1]:text-xl [&_h1]:md:text-3xl [&_h1]:lg:text-4xl 
  [&_h2]:text-base [&_h2]:md:text-lg [&_h2]:text-gray-100
  [&_h3]:text-base [&_h3]:md:text-lg [&_h3]:text-gray-100
  text-justify"
  dangerouslySetInnerHTML={{ __html: heroSection.heading }}
/>
<button
  onClick={() => setIsModalOpen(true)}
  className="px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg w-full md:w-1/3"
>
  Get in Touch
</button>
        </div>

        <div className="hidden md:block w-[40%] relative">
          <div className="absolute -top-4 -left-4 z-10">
            <FaStarOfLife className="text-red-500 text-4xl animate-[spin_5s_linear_infinite]" />
          </div>
          <ContactForm onSubmit={handleFormSubmit} loading={loading} />
        </div>
      </div>
      <Modal />
      {/* {isMessageVisible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#141414c7] text-white p-8 rounded-lg shadow-lg">
            {successMessage}
            <button
              onClick={() => setIsMessageVisible(false)}
              className="ml-4 text-white font-semibold"
            >
              Close
            </button>
          </div>
        </div>
      )} */}
    </div>
  );
};