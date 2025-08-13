import React, { useState } from "react";
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateTitle,
  validateCoreValueDescription,
  validatePhotos,
  validatePhotoAlt,
  validatePhotoTitle,
} from "../../utiles/validations";

const NewCoreValueForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});
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

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error("You can only upload up to 5 photos");
      return;
    }
    const newPhotos = [...photos, ...files];
    setPhotos(newPhotos);
    const newPhotoAlts = Array.from({ length: files.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    const newImgtitles = Array.from({ length: files.length }, () => "");
    setImgtitle([...imgtitle, ...newImgtitles]);
    setErrors(prev => ({
      ...prev,
      photos: newPhotos.length > 0 ? validatePhotos(newPhotos) : "",
      photoAlts: newPhotos.map((_, i) => validatePhotoAlt(photoAlts[i] || "")),
      imgtitle: newPhotos.map((_, i) => validatePhotoTitle(imgtitle[i] || "")),
    }));
  };

  const handleDeleteImage = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedPhotoAlts = photoAlts.filter((_, i) => i !== index);
    const updatedImgtitles = imgtitle.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoAlts(updatedPhotoAlts);
    setImgtitle(updatedImgtitles);
    setErrors(prev => ({
      ...prev,
      photos: updatedPhotos.length > 0 ? validatePhotos(updatedPhotos) : "",
      photoAlts: updatedPhotos.map((_, i) => validatePhotoAlt(updatedPhotoAlts[i] || "")),
      imgtitle: updatedPhotos.map((_, i) => validatePhotoTitle(updatedImgtitles[i] || "")),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      title: validateTitle(title),
      description: validateCoreValueDescription(description),
      photos: photos.length > 0 ? validatePhotos(photos) : "",
      photoAlts: photos.map((_, i) => validatePhotoAlt(photoAlts[i] || "")),
      imgtitle: photos.map((_, i) => validatePhotoTitle(imgtitle[i] || "")),
    };

    setErrors(newErrors);
    if (
      newErrors.title ||
      newErrors.description ||
      newErrors.photoAlts.some(e => e) ||
      newErrors.imgtitle.some(e => e)
    ) {
      toast.error("Please correct the errors in the form");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('status', status);
    photos.forEach((photo, index) => {
      formData.append(`photo`, photo);
      if (photoAlts[index]) formData.append(`alt`, photoAlts[index]);
      if (imgtitle[index]) formData.append(`imgtitle`, imgtitle[index]);
    });

    try {
      await axios.post('/api/corevalue/createCoreValue', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });
      setTitle("");
      setDescription("");
      setPhotos([]);
      setPhotoAlts([]);
      setImgtitle([]);
      setStatus("active");
      setErrors({});
      navigate('/CoreValue');
    } catch (error) {
      console.error("Error creating core value:", error);
      // Check for duplicate title error from backend
      if (
        error.response &&
        error.response.data &&
        typeof error.response.data.error === 'string' &&
        error.response.data.error.toLowerCase().includes('title')
      ) {
        toast.error("A core value with this title already exists. Please use a different title.");
      } else {
        toast.error("Error creating core value");
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Add Core Value</h1>
      <div className="mb-4">
        <label htmlFor="title" className="block font-semibold mb-2">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => {
            const value = e.target.value;
            setTitle(value);
            setErrors(prev => ({ ...prev, title: validateTitle(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.title ? "border-red-500" : ""}`}
          required
          maxLength={100}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>
      <div className="mb-8">
        <label htmlFor="description" className="block font-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </label>  
        <ReactQuill
          value={description}
          onChange={(value) => {
            setDescription(value);
            setErrors(prev => ({ ...prev, description: validateCoreValueDescription(value) }));
          }}
          modules={modules}
          className="quill"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="photo" className="block font-semibold mb-2">Photos (optional)</label>
        <input
          type="file"
          name="photo"
          id="photo"
          multiple
          onChange={handlePhotoChange}
          className={`border rounded focus:outline-none ${errors.photos ? "border-red-500" : ""}`}
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
        {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-56">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={photoAlts[index] || `Photo ${index + 1}`}
                  className="w-56 h-32 object-cover"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteImage(index)}
                  className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center hover:bg-red-600 focus:outline-none"
                >
                  <span className="text-xs">X</span>
                </button>
                <label htmlFor={`alt-${index}`} className="block mt-2">
                  Alternative Text <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    id={`alt-${index}`}
                    value={photoAlts[index] || ""}
                    onChange={(e) => {
                      const newPhotoAlts = [...photoAlts];
                      newPhotoAlts[index] = e.target.value;
                      setPhotoAlts(newPhotoAlts);
                      setErrors(prev => ({
                        ...prev,
                        photoAlts: photos.map((_, i) => validatePhotoAlt(newPhotoAlts[i] || "")),
                      }));
                    }}
                    className={`w-full p-2 border rounded focus:outline-none ${errors.photoAlts?.[index] ? "border-red-500" : ""}`}
                    required
                    maxLength={100}
                  />
                  {errors.photoAlts?.[index] && <p className="text-red-500 text-sm mt-1">{errors.photoAlts[index]}</p>}
                </label>
                <label htmlFor={`imgtitle-${index}`} className="block mt-2">
                  Title Text <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    id={`imgtitle-${index}`}
                    value={imgtitle[index] || ""}
                    onChange={(e) => {
                      const newImgtitles = [...imgtitle];
                      newImgtitles[index] = e.target.value;
                      setImgtitle(newImgtitles);
                      setErrors(prev => ({
                        ...prev,
                        imgtitle: photos.map((_, i) => validatePhotoTitle(newImgtitles[i] || "")),
                      }));
                    }}
                    className={`w-full p-2 border rounded focus:outline-none ${errors.imgtitle?.[index] ? "border-red-500" : ""}`}
                    required
                    maxLength={100}
                  />
                  {errors.imgtitle?.[index] && <p className="text-red-500 text-sm mt-1">{errors.imgtitle[index]}</p>}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="mt-8">
        <button type="submit" className="py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
          Submit
        </button>
      </div>
    </form>
  );
};

export default NewCoreValueForm;