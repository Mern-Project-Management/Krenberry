import React, { useState } from 'react';

const CollaborationInquiries = () => {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    foundUs: '',
    collaboration: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);

  const validateForm = () => {
    const newErrors = {};

    // Name validation: Only alphabets and spaces, min 2 characters
    if (!formData.name || !/^[A-Za-z\s]{2,}$/.test(formData.name.trim())) {
      newErrors.name = 'Name must contain only letters and spaces, minimum 2 characters';
    }

    // Email validation: Correct email format
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Company validation: No special characters
    if (!formData.company || !/^[A-Za-z0-9\s]+$/.test(formData.company.trim())) {
      newErrors.company = 'Company name must not contain special characters';
    }

    // Found us validation: Must be selected
    if (!formData.foundUs) {
      newErrors.foundUs = 'Please select how you found us';
    }

    // Collaboration validation: Optional, max 500 characters
    if (formData.collaboration && formData.collaboration.length > 500) {
      newErrors.collaboration = 'Collaboration description must not exceed 500 characters';
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length === 0) {
      console.log('Form submitted:', formData);
      setSubmitStatus('success');
      // Reset form
      setFormData({
        name: '',
        company: '',
        email: '',
        foundUs: '',
        collaboration: ''
      });
      setErrors({});
    } else {
      setErrors(validationErrors);
      setSubmitStatus('error');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-16 xl:mt-24">
      <h1 className="text-4xl font-semibold mb-4">Collaboration Inquiries</h1>
      <p className="mb-6">At Krenberry, we value the power of partnerships and believe in rewarding those who help us grow.</p>

      <h2 className="text-2xl font-semibold mb-2">Referral Program</h2>
      <p className="mb-6">
        Do you know someone who could benefit from our services? Refer them to Krenberry and you&apos;ll receive a 10% commission on the net sale. It&apos;s our way of
        saying thank you for spreading the word and supporting our mission which is to revolutionize the way businesses manage their design and website needs
        through our innovative subscription-based model, offering unlimited design services and comprehensive website packages. Fill out the form to get
        started.
      </p>

      <h2 className="text-2xl font-semibold mb-2">PR Inquiries</h2>
      <p className="mb-6">
        Are you a PR professional, influencer, or YouTube creator interested in collaborating with us? We&apos;d love to hear from you! Fill out the form below, and our
        team will respond within 24 hours.
      </p>

      {submitStatus === 'success' && (
        <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
          Form submitted successfully!
        </div>
      )}
      {submitStatus === 'error' && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          Please correct the errors in the form and try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Name (required)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Your name"
            required
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block mb-1">Company (required)</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.company ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Your company name"
            required
          />
          {errors.company && <p className="text-red-500 text-sm mt-1">{errors.company}</p>}
        </div>

        <div>
          <label className="block mb-1">Email (required)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Your working email"
            required
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block mb-1">How did you find out about us? (required)</label>
          <select
            name="foundUs"
            value={formData.foundUs}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.foundUs ? 'border-red-500' : 'border-gray-300'}`}
            required
          >
            <option value="">Select an option</option>
            <option value="Clutch">Clutch</option>
            <option value="Shopify expert list">Shopify expert list</option>
            <option value="Google Search">Google Search</option>
            <option value="Google Map">Google Map</option>
            <option value="Social media post">Social media post</option>
            <option value="Social media app">Social media app</option>
          </select>
          {errors.foundUs && <p className="text-red-500 text-sm mt-1">{errors.foundUs}</p>}
        </div>

        <div>
          <label className="block mb-1">How do you envision collaborating with us?</label>
          <textarea
            name="collaboration"
            value={formData.collaboration}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.collaboration ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Please explain"
            rows="4"
          ></textarea>
          {errors.collaboration && <p className="text-red-500 text-sm mt-1">{errors.collaboration}</p>}
        </div>

        <button type="submit" className="bg-[#ec2127] text-white font-bold py-2 px-4 rounded hover:bg-[#d11c22]">
          Submit
        </button>
      </form>
    </div>
  );
};

export default CollaborationInquiries;