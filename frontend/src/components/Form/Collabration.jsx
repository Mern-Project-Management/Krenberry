import React, { useState } from 'react';

const CollaborationInquiries = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    foundUs: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: null, message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    const maxMessageLength = 1000; // Maximum characters for the message field

    // Name validation: Only alphabets and spaces, min 2 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{2,}$/.test(formData.name.trim())) {
      newErrors.name = 'Name must contain only letters and spaces, minimum 2 characters';
    }

    // Email validation: Correct email format
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
    }

    // Company validation: No special characters
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (!/^[A-Za-z0-9\s\-&,.'()]+$/.test(formData.company.trim())) {
      newErrors.company = 'Company name contains invalid characters';
    }

    // Found us validation: Must be selected
    if (!formData.foundUs) {
      newErrors.foundUs = 'Please select how you found us';
    }

    // Message validation: Optional but with max length
    if (formData.message && formData.message.length > maxMessageLength) {
      newErrors.message = `Message cannot exceed ${maxMessageLength} characters`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Replace with your actual API call
        const response = await axios.post('/api/collaboration', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setSubmitStatus({
          type: 'success',
          message: 'Form submitted successfully! We\'ll get back to you soon.'
        });
        
        // Reset form after successful submission
        setFormData({
          name: '',
          email: '',
          company: '',
          foundUs: '',
          message: ''
        });
      } catch (error) {
        setSubmitStatus({
          type: 'error',
          message: 'Failed to submit form. Please try again later.'
        });
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setSubmitStatus({
        type: 'error',
        message: 'Please fix the errors in the form.'
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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

      {submitStatus.message && (
        <div className={`p-4 mb-4 rounded ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {submitStatus.message}
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
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-[#F7F4F4] ${errors.message ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Please explain"
            rows="4"
          ></textarea>
          {errors.message && <p className="text-red-500 text-sm mt-1">{errors.message}</p>}
        </div>

        <button type="submit" className="bg-[#ec2127] text-white font-bold py-2 px-4 rounded hover:bg-[#d11c22]" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default CollaborationInquiries;