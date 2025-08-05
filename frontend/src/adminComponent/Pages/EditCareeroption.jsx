import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
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

const EditCareer = () => {
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [jobType, setJobType] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [requirement, setRequirement] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState([]);
  const [status, setStatus] = useState("active");
  const { id } = useParams();
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [initialPhotoAlts, setInitialPhotoAlts] = useState([]);
  const [initialImgtitle, setInitialImgtitle] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [jobTitleError, setJobTitleError] = useState("");
  const [departmentError, setDepartmentError] = useState("");
  const [jobTypeError, setJobTypeError] = useState("");
  const [employmentTypeError, setEmploymentTypeError] = useState("");
  const [requirementError, setRequirementError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [photosError, setPhotosError] = useState("");
  const [initialPhotoAltsErrors, setInitialPhotoAltsErrors] = useState([]);
  const [photoAltsErrors, setPhotoAltsErrors] = useState([]);
  const [initialImgtitleErrors, setInitialImgtitleErrors] = useState([]);
  const [imgtitleErrors, setImgtitleErrors] = useState([]);
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
    fetchCareer();
  }, []);

  const fetchCareer = async () => {
    try {
      const response = await axios.get(`/api/careeroption/getCareeroptionById?id=${id}`, { withCredentials: true });
      const career = response.data;
      setJobTitle(career.jobtitle);
      setDepartment(career.department);
      setJobType(career.jobType);
      setEmploymentType(career.employmentType);
      setRequirement(career.requirement);
      setDescription(career.description);
      setInitialPhotos(career.photo);
      setStatus(career.status);
      setInitialPhotoAlts(career.alt);
      setInitialImgtitle(career.imgTitle);
      setInitialPhotoAltsErrors(career.alt.map(() => ""));
      setInitialImgtitleErrors(career.imgTitle.map(() => ""));
    } catch (error) {
      console.error(error);
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
    const photosErr = validatePhotos([...initialPhotos, ...photo]);
    const initialPhotoAltsErrs = initialPhotoAlts.map((alt) => validatePhotoAlt(alt));
    const photoAltsErrs = photoAlts.map((alt) => validatePhotoAlt(alt));
    const initialImgtitleErrs = initialImgtitle.map((title) => validatePhotoTitle(title));
    const imgtitleErrs = imgtitle.map((title) => validatePhotoTitle(title));

    setJobTitleError(jobTitleErr);
    setDepartmentError(departmentErr);
    setJobTypeError(jobTypeErr);
    setEmploymentTypeError(employmentTypeErr);
    setRequirementError(requirementErr);
    setDescriptionError(descriptionErr);
    setPhotosError(photosErr);  
    setInitialPhotoAltsErrors(initialPhotoAltsErrs);
    setPhotoAltsErrors(photoAltsErrs);
    setInitialImgtitleErrors(initialImgtitleErrs);
    setImgtitleErrors(imgtitleErrs);

    if (
      jobTitleErr ||
      departmentErr ||
      jobTypeErr ||
      employmentTypeErr ||
      requirementErr ||
      descriptionErr ||
      photosErr ||
      initialPhotoAltsErrs.some((err) => err) ||
      photoAltsErrs.some((err) => err) ||
      initialImgtitleErrs.some((err) => err) ||
      imgtitleErrs.some((err) => err)
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
      formData.append('status', status);

      // Combine initial and new photo alts and titles into single arrays
      const combinedAlts = [...initialPhotoAlts, ...photoAlts];
      const combinedImgtitle = [...initialImgtitle, ...imgtitle];

      // Append photos, their alts, and titles to FormData
      photo.forEach((p) => {
        formData.append('photo', p);
      });

      combinedAlts.forEach((a) => {
        formData.append('alt', a);
      });

      combinedImgtitle.forEach((t) => {
        formData.append('imgTitle', t);
      });

      await axios.put(`/api/careeroption/updateCareeroption?id=${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      navigate('/careeroption');
    } catch (error) {
      console.error(error);
      toast.error("Error updating career option");
    }
  };

  const handleInitialAltTextChange = (e, index) => {
    const newPhotoAlts = [...initialPhotoAlts];
    newPhotoAlts[index] = e.target.value;
    setInitialPhotoAlts(newPhotoAlts);
    const newInitialPhotoAltsErrors = [...initialPhotoAltsErrors];
    newInitialPhotoAltsErrors[index] = validatePhotoAlt(e.target.value);
    setInitialPhotoAltsErrors(newInitialPhotoAltsErrors);
  };

  const handleNewAltTextChange = (e, index) => {
    const newPhotoAlts = [...photoAlts];
    newPhotoAlts[index] = e.target.value;
    setPhotoAlts(newPhotoAlts);
    const newPhotoAltsErrors = [...photoAltsErrors];
    newPhotoAltsErrors[index] = validatePhotoAlt(e.target.value);
    setPhotoAltsErrors(newPhotoAltsErrors);
  };

  const handleInitialImgtitleChange = (e, index) => {
    const newImgtitles = [...initialImgtitle];
    newImgtitles[index] = e.target.value;
    setInitialImgtitle(newImgtitles);
    const newInitialImgtitleErrors = [...initialImgtitleErrors];
    newInitialImgtitleErrors[index] = validatePhotoTitle(e.target.value);
    setInitialImgtitleErrors(newInitialImgtitleErrors);
  };

  const handleNewImgtitleChange = (e, index) => {
    const newImgtitles = [...imgtitle];
    newImgtitles[index] = e.target.value;
    setImgtitle(newImgtitles);
    const newImgtitleErrors = [...imgtitleErrors];
    newImgtitleErrors[index] = validatePhotoTitle(e.target.value);
    setImgtitleErrors(newImgtitleErrors);
  };

  const handleFileChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    const totalPhotos = [...initialPhotos, ...photo, ...newPhotos];
    const photosErr = validatePhotos(totalPhotos);
    if (photosErr) {
      toast.error(photosErr);
      return;
    }
    setPhoto([...photo, ...newPhotos]);
    const newPhotoAlts = Array.from({ length: newPhotos.length }, () => "");
    const newImgTitles = Array.from({ length: newPhotos.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    setImgtitle([...imgtitle, ...newImgTitles]);
    setPhotoAltsErrors([...photoAltsErrors, ...newPhotoAlts.map(() => "")]);
    setImgtitleErrors([...imgtitleErrors, ...newImgTitles.map(() => "")]);
    setPhotosError("");
  };

  const handleDeleteInitialPhoto = (e, photoFilename, index) => {
    e.preventDefault();
    axios.delete(`/api/careeroption/${id}/image/${photoFilename}/${index}`, { withCredentials: true })
      .then(response => {
        const updatedPhotos = initialPhotos.filter(photo => photo !== photoFilename);
        setInitialPhotos(updatedPhotos);
        const updatedPhotoAlts = [...initialPhotoAlts];
        updatedPhotoAlts.splice(index, 1);
        setInitialPhotoAlts(updatedPhotoAlts);
        const updatedImgtitle = [...initialImgtitle];
        updatedImgtitle.splice(index, 1);
        setInitialImgtitle(updatedImgtitle);
        const updatedPhotoAltsErrors = [...initialPhotoAltsErrors];
        updatedPhotoAltsErrors.splice(index, 1);
        setInitialPhotoAltsErrors(updatedPhotoAltsErrors);
        const updatedImgtitleErrors = [...initialImgtitleErrors];
        updatedImgtitleErrors.splice(index, 1);
        setInitialImgtitleErrors(updatedImgtitleErrors);
        setPhotosError(validatePhotos([...updatedPhotos, ...photo]));
      })
      .catch(error => {
        console.error(error);
        toast.error("Error deleting photo");
      });
  };

  const handleDeleteNewPhoto = (e, index) => {
    e.preventDefault();
    const updatedPhotos = [...photo];
    updatedPhotos.splice(index, 1);
    setPhoto(updatedPhotos);
    const updatedPhotoAlts = [...photoAlts];
    updatedPhotoAlts.splice(index, 1);
    setPhotoAlts(updatedPhotoAlts);
    const updatedImgtitle = [...imgtitle];
    updatedImgtitle.splice(index, 1);
    setImgtitle(updatedImgtitle);
    const updatedPhotoAltsErrors = [...photoAltsErrors];
    updatedPhotoAltsErrors.splice(index, 1);
    setPhotoAltsErrors(updatedPhotoAltsErrors);
    const updatedImgtitleErrors = [...imgtitleErrors];
    updatedImgtitleErrors.splice(index, 1);
    setImgtitleErrors(updatedImgtitleErrors);
    setPhotosError(validatePhotos([...initialPhotos, ...updatedPhotos]));
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Career Option</h1>

      <div className="mb-4">
        <label htmlFor="jobtitle" className="block font-semibold mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="jobtitle"
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
        <label className="block font-semibold mb-2">
          Current Photos <span className="text-red-500">*</span>
        </label>
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
                  value={initialPhotoAlts[index]}
                  onChange={(e) => handleInitialAltTextChange(e, index)}
                  className={`w-56 p-2 border rounded focus:outline-none ${initialPhotoAltsErrors[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {initialPhotoAltsErrors[index] && <p className="text-red-500 text-sm mt-1">{initialPhotoAltsErrors[index]}</p>}
              </label>
              <label htmlFor={`imgtitle-${index}`} className="block mt-2">
                Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-${index}`}
                  value={initialImgtitle[index]}
                  onChange={(e) => handleInitialImgtitleChange(e, index)}
                  className={`w-56 p-2 border rounded focus:outline-none ${initialImgtitleErrors[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {initialImgtitleErrors[index] && <p className="text-red-500 text-sm mt-1">{initialImgtitleErrors[index]}</p>}
              </label>
              <button
                onClick={(e) => handleDeleteInitialPhoto(e, photo, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">
          Add New Photos
        </label>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/*"
          className={`p-2 border rounded ${photosError ? "border-red-500" : ""}`}
        />
        {photosError && <p className="text-red-500 text-sm mt-1">{photosError}</p>}
        <div className="flex flex-wrap gap-4 mt-4">
          {photo.map((file, index) => (
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
                  className={`w-full p-2 border rounded focus:outline-none ${photoAltsErrors[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {photoAltsErrors[index] && <p className="text-red-500 text-sm mt-1">{photoAltsErrors[index]}</p>}
              </label>
              <label htmlFor={`imgtitle-new-${index}`} className="block mt-2">
                Title Text <span className="text-red-500">*</span>:
                <input
                  type="text"
                  id={`imgtitle-new-${index}`}
                  value={imgtitle[index] || ""}
                  onChange={(e) => handleNewImgtitleChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${imgtitleErrors[index] ? "border-red-500" : ""}`}
                  required
                  maxLength={100}
                />
                {imgtitleErrors[index] && <p className="text-red-500 text-sm mt-1">{imgtitleErrors[index]}</p>}
              </label>
              <button
                onClick={(e) => handleDeleteNewPhoto(e, index)}
                className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center"
              >
                <span className="text-xs">X</span>
              </button>
            </div>
          ))}
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
            setDescriptionError(validateDescription(value));
          }}
          modules={modules}
          className={`border rounded ${descriptionError ? "border-red-500" : ""}`}
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
          className={`border rounded ${requirementError ? "border-red-500" : ""}`}
          required
        />
        {requirementError && <p className="text-red-500 text-sm mt-1">{requirementError}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">
          Status <span className="text-red-500">*</span>
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          required
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button type="submit" className="bg-blue-500 text-white rounded-md p-2">
        Update Career Option
      </button>
    </form>
  );
};

export default EditCareer;