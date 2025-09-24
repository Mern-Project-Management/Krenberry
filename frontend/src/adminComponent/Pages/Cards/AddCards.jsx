import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import the styles for React Quill
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CreateCard() {
  const [icon, setIcon] = useState(null);
  const [iconName, setIconName] = useState('');
  const [altName, setAltName] = useState('');
  const [title, setTitle] = useState('');
  const [questionsAndAnswers, setQuestionsAndAnswers] = useState([{ question: '', answer: '' }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const navigate = useNavigate();

  const handleAddQA = () => {
    setQuestionsAndAnswers([...questionsAndAnswers, { question: '', answer: '' }]);
  };

  const handleRemoveQA = (index) => {
    setQuestionsAndAnswers(questionsAndAnswers.filter((_, i) => i !== index));
  };

  const handleChangeQA = (index, field, value) => {
    const updatedQA = questionsAndAnswers.map((qa, i) =>
      i === index ? { ...qa, [field]: value } : qa
    );
    setQuestionsAndAnswers(updatedQA);
  };

  const handleFileChange = (e) => {
    setIcon(e.target.files[0]);
  };

  const resetForm = () => {
    setIcon(null);
    setIconName('');
    setAltName('');
    setTitle('');
    setQuestionsAndAnswers([{ question: '', answer: '' }]);
    setError('');
    setSuccess('');
  };

  const validate = () => {
    const newErrors = {};
    
    // Validate Title (Heading)
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 5 || title.trim().length > 100) {
      newErrors.title = 'Title must be between 5 and 100 characters';
    } else if (!/\p{L}/u.test(title)) {
      newErrors.title = 'Title must contain at least one letter';
    } else if (/^[0-9\s\W]+$/.test(title)) {
      newErrors.title = 'Title cannot contain only numbers or symbols';
    }

    // Validate Icon (Photo Upload)
    if (!icon) {
      newErrors.icon = 'Photo is required';
    } else if (icon) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png','image/webp','image/gif','image/svg+xml'];
      const maxSize = 2 * 1024 * 1024; // 2MB
      
      if (!validTypes.includes(icon.type)) {
        newErrors.icon = 'Only JPG, JPEG, PNG,WEBP,GIF and SVG files are allowed';
      } else if (icon.size > maxSize) {
        newErrors.icon = 'Image size must be less than 2MB';
      }
    }

    // Validate Alt Text
    if (!altName.trim()) {
      newErrors.altName = 'Alt text is required';
    } else if (altName.trim().length < 3 || altName.trim().length > 100) {
      newErrors.altName = 'Alt text must be between 3 and 100 characters';
    } else if (!/^[a-zA-Z0-9\s]+$/.test(altName)) {
      newErrors.altName = 'Alt text can only contain letters and numbers';
    }

    // Validate Icon Name (Image Title) - Optional
    if (iconName.trim() && (iconName.trim().length < 3 || iconName.trim().length > 80)) {
      newErrors.iconName = 'Image title must be between 3 and 80 characters if provided';
    } else if (iconName.trim() && !/^[a-zA-Z0-9\s-]+$/.test(iconName)) {
      newErrors.iconName = 'Image title can only contain letters, numbers, spaces, and hyphens';
    }

    // Validate Questions and Answers
    questionsAndAnswers.forEach((qa, index) => {
      // Validate Question (Sub Heading)
      if (!qa.question.trim()) {
        newErrors[`question-${index}`] = 'Question is required';
      } else if (qa.question.trim().length < 10 || qa.question.trim().length > 200) {
        newErrors[`question-${index}`] = 'Question must be between 10 and 200 characters';
      } else if (/^[\s\W_]+$/.test(qa.question)) {
        newErrors[`question-${index}`] = 'Question cannot contain only symbols';
      }

      // Validate Answer
      if (!qa.answer.trim()) {
        newErrors[`answer-${index}`] = 'Answer is required';
      } else if (qa.answer.trim().length < 10) {
        newErrors[`answer-${index}`] = 'Answer must be at least 10 characters';
      }
    });
    
    return newErrors;
  };

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    setErrors(validate());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields on submit
    const formErrors = validate();
    setErrors(formErrors);
    
    // Mark all fields as touched to show errors
    const allFieldsTouched = {};
    Object.keys(formErrors).forEach(key => {
      allFieldsTouched[key] = true;
    });
    setTouched(allFieldsTouched);
    
    // If there are errors, don't submit
    if (Object.keys(formErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('icon', icon);
      formData.append('iconName', iconName);
      formData.append('altName', altName);
      formData.append('title', title);
      formData.append('questionsAndAnswers', JSON.stringify(questionsAndAnswers));

      await axios.post(
        'http://localhost:3006/api/card/addCard',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      // Show success message
      toast.success('Card created successfully!', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Reset form
      resetForm();
      
      // Redirect after a short delay
      setTimeout(() => {
        navigate('/card');
      }, 2000);
      
    } catch (error) {
      console.error('Error adding card:', error);
      toast.error(error.response?.data?.message || 'Failed to create card. Please try again.', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-10 my-10">
      <ToastContainer />
      <h1 className="text-2xl font-bold mb-4">Create Card</h1>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Icon Upload */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Icon x <span className="text-red-500"> *</span>
            {touched.icon && errors.icon && (
              <span className="text-red-500 text-xs font-normal ml-2">{errors.icon}</span>
            )}
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            onBlur={() => handleBlur('icon')}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              touched.icon && errors.icon ? 'border-red-500' : ''
            }`}
            accept="image/*"
            required
          />
        </div>

        {/* Icon Name */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Icon Name <span className="text-red-500"> *</span>
            {touched.iconName && errors.iconName && (
              <span className="text-red-500 text-xs font-normal ml-2">{errors.iconName}</span>
            )}
          </label>
          <input
            type="text"
            value={iconName}
            onChange={(e) => setIconName(e.target.value)}
            onBlur={() => handleBlur('iconName')}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              touched.iconName && errors.iconName ? 'border-red-500' : ''
            }`}
            required
          />
        </div>

        {/* Alt Name */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Alt Name <span className="text-red-500"> *</span>
            {touched.altName && errors.altName && (
              <span className="text-red-500 text-xs font-normal ml-2">{errors.altName}</span>
            )}
          </label>
          <input
            type="text"
            value={altName}
            onChange={(e) => setAltName(e.target.value)}
            onBlur={() => handleBlur('altName')}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              touched.altName && errors.altName ? 'border-red-500' : ''
            }`}
            required
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Title <span className="text-red-500"> *</span>
            {touched.title && errors.title && (
              <span className="text-red-500 text-xs font-normal ml-2">{errors.title}</span>
            )}
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => handleBlur('title')}
            className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${
              touched.title && errors.title ? 'border-red-500' : ''
            }`}
            required
          />
        </div>

        {/* Questions and Answers */}
        <div>
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Questions and Answers <span className="text-red-500"> *</span>
          </label>
          {questionsAndAnswers.map((qa, index) => (
            <div key={index} className="mb-6 p-4 border rounded-lg bg-gray-50">
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Question {index + 1} <span className="text-red-500"> *</span>
                  {touched[`question-${index}`] && errors[`question-${index}`] && (
                    <span className="text-red-500 text-xs font-normal ml-2">
                      {errors[`question-${index}`]}
                    </span>
                  )}
                </label>
                <ReactQuill
                  value={qa.question}
                  onChange={(value) => {
                    handleChangeQA(index, 'question', value);
                    // Clear error when user starts typing
                    if (touched[`question-${index}`]) {
                      setErrors(prev => ({
                        ...prev,
                        [`question-${index}`]: value.trim() ? '' : 'Question is required'
                      }));
                    }
                  }}
                  onBlur={() => handleBlur(`question-${index}`)}
                  placeholder="Enter question"
                  className={`bg-white ${touched[`question-${index}`] && errors[`question-${index}`] ? 'border-red-500' : ''}`}
                />
              </div>
              <div className="mb-2">
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Answer {index + 1} <span className="text-red-500"> *</span>
                  {touched[`answer-${index}`] && errors[`answer-${index}`] && (
                    <span className="text-red-500 text-xs font-normal ml-2">
                      {errors[`answer-${index}`]}
                    </span>
                  )}
                </label>
                <ReactQuill
                  value={qa.answer}
                  onChange={(value) => {
                    handleChangeQA(index, 'answer', value);
                    // Clear error when user starts typing
                    if (touched[`answer-${index}`]) {
                      setErrors(prev => ({
                        ...prev,
                        [`answer-${index}`]: value.trim() ? '' : 'Answer is required'
                      }));
                    }
                  }}
                  onBlur={() => handleBlur(`answer-${index}`)}
                  placeholder="Enter answer"
                  className={`bg-white ${touched[`answer-${index}`] && errors[`answer-${index}`] ? 'border-red-500' : ''}`}
                />
              </div>
              {questionsAndAnswers.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveQA(index)}
                  className="mt-2 text-red-500 text-sm hover:text-red-700"
                >
                  Remove Question {index + 1} <span className="text-red-500"> *</span>  
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddQA}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
          >
            + Add Another Question
          </button>
        </div>

        <div className="flex justify-start space-x-4 mt-6">
          <button
            type="button"
            onClick={() => navigate('/card')}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-6 py-2 rounded-md text-white ${
              isSubmitting
                ? 'bg-green-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Card'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCard;
