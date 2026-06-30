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
  const maxMessageLength = 1000;

  const validateForm = () => {
    const newErrors = {};

    // Name validation: Only alphabets and spaces, min 2 characters
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (!/^[A-Za-z\s]{2,}$/.test(formData.name.trim())) {
      newErrors.name = 'Name must contain only letters and spaces (minimum 2 characters)';
    }

    // Email validation: Correct email format
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address (e.g., example@domain.com)';
    }

    // Company validation: No special characters except common business punctuation
    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required';
    } else if (!/^[A-Za-z0-9\s\-&,.'()]+$/.test(formData.company.trim())) {
      newErrors.company = 'Company name should not contain special characters like @#$%';
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
    
    // Clear previous status
    setSubmitStatus({ type: null, message: '' });
    
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // Using fetch API instead of axios
        const response = await fetch('/api/collaboration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
          throw new Error('Failed to submit');
        }
        
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
        
        // Clear errors
        setErrors({});
        
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
        message: 'Please fix the errors in the form before submitting.'
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
    
    // Clear submit status when user starts editing
    if (submitStatus.message) {
      setSubmitStatus({ type: null, message: '' });
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
        <div className={`p-4 mb-6 rounded border ${
          submitStatus.type === 'success' 
            ? 'bg-green-50 text-green-700 border-green-200' 
            : 'bg-red-50 text-red-700 border-red-200'
        }`}>
          <strong>{submitStatus.type === 'success' ? '✓ Success: ' : '✗ Error: '}</strong>
          {submitStatus.message}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Name (required)</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${
              errors.name 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Your name"
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1 flex items-start">
              <span className="mr-1">⚠</span>
              <span>{errors.name}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Email (required)</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${
              errors.email 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Your working email"
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1 flex items-start">
              <span className="mr-1">⚠</span>
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Company (required)</label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${
              errors.company 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Your company name"
          />
          {errors.company && (
            <p className="text-red-600 text-sm mt-1 flex items-start">
              <span className="mr-1">⚠</span>
              <span>{errors.company}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">How did you find out about us? (required)</label>
          <select
            name="foundUs"
            value={formData.foundUs}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${
              errors.foundUs 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
          >
            <option value="">Select an option</option>
            <option value="Clutch">Clutch</option>
            <option value="Shopify expert list">Shopify expert list</option>
            <option value="Google Search">Google Search</option>
            <option value="Google Map">Google Map</option>
            <option value="Social media post">Social media post</option>
            <option value="Social media app">Social media app</option>
          </select>
          {errors.foundUs && (
            <p className="text-red-600 text-sm mt-1 flex items-start">
              <span className="mr-1">⚠</span>
              <span>{errors.foundUs}</span>
            </p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">
            How do you envision collaborating with us? (optional)
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            className={`w-full p-2 border rounded bg-gray-50 focus:outline-none focus:ring-2 ${
              errors.message 
                ? 'border-red-500 focus:ring-red-200' 
                : 'border-gray-300 focus:ring-blue-200'
            }`}
            placeholder="Please explain"
            rows="4"
          ></textarea>
          <div className="flex justify-between items-start mt-1">
            <div className="flex-1">
              {errors.message && (
                <p className="text-red-600 text-sm flex items-start">
                  <span className="mr-1">⚠</span>
                  <span>{errors.message}</span>
                </p>
              )}
            </div>
            <p className={`text-sm ${
              formData.message.length > maxMessageLength 
                ? 'text-red-600 font-medium' 
                : 'text-gray-500'
            }`}>
              {formData.message.length} / {maxMessageLength}
            </p>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
};

export default CollaborationInquiries;