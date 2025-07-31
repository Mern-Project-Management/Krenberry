import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import "react-toastify/dist/ReactToastify.css";

const EditServiceDetails = () => {
  const { categoryId } = useParams();
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoAlt, setVideoAlt] = useState("");
  const [videotitle, setVideotitle] = useState("");
  const [status, setStatus] = useState(true);
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [initialPhotoAlts, setInitialPhotoAlts] = useState([]);
  const [initialVideoAlt, setInitialVideoAlt] = useState("");
  const [initialImgtitle, setInitialImgtitle] = useState([]);
  const [initialVideo, setInitialVideo] = useState("");
  const [initialVideotitle, setInitialVideotitle] = useState("");
  
  // Validation states
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();

  const modules = {
    toolbar: [
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
        [{ 'script': 'sub' }, { 'script': 'super' }],
        [{ 'indent': '-1' }, { 'indent': '+1' }],
        ['link', 'image', 'video'],
        [{ 'direction': 'rtl' }],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'align': [] }],
        ['clean']
    ],
    clipboard: {
        matchVisual: false,
    }
  };

  useEffect(() => {
    fetchServiceDetails();
  }, []);

  const fetchServiceDetails = async () => {
    try {
      const response = await axios.get(`/api/serviceDetails/getServiceDetailById?id=${categoryId}`, { withCredentials: true });
      const serviceDetails = response.data.data;

      setHeading(serviceDetails.heading);
      setDescription(serviceDetails.description);
      setInitialPhotos(serviceDetails.photo || []);
      setInitialPhotoAlts(serviceDetails.alt || []);
      setInitialVideo(serviceDetails.video);      
      setInitialVideoAlt(serviceDetails.altVideo);
      setInitialImgtitle(serviceDetails.imgtitle);
      setInitialVideotitle(serviceDetails.videotitle);
      setStatus(serviceDetails.status);
      setQuestions(serviceDetails.questions || [{ question: "", answer: "" }]);
    } catch (error) {
      console.error(error);
    }
  };

  // Validation functions
  const validateHeading = (value) => {
    // Only allow alphabets, spaces, and specific special characters: ? ! ' " ,
    const headingRegex = /^[a-zA-Z\s?!'",\-]+$/;
    if (!value.trim()) {
      return "Heading is required";
    }
    if (value.length > 100) {
      return "Heading must be less than 100 characters";
    }
    if (!headingRegex.test(value)) {
      return "Please enter a valid heading using alphabets, spaces, and only these special characters: ? ! ' \" ,";
    }
    return "";
  };

  const validateDescription = (value) => {
    const plainText = value.replace(/<[^>]*>/g, '').trim();
    if (!plainText) {
      return "Description cannot be empty. Please provide a brief explanation of the service.";
    }
    if (plainText.length < 10) {
      return "Description must be at least 10 characters long";
    }
    return "";
  };

  const validatePhotos = () => {
    if (initialPhotos.length === 0 && photos.length === 0) {
      return "At least one image is required for the service";
    }
    return "";
  };

  const validatePhotoFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (!allowedTypes.includes(file.type)) {
      return "Please upload an image in JPG/PNG/WEBP format only";
    }
    if (file.size > maxSize) {
      return "Image size must be less than 5MB";
    }
    return "";
  };

  const validateVideo = (file) => {
    if (!file) return "";
    
    const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov'];
    const maxSize = 50 * 1024 * 1024; // 50MB
    
    if (!allowedTypes.includes(file.type)) {
      return "Please upload a video in MP4/WEBM/OGG/AVI/MOV format only";
    }
    if (file.size > maxSize) {
      return "Video size must be less than 50MB";
    }
    return "";
  };

  const validateQuestions = () => {
    const questionErrors = [];
    questions.forEach((q, index) => {
      const questionError = {};
      if (!q.question.trim()) {
        questionError.question = "Question cannot be empty";
      }
      const plainAnswer = q.answer.replace(/<[^>]*>/g, '').trim();
      if (!plainAnswer) {
        questionError.answer = "Answer cannot be empty";
      }
      if (Object.keys(questionError).length > 0) {
        questionErrors[index] = questionError;
      }
    });
    return questionErrors;
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate heading
    const headingError = validateHeading(heading);
    if (headingError) newErrors.heading = headingError;
    
    // Validate description
    const descriptionError = validateDescription(description);
    if (descriptionError) newErrors.description = descriptionError;
    
    // Validate photos
    const photoError = validatePhotos();
    if (photoError) newErrors.photos = photoError;
    
    // Validate new photo files
    photos.forEach((photo, index) => {
      const photoFileError = validatePhotoFile(photo);
      if (photoFileError) {
        if (!newErrors.newPhotos) newErrors.newPhotos = {};
        newErrors.newPhotos[index] = photoFileError;
      }
    });
    
    // Validate video if uploaded
    if (video) {
      const videoError = validateVideo(video);
      if (videoError) newErrors.video = videoError;
    }
    
    // Validate questions
    const questionErrors = validateQuestions();
    if (questionErrors.length > 0) {
      newErrors.questions = questionErrors;
    }
    
    // Validate alt texts for new photos
    photos.forEach((_, index) => {
      if (!photoAlts[index] || !photoAlts[index].trim()) {
        if (!newErrors.photoAlts) newErrors.photoAlts = {};
        newErrors.photoAlts[index] = "Alt text is required for accessibility";
      }
    });
    
    // Validate image titles for new photos
    photos.forEach((_, index) => {
      if (!imgtitle[index] || !imgtitle[index].trim()) {
        if (!newErrors.imgtitle) newErrors.imgtitle = {};
        newErrors.imgtitle[index] = "Image title is required";
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('heading', heading);
      formData.append('description', description);
      formData.append('status', status);

      if (video) {
        formData.append('video', video);
        formData.append('altVideo', videoAlt);
        formData.append('videotitle', videotitle || initialVideotitle);
      }
      
      const combinedAlts = [...initialPhotoAlts, ...photoAlts];
      const combinedImgtitle = [...initialImgtitle, ...imgtitle];

      photos.forEach((p) => {
        formData.append('photo', p);
      });

      combinedAlts.forEach((a) => {
        formData.append('alt', a);
      });

      combinedImgtitle.forEach((m) => {
        formData.append('imgtitle', m);
      });

      questions.forEach((q) => {
        formData.append('questions', JSON.stringify(q));
      });

      await axios.put(`/api/serviceDetails/updateServiceDetail?id=${categoryId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      navigate(`/services`);
    } catch (error) {
      console.error(error);
      setErrors({ submit: "Failed to update service details. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    const validPhotos = [];
    const fileErrors = {};
    
    newPhotos.forEach((photo, index) => {
      const error = validatePhotoFile(photo);
      if (error) {
        fileErrors[photos.length + index] = error;
      } else {
        validPhotos.push(photo);
      }
    });
    
    if (Object.keys(fileErrors).length > 0) {
      setErrors(prev => ({ ...prev, newPhotos: fileErrors }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.newPhotos;
        delete newErrors.photos;
        return newErrors;
      });
    }
    
    setPhotos([...photos, ...validPhotos]);
    // Initialize alt texts and titles for new photos
    setPhotoAlts([...photoAlts, ...new Array(validPhotos.length).fill("")]);
    setImgtitle([...imgtitle, ...new Array(validPhotos.length).fill("")]);
  };

  const handleVideoChange = (e) => {
    const selectedVideo = e.target.files[0];
    const error = validateVideo(selectedVideo);
    
    if (error) {
      setErrors(prev => ({ ...prev, video: error }));
      return;
    }
    
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.video;
      return newErrors;
    });
    
    setVideo(selectedVideo);
    setVideoAlt("");
    setVideotitle("");
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
    
    // Clear validation errors for this question
    if (errors.questions && errors.questions[index]) {
      const newErrors = { ...errors };
      delete newErrors.questions[index][field];
      if (Object.keys(newErrors.questions[index]).length === 0) {
        delete newErrors.questions[index];
      }
      if (Object.keys(newErrors.questions).length === 0) {
        delete newErrors.questions;
      }
      setErrors(newErrors);
    }
  };

  const handleAddQuestion = () => {
    // Create a new question object without affecting existing ones
    setQuestions(prevQuestions => [...prevQuestions, { question: "", answer: "" }]);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions);
    
    // Clear validation errors for removed question
    if (errors.questions) {
      const newErrors = { ...errors };
      delete newErrors.questions[index];
      setErrors(newErrors);
    }
  };

  const handleInitialAltTextChange = (e, index) => {
    const newPhotoAlts = [...initialPhotoAlts];
    newPhotoAlts[index] = e.target.value;
    setInitialPhotoAlts(newPhotoAlts);
  };

  const handleNewAltTextChange = (e, index) => {
    const newPhotoAlts = [...photoAlts];
    newPhotoAlts[index] = e.target.value;
    setPhotoAlts(newPhotoAlts);
    
    // Clear validation error
    if (errors.photoAlts && errors.photoAlts[index]) {
      const newErrors = { ...errors };
      delete newErrors.photoAlts[index];
      if (Object.keys(newErrors.photoAlts).length === 0) {
        delete newErrors.photoAlts;
      }
      setErrors(newErrors);
    }
  };

  const handleInitialImgtitleChange = (e, index) => {
    const newImgtitles = [...initialImgtitle];
    newImgtitles[index] = e.target.value;
    setInitialImgtitle(newImgtitles);
  };

  const handleNewImgtitleChange = (e, index) => {
    const newImgtitles = [...imgtitle];
    newImgtitles[index] = e.target.value;
    setImgtitle(newImgtitles);
    
    // Clear validation error
    if (errors.imgtitle && errors.imgtitle[index]) {
      const newErrors = { ...errors };
      delete newErrors.imgtitle[index];
      if (Object.keys(newErrors.imgtitle).length === 0) {
        delete newErrors.imgtitle;
      }
      setErrors(newErrors);
    }
  };

  const handleDeleteInitialPhoto = async (e, photoFilename, index) => {
    e.preventDefault();
    try {
      await axios.delete(`/api/serviceDetails/${categoryId}/image/${photoFilename}/${index}`, { withCredentials: true });
      const updatedPhotos = initialPhotos.filter((_, i) => i !== index);
      setInitialPhotos(updatedPhotos);
      const updatedPhotoAlts = initialPhotoAlts.filter((_, i) => i !== index);
      setInitialPhotoAlts(updatedPhotoAlts);
      const updatedImgtitle = [...initialImgtitle];
      updatedImgtitle.splice(index, 1);
      setInitialImgtitle(updatedImgtitle);
      
      // Clear photo validation error if exists
      if (errors.photos) {
        const newErrors = { ...errors };
        delete newErrors.photos;
        setErrors(newErrors);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteNewPhoto = (e, index) => {
    e.preventDefault();
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    const updatedPhotoAlts = photoAlts.filter((_, i) => i !== index);
    setPhotoAlts(updatedPhotoAlts);
    const updatedImgtitle = [...imgtitle];
    updatedImgtitle.splice(index, 1);
    setImgtitle(updatedImgtitle);
  };

  const handleDeleteVideo = async (e) => {
    e.preventDefault();
    try {
      if (video) {
        await axios.delete(`/api/serviceDetails/serviceDetail/${categoryId}/video/${video}`, { withCredentials: true });
        setVideo(null);
        setVideoAlt("");
        setVideotitle("");
      }
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  };
  
  const handleDeleteQuestion = async (e, questionId, index) => {
    e.preventDefault();
    try {
      await axios.delete(`/api/serviceDetails/${categoryId}/questions/${questionId}`, { withCredentials: true });
      const updatedQuestions = questions.filter((_, i) => i !== index);
      setQuestions(updatedQuestions);
    } catch (error) {
      console.error('Error deleting question:', error);
    }
  };

  // Helper function to display error messages
  const ErrorMessage = ({ error }) => (
    error ? <div className="text-red-500 text-sm mt-1">{error}</div> : null
  );

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Service Details</h1>

      {errors.submit && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {errors.submit}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="heading" className="block font-semibold mb-2">
          Heading <span className="text-red-500">*</span>
        </label>
        <div className="mb-4">     
          <ReactQuill
            value={heading}
            onChange={(value) => {
              setHeading(value);
              if (errors.heading) {
                const error = validateHeading(value);
                if (!error) {
                  const newErrors = { ...errors };
                  delete newErrors.heading;
                  setErrors(newErrors);
                }
              }
            }}
            modules={modules}
            className="quill"
            required
          />
          <ErrorMessage error={errors.heading} />
        </div>
      </div>

      <div className="mb-8">
        <label htmlFor="description" className="block font-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={description}
          onChange={(value) => {
            setDescription(value);
            if (errors.description) {
              const error = validateDescription(value);
              if (!error) {
                const newErrors = { ...errors };
                delete newErrors.description;
                setErrors(newErrors);
              }
            }
          }}
          modules={modules}
          className="quill"
        />
        <ErrorMessage error={errors.description} />
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Current Photos</label>
        <div className="flex flex-wrap gap-4">
          {initialPhotos.map((photo, index) => (
            <div key={index} className="relative w-56">
              <img
                src={`/api/image/download/${photo}`}
                alt={`Photo ${index + 1}`}
                className="w-56 h-32 object-cover"
              />
              <label htmlFor={`alt-${index}`} className="block mt-2">
                Alternative Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`alt-${index}`}
                  value={initialPhotoAlts[index] || ""}
                  onChange={(e) => handleInitialAltTextChange(e, index)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </label>
              <label htmlFor={`imgtitle-${index}`} className="block mt-2">
                Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-${index}`}
                  value={initialImgtitle[index] || ""}
                  onChange={(e) => handleInitialImgtitleChange(e, index)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </label>
              <button
                onClick={(e) => handleDeleteInitialPhoto(e, photo, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 flex justify-center items-center"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">
          Add New Photos <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Please upload images in JPG/PNG/WEBP format (max size: 5MB each)
        </p>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className="p-2 border rounded"
        />
        <ErrorMessage error={errors.photos} />
        <div className="flex flex-wrap gap-4 mt-4">
          {photos.map((file, index) => (
            <div key={index} className="relative w-56">
              <img
                src={URL.createObjectURL(file)}
                alt={`New Photo ${index + 1}`}
                className="w-56 h-32 object-cover"
              />
              <label htmlFor={`alt-new-${index}`} className="block mt-2">
                Alternative Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`alt-new-${index}`}
                  value={photoAlts[index] || ""}
                  onChange={(e) => handleNewAltTextChange(e, index)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
                <ErrorMessage error={errors.photoAlts && errors.photoAlts[index]} />
              </label>
              <label htmlFor={`imgtitle-new-${index}`} className="block mt-2">
                Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-new-${index}`}
                  value={imgtitle[index] || ""}
                  onChange={(e) => handleNewImgtitleChange(e, index)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
                <ErrorMessage error={errors.imgtitle && errors.imgtitle[index]} />
              </label>
              <button
                onClick={(e) => handleDeleteNewPhoto(e, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 flex justify-center items-center"
              >
                <span className="text-xs">X</span>
              </button>
              <ErrorMessage error={errors.newPhotos && errors.newPhotos[index]} />
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="video" className="block font-semibold mb-2">
          Upload Video (Optional)
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Please upload video in MP4/WEBM/OGG format (max size: 50MB)
        </p>
        <input
          type="file"
          id="video"
          onChange={handleVideoChange}
          accept="video/*"
          className="p-2 border rounded"
        />
        <ErrorMessage error={errors.video} />
        {(video || initialVideo) && (
          <div className="mt-4">
            <label className="block font-semibold mb-2">Current Video</label>
            <div className="relative w-56">
              <video
                src={
                  video
                    ? URL.createObjectURL(video)
                    : `/api/video/download/${initialVideo}`
                }
                controls
                className="w-56 h-32 object-cover"
              />
              <label htmlFor="videoAlt" className="block mt-2">
                Video Alt Text:
                <input
                  type="text"
                  id="videoAlt"
                  value={videoAlt || initialVideoAlt}
                  onChange={(e) => setVideoAlt(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </label>
              <label htmlFor="videotitle" className="block mt-2">
                Title Text:
                <input
                  type="text"
                  id="videotitle"
                  value={videotitle || initialVideotitle}
                  onChange={(e) => setVideotitle(e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                />
              </label>
              <button
                onClick={handleDeleteVideo}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 flex justify-center items-center"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value === "true")}
          className="p-2 border rounded focus:outline-none"
        >
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block font-semibold mb-2">
          Questions & Answers <span className="text-red-500">*</span>
        </label>
        {questions.map((question, index) => (
          <div key={index} className="mb-4 p-4 border rounded">
            <input
              type="text"
              placeholder="Enter your question here..."
              value={question.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              className="w-full p-2 mb-2 border rounded focus:outline-none"
            />
            <ErrorMessage error={errors.questions && errors.questions[index] && errors.questions[index].question} />
            
            <ReactQuill
              value={question.answer}
              onChange={(value) => handleQuestionChange(index, "answer", value)}
              className="quill"
              modules={modules}
              placeholder="Enter your answer here..."
            />
            <ErrorMessage error={errors.questions && errors.questions[index] && errors.questions[index].answer} />
            
            <button
              type="button"
              onClick={(e) => handleDeleteQuestion(e, question._id, index)}
              className="mt-2 bg-red-500 text-white rounded-md p-2 flex justify-center items-center"
            >
              <span className="text-xs">Remove Question</span>
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddQuestion}
          className="mt-4 bg-green-500 text-white rounded-md p-2"
        >
          Add Another Question
        </button>
      </div>

      <div className="text-center">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`${
            isSubmitting 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white rounded-md p-3 px-6 transition-colors`}
        >
          {isSubmitting ? 'Updating...' : 'Update Service Details'}
        </button>
      </div>
    </form>
  );
};

export default EditServiceDetails;