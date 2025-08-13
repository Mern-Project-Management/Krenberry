import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateTitle,
  validateCoreValueDescription,
  validatePhotos,
  validatePhotoAlt,
  validatePhotoTitle,
} from "../../utiles/validations";

const EditCoreValue = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [initialPhotoAlts, setInitialPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [initialImgtitle, setInitialImgtitle] = useState([]);
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});
  const { id } = useParams();
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
    fetchCoreValue();
  }, []);

  const fetchCoreValue = async () => {
    try {
      const response = await axios.get(`/api/corevalue/getCoreValueById?id=${id}`, { withCredentials: true });
      const coreValue = response.data;
      setTitle(coreValue.title || "");
      setDescription(coreValue.description || "");
      setInitialPhotos(coreValue.photo || []);
      setInitialPhotoAlts(coreValue.alt || []);
      setInitialImgtitle(coreValue.imgtitle || []);
      setStatus(coreValue.status || "active");

      // Validate initial data
      setErrors({
        title: validateTitle(coreValue.title || ""),
        description: validateCoreValueDescription(coreValue.description || ""),
        photos: coreValue.photo?.length > 0 ? validatePhotos(coreValue.photo) : "",
        photoAlts: (coreValue.photo || []).map((_, i) => validatePhotoAlt(coreValue.alt?.[i] || "")),
        imgtitle: (coreValue.photo || []).map((_, i) => validatePhotoTitle(coreValue.imgtitle?.[i] || "")),
      });
    } catch (error) {
      console.error("Error fetching core value:", error);
      toast.error("Error fetching core value data");
    }
  };

  const handleFileChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    if (initialPhotos.length + photos.length + newPhotos.length > 5) {
      toast.error("You can only upload up to 5 photos");
      return;
    }
    const updatedPhotos = [...photos, ...newPhotos];
    setPhotos(updatedPhotos);
    const newPhotoAlts = Array.from({ length: newPhotos.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    const newImgtitles = Array.from({ length: newPhotos.length }, () => "");
    setImgtitle([...imgtitle, ...newImgtitles]);
    setErrors(prev => ({
      ...prev,
      photos: [...initialPhotos, ...updatedPhotos].length > 0 ? validatePhotos([...initialPhotos, ...updatedPhotos]) : "",
      photoAlts: [...initialPhotos, ...updatedPhotos].map((_, i) =>
        validatePhotoAlt(i < initialPhotoAlts.length ? initialPhotoAlts[i] : photoAlts[i - initialPhotoAlts.length] || "")
      ),
      imgtitle: [...initialPhotos, ...updatedPhotos].map((_, i) =>
        validatePhotoTitle(i < initialImgtitle.length ? initialImgtitle[i] : imgtitle[i - initialImgtitle.length] || "")
      ),
    }));
  };

  const handleInitialAltTextChange = (e, index) => {
    const updatedAlts = [...initialPhotoAlts];
    updatedAlts[index] = e.target.value;
    setInitialPhotoAlts(updatedAlts);
    setErrors(prev => ({
      ...prev,
      photoAlts: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoAlt(i < updatedAlts.length ? updatedAlts[i] : photoAlts[i - updatedAlts.length] || "")
      ),
    }));
  };

  const handleNewAltTextChange = (e, index) => {
    const updatedAlts = [...photoAlts];
    updatedAlts[index] = e.target.value;
    setPhotoAlts(updatedAlts);
    setErrors(prev => ({
      ...prev,
      photoAlts: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoAlt(i < initialPhotoAlts.length ? initialPhotoAlts[i] : updatedAlts[i - initialPhotoAlts.length] || "")
      ),
    }));
  };

  const handleInitialImgtitleChange = (e, index) => {
    const updatedTitles = [...initialImgtitle];
    updatedTitles[index] = e.target.value;
    setInitialImgtitle(updatedTitles);
    setErrors(prev => ({
      ...prev,
      imgtitle: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoTitle(i < updatedTitles.length ? updatedTitles[i] : imgtitle[i - updatedTitles.length] || "")
      ),
    }));
  };

  const handleNewImgtitleChange = (e, index) => {
    const updatedTitles = [...imgtitle];
    updatedTitles[index] = e.target.value;
    setImgtitle(updatedTitles);
    setErrors(prev => ({
      ...prev,
      imgtitle: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoTitle(i < initialImgtitle.length ? initialImgtitle[i] : updatedTitles[i - initialImgtitle.length] || "")
      ),
    }));
  };

  const handleDeleteInitialPhoto = (e, photoFilename, index) => {
    e.preventDefault();
    axios.delete(`/api/corevalue/${id}/image/${photoFilename}/${index}`, { withCredentials: true })
      .then(() => {
        const updatedPhotos = initialPhotos.filter((_, i) => i !== index);
        const updatedAlts = initialPhotoAlts.filter((_, i) => i !== index);
        const updatedTitles = initialImgtitle.filter((_, i) => i !== index);
        setInitialPhotos(updatedPhotos);
        setInitialPhotoAlts(updatedAlts);
        setInitialImgtitle(updatedTitles);
        setErrors(prev => ({
          ...prev,
          photos: [...updatedPhotos, ...photos].length > 0 ? validatePhotos([...updatedPhotos, ...photos]) : "",
          photoAlts: [...updatedPhotos, ...photos].map((_, i) =>
            validatePhotoAlt(i < updatedAlts.length ? updatedAlts[i] : photoAlts[i - updatedAlts.length] || "")
          ),
          imgtitle: [...updatedPhotos, ...photos].map((_, i) =>
            validatePhotoTitle(i < updatedTitles.length ? updatedTitles[i] : imgtitle[i - updatedTitles.length] || "")
          ),
        }));
      })
      .catch(error => {
        console.error("Error deleting photo:", error);
        toast.error("Error deleting photo");
      });
  };

  const handleDeleteNewPhoto = (e, index) => {
    e.preventDefault();
    const updatedPhotos = photos.filter((_, i) => i !== index);
    const updatedAlts = photoAlts.filter((_, i) => i !== index);
    const updatedTitles = imgtitle.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoAlts(updatedAlts);
    setImgtitle(updatedTitles);
    setErrors(prev => ({
      ...prev,
      photos: [...initialPhotos, ...updatedPhotos].length > 0 ? validatePhotos([...initialPhotos, ...updatedPhotos]) : "",
      photoAlts: [...initialPhotos, ...updatedPhotos].map((_, i) =>
        validatePhotoAlt(i < initialPhotoAlts.length ? initialPhotoAlts[i] : updatedAlts[i - initialPhotoAlts.length] || "")
      ),
      imgtitle: [...initialPhotos, ...updatedPhotos].map((_, i) =>
        validatePhotoTitle(i < initialImgtitle.length ? initialImgtitle[i] : updatedTitles[i - initialImgtitle.length] || "")
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      title: validateTitle(title),
      description: validateCoreValueDescription(description),
      photos: [...initialPhotos, ...photos].length > 0 ? validatePhotos([...initialPhotos, ...photos]) : "",
      photoAlts: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoAlt(i < initialPhotoAlts.length ? initialPhotoAlts[i] : photoAlts[i - initialPhotoAlts.length] || "")
      ),
      imgtitle: [...initialPhotos, ...photos].map((_, i) =>
        validatePhotoTitle(i < initialImgtitle.length ? initialImgtitle[i] : imgtitle[i - initialImgtitle.length] || "")
      ),
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
    photos.forEach((p) => {
      formData.append('photo', p);
    });
    [...initialPhotoAlts, ...photoAlts].forEach((a) => {
      if (a) formData.append('alt', a);
    });
    [...initialImgtitle, ...imgtitle].forEach((m) => {
      if (m) formData.append('imgtitle', m);
    });

    try {
      await axios.put(`/api/corevalue/updateCorevalue?id=${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      navigate('/corevalue');
    } catch (error) {
      console.error("Error updating core value:", error);
      toast.error("Error updating core value");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Core Value</h1>
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
      <div className="mb-4">
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
          className="bg-white"
        />
        {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Current Photos (optional)</label>
        <div className="flex flex-wrap gap-4">
          {initialPhotos.map((photo, index) => (
            <div key={index} className="relative w-56">
              <img
                src={`/api/image/download/${photo}`}
                alt={initialPhotoAlts[index] || `Photo ${index + 1}`}
                className="w-56 h-32 object-cover"
              />
              <label htmlFor={`alt-initial-${index}`} className="block mt-2">
                Alternative Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`alt-initial-${index}`}
                  value={initialPhotoAlts[index] || ""}
                  onChange={(e) => handleInitialAltTextChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.photoAlts?.[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {errors.photoAlts?.[index] && <p className="text-red-500 text-sm mt-1">{errors.photoAlts[index]}</p>}
              </label>
              <label htmlFor={`imgtitle-initial-${index}`} className="block mt-2">
                Image Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-initial-${index}`}
                  value={initialImgtitle[index] || ""}
                  onChange={(e) => handleInitialImgtitleChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.imgtitle?.[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {errors.imgtitle?.[index] && <p className="text-red-500 text-sm mt-1">{errors.imgtitle[index]}</p>}
              </label>
              <button
                onClick={(e) => handleDeleteInitialPhoto(e, photo, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center hover:bg-red-600 focus:outline-none"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Add New Photos (optional)</label>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          className={`p-2 border rounded focus:outline-none ${errors.photos ? "border-red-500" : ""}`}
        />
        {errors.photos && <p className="text-red-500 text-sm mt-1">{errors.photos}</p>}
        <div className="flex flex-wrap gap-4 mt-4">
          {photos.map((file, index) => (
            <div key={index} className="relative w-56">
              <img
                src={URL.createObjectURL(file)}
                alt={photoAlts[index] || `New Photo ${index + 1}`}
                className="w-56 h-32 object-cover"
              />
              <label htmlFor={`alt-new-${index}`} className="block mt-2">
                Alternative Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`alt-new-${index}`}
                  value={photoAlts[index] || ""}
                  onChange={(e) => handleNewAltTextChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.photoAlts?.[index + initialPhotoAlts.length] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {errors.photoAlts?.[index + initialPhotoAlts.length] && <p className="text-red-500 text-sm mt-1">{errors.photoAlts[index + initialPhotoAlts.length]}</p>}
              </label>
              <label htmlFor={`imgtitle-new-${index}`} className="block mt-2">
                Image Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-new-${index}`}
                  value={imgtitle[index] || ""}
                  onChange={(e) => handleNewImgtitleChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.imgtitle?.[index + initialImgtitle.length] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {errors.imgtitle?.[index + initialImgtitle.length] && <p className="text-red-500 text-sm mt-1">{errors.imgtitle[index + initialImgtitle.length]}</p>}
              </label>
              <button
                onClick={(e) => handleDeleteNewPhoto(e, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center hover:bg-red-600 focus:outline-none"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          ))}
        </div>
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
      <button type="submit" className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none">
        Update Core Value
      </button>
    </form>
  );
};

export default EditCoreValue;