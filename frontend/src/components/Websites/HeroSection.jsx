import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import "react-quill/dist/quill.snow.css";
import { FaStarOfLife } from "react-icons/fa6";
import { X } from "lucide-react";
import axios from "axios";
import {
  validateName,
  validateEmail,
  validateMobileNo,
} from "../../utiles/validations"; // Adjust path to validations.js as needed

const AutocompleteInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  loading,
  disabled,
  resetKey,
  fieldName,
  error, // Add error prop to display validation messages
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef(null);

  useEffect(() => {
    setSearch(value);
  }, [value, resetKey]);

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
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setIsOpen(true);
          onChange({ target: { name: fieldName, value: e.target.value } });
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={loading ? "Loading..." : placeholder}
        disabled={disabled || loading}
        className={`w-full px-3 py-1 rounded-lg bg-white/5 border ${error ? "border-red-500" : "border-white/20"
          } text-white placeholder:text-white/50 focus:outline-none focus:border-[#ec2127] transition-colors duration-300`}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
      {isOpen && filteredSuggestions?.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-lg max-h-40 overflow-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-3 hover:bg-white/10 cursor-pointer text-white/90 transition-colors duration-200"
              onClick={() => {
                onChange({ target: { name: fieldName, value: suggestion } });
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
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
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
          ? "w-full max-w-md mx-auto bg-black"
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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
          onChange={handleInputChange}
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

const HeroSection = () => {
  const [successMessage, setSuccessMessage] = useState("");
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const [heroSection, setHeroSection] = useState({});
  const [clientIp, setClientIp] = useState("");
  const [utmParams, setUtmParams] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const location = useLocation();

  useEffect(() => {
    const fetchClientIp = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setClientIp(response.data.ip);
      } catch (error) {
        console.error("Error fetching IP address", error);
      }
    };

    fetchClientIp();

    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_id: params.get("utm_id") || "",
      gclid: params.get("gclid") || "",
      gcid_source: params.get("gcid_source") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    });
  }, []);

  useEffect(() => {
    const fetchHeroSection = async () => {
      try {
        const slug = location.pathname.split("/").filter(Boolean).pop();
        const response = await axios.get(`/api/heroSection/front/${slug}`, {
          withCredentials: true,
        });
        setHeroSection(response.data);
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
    const completeFormData = {
      ...formData,
      ipaddress: clientIp,
      utmSource: utmParams.utm_source,
      utmMedium: utmParams.utm_medium,
      utmCampaign: utmParams.utm_campaign,
      utmId: utmParams.utm_id,
      gclid: utmParams.gclid,
      gcidSource: utmParams.gcid_source,
      utmContent: utmParams.utm_content,
      utmTerm: utmParams.utm_term,
    };
    try {
      const response = await axios.post(
        "/api/herosectioninquiry/createHomesectionInquiry",
        completeFormData
      );
      setSuccessMessage(response.data.message);
      setIsMessageVisible(true);
      setIsModalOpen(false);
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
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all duration-300 ${isModalOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
      >
        <div
          className={`relative w-full max-w-md transform transition-all duration-300 flex flex-col items-center justify-center ${isModalOpen ? "scale-100" : "scale-95"
            }`}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute -bottom-10 z-10 bg-[#1111119f] p-1 rounded-full hover:bg-white/20 transition-colors duration-300"
          >
            <X className="w-6 h-6 text-white" />
          </button>
          <ContactForm
            isModal={true}
            onSubmit={handleFormSubmit}
            loading={loading}
          />
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
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black md:min-h-[80vh] py-4 flex items-center justify-between text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative flex flex-col md:flex-row justify-center gap-10  xl:gap-20 w-11/12 sm:pt-16 lg:w-4/5 mx-auto my-32">
        <div className="md:w-[50%] space-y-8">
          <div className="inline-flex items-center rounded-full bg-white px-2 py-2 pr-4">
            <span className="ml-2 text-[16px] font-medium bg-[#ec2127] rounded-full text-white px-4 py-1">
              Best
            </span>
            <span className="ml-2 text-[16px] text-gray-700 font-semibold">
              {heroSection.title}
            </span>
          </div>
          <div className="quill">
            <div 
              dangerouslySetInnerHTML={{ __html: heroSection.heading }}
              style={{
                fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
                fontSize: 'inherit',
                lineHeight: 'inherit',
                fontWeight: 'inherit'
              }}
              className="quill-content [&_h1]:text-xl [&_h1]:md:text-3xl [&_h1]:lg:text-4xl text-justify [&_h2]:text-md [&_h2]:md:text-lg  [&_h2]:text-gray-100"
            />
          </div>
          <div className="flex sm:block flex-col gap-4 items-center justify-center ">
            <Link to="/contact">
            <button
              className="mt-6 px-8 py-3 bg-gradient-to-r from-[#ec2127] to-red-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg "
            >
              Request Proposal
            </button>
          </Link>
            <button
            onClick={() => setIsModalOpen(true)}
            className="md:hidden px-8 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:from-red-500 hover:to-red-600 transform hover:scale-105 transition-all duration-300 shadow-lg w-[65%]"
          >
            Get in Touch
          </button>
          </div>
        </div>

        <div className="hidden md:block xl:w-[35%] w-[40%] relative">
          <div className="absolute -top-4 -left-4 z-10">
            <FaStarOfLife className="text-[#ec2127] text-4xl animate-[spin_5s_linear_infinite]" />
          </div>
          <ContactForm onSubmit={handleFormSubmit} loading={loading} />
        </div>
      </div>
      <Modal />
    </div>
  );
};

export default HeroSection;