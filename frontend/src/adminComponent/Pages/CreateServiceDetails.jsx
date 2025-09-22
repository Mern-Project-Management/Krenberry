import React, { useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";

const NewServiceForm = () => {
  const { categoryId } = useParams();
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [video, setVideo] = useState(null);
  const [altVideo, setVideoAlt] = useState("");
  const [videotitle, setVideotitle] = useState("");
  const [status, setStatus] = useState(true);
  const [questions, setQuestions] = useState([{ question: "", answer: "" }]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [hasAttemptedPhotoUpload, setHasAttemptedPhotoUpload] = useState(false); // Track photo upload attempts
  const navigate = useNavigate();

  const modules = {
    toolbar: [
      [{ font: [] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ list: "ordered" }, { list: "bullet" }, { list: "check" }],
      [{ script: "sub" }, { script: "super" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image", "video"],
      [{ direction: "rtl" }],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ["clean"],
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // Utility to strip HTML tags and get plain text
  const stripHTML = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  // Validate heading
  const validateHeading = (value) => {
    const plainText = stripHTML(value);
    if (!plainText.trim()) {
      return "Please enter a valid heading using alphabets and spaces only (max 100 characters). Avoid special symbols like #, $, %, etc.";
    }
    if (plainText.length > 100) {
      return "Heading cannot exceed 100 characters.";
    }
    if (!/^[a-zA-Z\s.,:–-]*$/.test(plainText)) {
      return "Heading can only contain alphabets, spaces, and basic punctuation (.,:–-).";
    }
    return "";
  };

  // Validate description
  const validateDescription = (value) => {
    const plainText = stripHTML(value);
    if (!plainText.trim()) {
      return "Description cannot be empty. Please provide a brief explanation of the service.";
    }
    return "";
  };

  // Validate photos (optional field). If user attempts upload, enforce constraints; if photos provided, require alt and title per photo
  const validatePhotos = () => {
    if (photos.length === 0) return ""; // photos are optional
    // if present, each photo must have alt and title
    const missingMetaIndexes = photos.reduce((acc, _p, idx) => {
      const alt = (photoAlts[idx] || "").trim();
      const title = (imgtitle[idx] || "").trim();
      if (!alt || !title) acc.push(idx + 1);
      return acc;
    }, []);
    if (missingMetaIndexes.length > 0) {
      return `Please provide Alt and Title for image(s): ${missingMetaIndexes.join(', ')}`;
    }
    return "";
  };

  const handlePhotoChange = (e) => {
    setHasAttemptedPhotoUpload(true);
    const files = Array.from(e.target.files);
    const validFiles = files.filter((file) => {
      const isValidType = ["image/jpeg", "image/png"].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB
      if (!isValidType) {
        toast.error(`Invalid file type for ${file.name}. Only JPG/PNG allowed.`);
        return false;
      }
      if (!isValidSize) {
        toast.error(`File ${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    if (photos.length + validFiles.length > 5) {
      toast.error("You can only upload up to 5 photos.");
      setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
      return;
    }

    setPhotos([...photos, ...validFiles]);
    const newPhotoAlts = Array.from({ length: validFiles.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    const newImgtitles = Array.from({ length: validFiles.length }, () => "");
    setImgtitle([...imgtitle, ...newImgtitles]);
    setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
  };

  const handleClearAllPhotos = () => {
    setPhotos([]);
    setPhotoAlts([]);
    setImgtitle([]);
    setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
  };

  const handleVideoChange = (e) => {
    setVideo(e.target.files[0]);
    // clear video-related errors on change
    setErrors((prev) => ({ ...prev, altVideo: "", videotitle: "" }));
  };

  const handleDeleteImage = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPhotoAlts((prevPhotoAlts) => prevPhotoAlts.filter((_, i) => i !== index));
    setImgtitle((prevImgtitle) => prevImgtitle.filter((_, i) => i !== index));
    setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
    // clear specific question error on edit
    setErrors((prev) => {
      const qErrors = Array.isArray(prev.questions) ? [...prev.questions] : [];
      if (!qErrors[index]) qErrors[index] = { question: "", answer: "" };
      if (field === 'question') qErrors[index].question = "";
      if (field === 'answer') qErrors[index].answer = "";
      return { ...prev, questions: qErrors };
    });
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", answer: "" }]);
  };

  const handleRemoveQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    setErrors((prev) => {
      const qErrors = Array.isArray(prev.questions) ? prev.questions.filter((_, i) => i !== index) : [];
      return { ...prev, questions: qErrors };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields (photo and video optional)
    const headingError = validateHeading(heading);
    const descriptionError = validateDescription(description);
    const photosError = validatePhotos();

    // Video-related conditional validation
    const altVideoError = video ? (altVideo.trim() ? "" : "Video Alt Text is required when a video is uploaded.") : "";
    const videoTitleError = video ? (videotitle.trim() ? "" : "Video Title is required when a video is uploaded.") : "";

    // Questions validation (each question and answer are required)
    const questionErrors = questions.map((qa) => {
      const qErr = !qa.question.trim() ? "Question is required" : "";
      const aErr = !stripHTML(qa.answer).trim() ? "Answer is required" : "";
      return { question: qErr, answer: aErr };
    });
    const hasQuestionErrors = questionErrors.some((qe) => qe.question || qe.answer);

    const newErrors = {
      heading: headingError,
      description: descriptionError,
      photos: photosError,
      altVideo: altVideoError,
      videotitle: videoTitleError,
      questions: questionErrors,
    };

    setErrors(newErrors);

    if (headingError || descriptionError || photosError || altVideoError || videoTitleError || hasQuestionErrors) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    setLoading(true);
    try {
      console.log("Submitting form with data:", {
        heading,
        description,
        status,
        categoryId,
        photos,
        photoAlts,
        imgtitle,
        video,
        altVideo,
        videotitle,
        questions,
      });
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("description", description);
      formData.append("status", status);
      formData.append("altVideo", altVideo);
      formData.append("categoryId", categoryId);
      formData.append("videotitle", videotitle);
      photos.forEach((photo, index) => {
        formData.append("photo", photo);
        formData.append("alt", photoAlts[index]);
        formData.append("imgtitle", imgtitle[index]);
      });

      if (video) {
        formData.append("video", video);
      }

      questions.forEach((qa) => {
        formData.append("questions", JSON.stringify(qa));
      });

      const response = await axios.post(
        "/api/serviceDetails/insertServiceDetail",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      console.log("Service created successfully:", response.data);
      toast.success("Service created successfully!", { autoClose: 3000 });

      setDescription("");
      setHeading("");
      setPhotos([]);
      setVideo(null);
      setVideoAlt("");
      setStatus(true);
      setPhotoAlts([]);
      setImgtitle([]);
      setVideotitle("");
      setQuestions([{ question: "", answer: "" }]);
      setErrors({});
      setHasAttemptedPhotoUpload(false);
      navigate(`/services`);
    } catch (error) {
      console.error("Error creating service:", error.response?.data || error.message);
      toast.error("Failed to create service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">
        Add Service
      </h1>

      {/* Heading Field */}
      <div className="mb-4">
        <label htmlFor="heading" className="block font-semibold mb-2">
          Heading <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={heading}
          onChange={(value) => {
            setHeading(value);
            setErrors((prev) => ({ ...prev, heading: validateHeading(value) }));
          }}
          modules={modules}
          className={`quill ${errors.heading ? 'border border-red-500' : ''}`}
        />
        {errors.heading && (
          <p className="text-red-500 text-sm mt-1">{errors.heading}</p>
        )}
      </div>

      {/* Description Field */}
      <div className="mb-8">
        <label htmlFor="description" className="block font-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={description}
          onChange={(value) => {
            setDescription(value);
            setErrors((prev) => ({
              ...prev,
              description: validateDescription(value),
            }));
          }}
          modules={modules}
          className={`quill ${errors.description ? 'border border-red-500' : ''}`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description}</p>
        )}
      </div>

      {/* Photo Upload Field (optional) */}
      <div className="mt-12">
        <label htmlFor="photo" className="block font-semibold mb-2">
          Photos
        </label>
        <div className="flex items-center gap-4">
          <input
            type="file"
            name="photo"
            id="photo"
            multiple
            onChange={handlePhotoChange}
            className="border rounded focus:outline-none"
            accept="image/jpeg,image/png"
          />
          {photos.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllPhotos}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear All Photos
            </button>
          )}
        </div>
        {errors.photos && (
          <p className="text-red-500 text-sm mt-1">{errors.photos}</p>
        )}
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-4">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="relative group flex flex-col items-center w-56"
              >
                <div className="relative w-56">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Service ${index + 1}`}
                    className="w-56 h-32 object-cover"
                  />
                  <button
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                  >
                    X
                  </button>
                </div>
                <label className="block mt-2">
                  Alternative Text <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    value={photoAlts[index]}
                    onChange={(e) => {
                      const newPhotoAlts = [...photoAlts];
                      newPhotoAlts[index] = e.target.value;
                      setPhotoAlts(newPhotoAlts);
                      setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
                    }}
                    className={`w-full p-2 border rounded focus:outline-none ${errors.photos ? 'border-red-500' : ''}`}
                  />
                </label>
                <label className="block mt-2">
                  Image title Text <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    value={imgtitle[index]}
                    onChange={(e) => {
                      const newImgtitles = [...imgtitle];
                      newImgtitles[index] = e.target.value;
                      setImgtitle(newImgtitles);
                      setErrors((prev) => ({ ...prev, photos: validatePhotos() }));
                    }}
                    className={`w-full p-2 border rounded focus:outline-none ${errors.photos ? 'border-red-500' : ''}`}
                  />
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Video Upload Field (optional) */}
      <div className="mt-4">
        <label htmlFor="video" className="block font-semibold mb-2">
          Video
        </label>
        <input
          type="file"
          id="video"
          onChange={handleVideoChange}
          className="border rounded focus:outline-none"
          accept="video/*"
        />
        {video && (
          <div className="mt-4">
            <label htmlFor="videoAlt" className="block font-semibold mb-2">
              Video Alt Text <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="videoAlt"
              value={altVideo}
              onChange={(e) => setVideoAlt(e.target.value)}
              className={`w-full p-2 border rounded focus:outline-none ${errors.altVideo ? 'border-red-500' : ''}`}
            />
            {errors.altVideo && (
              <p className="text-red-500 text-sm mt-1">{errors.altVideo}</p>
            )}
            <div className="mt-4">
              <label htmlFor="videotitle" className="block font-semibold mb-2">
                Video title Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="videotitle"
                value={videotitle}
                onChange={(e) => setVideotitle(e.target.value)}
                className={`w-full p-2 border rounded focus:outline-none ${errors.videotitle ? 'border-red-500' : ''}`}
              />
              {errors.videotitle && (
                <p className="text-red-500 text-sm mt-1">{errors.videotitle}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Questions Section (required) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4">Questions and Answers <span className="text-red-500">*</span></h3>
        {questions.map((qa, index) => (
          <div key={index} className="mb-4 p-4 border rounded bg-gray-50">
            <label className="block mb-1 font-medium">Question <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="question"
              value={qa.question}
              onChange={(e) => handleQuestionChange(index, "question", e.target.value)}
              className={`w-full p-2 border rounded focus:outline-none mb-2 ${errors.questions && errors.questions[index] && errors.questions[index].question ? 'border-red-500' : ''}`}
            />
            {errors.questions && errors.questions[index] && errors.questions[index].question && (
              <p className="text-red-500 text-sm mt-1">{errors.questions[index].question}</p>
            )}
            <label className="block mb-1 font-medium">Answer <span className="text-red-500">*</span></label>
            <ReactQuill
              value={qa.answer}
              onChange={(value) => handleQuestionChange(index, "answer", value)}
              modules={modules}
              className={`quill ${errors.questions && errors.questions[index] && errors.questions[index].answer ? 'border border-red-500' : ''}`}
            />
            {errors.questions && errors.questions[index] && errors.questions[index].answer && (
              <p className="text-red-500 text-sm mt-1">{errors.questions[index].answer}</p>
            )}
            {questions.length > 1 && (
              <button
                type="button"
                className="mt-2 text-red-600 hover:text-red-800"
                onClick={() => handleRemoveQuestion(index)}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleAddQuestion}
        >
          Add Another Question
        </button>
      </div>

      {/* Status Toggle */}
      <div className="mt-8">
        <label htmlFor="status" className="inline-flex items-center">
          <input
            type="checkbox"
            id="status"
            checked={status}
            onChange={(e) => setStatus(e.target.checked)}
            className="form-checkbox h-5 w-5 text-blue-600"
          />
          <span className="ml-2 font-medium">Active</span>
        </label>
      </div>

      {/* Submit Button */}
      <div className="mt-8">
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <UseAnimations animation={loading} size={24} strokeColor="#fff" />
              Submitting...
            </>
          ) : (
            "Create Service"
          )}
        </button>
      </div>
    </form>
  );
};

export default NewServiceForm;