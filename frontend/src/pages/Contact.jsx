import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Inquiry from "../assets/quote.png"
import { useNavigate } from 'react-router-dom';


const GetInTouch = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    companySize: '',
    activeUsers: '',
    topic: '',
    message: '',
    utmSource: '',
    utmMedium: '',
    utmCampaign: '',
    utmId: '',
    gclid: '',
    gcidSource: '',
    utmContent: '',
    utmTerm: '',
    ipaddress: ''
  });

  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    setFormData(prevData => ({
      ...prevData,
      utmSource: urlParams.get('utm_source') || '',
      utmMedium: urlParams.get('utm_medium') || '',
      utmCampaign: urlParams.get('utm_campaign') || '',
      utmId: urlParams.get('utm_id') || '',
      gclid: urlParams.get('gclid') || '',
      gcidSource: urlParams.get('gcid_source') || '',
      utmContent: urlParams.get('utm_content') || '',
      utmTerm: urlParams.get('utm_term') || ''
    }));

    const fetchIP = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setFormData(prevData => ({ ...prevData, ipaddress: response.data.ip }));
      } catch (error) {
        console.error('Error fetching IP address:', error);
      }
    };

    fetchIP();
  }, []);

  // Enhanced email validation function
  const validateEmail = (email) => {
    // RFC 5322 compliant email regex (simplified but robust)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Additional checks
    if (!email) return false;
    if (!emailRegex.test(email)) return false;
    
    // Check for valid domain format
    const parts = email.split('@');
    if (parts.length !== 2) return false;
    
    const domain = parts[1];
    const domainParts = domain.split('.');
    
    // Domain should have at least 2 parts and last part should be letters only
    if (domainParts.length < 2) return false;
    if (!/^[a-zA-Z]{2,}$/.test(domainParts[domainParts.length - 1])) return false;
    
    // Check if domain part contains only valid characters
    if (!/^[a-zA-Z0-9.-]+$/.test(domain)) return false;
    
    return true;
  };

  const validatePhone = (phone) => {
    return /^[0-9]{10}$/.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., user@example.com)';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }

    if (!formData.companySize) {
      newErrors.companySize = 'Please select company size';
    }

    if (!formData.activeUsers) {
      newErrors.activeUsers = 'Please select number of active users';
    }

    if (!formData.topic) {
      newErrors.topic = 'Please select a topic';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const dataToSubmit = {
      firstname: formData.firstName,
      lastname: formData.lastName,
      email: formData.email,
      mobileNo: formData.phone,
      companysize: formData.companySize,
      activeuser: formData.activeUsers,
      topic: formData.topic,
      message: formData.message,
      utm_source: formData.utmSource || '',
      utm_medium: formData.utmMedium || '',
      utm_campaign: formData.utmCampaign || '',
      utm_id: formData.utmId || '',
      gclid: formData.gclid || '',
      gcid_source: formData.gcidSource || '',
      utm_content: formData.utmContent || '',
      utm_term: formData.utmTerm || '',
      ipaddress: formData.ipaddress || ''
    };

    try {
      await axios.post('/api/inquiries/addInquiry', dataToSubmit);
      navigate("/thankyou");
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Error submitting form');
    }
  };

  return (
    <div className="bg-white p-8 mt-24">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-center items-center">
        <div className="md:w-1/2 pr-8">
          <h1 className="text-4xl font-bold text-[#ec2127] mb-6">Krenberry</h1>
          <h2 className="text-3xl font-bold mb-6">Get in touch</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">First Name *</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full p-2 bg-gray-100 rounded ${errors.firstName ? 'border-2 border-red-500' : ''}`}
                />
                {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Last Name *</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full p-2 bg-gray-100 rounded ${errors.lastName ? 'border-2 border-red-500' : ''}`}
                />
                {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
              </div>
            </div>
            <div className="flex space-x-4">
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Company Email *</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 bg-gray-100 rounded ${errors.email ? 'border-2 border-red-500' : ''}`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div className="w-1/2">
                <label className="block text-sm font-medium mb-1">Phone *</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full p-2 bg-gray-100 rounded ${errors.phone ? 'border-2 border-red-500' : ''}`}
                  maxLength={10}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Company Size *</label>
              <div className="flex space-x-2">
                {['1-250', '251-1000', '1000+'].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, companySize: size });
                      if (errors.companySize) {
                        setErrors({ ...errors, companySize: '' });
                      }
                    }}
                    className={`px-4 py-2 rounded ${formData.companySize === size ? 'bg-red-200' : 'bg-gray-100'}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {errors.companySize && <p className="text-red-500 text-xs mt-1">{errors.companySize}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Active Users *</label>
              <div className="flex space-x-2">
                {['<100k+', '>100k+', 'Unknown'].map((users) => (
                  <button
                    key={users}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, activeUsers: users });
                      if (errors.activeUsers) {
                        setErrors({ ...errors, activeUsers: '' });
                      }
                    }}
                    className={`px-4 py-2 rounded ${formData.activeUsers === users ? 'bg-red-200' : 'bg-gray-100'}`}
                  >
                    {users}
                  </button>
                ))}
              </div>
              {errors.activeUsers && <p className="text-red-500 text-xs mt-1">{errors.activeUsers}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Topic *</label>
              <select
                name="topic"
                value={formData.topic}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded ${errors.topic ? 'border-2 border-red-500' : ''}`}
              >
                <option value="">Select a topic</option>
                <option>I want to change my plan</option>
                <option>Pricing question</option>
                <option>Product question</option>
                <option>Free Demo</option>
              </select>
              {errors.topic && <p className="text-red-500 text-xs mt-1">{errors.topic}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">How can we help *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                className={`w-full p-2 bg-gray-100 rounded ${errors.message ? 'border-2 border-red-500' : ''}`}
                rows="4"
              ></textarea>
              {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
            </div>
            <div className="flex items-center space-x-4">
              <button type="submit" className="px-6 py-2 bg-[#ec2127] text-white rounded hover:bg-red-700 transition-colors">
                Submit
              </button>
            </div>
          </form>
        </div>
        <div className="md:w-1/2 mt-8 md:mt-0">
          <img src={Inquiry} alt="" />
        </div>
      </div>
    </div>
  );
};

export default GetInTouch;