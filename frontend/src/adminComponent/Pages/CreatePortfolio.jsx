import React, { useState, useEffect } from "react";
import axios from 'axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewPortfolioForm = () => {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [photoError, setPhotoError] = useState("At least one photo is required");
  const [photoAlts, setPhotoAlts] = useState([]);
  const [photoAltsErrors, setPhotoAltsErrors] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [imgtitleErrors, setImgtitleErrors] = useState([]);
  const [slug, setSlug] = useState("");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState("0");
  const [priorityError, setPriorityError] = useState("");
  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [servicecategories, setServiceCategories] = useState([]);
  const [serviceparentCategoryId, setServiceParentCategoryId] = useState("");
  const [servicesubCategoryId, setServiceSubCategoryId] = useState("");
  const [servicesubSubCategoryId, setServiceSubSubCategoryId] = useState("");
  const [industriescategories, setIndustriesCategories] = useState([]);
  const [industriesparentCategoryId, setIndustriesParentCategoryId] = useState("");
  const [industriessubCategoryId, setIndustriesSubCategoryId] = useState("");
  const [industriessubSubCategoryId, setIndustriesSubSubCategoryId] = useState("");
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
    fetchCategories();
    fetchServiceCategories();
    fetchIndustriesCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/portfolio/getall', { withCredentials: true });
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get('/api/services/getall', { withCredentials: true });
      setServiceCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchIndustriesCategories = async () => {
    try {
      const response = await axios.get('/api/industries/getall', { withCredentials: true });
      setIndustriesCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const validateTitle = (value) => {
    if (!value.trim()) return "Title is required";
    if (value.trim().length < 3) return "Title must be at least 3 characters long";
    if (value.trim().length > 100) return "Title cannot exceed 100 characters";
    if (/^\s+$/.test(value)) return "Title cannot contain only spaces";
    if (!/^[a-zA-Z0-9\s\-\/&]+$/.test(value)) {
      return "Title can only contain letters, numbers, spaces, hyphens, slashes, and &";
    }
    return "";
  };


  const validateLink = (value) => {
      if (!value) return "";
      const urlPattern = new RegExp(
        "^(https?:\\/\\/)?" + // protocol
          "((([a-zA-Z0-9-]+)\\.)+[a-zA-Z]{2,})" + // domain name
          "(\\:[0-9]{1,5})?" + // port
          "(\\/[^\\s]*)?$", // path
        "i"
      );
      return urlPattern.test(value) ? "" : "Please enter a valid URL";
    };

  const validateDetails = (value) => {
    const text = value.replace(/<[^>]+>/g, '').trim();
    if (!text) return "Description is required";
    if (text.length < 3) return "Description must be at least 3 characters long";
    return "";
  };

  const validatePhoto = (files) => {
    if (files.length === 0) return "At least one photo is required";
    if (files.length > 5) return "You can only upload up to 5 photos";
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    for (const file of files) {
      if (!validTypes.includes(file.type)) return "Photos must be images (jpeg, png, gif, or webp)";
      if (file.size < 50 * 1024) return "Each photo must be at least 50KB";
    }
    return "";
  };

  const validateAltText = (value, hasPhoto) => {
    if (hasPhoto && !value.trim()) return "Alternative Text is required when photo is provided";
    if (hasPhoto && value.trim().length < 3) return "Alternative Text must be at least 3 characters long";
    if (hasPhoto && value.trim().length > 100) return "Alternative Text cannot exceed 100 characters";
    return "";
  };

  const validateImgtitle = (value, hasPhoto) => {
    if (hasPhoto && !value.trim()) return "Image Title Text is required when photo is provided";
    if (hasPhoto && value.trim().length < 3) return "Image Title Text must be at least 3 characters long";
    if (hasPhoto && value.trim().length > 100) return "Image Title Text cannot exceed 100 characters";
    return "";
  };

  const validatePriority = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "Priority must be a number";
    if (num < 0 || num > 1) return "Priority must be between 0 and 1";
    if (!/^\d*\.?\d{0,2}$/.test(value)) return "Priority must have at most 2 decimal places";
    return "";
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setTitle(value);
      setTitleError(validateTitle(value));
    }
  };

  const handleLinkChange = (e) => {
    const value = e.target.value;
    setLink(value);
    setLinkError(validateLink(value));
  };

  const handleDetailsChange = (value) => {
    setDetails(value);
    setDetailsError(validateDetails(value));
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + photos.length > 5) {
      toast.error("You can only upload up to 5 photos");
      setPhotoError("You can only upload up to 5 photos");
      return;
    }
    setPhotos([...photos, ...files]);
    setPhotoError(validatePhoto([...photos, ...files]));
    const newPhotoAlts = Array.from({ length: files.length }, () => "");
    setPhotoAlts([...photoAlts, ...newPhotoAlts]);
    const newImgtitle = Array.from({ length: files.length }, () => "");
    setImgtitle([...imgtitle, ...newImgtitle]);
    setPhotoAltsErrors([...photoAltsErrors, ...newPhotoAlts.map(() => files.length > 0 ? "Alternative Text is required when photo is provided" : "")]);
    setImgtitleErrors([...imgtitleErrors, ...newImgtitle.map(() => files.length > 0 ? "Image Title Text is required when photo is provided" : "")]);
  };

  const handleAltTextChange = (e, index) => {
    const newPhotoAlts = [...photoAlts];
    newPhotoAlts[index] = e.target.value;
    setPhotoAlts(newPhotoAlts);
    const newErrors = [...photoAltsErrors];
    newErrors[index] = validateAltText(e.target.value, photos.length > 0);
    setPhotoAltsErrors(newErrors);
  };

  const handleImgtitleChange = (e, index) => {
    const newImgtitle = [...imgtitle];
    newImgtitle[index] = e.target.value;
    setImgtitle(newImgtitle);
    const newErrors = [...imgtitleErrors];
    newErrors[index] = validateImgtitle(e.target.value, photos.length > 0);
    setImgtitleErrors(newErrors);
  };

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    setPriority(value);
    setPriorityError(validatePriority(value));
  };

  const handleDeleteImage = (index) => {
    const updatedPhotos = photos.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoError(validatePhoto(updatedPhotos));
    const updatedPhotoAlts = photoAlts.filter((_, i) => i !== index);
    setPhotoAlts(updatedPhotoAlts);
    const updatedImgtitle = imgtitle.filter((_, i) => i !== index);
    setImgtitle(updatedImgtitle);
    const updatedPhotoAltsErrors = photoAltsErrors.filter((_, i) => i !== index);
    setPhotoAltsErrors(updatedPhotoAltsErrors);
    const updatedImgtitleErrors = imgtitleErrors.filter((_, i) => i !== index);
    setImgtitleErrors(updatedImgtitleErrors);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleErr = validateTitle(title);
    const linkErr = validateLink(link);
    const detailsErr = validateDetails(details);
    const photoErr = validatePhoto(photos);
    const priorityErr = validatePriority(priority);
    const altErrors = photoAlts.map((alt, index) => validateAltText(alt, photos.length > 0));
    const imgtitleErrs = imgtitle.map((img, index) => validateImgtitle(img, photos.length > 0));

    setTitleError(titleErr);
    setLinkError(linkErr);
    setDetailsError(detailsErr);
    setPhotoError(photoErr);
    setPriorityError(priorityErr);
    setPhotoAltsErrors(altErrors);
    setImgtitleErrors(imgtitleErrs);

    if (titleErr || linkErr || detailsErr || photoErr || priorityErr || altErrors.some(err => err) || imgtitleErrs.some(err => err)) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('link', link);
      formData.append('details', details);
      formData.append('priority', priority);
      photos.forEach((photo, index) => {
        formData.append(`photo`, photo);
        formData.append(`alt`, photoAlts[index]);
        formData.append(`imgtitle`, imgtitle[index]);
      });
      formData.append('slug', slug);
      formData.append('status', status);
      formData.append('categories', parentCategoryId);
      formData.append('subcategories', subCategoryId);
      formData.append('subSubcategories', subSubCategoryId);
      formData.append('servicecategories', serviceparentCategoryId);
      formData.append('servicesubcategories', servicesubCategoryId);
      formData.append('servicesubSubcategories', servicesubSubCategoryId);
      formData.append('industrycategories', industriesparentCategoryId);
      formData.append('industrysubcategories', industriessubCategoryId);
      formData.append('industrysubSubcategories', industriessubSubCategoryId);

      await axios.post('/api/Portfolio/insertPortfolio', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true
      });

      setTitle("");
      setTitleError("");
      setLink("");
      setLinkError("");
      setDetails("");
      setDetailsError("");
      setPhotos([]);
      setPhotoError("At least one photo is required");
      setPhotoAlts([]);
      setPhotoAltsErrors([]);
      setImgtitle([]);
      setImgtitleErrors([]);
      setStatus("active");
      setPriority("0");
      setPriorityError("");
      setParentCategoryId("");
      setSubCategoryId("");
      setSubSubCategoryId("");
      setServiceParentCategoryId("");
      setServiceSubCategoryId("");
      setServiceSubSubCategoryId("");
      setIndustriesParentCategoryId("");
      setIndustriesSubCategoryId("");
      setIndustriesSubSubCategoryId("");
      setSlug("");
      toast.success("Portfolio added successfully!");
      navigate('/Portfolio');
    } catch (error) {
      console.error(error);
      toast.error("Failed to add portfolio. Please try again.");
    }
  };

  const renderCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const renderServiceCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const renderIndustriesCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const handleParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setParentCategoryId(selectedCategoryId);
    setSubCategoryId("");
    setSubSubCategoryId("");
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setSubCategoryId(selectedSubCategoryId);
    setSubSubCategoryId("");
  };

  const handleSubSubCategoryChange = (e) => {
    const selectedSubSubCategoryId = e.target.value;
    setSubSubCategoryId(selectedSubSubCategoryId);
  };

  const handleServiceParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setServiceParentCategoryId(selectedCategoryId);
    setServiceSubCategoryId("");
    setServiceSubSubCategoryId("");
  };

  const handleServiceSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setServiceSubCategoryId(selectedSubCategoryId);
    setServiceSubSubCategoryId("");
  };

  const handleServiceSubSubCategoryChange = (e) => {
    const selectedSubSubCategoryId = e.target.value;
    setServiceSubSubCategoryId(selectedSubSubCategoryId);
  };

  const handleIndustriesParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setIndustriesParentCategoryId(selectedCategoryId);
    setIndustriesSubCategoryId("");
    setIndustriesSubSubCategoryId("");
  };

  const handleIndustriesSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setIndustriesSubCategoryId(selectedSubCategoryId);
    setIndustriesSubSubCategoryId("");
  };

  const handleIndustriesSubSubCategoryChange = (e) => {
    const selectedSubSubCategoryId = e.target.value;
    setIndustriesSubSubCategoryId(selectedSubSubCategoryId);
  };

  const findCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category.slug === id) return category;
      if (category.subCategories) {
        const subCategory = findCategoryById(category.subCategories, id);
        if (subCategory) return subCategory;
      }
    }
    return null;
  };

  const findSubCategories = (categories, parentCategoryId) => {
    const parentCategory = findCategoryById(categories, parentCategoryId);
    return parentCategory ? parentCategory.subCategories || [] : [];
  };

  const findSubSubCategories = (categories, parentCategoryId, subCategoryId) => {
    const parentCategory = findCategoryById(categories, parentCategoryId);
    if (parentCategory && parentCategory.subCategories) {
      const subCategory = findCategoryById(parentCategory.subCategories, subCategoryId);
      return subCategory ? subCategory.subSubCategory || [] : [];
    }
    return [];
  };

  const findServiceSubCategories = (categories, serviceparentCategoryId) => {
    const parentCategory = findCategoryById(categories, serviceparentCategoryId);
    return parentCategory ? parentCategory.subCategories || [] : [];
  };

  const findServiceSubSubCategories = (categories, serviceparentCategoryId, servicesubCategoryId) => {
    const parentCategory = findCategoryById(categories, serviceparentCategoryId);
    if (parentCategory && parentCategory.subCategories) {
      const subCategory = findCategoryById(parentCategory.subCategories, servicesubCategoryId);
      return subCategory ? subCategory.subSubCategory || [] : [];
    }
    return [];
  };

  const findIndustriesSubCategories = (categories, industriesparentCategoryId) => {
    const parentCategory = findCategoryById(categories, industriesparentCategoryId);
    return parentCategory ? parentCategory.subCategories || [] : [];
  };

  const findIndustriesSubSubCategories = (categories, industriesparentCategoryId, industriessubCategoryId) => {
    const parentCategory = findCategoryById(categories, industriesparentCategoryId);
    if (parentCategory && parentCategory.subCategories) {
      const subCategory = findCategoryById(parentCategory.subCategories, industriessubCategoryId);
      return subCategory ? subCategory.subSubCategories || [] : [];
    }
    return [];
  };

  const subCategories = parentCategoryId ? findSubCategories(categories, parentCategoryId) : [];
  const subSubCategories = (parentCategoryId && subCategoryId) ? findSubSubCategories(categories, parentCategoryId, subCategoryId) : [];
  const subServiceCategories = serviceparentCategoryId ? findServiceSubCategories(servicecategories, serviceparentCategoryId) : [];
  const subSubServiceCategories = (serviceparentCategoryId && servicesubCategoryId) ? findServiceSubSubCategories(servicecategories, serviceparentCategoryId, servicesubCategoryId) : [];
  const subIndustriesCategories = industriesparentCategoryId ? findIndustriesSubCategories(industriescategories, industriesparentCategoryId) : [];
  const subSubIndustriesCategories = (industriesparentCategoryId && industriessubCategoryId) ? findIndustriesSubSubCategories(industriescategories, industriesparentCategoryId, industriessubCategoryId) : [];

  useEffect(() => {
    setSlug(title.replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
    );
  }, [title]);

  useEffect(() => {
    setSlug(slug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
    );
  }, [slug]);

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Add Portfolio</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="parentCategory" className="block font-semibold mb-2">
            Parent Category <span className="text-red-500">*</span>
          </label>
          <select
            id="parentCategory"
            value={parentCategoryId}
            onChange={handleParentCategoryChange}
            className={`w-full p-2 border rounded focus:outline-none ${!parentCategoryId ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select Parent Category</option>
            {categories.map(renderCategoryOptions)}
          </select>
        </div>
        {subCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subCategory" className="block font-semibold mb-2">
              Subcategory (optional)
            </label>
            <select
              id="subCategory"
              value={subCategoryId}
              onChange={handleSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Subcategory</option>
              {subCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory.slug}>
                  {subCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        {subSubCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subSubCategory" className="block font-semibold mb-2">
              Sub-Subcategory (optional)
            </label>
            <select
              id="subSubCategory"
              value={subSubCategoryId}
              onChange={handleSubSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Sub-Subcategory</option>
              {subSubCategories.map((subSubCategory) => (
                <option key={subSubCategory._id} value={subSubCategory.slug}>
                  {subSubCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
            Service Parent Category <span className="text-red-500">*</span>
          </label>
          <select
            id="serviceParentCategory"
            value={serviceparentCategoryId}
            onChange={handleServiceParentCategoryChange}
            className={`w-full p-2 border rounded focus:outline-none ${!serviceparentCategoryId ? 'border-red-500' : ''}`}
            required
          >
            <option value="">Select Service Parent Category</option>
            {servicecategories.map(renderServiceCategoryOptions)}
          </select>
        </div>
        {subServiceCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">
              Service Subcategory (optional)
            </label>
            <select
              id="serviceSubCategory"
              value={servicesubCategoryId}
              onChange={handleServiceSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Service Subcategory</option>
              {subServiceCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory.slug}>
                  {subCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        {subSubServiceCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="serviceSubSubCategory" className="block font-semibold mb-2">
              Service Sub-Subcategory (optional)
            </label>
            <select
              id="serviceSubSubCategory"
              value={servicesubSubCategoryId}
              onChange={handleServiceSubSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Service Sub-Subcategory</option>
              {subSubServiceCategories.map((subSubCategory) => (
                <option key={subSubCategory._id} value={subSubCategory.slug}>
                  {subSubCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="industriesParentCategory" className="block font-semibold mb-2">
            Industries Parent Category (optional)
          </label>
          <select
            id="industriesParentCategory"
            value={industriesparentCategoryId}
            onChange={handleIndustriesParentCategoryChange}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Industries Parent Category</option>
            {industriescategories.map(renderIndustriesCategoryOptions)}
          </select>
        </div>
        {subIndustriesCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="industriesSubCategory" className="block font-semibold mb-2">
              Industries Subcategory (optional)
            </label>
            <select
              id="industriesSubCategory"
              value={industriessubCategoryId}
              onChange={handleIndustriesSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Industries Subcategory</option>
              {subIndustriesCategories.map((subCategory) => (
                <option key={subCategory._id} value={subCategory.slug}>
                  {subCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        {subSubIndustriesCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="industriesSubSubCategory" className="block font-semibold mb-2">
              Industries Sub-Subcategory (optional)
            </label>
            <select
              id="industriesSubSubCategory"
              value={industriessubSubCategoryId}
              onChange={handleIndustriesSubSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Industries Sub-Subcategory</option>
              {subSubIndustriesCategories.map((subSubCategory) => (
                <option key={subSubCategory._id} value={subSubCategory.slug}>
                  {subSubCategory.category}
                </option>
              ))}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="title" className="block font-semibold mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={handleTitleChange}
            className={`w-full p-2 border rounded focus:outline-none ${titleError ? 'border-red-500' : ''}`}
            maxLength={100}
            required
          />
          {titleError && (
            <p className="text-red-500 text-sm mt-1">{titleError}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="link" className="block font-semibold mb-2">
            Website Link
          </label>
          <input
            type="text"
            id="link"
            value={link}
            onChange={handleLinkChange}
            className={`w-full p-2 border rounded focus:outline-none ${linkError ? 'border-red-500' : ''}`}
          />
          {linkError && (
            <p className="text-red-500 text-sm mt-1">{linkError}</p>
          )}
        </div>
        <div className="mb-8">
          <label htmlFor="details" className="block font-semibold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <ReactQuill
            value={details}
            onChange={handleDetailsChange}
            modules={modules}
            className={`quill ${detailsError ? 'border-red-500' : ''}`}
          />
          {detailsError && (
            <p className="text-red-500 text-sm mt-1">{detailsError}</p>
          )}
        </div>
        <div className="mb-8">
          <label htmlFor="photo" className="block font-semibold mb-2">
            Photos <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            name="photo"
            id="photo"
            multiple
            onChange={handlePhotoChange}
            className={`border rounded focus:outline-none ${photoError ? 'border-red-500' : ''}`}
            accept="image/jpeg,image/png,image/gif,image/webp"
            required
          />
          {photoError && (
            <p className="text-red-500 text-sm mt-1">{photoError}</p>
          )}
          {photos.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-4">
              {photos.map((photo, index) => (
                <div key={index} className="relative w-56">
                  <button
                    type="button"
                    className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
                    onClick={() => handleDeleteImage(index)}
                  >
                    X
                  </button>
                  <img
                    src={URL.createObjectURL(photo)}
                    alt=""
                    className="h-32 w-56 object-cover"
                  />
                  <label className="block mt-2">
                    Alternative Text <span className="text-red-500">*</span>:
                    <input
                      type="text"
                      value={photoAlts[index]}
                      onChange={(e) => handleAltTextChange(e, index)}
                      className={`w-full p-2 border rounded focus:outline-none ${photoAltsErrors[index] ? 'border-red-500' : ''}`}
                      maxLength={100}
                      required={photos.length > 0}
                    />
                    {photoAltsErrors[index] && (
                      <p className="text-red-500 text-sm mt-1">{photoAltsErrors[index]}</p>
                    )}
                  </label>
                  <label className="block mt-2">
                    Image Title Text <span className="text-red-500">*</span>:
                    <input
                      type="text"
                      value={imgtitle[index]}
                      onChange={(e) => handleImgtitleChange(e, index)}
                      className={`w-full p-2 border rounded focus:outline-none ${imgtitleErrors[index] ? 'border-red-500' : ''}`}
                      maxLength={100}
                      required={photos.length > 0}
                    />
                    {imgtitleErrors[index] && (
                      <p className="text-red-500 text-sm mt-1">{imgtitleErrors[index]}</p>
                    )}
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="priority" className="block font-semibold mb-2">
            Priority
          </label>
          <input
            type="number"
            id="priority"
            min={0}
            max={1}
            step={0.01}
            value={priority}
            onChange={handlePriorityChange}
            className={`w-full p-2 border rounded focus:outline-none ${priorityError ? 'border-red-500' : ''}`}
          />
          {priorityError && (
            <p className="text-red-500 text-sm mt-1">{priorityError}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="status" className="block font-semibold mb-2">
            Status
          </label>
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
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
          Add Portfolio
        </button>
      </form>
    </div>
  );
};

export default NewPortfolioForm;