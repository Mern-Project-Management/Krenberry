import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditPortfolio = () => {
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [link, setLink] = useState("");
  const [linkError, setLinkError] = useState("");
  const [details, setDetails] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [photo, setPhoto] = useState([]);
  const [photoError, setPhotoError] = useState("At least one photo is required");
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
  const { slugs } = useParams();
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [imgtitle, setImgtitle] = useState([]);
  const [initialphotoAlts, setInitialPhotoAlts] = useState([]);
  const [initialimgtitle, setInitialImgtitle] = useState([]);
  const [photoAltsErrors, setPhotoAltsErrors] = useState([]);
  const [imgtitleErrors, setImgtitleErrors] = useState([]);
  const [initialPhotoAltsErrors, setInitialPhotoAltsErrors] = useState([]);
  const [initialImgtitleErrors, setInitialImgtitleErrors] = useState([]);
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

  const validatePhoto = (newFiles, initial) => {
    const totalPhotos = newFiles.length + initial.length;
    if (totalPhotos === 0) return "At least one photo is required";
    if (totalPhotos > 5) return "You can only have up to 5 photos total";
    if (newFiles.length > 0) {
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      for (const file of newFiles) {
        if (!validTypes.includes(file.type)) return "Photos must be images (jpeg, png, gif, or webp)";
        if (file.size < 50 * 1024) return "Each photo must be at least 50KB";
      }
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

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/portfolio/getall', { withCredentials: true });
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    fetchCategories();
    fetchServiceCategories();
    fetchIndustriesCategories();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const response = await axios.get(`/api/Portfolio/getPortfolioById?slugs=${slugs}`, { withCredentials: true });
      const Portfolio = response.data.data;
      setTitle(Portfolio.title);
      setTitleError(validateTitle(Portfolio.title));
      setLink(Portfolio.link);
      setLinkError(validateLink(Portfolio.link));
      setDetails(Portfolio.details);
      setDetailsError(validateDetails(Portfolio.details));
      setInitialPhotos(Portfolio.photo || []);
      setPhotoError(validatePhoto([], Portfolio.photo || []));
      setStatus(Portfolio.status);
      setPriority(Portfolio.priority || "0");
      setPriorityError(validatePriority(Portfolio.priority || "0"));
      setInitialPhotoAlts(Portfolio.alt || []);
      setInitialImgtitle(Portfolio.imgtitle || []);
      setInitialPhotoAltsErrors((Portfolio.alt || []).map(alt => validateAltText(alt, Portfolio.photo?.length > 0)));
      setInitialImgtitleErrors((Portfolio.imgtitle || []).map(img => validateImgtitle(img, Portfolio.photo?.length > 0)));

      try {
        const categoryResponse = await axios.get(`/api/portfolio/getSpecificCategory?categoryId=${Portfolio.categories}`, { withCredentials: true });
        const category = categoryResponse.data;
        setParentCategoryId(category.slug);
      } catch (error) {
        console.error('Error fetching parent category:', error);
      }

      try {
        const subCategoryResponse = await axios.get(`/api/portfolio/getSpecificSubcategory?categoryId=${Portfolio.categories}&subCategoryId=${Portfolio.subcategories}`, { withCredentials: true });
        const subCategory = subCategoryResponse.data;
        setSubCategoryId(subCategory.slug);
      } catch (error) {
        console.error('Error fetching subcategory:', error);
      }

      try {
        const subSubCategoryResponse = await axios.get(`/api/portfolio/getSpecificSubSubcategory?categoryId=${Portfolio.categories}&subCategoryId=${Portfolio.subcategories}&subSubCategoryId=${Portfolio.subSubcategories}`, { withCredentials: true });
        const subSubCategory = subSubCategoryResponse.data;
        setSubSubCategoryId(subSubCategory.slug);
      } catch (error) {
        console.error('Error fetching sub-subcategory:', error);
      }

      try {
        const serviceCategoryResponse = await axios.get(`/api/services/getSpecificCategory?categoryId=${Portfolio.servicecategories}`, { withCredentials: true });
        const serviceCategory = serviceCategoryResponse.data;
        setServiceParentCategoryId(serviceCategory.slug);
      } catch (error) {
        console.error('Error fetching service parent category:', error);
      }

      try {
        const serviceSubCategoryResponse = await axios.get(`/api/services/getSpecificSubcategory?categoryId=${Portfolio.servicecategories}&subCategoryId=${Portfolio.servicesubcategories}`, { withCredentials: true });
        const serviceSubCategory = serviceSubCategoryResponse.data;
        setServiceSubCategoryId(serviceSubCategory.slug);
      } catch (error) {
        console.error('Error fetching service subcategory:', error);
      }

      try {
        const serviceSubSubCategoryResponse = await axios.get(`/api/services/getSpecificSubSubcategory?categoryId=${Portfolio.servicecategories}&subCategoryId=${Portfolio.servicesubcategories}&subSubCategoryId=${Portfolio.servicesubSubcategories}`, { withCredentials: true });
        const serviceSubSubCategory = serviceSubSubCategoryResponse.data;
        setServiceSubSubCategoryId(serviceSubSubCategory.slug);
      } catch (error) {
        console.error('Error fetching service sub-subcategory:', error);
      }

      try {
        const industriesCategoryResponse = await axios.get(`/api/industries/getSpecificCategory?categoryId=${Portfolio.industriescategories}`, { withCredentials: true });
        const industriesCategory = industriesCategoryResponse.data;
        setIndustriesParentCategoryId(industriesCategory.slug);
      } catch (error) {
        console.error('Error fetching industries parent category:', error);
      }

      try {
        const industriesSubCategoryResponse = await axios.get(`/api/industries/getSpecificSubcategory?categoryId=${Portfolio.industriescategories}&subCategoryId=${Portfolio.industriessubcategories}`, { withCredentials: true });
        const industriesSubCategory = industriesSubCategoryResponse.data;
        setIndustriesSubCategoryId(industriesSubCategory.slug);
      } catch (error) {
        console.error('Error fetching industries subcategory:', error);
      }

      try {
        const industriesSubSubCategoryResponse = await axios.get(`/api/industries/getSpecificSubSubcategory?categoryId=${Portfolio.industriescategories}&subCategoryId=${Portfolio.industriessubcategories}&subSubCategoryId=${Portfolio.industriessubSubcategories}`, { withCredentials: true });
        const industriesSubSubCategory = industriesSubSubCategoryResponse.data;
        setIndustriesSubSubCategoryId(industriesSubSubCategory.slug);
      } catch (error) {
        console.error('Error fetching industries sub-subcategory:', error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch portfolio details.");
    }
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

  const handlePriorityChange = (e) => {
    const value = e.target.value;
    setPriority(value);
    setPriorityError(validatePriority(value));
  };

  const handleFileChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    if (initialPhotos.length + photo.length + newPhotos.length > 5) {
      toast.error("You can only have up to 5 photos total");
      setPhotoError("You can only have up to 5 photos total");
      return;
    }
    setPhoto([...photo, ...newPhotos]);
    setPhotoError(validatePhoto([...photo, ...newPhotos], initialPhotos));
    setPhotoAlts([...photoAlts, ...newPhotos.map(() => "")]);
    setImgtitle([...imgtitle, ...newPhotos.map(() => "")]);
    setPhotoAltsErrors([...photoAltsErrors, ...newPhotos.map(() => "Alternative Text is required when photo is provided")]);
    setImgtitleErrors([...imgtitleErrors, ...newPhotos.map(() => "Image Title Text is required when photo is provided")]);
  };

  const handleInitialAltTextChange = (e, index) => {
    const newPhotoAlts = [...initialphotoAlts];
    newPhotoAlts[index] = e.target.value;
    setInitialPhotoAlts(newPhotoAlts);
    const newErrors = [...initialPhotoAltsErrors];
    newErrors[index] = validateAltText(e.target.value, initialPhotos.length > 0 || photo.length > 0);
    setInitialPhotoAltsErrors(newErrors);
  };

  const handleInitialImgtitleChange = (e, index) => {
    const newImgtitle = [...initialimgtitle];
    newImgtitle[index] = e.target.value;
    setInitialImgtitle(newImgtitle);
    const newErrors = [...initialImgtitleErrors];
    newErrors[index] = validateImgtitle(e.target.value, initialPhotos.length > 0 || photo.length > 0);
    setInitialImgtitleErrors(newErrors);
  };

  const handleNewAltTextChange = (e, index) => {
    const newPhotoAlts = [...photoAlts];
    newPhotoAlts[index] = e.target.value;
    setPhotoAlts(newPhotoAlts);
    const newErrors = [...photoAltsErrors];
    newErrors[index] = validateAltText(e.target.value, initialPhotos.length > 0 || photo.length > 0);
    setPhotoAltsErrors(newErrors);
  };

  const handleNewImgtitleChange = (e, index) => {
    const newImgtitle = [...imgtitle];
    newImgtitle[index] = e.target.value;
    setImgtitle(newImgtitle);
    const newErrors = [...imgtitleErrors];
    newErrors[index] = validateImgtitle(e.target.value, initialPhotos.length > 0 || photo.length > 0);
    setImgtitleErrors(newErrors);
  };

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

  const handleDeleteInitialPhoto = (e, photoFilename, index) => {
    e.preventDefault();
    axios.delete(`/api/Portfolio/${slugs}/image/${photoFilename}/${index}`, { withCredentials: true })
      .then(response => {
        const updatedPhotos = initialPhotos.filter(photo => photo !== photoFilename);
        setInitialPhotos(updatedPhotos);
        const updatedPhotoAlts = [...initialphotoAlts];
        updatedPhotoAlts.splice(index, 1);
        setInitialPhotoAlts(updatedPhotoAlts);
        const updatedImgtitle = [...initialimgtitle];
        updatedImgtitle.splice(index, 1);
        setInitialImgtitle(updatedImgtitle);
        const updatedPhotoAltsErrors = [...initialPhotoAltsErrors];
        updatedPhotoAltsErrors.splice(index, 1);
        setInitialPhotoAltsErrors(updatedPhotoAltsErrors);
        const updatedImgtitleErrors = [...initialImgtitleErrors];
        updatedImgtitleErrors.splice(index, 1);
        setInitialImgtitleErrors(updatedImgtitleErrors);
        setPhotoError(validatePhoto(photo, updatedPhotos));
      })
      .catch(error => {
        console.error(error);
        toast.error("Failed to delete photo.");
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
    setPhotoError(validatePhoto(updatedPhotos, initialPhotos));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleErr = validateTitle(title);
    const linkErr = validateLink(link);
    const detailsErr = validateDetails(details);
    const photoErr = validatePhoto(photo, initialPhotos);
    const priorityErr = validatePriority(priority);
    const altErrors = [
      ...initialphotoAlts.map((alt, i) => validateAltText(alt, initialPhotos.length > 0 || photo.length > 0)),
      ...photoAlts.map((alt, i) => validateAltText(alt, initialPhotos.length > 0 || photo.length > 0))
    ];
    const imgtitleErrs = [
      ...initialimgtitle.map((img, i) => validateImgtitle(img, initialPhotos.length > 0 || photo.length > 0)),
      ...imgtitle.map((img, i) => validateImgtitle(img, initialPhotos.length > 0 || photo.length > 0))
    ];

    setTitleError(titleErr);
    setLinkError(linkErr);
    setDetailsError(detailsErr);
    setPhotoError(photoErr);
    setPriorityError(priorityErr);
    setInitialPhotoAltsErrors(initialphotoAlts.map((alt) => validateAltText(alt, initialPhotos.length > 0 || photo.length > 0)));
    setPhotoAltsErrors(photoAlts.map((alt) => validateAltText(alt, initialPhotos.length > 0 || photo.length > 0)));
    setInitialImgtitleErrors(initialimgtitle.map((img) => validateImgtitle(img, initialPhotos.length > 0 || photo.length > 0)));
    setImgtitleErrors(imgtitle.map((img) => validateImgtitle(img, initialPhotos.length > 0 || photo.length > 0)));

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

      const combinedAlts = [...initialphotoAlts, ...photoAlts];
      const combinedImgtitle = [...initialimgtitle, ...imgtitle];

      photo.forEach((p) => {
        formData.append(`photo`, p);
      });

      combinedAlts.forEach((a) => {
        formData.append(`alt`, a);
      });

      combinedImgtitle.forEach((m) => {
        formData.append(`imgtitle`, m);
      });

      await axios.put(`/api/portfolio/updatePortfolio?slugs=${slugs}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      toast.success("Portfolio updated successfully!");
      navigate('/portfolio');
    } catch (error) {
      console.error(error);
      toast.error("Failed to update portfolio. Please try again.");
    }
  };

  const renderCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const renderSubCategoryOptions = (subCategory) => (
    <option key={subCategory._id} value={subCategory.slug}>
      {subCategory.category}
    </option>
  );

  const renderSubSubCategoryOptions = (subSubCategory) => (
    <option key={subSubCategory._id} value={subSubCategory.slug}>
      {subSubCategory.category}
    </option>
  );

  const renderServiceCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const renderServiceSubCategoryOptions = (subCategory) => (
    <option key={subCategory._id} value={subCategory.slug}>
      {subCategory.category}
    </option>
  );

  const renderServiceSubSubCategoryOptions = (subSubCategory) => (
    <option key={subSubCategory._id} value={subSubCategory.slug}>
      {subSubCategory.category}
    </option>
  );

  const renderIndustriesCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

  const renderIndustriesSubCategoryOptions = (subCategory) => (
    <option key={subCategory._id} value={subCategory.slug}>
      {subCategory.category}
    </option>
  );

  const renderIndustriesSubSubCategoryOptions = (subSubCategory) => (
    <option key={subSubCategory._id} value={subSubCategory.slug}>
      {subSubCategory.category}
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

  const getSubCategories = (categoryId) => {
    const category = categories.find(category => category.slug === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryId) => {
    const category = categories.find(category => category.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  const getServiceSubCategories = (categoryId) => {
    const category = servicecategories.find(category => category.slug === categoryId);
    return category?.subCategories || [];
  };

  const getServiceSubSubCategories = (categoryId, subCategoryId) => {
    const category = servicecategories.find(category => category.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategory || [];
  };

  const getIndustriesSubCategories = (categoryId) => {
    const category = industriescategories.find(category => category.slug === categoryId);
    return category?.subCategories || [];
  };

  const getIndustriesSubSubCategories = (categoryId, subCategoryId) => {
    const category = industriescategories.find(category => category.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Portfolio</h1>
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
        {getSubCategories(parentCategoryId).length > 0 && (
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
              {getSubCategories(parentCategoryId).map(renderSubCategoryOptions)}
            </select>
          </div>
        )}
        {getSubSubCategories(parentCategoryId, subCategoryId).length > 0 && (
          <div className="mb-4">
            <label htmlFor="subSubCategory" className="block font-semibold mb-2">
              Sub-Subcategory (optional)
            </label>
            <select
              id="subSubCategory"
              value={subSubCategoryId}
              onChange={(e) => setSubSubCategoryId(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Sub-Subcategory</option>
              {getSubSubCategories(parentCategoryId, subCategoryId).map(renderSubSubCategoryOptions)}
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
        {getServiceSubCategories(serviceparentCategoryId).length > 0 && (
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
              {getServiceSubCategories(serviceparentCategoryId).map(renderServiceSubCategoryOptions)}
            </select>
          </div>
        )}
        {getServiceSubSubCategories(serviceparentCategoryId, servicesubCategoryId).length > 0 && (
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
              {getServiceSubSubCategories(serviceparentCategoryId, servicesubCategoryId).map(renderServiceSubSubCategoryOptions)}
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
        {getIndustriesSubCategories(industriesparentCategoryId).length > 0 && (
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
              {getIndustriesSubCategories(industriesparentCategoryId).map(renderIndustriesSubCategoryOptions)}
            </select>
          </div>
        )}
        {getIndustriesSubSubCategories(industriesparentCategoryId, industriessubCategoryId).length > 0 && (
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
              {getIndustriesSubSubCategories(industriesparentCategoryId, industriessubCategoryId).map(renderIndustriesSubSubCategoryOptions)}
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
            required
            maxLength={100}
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
          <label className="block font-semibold mb-2">
            Current Photos {initialPhotos.length > 0 && <span className="text-red-500">*</span>}
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
                  Alternative Text {initialPhotos.length > 0 && <span className="text-red-500">*</span>}:
                  <input
                    type="text"
                    id={`alt-${index}`}
                    value={initialphotoAlts[index]}
                    onChange={(e) => handleInitialAltTextChange(e, index)}
                    className={`w-full p-2 border rounded focus:outline-none ${initialPhotoAltsErrors[index] ? 'border-red-500' : ''}`}
                    maxLength={100}
                    required={initialPhotos.length > 0 || photo.length > 0}
                  />
                  {initialPhotoAltsErrors[index] && (
                    <p className="text-red-500 text-sm mt-1">{initialPhotoAltsErrors[index]}</p>
                  )}
                </label>
                <label htmlFor={`imgtitle-${index}`} className="block mt-2">
                  Image Title Text {initialPhotos.length > 0 && <span className="text-red-500">*</span>}:
                  <input
                    type="text"
                    id={`imgtitle-${index}`}
                    value={initialimgtitle[index]}
                    onChange={(e) => handleInitialImgtitleChange(e, index)}
                    className={`w-full p-2 border rounded focus:outline-none ${initialImgtitleErrors[index] ? 'border-red-500' : ''}`}
                    maxLength={100}
                    required={initialPhotos.length > 0 || photo.length > 0}
                  />
                  {initialImgtitleErrors[index] && (
                    <p className="text-red-500 text-sm mt-1">{initialImgtitleErrors[index]}</p>
                  )}
                </label>
                <button
                  onClick={(e) => handleDeleteInitialPhoto(e, photo, index)}
                  className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center hover:bg-red-600"
                >
                  <span className="text-xs">X</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            Add New Photos <span className={initialPhotos.length === 0 ? "text-red-500" : ""}>*</span>
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            className={`p-2 border rounded ${photoError ? 'border-red-500' : ''}`}
            required={initialPhotos.length === 0}
          />
          {photoError && (
            <p className="text-red-500 text-sm mt-1">{photoError}</p>
          )}
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
                    className={`w-full p-2 border rounded focus:outline-none ${photoAltsErrors[index] ? 'border-red-500' : ''}`}
                    maxLength={100}
                    required
                  />
                  {photoAltsErrors[index] && (
                    <p className="text-red-500 text-sm mt-1">{photoAltsErrors[index]}</p>
                  )}
                </label>
                <label htmlFor={`imgtitle-new-${index}`} className="block mt-2">
                  Image Title Text <span className="text-red-500">*</span>:
                  <input
                    type="text"
                    id={`imgtitle-new-${index}`}
                    value={imgtitle[index] || ""}
                    onChange={(e) => handleNewImgtitleChange(e, index)}
                    className={`w-full p-2 border rounded focus:outline-none ${imgtitleErrors[index] ? 'border-red-500' : ''}`}
                    maxLength={100}
                    required
                  />
                  {imgtitleErrors[index] && (
                    <p className="text-red-500 text-sm mt-1">{imgtitleErrors[index]}</p>
                  )}
                </label>
                <button
                  onClick={(e) => handleDeleteNewPhoto(e, index)}
                  className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex justify-center items-center hover:bg-red-600"
                >
                  <span className="text-xs">X</span>
                </button>
              </div>
            ))}
          </div>
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
        <div className="mt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          >
            Update Portfolio
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPortfolio;