import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateTitle,
  validateBlogDescription,
  validatePhotos,
  validatePhotoAlt,
  validatePhotoTitle,
  validateSlug,
  validateMetaTitle,
  validateMetaDescription,
  validateMetaKeywords,
  validateMetaLanguage,
  validateMetaCanonical,
  validateMetaSchema,
  validateOtherMeta,
  validateUrl,
  validateChangeFreq,
  validatePriority,
  validatePostedBy,
  validateDate,
  validateCategoryId,
} from "../../utiles/validations";

const EditNews = () => {
  const { slugs } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [photos, setPhotos] = useState([]);
  const [initialPhotos, setInitialPhotos] = useState([]);
  const [photoAlts, setPhotoAlts] = useState([]);
  const [initialPhotoAlts, setInitialPhotoAlts] = useState([]);
  const [imgTitles, setImgTitles] = useState([]);
  const [initialImgTitles, setInitialImgTitles] = useState([]);
  const [slug, setSlug] = useState("");
  const [metatitle, setMetatitle] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [metakeywords, setMetakeywords] = useState("");
  const [metalanguage, setMetalanguage] = useState("");
  const [metacanonical, setMetacanonical] = useState("");
  const [metaschema, setMetaschema] = useState("");
  const [otherMeta, setOtherMeta] = useState("");
  const [url, setUrl] = useState("");
  const [changeFreq, setChangeFreq] = useState("");
  const [priority, setPriority] = useState("");
  const [postedBy, setPostedBy] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("active");
  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [serviceCategories, setServiceCategories] = useState([]);
  const [serviceParentCategoryId, setServiceParentCategoryId] = useState("");
  const [serviceSubCategoryId, setServiceSubCategoryId] = useState("");
  const [serviceSubSubCategoryId, setServiceSubSubCategoryId] = useState("");
  const [errors, setErrors] = useState({});

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
    clipboard: { matchVisual: false },
  };

  useEffect(() => {
    fetchNews();
    fetchCategories();
    fetchServiceCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/news/getAll", { withCredentials: true });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get("/api/services/getAll", { withCredentials: true });
      setServiceCategories(response.data);
    } catch (error) {
      console.error("Error fetching service categories:", error);
      toast.error("Error fetching service categories");
    }
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(`/api/news/getNewsById?slugs=${slugs}`, { withCredentials: true });
      const news = response.data.data;
      setTitle(news.title || "");
      setDetails(news.details || "");
      setInitialPhotos(news.photo || []);
      setInitialPhotoAlts(news.alt || []);
      setInitialImgTitles(news.imgtitle || []);
      setPostedBy(news.postedBy || "");
      setDate(news.date || "");
      setStatus(news.status || "active");
      setSlug(news.slug || "");
      setMetatitle(news.metatitle || "");
      setMetadescription(news.metadescription || "");
      setMetakeywords(news.metakeywords || "");
      setMetalanguage(news.metalanguage || "");
      setMetacanonical(news.metacanonical || "");
      setMetaschema(news.metaschema || "");
      setOtherMeta(news.otherMeta || "");
      setUrl(news.url || `https://krenberry.com/${news.slug}`);
      setChangeFreq(news.changeFreq || "");
      setPriority(news.priority !== undefined ? news.priority : "");
      setParentCategoryId(news.categories || "");
      setSubCategoryId(news.subcategories || "");
      setSubSubCategoryId(news.subSubcategories || "");
      setServiceParentCategoryId(news.servicecategories || "");
      setServiceSubCategoryId(news.servicesubcategories || "");
      setServiceSubSubCategoryId(news.servicesubSubcategories || "");

      // Validate initial data
      setErrors({
        title: validateTitle(news.title || ""),
        details: validateBlogDescription(news.details || ""),
        photos: validatePhotos(news.photo || []),
        photoAlts: (news.photo || []).map((_, i) => validatePhotoAlt(news.alt?.[i] || "")),
        imgTitles: (news.photo || []).map((_, i) => validatePhotoTitle(news.imgtitle?.[i] || "")),
        postedBy: validatePostedBy(news.postedBy || ""),
        date: validateDate(news.date || ""),
        parentCategoryId: validateCategoryId(news.categories || ""),
        serviceParentCategoryId: validateCategoryId(news.servicecategories || ""),
        subCategoryId: validateCategoryId(news.subcategories || ""),
        subSubCategoryId: validateCategoryId(news.subSubcategories || ""),
        serviceSubCategoryId: validateCategoryId(news.servicesubcategories || ""),
        serviceSubSubCategoryId: validateCategoryId(news.servicesubSubcategories || ""),
        slug: validateSlug(news.slug || ""),
        metatitle: validateMetaTitle(news.metatitle || ""),
        metadescription: validateMetaDescription(news.metadescription || ""),
        metakeywords: validateMetaKeywords(news.metakeywords || ""),
        metalanguage: validateMetaLanguage(news.metalanguage || ""),
        metacanonical: validateMetaCanonical(news.metacanonical || ""),
        metaschema: validateMetaSchema(news.metaschema || ""),
        otherMeta: validateOtherMeta(news.otherMeta || ""),
        url: news.url ? validateUrl(news.url) : "",
        changeFreq: validateChangeFreq(news.changeFreq || ""),
        priority: validatePriority(news.priority !== undefined ? news.priority : ""),
      });
    } catch (error) {
      console.error("Error fetching news:", error);
      toast.error("Error fetching news data");
    }
  };

  useEffect(() => {
    setSlug(
      title
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
    );
  }, [title]);

  useEffect(() => {
    setUrl(slug ? `https://krenberry.com/${slug}` : "");
  }, [slug]);

  const handleFileChange = (e) => {
    const newPhotos = Array.from(e.target.files);
    if (initialPhotos.length + photos.length + newPhotos.length > 5) {
      toast.error("You can only upload up to 5 photos");
      return;
    }
    setPhotos([...photos, ...newPhotos]);
    setPhotoAlts([...photoAlts, ...Array(newPhotos.length).fill("")]);
    setImgTitles([...imgTitles, ...Array(newPhotos.length).fill("")]);
    setErrors(prev => ({
      ...prev,
      photos: validatePhotos([...photos, ...newPhotos]),
      photoAlts: [...photos, ...newPhotos].map((_, i) => validatePhotoAlt((i < photoAlts.length ? photoAlts[i] : "") || (i < initialPhotoAlts.length ? initialPhotoAlts[i] : ""))),
      imgTitles: [...photos, ...newPhotos].map((_, i) => validatePhotoTitle((i < imgTitles.length ? imgTitles[i] : "") || (i < initialImgTitles.length ? initialImgTitles[i] : ""))),
    }));
  };

  const handleDeleteInitialPhoto = (e, photoFilename, index) => {
    e.preventDefault();
    axios
      .delete(`/api/news/${slugs}/image/${photoFilename}/${index}`, { withCredentials: true })
      .then(() => {
        const updatedPhotos = initialPhotos.filter((_, i) => i !== index);
        const updatedAlts = initialPhotoAlts.filter((_, i) => i !== index);
        const updatedTitles = initialImgTitles.filter((_, i) => i !== index);
        setInitialPhotos(updatedPhotos);
        setInitialPhotoAlts(updatedAlts);
        setInitialImgTitles(updatedTitles);
        setErrors(prev => ({
          ...prev,
          photos: validatePhotos([...updatedPhotos, ...photos]),
          photoAlts: [...updatedPhotos, ...photos].map((_, i) => validatePhotoAlt((i < updatedAlts.length ? updatedAlts[i] : photoAlts[i - updatedAlts.length]) || "")),
          imgTitles: [...updatedPhotos, ...photos].map((_, i) => validatePhotoTitle((i < updatedTitles.length ? updatedTitles[i] : imgTitles[i - updatedTitles.length]) || "")),
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
    const updatedTitles = imgTitles.filter((_, i) => i !== index);
    setPhotos(updatedPhotos);
    setPhotoAlts(updatedAlts);
    setImgTitles(updatedTitles);
    setErrors(prev => ({
      ...prev,
      photos: validatePhotos([...initialPhotos, ...updatedPhotos]),
      photoAlts: [...initialPhotos, ...updatedPhotos].map((_, i) => validatePhotoAlt((i < initialPhotoAlts.length ? initialPhotoAlts[i] : updatedAlts[i - initialPhotoAlts.length]) || "")),
      imgTitles: [...initialPhotos, ...updatedPhotos].map((_, i) => validatePhotoTitle((i < initialImgTitles.length ? initialImgTitles[i] : updatedTitles[i - initialImgTitles.length]) || "")),
    }));
  };

  const handleInitialAltTextChange = (e, index) => {
    const updatedAlts = [...initialPhotoAlts];
    updatedAlts[index] = e.target.value;
    setInitialPhotoAlts(updatedAlts);
    setErrors(prev => ({
      ...prev,
      photoAlts: [...initialPhotos, ...photos].map((_, i) => validatePhotoAlt((i < updatedAlts.length ? updatedAlts[i] : photoAlts[i - updatedAlts.length]) || "")),
    }));
  };

  const handleInitialImgTitleChange = (e, index) => {
    const updatedTitles = [...initialImgTitles];
    updatedTitles[index] = e.target.value;
    setInitialImgTitles(updatedTitles);
    setErrors(prev => ({
      ...prev,
      imgTitles: [...initialPhotos, ...photos].map((_, i) => validatePhotoTitle((i < updatedTitles.length ? updatedTitles[i] : imgTitles[i - updatedTitles.length]) || "")),
    }));
  };

  const handleNewAltTextChange = (e, index) => {
    const updatedAlts = [...photoAlts];
    updatedAlts[index] = e.target.value;
    setPhotoAlts(updatedAlts);
    setErrors(prev => ({
      ...prev,
      photoAlts: [...initialPhotos, ...photos].map((_, i) => validatePhotoAlt((i < initialPhotoAlts.length ? initialPhotoAlts[i] : updatedAlts[i - initialPhotoAlts.length]) || "")),
    }));
  };

  const handleNewImgTitleChange = (e, index) => {
    const updatedTitles = [...imgTitles];
    updatedTitles[index] = e.target.value;
    setImgTitles(updatedTitles);
    setErrors(prev => ({
      ...prev,
      imgTitles: [...initialPhotos, ...photos].map((_, i) => validatePhotoTitle((i < initialImgTitles.length ? initialImgTitles[i] : updatedTitles[i - initialImgTitles.length]) || "")),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {
      title: validateTitle(title),
      details: validateBlogDescription(details),
      photos: validatePhotos([...initialPhotos, ...photos]),
      photoAlts: [...initialPhotos, ...photos].map((_, i) => validatePhotoAlt((i < initialPhotoAlts.length ? initialPhotoAlts[i] : photoAlts[i - initialPhotoAlts.length]) || "")),
      imgTitles: [...initialPhotos, ...photos].map((_, i) => validatePhotoTitle((i < initialImgTitles.length ? initialImgTitles[i] : imgTitles[i - initialImgTitles.length]) || "")),
      postedBy: validatePostedBy(postedBy),
      date: validateDate(date),
      parentCategoryId: validateCategoryId(parentCategoryId),
      serviceParentCategoryId: validateCategoryId(serviceParentCategoryId),
      subCategoryId: validateCategoryId(subCategoryId),
      subSubCategoryId: validateCategoryId(subSubCategoryId),
      serviceSubCategoryId: validateCategoryId(serviceSubCategoryId),
      serviceSubSubCategoryId: validateCategoryId(serviceSubSubCategoryId),
      slug: validateSlug(slug),
      metatitle: validateMetaTitle(metatitle),
      metadescription: validateMetaDescription(metadescription),
      metakeywords: validateMetaKeywords(metakeywords),
      metalanguage: validateMetaLanguage(metalanguage),
      metacanonical: validateMetaCanonical(metacanonical),
      metaschema: validateMetaSchema(metaschema),
      otherMeta: validateOtherMeta(otherMeta),
      url: validateUrl(url),
      changeFreq: validateChangeFreq(changeFreq),
      priority: validatePriority(priority),
    };

    setErrors(newErrors);
    if (
      newErrors.title ||
      newErrors.postedBy ||
      newErrors.date ||
      newErrors.parentCategoryId ||
      newErrors.serviceParentCategoryId ||
      newErrors.photoAlts.some(e => e) ||
      newErrors.imgTitles.some(e => e)
    ) {
      toast.error("Please correct the errors in the form");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (details) formData.append("details", details);
    photos.forEach((photo) => formData.append("photo", photo));
    [...initialPhotoAlts, ...photoAlts].forEach((alt) => {
      if (alt) formData.append("alt", alt);
    });
    [...initialImgTitles, ...imgTitles].forEach((title) => {
      if (title) formData.append("imgtitle", title);
    });
    if (slug) formData.append("slug", slug);
    if (metatitle) formData.append("metatitle", metatitle);
    if (metadescription) formData.append("metadescription", metadescription);
    if (metakeywords) formData.append("metakeywords", metakeywords);
    if (metalanguage) formData.append("metalanguage", metalanguage);
    if (metacanonical) formData.append("metacanonical", metacanonical);
    if (metaschema) formData.append("metaschema", metaschema);
    if (otherMeta) formData.append("otherMeta", otherMeta);
    if (url) formData.append("url", url);
    if (changeFreq) formData.append("changeFreq", changeFreq);
    if (priority) formData.append("priority", priority);
    formData.append("postedBy", postedBy);
    formData.append("date", date);
    formData.append("status", status);
    if (parentCategoryId) formData.append("categories", parentCategoryId);
    if (subCategoryId) formData.append("subcategories", subCategoryId);
    if (subSubCategoryId) formData.append("subSubcategories", subSubCategoryId);
    if (serviceParentCategoryId) formData.append("servicecategories", serviceParentCategoryId);
    if (serviceSubCategoryId) formData.append("servicesubcategories", serviceSubCategoryId);
    if (serviceSubSubCategoryId) formData.append("servicesubSubcategories", serviceSubSubCategoryId);

    try {
      await axios.put(`/api/news/updateNews?slugs=${slugs}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      navigate("/news");
    } catch (error) {
      console.error("Error updating news:", error);
      toast.error("Error updating news");
    }
  };

  const getSubCategories = (categoryId) => {
    const category = categories.find((cat) => cat.slug === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryId) => {
    const category = categories.find((cat) => cat.slug === categoryId);
    const subCategory = category?.subCategories.find((sub) => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  const getServiceSubCategories = (categoryId) => {
    const category = serviceCategories.find((cat) => cat.slug === categoryId);
    return category?.subCategories || [];
  };

  const getServiceSubSubCategories = (categoryId, subCategoryId) => {
    const category = serviceCategories.find((cat) => cat.slug === categoryId);
    const subCategory = category?.subCategories.find((sub) => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit News</h1>
      <div className="mb-4">
        <label htmlFor="parentCategory" className="block font-semibold mb-2">
          Parent Category <span className="text-red-500">*</span>
        </label>
        <select
          id="parentCategory"
          value={parentCategoryId}
          onChange={(e) => {
            const value = e.target.value;
            setParentCategoryId(value);
            setSubCategoryId("");
            setSubSubCategoryId("");
            setErrors(prev => ({ ...prev, parentCategoryId: validateCategoryId(value), subCategoryId: "", subSubCategoryId: "" }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.parentCategoryId ? "border-red-500" : ""}`}
          required
        >
          <option value="">Select Parent Category</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.category}
            </option>
          ))}
        </select>
        {errors.parentCategoryId && <p className="text-red-500 text-sm mt-1">{errors.parentCategoryId}</p>}
      </div>
      {getSubCategories(parentCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="subCategory" className="block font-semibold mb-2">Subcategory </label>
          <select
            id="subCategory"
            value={subCategoryId}
            onChange={(e) => {
              const value = e.target.value;
              setSubCategoryId(value);
              setSubSubCategoryId("");
              setErrors(prev => ({ ...prev, subCategoryId: validateCategoryId(value), subSubCategoryId: "" }));
            }}
            className={`w-full p-2 border rounded focus:outline-none ${errors.subCategoryId ? "border-red-500" : ""}`}
          >
            <option value="">Select Subcategory</option>
            {getSubCategories(parentCategoryId).map((sub) => (
              <option key={sub._id} value={sub.slug}>
                {sub.category}
              </option>
            ))}
          </select>
          {errors.subCategoryId && <p className="text-red-500 text-sm mt-1">{errors.subCategoryId}</p>}
        </div>
      )}
      {getSubSubCategories(parentCategoryId, subCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="subSubCategory" className="block font-semibold mb-2">Sub-Subcategory </label>
          <select
            id="subSubCategory"
            value={subSubCategoryId}
            onChange={(e) => {
              const value = e.target.value;
              setSubSubCategoryId(value);
              setErrors(prev => ({ ...prev, subSubCategoryId: validateCategoryId(value) }));
            }}
            className={`w-full p-2 border rounded focus:outline-none ${errors.subSubCategoryId ? "border-red-500" : ""}`}
          >
            <option value="">Select Sub-Subcategory</option>
            {getSubSubCategories(parentCategoryId, subCategoryId).map((subSub) => (
              <option key={subSub._id} value={subSub.slug}>
                {subSub.category}
              </option>
            ))}
          </select>
          {errors.subSubCategoryId && <p className="text-red-500 text-sm mt-1">{errors.subSubCategoryId}</p>}
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
          Service Parent Category <span className="text-red-500">*</span>
        </label>
        <select
          id="serviceParentCategory"
          value={serviceParentCategoryId}
          onChange={(e) => {
            const value = e.target.value;
            setServiceParentCategoryId(value);
            setServiceSubCategoryId("");
            setServiceSubSubCategoryId("");
            setErrors(prev => ({ ...prev, serviceParentCategoryId: validateCategoryId(value), serviceSubCategoryId: "", serviceSubSubCategoryId: "" }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.serviceParentCategoryId ? "border-red-500" : ""}`}
          required
        >
          <option value="">Select Service Parent Category</option>
          {serviceCategories.map((cat) => (
            <option key={cat._id} value={cat.slug}>
              {cat.category}
            </option>
          ))}
        </select>
        {errors.serviceParentCategoryId && <p className="text-red-500 text-sm mt-1">{errors.serviceParentCategoryId}</p>}
      </div>
      {getServiceSubCategories(serviceParentCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">Service Subcategory </label>
          <select
            id="serviceSubCategory"
            value={serviceSubCategoryId}
            onChange={(e) => {
              const value = e.target.value;
              setServiceSubCategoryId(value);
              setServiceSubSubCategoryId("");
              setErrors(prev => ({ ...prev, serviceSubCategoryId: validateCategoryId(value), serviceSubSubCategoryId: "" }));
            }}
            className={`w-full p-2 border rounded focus:outline-none ${errors.serviceSubCategoryId ? "border-red-500" : ""}`}
          >
            <option value="">Select Service Subcategory</option>
            {getServiceSubCategories(serviceParentCategoryId).map((sub) => (
              <option key={sub._id} value={sub.slug}>
                {sub.category}
              </option>
            ))}
          </select>
          {errors.serviceSubCategoryId && <p className="text-red-500 text-sm mt-1">{errors.serviceSubCategoryId}</p>}
        </div>
      )}
      {getServiceSubSubCategories(serviceParentCategoryId, serviceSubCategoryId).length > 0 && (
        <div className="mb-4">
          <label htmlFor="serviceSubSubCategory" className="block font-semibold mb-2">Service Sub-Subcategory </label>
          <select
            id="serviceSubSubCategory"
            value={serviceSubSubCategoryId}
            onChange={(e) => {
              const value = e.target.value;
              setServiceSubSubCategoryId(value);
              setErrors(prev => ({ ...prev, serviceSubSubCategoryId: validateCategoryId(value) }));
            }}
            className={`w-full p-2 border rounded focus:outline-none ${errors.serviceSubSubCategoryId ? "border-red-500" : ""}`}
          >
            <option value="">Select Service Sub-Subcategory</option>
            {getServiceSubSubCategories(serviceParentCategoryId, serviceSubCategoryId).map((subSub) => (
              <option key={subSub._id} value={subSub.slug}>
                {subSub.category}
              </option>
            ))}
          </select>
          {errors.serviceSubSubCategoryId && <p className="text-red-500 text-sm mt-1">{errors.serviceSubSubCategoryId}</p>}
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
        <label htmlFor="details" className="block font-semibold mb-2">Description </label>
        <ReactQuill
          value={details}
          onChange={(value) => {
            setDetails(value);
            setErrors(prev => ({ ...prev, details: validateDetails(value) }));
          }}
          modules={modules}
          className="quill"
        />
        {errors.details && <p className="text-red-500 text-sm mt-1">{errors.details}</p>}
      </div>
      <div className="mb-4">
        <label className="block font-semibold mb-2">Current Photos </label>
        <div className="flex flex-wrap gap-4">
          {initialPhotos.map((photo, index) => (
            <div key={index} className="relative w-56">
              <img
                src={`/api/image/download/${photo}`}
                alt={initialPhotoAlts[index] || `Photo ${index + 1}`}
                className="w-56 h-32 object-cover"
              />
              <label htmlFor={`alt-initial-${index}`} className="block mt-2">
                Alternative Text:
                <input
                  type="text"
                  id={`alt-initial-${index}`}
                  value={initialPhotoAlts[index] || ""}
                  onChange={(e) => handleInitialAltTextChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.photoAlts?.[index] ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {errors.photoAlts?.[index] && <p className="text-red-500 text-sm mt-1">{errors.photoAlts[index]}</p>}
              </label>
              <label htmlFor={`imgtitle-initial-${index}`} className="block mt-2">
                Image Title Text:
                <input
                  type="text"
                  id={`imgtitle-initial-${index}`}
                  value={initialImgTitles[index] || ""}
                  onChange={(e) => handleInitialImgTitleChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.imgTitles?.[index] ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {errors.imgTitles?.[index] && <p className="text-red-500 text-sm mt-1">{errors.imgTitles[index]}</p>}
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
        <label className="block font-semibold mb-2">Add New Photos </label>
        <input
          type="file"
          onChange={handleFileChange}
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          className={`p-2 border rounded ${errors.photos ? "border-red-500" : ""}`}
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
                Alternative Text:
                <input
                  type="text"
                  id={`alt-new-${index}`}
                  value={photoAlts[index] || ""}
                  onChange={(e) => handleNewAltTextChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.photoAlts?.[index + initialPhotoAlts.length] ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {errors.photoAlts?.[index + initialPhotoAlts.length] && <p className="text-red-500 text-sm mt-1">{errors.photoAlts[index + initialPhotoAlts.length]}</p>}
              </label>
              <label htmlFor={`imgtitle-new-${index}`} className="block mt-2">
                Image Title Text:
                <input
                  type="text"
                  id={`imgtitle-new-${index}`}
                  value={imgTitles[index] || ""}
                  onChange={(e) => handleNewImgTitleChange(e, index)}
                  className={`w-full p-2 border rounded focus:outline-none ${errors.imgTitles?.[index + initialImgTitles.length] ? "border-red-500" : ""}`}
                  maxLength={100}
                />
                {errors.imgTitles?.[index + initialImgTitles.length] && <p className="text-red-500 text-sm mt-1">{errors.imgTitles[index + initialImgTitles.length]}</p>}
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
        <label htmlFor="postedBy" className="block font-semibold mb-2">
          Posted By <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="postedBy"
          value={postedBy}
          onChange={(e) => {
            const value = e.target.value;
            setPostedBy(value);
            setErrors(prev => ({ ...prev, postedBy: validatePostedBy(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.postedBy ? "border-red-500" : ""}`}
          required
          maxLength={50}
        />
        {errors.postedBy && <p className="text-red-500 text-sm mt-1">{errors.postedBy}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="date" className="block font-semibold mb-2">
          Date <span className="text-red-500">*</span>
        </label>
        <input
          type="date"
          id="date"
          value={date}
          onChange={(e) => {
            const value = e.target.value;
            setDate(value);
            setErrors(prev => ({ ...prev, date: validateDate(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.date ? "border-red-500" : ""}`}
          required
        />
        {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="slug" className="block font-semibold mb-2">Slug </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => {
            const value = e.target.value;
            setSlug(value);
            setErrors(prev => ({ ...prev, slug: validateSlug(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.slug ? "border-red-500" : ""}`}
          maxLength={100}
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="url" className="block font-semibold mb-2">URL </label>
        <input
          type="text"
          id="url"
          value={url}
          onChange={(e) => {
            const value = e.target.value;
            setUrl(value);
            setErrors(prev => ({ ...prev, url: validateUrl(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.url ? "border-red-500" : ""}`}
        />
        {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metatitle" className="block font-semibold mb-2">Meta Title </label>
        <textarea
          id="metatitle"
          value={metatitle}
          onChange={(e) => {
            const value = e.target.value;
            setMetatitle(value);
            setErrors(prev => ({ ...prev, metatitle: validateMetaTitle(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metatitle ? "border-red-500" : ""}`}
          rows="3"
          maxLength={70}
        ></textarea>
        {errors.metatitle && <p className="text-red-500 text-sm mt-1">{errors.metatitle}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metadescription" className="block font-semibold mb-2">Meta Description </label>
        <textarea
          id="metadescription"
          value={metadescription}
          onChange={(e) => {
            const value = e.target.value;
            setMetadescription(value);
            setErrors(prev => ({ ...prev, metadescription: validateMetaDescription(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metadescription ? "border-red-500" : ""}`}
          rows="3"
          maxLength={160}
        ></textarea>
        {errors.metadescription && <p className="text-red-500 text-sm mt-1">{errors.metadescription}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metakeywords" className="block font-semibold mb-2">Meta Keywords </label>
        <textarea
          id="metakeywords"
          value={metakeywords}
          onChange={(e) => {
            const value = e.target.value;
            setMetakeywords(value);
            setErrors(prev => ({ ...prev, metakeywords: validateMetaKeywords(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metakeywords ? "border-red-500" : ""}`}
          rows="3"
          maxLength={200}
        ></textarea>
        {errors.metakeywords && <p className="text-red-500 text-sm mt-1">{errors.metakeywords}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metalanguage" className="block font-semibold mb-2">Meta Language </label>
        <textarea
          id="metalanguage"
          value={metalanguage}
          onChange={(e) => {
            const value = e.target.value;
            setMetalanguage(value);
            setErrors(prev => ({ ...prev, metalanguage: validateMetaLanguage(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metalanguage ? "border-red-500" : ""}`}
          rows="3"
          maxLength={5}
        ></textarea>
        {errors.metalanguage && <p className="text-red-500 text-sm mt-1">{errors.metalanguage}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metacanonical" className="block font-semibold mb-2">Meta Canonical </label>
        <textarea
          id="metacanonical"
          value={metacanonical}
          onChange={(e) => {
            const value = e.target.value;
            setMetacanonical(value);
            setErrors(prev => ({ ...prev, metacanonical: validateMetaCanonical(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metacanonical ? "border-red-500" : ""}`}
          rows="3"
        ></textarea>
        {errors.metacanonical && <p className="text-red-500 text-sm mt-1">{errors.metacanonical}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metaschema" className="block font-semibold mb-2">Schema </label>
        <textarea
          id="metaschema"
          value={metaschema}
          onChange={(e) => {
            const value = e.target.value;
            setMetaschema(value);
            setErrors(prev => ({ ...prev, metaschema: validateMetaSchema(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metaschema ? "border-red-500" : ""}`}
          rows="3"
          maxLength={2000}
        ></textarea>
        {errors.metaschema && <p className="text-red-500 text-sm mt-1">{errors.metaschema}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="otherMeta" className="block font-semibold mb-2">Other Meta </label>
        <textarea
          id="otherMeta"
          value={otherMeta}
          onChange={(e) => {
            const value = e.target.value;
            setOtherMeta(value);
            setErrors(prev => ({ ...prev, otherMeta: validateOtherMeta(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.otherMeta ? "border-red-500" : ""}`}
          rows="3"
          maxLength={2000}
        ></textarea>
        {errors.otherMeta && <p className="text-red-500 text-sm mt-1">{errors.otherMeta}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="priority" className="block font-semibold mb-2">Priority </label>
        <input
          type="number"
          id="priority"
          min={0}
          max={1}
          step={0.01}
          value={priority}
          onChange={(e) => {
            const value = e.target.value;
            setPriority(value);
            setErrors(prev => ({ ...prev, priority: validatePriority(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.priority ? "border-red-500" : ""}`}
        />
        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="changeFreq" className="block font-semibold mb-2">Change Frequency </label>
        <select
          id="changeFreq"
          value={changeFreq}
          onChange={(e) => {
            const value = e.target.value;
            setChangeFreq(value);
            setErrors(prev => ({ ...prev, changeFreq: validateChangeFreq(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.changeFreq ? "border-red-500" : ""}`}
        >
          <option value="">Select Change Frequency</option>
          <option value="always">Always</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
        {errors.changeFreq && <p className="text-red-500 text-sm mt-1">{errors.changeFreq}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="status" className="block font-semibold mb-2">Status</label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className={`w-full p-2 border rounded focus:outline-none ${errors.status ? "border-red-500" : ""}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <div className="mt-4">
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none">
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default EditNews;