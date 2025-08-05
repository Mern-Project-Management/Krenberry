import React, { useState } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateJobTitle,
  validateDepartment,
  validateJobType,
  validateEmploymentType,
  validateRequirement,
  validateDescription,
  validatePhotos,
  validatePhotoAlt,
  validatePhotoTitle,
} from "../../utiles/validations";

const NewCareerForm = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [requirement, setRequirement] = useState("");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgTitles, setImgTitles] = useState([]);
  const [status, setStatus] = useState("active");
  const [jobTitleError, setJobTitleError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [jobTypeError, setJobTypeError] = useState("");
  const [employmentTypeError, setEmploymentTypeError] = useState("");
  const [requirementError, setRequirementError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [photosError, setPhotosError] = useState("");
  const [photoAltsErrors, setPhotoAltsErrors] = useState([]);
  const [imgTitlesErrors, setImgTitlesErrors] = useState([]);
  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    const newPhotosError = validatePhotos([...photos, ...files]);
    if (newPhotosError) {
      toast.error(newPhotosError);
      return;
    }
    setPhotos([...photos, ...files]);
    const newPhotoAlts = Array.from({ length: files.length }, () => "");
    const newImgTitles = Array.from({ length: files.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    setImgTitles([...imgTitles, ...newImgTitles]);
    setPhotoAltsErrors([...photoAltsErrors, ...newPhotoAlts.map(() => "")]);
    setImgTitlesErrors([...imgTitlesErrors, ...newImgTitles.map(() => "")]);
    setPhotosError("");
  };

  const handleDeleteImage = (index) => {
    setPhotos((prevPhotos) => prevPhotos.filter((_, i) => i !== index));
    setPhotoAlts((prevPhotoAlts) => prevPhotoAlts.filter((_, i) => i !== index));
    setImgTitles((prevImgTitles) => prevImgTitles.filter((_, i) => i !== index));
    setPhotoAltsErrors((prevErrors) => prevErrors.filter((_, i) => i !== index));
    setImgTitlesErrors((prevErrors) => prevErrors.filter((_, i) => i !== index));
    setPhotosError(validatePhotos(photos.filter((_, i) => i !== index)));
  };

  const handlePhotoAltChange = (value, index) => {
    const newPhotoAlts = [...photoAlts];
    newPhotoAlts[index] = value;
    setPhotoAlts(newPhotoAlts);
    const newPhotoAltsErrors = [...photoAltsErrors];
    newPhotoAltsErrors[index] = validatePhotoAlt(value);
    setPhotoAltsErrors(newPhotoAltsErrors);
  };

  const handleImgTitleChange = (value, index) => {
    const newImgTitles = [...imgTitles];
    newImgTitles[index] = value;
    setImgTitles(newImgTitles);
    const newImgTitlesErrors = [...imgTitlesErrors];
    newImgTitlesErrors[index] = validatePhotoTitle(value);
    setImgTitlesErrors(newImgTitlesErrors);
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const jobTitleErr = validateJobTitle(jobTitle);
    const departmentErr = validateDepartment(department);
    const jobTypeErr = validateJobType(jobType);
    const employmentTypeErr = validateEmploymentType(employmentType);
    const requirementErr = validateRequirement(requirement);
    const descriptionErr = validateDescription(description);
    const photosErr = validatePhotos(photos);
    const photoAltsErrs = photoAlts.map((alt, index) => validatePhotoAlt(alt));
    const imgTitlesErrs = imgTitles.map((title, index) => validatePhotoTitle(title));

    setJobTitleError(jobTitleErr);
    setDepartmentError(departmentErr);
    setJobTypeError(jobTypeErr);
    setEmploymentTypeError(employmentTypeErr);
    setRequirementError(requirementErr);
    setDescriptionError(descriptionErr);
    setPhotosError(photosErr);
    setPhotoAltsErrors(photoAltsErrs);
    setImgTitlesErrors(imgTitlesErrs);

    if (
      jobTitleErr ||
      departmentErr ||
      jobTypeErr ||
      employmentTypeErr ||
      requirementErr ||
      descriptionErr ||
      photosErr ||
      photoAltsErrs.some((err) => err) ||
      imgTitlesErrs.some((err) => err)
    ) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('jobtitle', jobTitle);
      formData.append('department', department);
      formData.append('jobType', jobType);
      formData.append('employmentType', employmentType);
      formData.append('requirement', requirement);
      formData.append('description', description);
      photos.forEach((photo, index) => {
        formData.append('photo', photo);
        formData.append('alt', photoAlts[index]);
        formData.append('imgTitle', imgTitles[index]);
      });
      formData.append('status', status);

      await axios.post('/api/careeroption/CreateCareeroption', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      // Reset form fields
      setJobTitle("");
      setDepartment("");
      setJobType("");
      setEmploymentType("");
      setRequirement("");
      setDescription("");
      setPhotos([]);
      setPhotoAlts([]);
      setImgTitles([]);
      setStatus("active");
      setJobTitleError("");
      setDepartmentError("");
      setJobTypeError("");
      setEmploymentTypeError("");
      setRequirementError("");
      setDescriptionError("");
      setPhotosError("");
      setPhotoAltsErrors([]);
      setImgTitlesErrors([]);

      navigate('/careeroption');
    } catch (error) {
      console.error(error);
      toast.error("Error adding career option");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Add Career Option</h1>
      <div className="mb-4">
        <label htmlFor="jobTitle" className="block font-semibold mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="jobTitle"
          value={jobTitle}
          onChange={(e) => {
            const value = e.target.value;
            setJobTitle(value);
            setJobTitleError(validateJobTitle(value));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${jobTitleError ? "border-red-500" : ""}`}
          required
          maxLength={50}
        />
        {jobTitleError && <p className="text-red-500 text-sm mt-1">{jobTitleError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="department" className="block font-semibold mb-2">
          Department <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="department"
          value={department}
          onChange={(e) => {
            const value = e.target.value;
            setDepartment(value);
            setDepartmentError(validateDepartment(value));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${departmentError ? "border-red-500" : ""}`}
          required
          maxLength={50}
        />
        {departmentError && <p className="text-red-500 text-sm mt-1">{departmentError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="jobType" className="block font-semibold mb-2">
          Job Type <span className="text-red-500">*</span>
        </label>
        <select
          id="jobType"
          value={jobType}
          onChange={(e) => {
            const value = e.target.value;
            setJobType(value);
            setJobTypeError(validateJobType(value));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${jobTypeError ? "border-red-500" : ""}`}
          required
        >
          <option value="">Select Job Type</option>
          <option value="Onsite">Onsite</option>
          <option value="Remote">Remote</option>
          <option value="Hybrid">Hybrid</option>
        </select>
        {jobTypeError && <p className="text-red-500 text-sm mt-1">{jobTypeError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="employmentType" className="block font-semibold mb-2">
          Employment Type <span className="text-red-500">*</span>
        </label>
        <select
          id="employmentType"
          value={employmentType}
          onChange={(e) => {
            const value = e.target.value;
            setEmploymentType(value);
            setEmploymentTypeError(validateEmploymentType(value));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${employmentTypeError ? "border-red-500" : ""}`}
          required
        >
          <option value="">Select Employment Type</option>
          <option value="Full Time">Full Time</option>
          <option value="Part Time">Part Time</option>
          <option value="Contract">Contract</option>
          <option value="Internship">Internship</option>
        </select>
        {employmentTypeError && <p className="text-red-500 text-sm mt-1">{employmentTypeError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="photo" className="block font-semibold mb-2">
          Photos <span className="text-red-500">*</span>
        </label>
        <input
          type="file"
          name="photo"
          id="photo"
          multiple
          onChange={handlePhotoChange}
          className={`border rounded focus:outline-none ${photosError ? "border-red-500" : ""}`}
          accept="image/*"
          required
        />
        {photosError && <p className="text-red-500 text-sm mt-1">{photosError}</p>}
        {photos.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative w-56 group flex flex-col items-center">
                <div className="relative w-56">
                  <img
                    src={URL.createObjectURL(photo)}
                    alt={`Career ${index + 1}`}
                    className="h-32 w-56 object-cover"
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
                    onChange={(e) => handlePhotoAltChange(e.target.value, index)}
                    className={`w-full p-2 border rounded focus:outline-none ${photoAltsErrors[index] ? "border-red-500" : ""}`}
                    required
                    maxLength={100}
                  />
                  {photoAltsErrors[index] && <p className="text-red-500 text-sm mt-1">{photoAltsErrors[index]}</p>}
                </label>
                <label className="block mt-2">
                  Image Title <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    value={imgTitles[index]}
                    onChange={(e) => handleImgTitleChange(e.target.value, index)}
                    className={`w-full p-2 border rounded focus:outline-none ${imgTitlesErrors[index] ? "border-red-500" : ""}`}
                    required
                    maxLength={100}
                  />
                  {imgTitlesErrors[index] && <p className="text-red-500 text-sm mt-1">{imgTitlesErrors[index]}</p>}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="mb-8">
        <label htmlFor="description" className="block font-semibold mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={description}
          onChange={(value) => {
            setDescription(value);
            setDescriptionError(validateDescription(value));
          }}
          modules={modules}
          className={`quill ${descriptionError ? "border-red-500" : ""}`}
          required
        />
        {descriptionError && <p className="text-red-500 text-sm mt-1">{descriptionError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="requirement" className="block font-semibold mb-2">
          Requirement <span className="text-red-500">*</span>
        </label>
        <ReactQuill
          value={requirement}
          onChange={(value) => {
            setRequirement(value);
            setRequirementError(validateRequirement(value));
          }}
          modules={modules}
          className={`quill ${requirementError ? "border-red-500" : ""}`}
          required
        />
        {requirementError && <p className="text-red-500 text-sm mt-1">{requirementError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center">
          <label className="mr-4 text-green-500">
            <input
              type="radio"
              value="active"
              checked={status === "active"}
              onChange={() => setStatus("active")}
              required
            />
            Active
          </label>
          <label className="text-red-500">
            <input
              type="radio"
              value="inactive"
              checked={status === "inactive"}
              onChange={() => setStatus("inactive")}
              required
            />
            Inactive
          </label>
        </div>
      </div>
      <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700">
        Add Career Option
      </button>
    </form>
  );
};

export default NewCareerForm;