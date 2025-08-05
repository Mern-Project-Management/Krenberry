import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  validateCategory,
  validatePhoto,
  validatePhotoAlt,
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
} from "../../utiles/validations";

const NewCategoryForm = () => {
  const [category, setCategory] = useState("");
  const [photo, setPhoto] = useState(null);
  const [altText, setAltText] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [categories, setCategories] = useState([]);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("active");
  const [changeFreq, setChangeFreq] = useState("");
  const [url, setUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [metatitle, setMetatitle] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [metakeywords, setMetakeywords] = useState("");
  const [metalanguage, setMetalanguage] = useState("");
  const [metacanonical, setMetacanonical] = useState("");
  const [metaschema, setMetaschema] = useState("");
  const [otherMeta, setOthermeta] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/product/getall', { withCredentials: true });
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Error fetching categories");
    }
  };

  const generateUrl = () => {
    let baseUrl = "https://krenberry.com";
    if (parentCategoryId && !subCategoryId) {
      return `${baseUrl}/${slug}`;
    } else if (parentCategoryId && subCategoryId) {
      return `${baseUrl}/${slug}`;
    }
    return `${baseUrl}/${slug}`;
  };

  useEffect(() => {
    setSlug(
      category
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "")
    );
  }, [category]);

  useEffect(() => {
    setSlug(
      slug
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "")
        .replace(/--+/g, "-")
    );
    setUrl(generateUrl());
  }, [slug, parentCategoryId, subCategoryId]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhoto(file);
    setErrors(prev => ({ ...prev, photo: validatePhoto(file, null), altText: file ? validatePhotoAlt(altText) : "" }));
  };

  const handleDeleteImage = () => {
    setPhoto(null);
    setAltText("");
    setErrors(prev => ({ ...prev, photo: "", altText: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    newErrors.category = validateCategory(category);
    if (photo) newErrors.photo = validatePhoto(photo, null);
    if (photo && altText) newErrors.altText = validatePhotoAlt(altText);
    if (slug) newErrors.slug = validateSlug(slug);
    if (metatitle) newErrors.metatitle = validateMetaTitle(metatitle);
    if (metadescription) newErrors.metadescription = validateMetaDescription(metadescription);
    if (metakeywords) newErrors.metakeywords = validateMetaKeywords(metakeywords);
    if (metalanguage) newErrors.metalanguage = validateMetaLanguage(metalanguage);
    if (metacanonical) newErrors.metacanonical = validateMetaCanonical(metacanonical);
    if (metaschema) newErrors.metaschema = validateMetaSchema(metaschema);
    if (otherMeta) newErrors.otherMeta = validateOtherMeta(otherMeta);
    if (url) newErrors.url = validateUrl(url);
    if (changeFreq) newErrors.changeFreq = validateChangeFreq(changeFreq);
    if (priority) newErrors.priority = validatePriority(priority);

    setErrors(newErrors);
    return !newErrors.category; // Only category is required
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please correct the errors in the form");
      return;
    }

    try {
      let urls = '/api/product/insertCategory';
      const formData = new FormData();
      formData.append('category', category);
      if (photo) formData.append('photo', photo);
      if (altText) formData.append('alt', altText);
      if (slug) formData.append('slug', slug);
      if (metatitle) formData.append('metatitle', metatitle);
      if (metadescription) formData.append('metadescription', metadescription);
      if (metakeywords) formData.append('metakeywords', metakeywords);
      if (metalanguage) formData.append('metalanguage', metalanguage);
      if (metacanonical) formData.append('metacanonical', metacanonical);
      if (metaschema) formData.append('metaschema', metaschema);
      if (otherMeta) formData.append('otherMeta', otherMeta);
      if (url) formData.append('url', url);
      if (priority) formData.append('priority', priority);
      if (changeFreq) formData.append('changeFreq', changeFreq);
      if (status) formData.append('status', status);

      if (parentCategoryId && !subCategoryId) {
        urls = `/api/product/insertSubCategory?categoryId=${parentCategoryId}`;
      } else if (parentCategoryId && subCategoryId) {
        urls = `/api/product/insertSubSubCategory?categoryId=${parentCategoryId}&subCategoryId=${subCategoryId}`;
      }

      await axios.post(urls, formData, { withCredentials: true });

      setCategory("");
      setPhoto(null);
      setAltText("");
      setParentCategoryId("");
      setSubCategoryId("");
      setSlug("");
      setMetatitle("");
      setMetadescription("");
      setMetakeywords("");
      setMetalanguage("");
      setMetacanonical("");
      setMetaschema("");
      setOthermeta("");
      setUrl("");
      setPriority("");
      setChangeFreq("");
      setStatus("active");
      setErrors({});
      navigate('/ProductCategory');
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error adding category");
    }
  };

  const renderCategoryOptions = (category) => (
    <option key={category._id} value={category._id}>
      {category.category}
    </option>
  );

  const handleParentCategoryChange = (e) => {
    const selectedCategoryId = e.target.value;
    setParentCategoryId(selectedCategoryId);
    setSubCategoryId("");
  };

  const handleSubCategoryChange = (e) => {
    const selectedSubCategoryId = e.target.value;
    setSubCategoryId(selectedSubCategoryId);
  };

  const findCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category._id === id) return category;
      if (category.subCategories) {
        const subCategory = findCategoryById(category.subCategories, id);
        if (subCategory) return subCategory;
      }
    }
    return null;
  };

  const findSubCategories = (categories, parentCategoryId) => {
    const parentCategory = findCategoryById(categories, parentCategoryId);
    return parentCategory ? parentCategory.subCategories : [];
  };

  const subCategories = findSubCategories(categories, parentCategoryId);

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Add Category</h1>
      <div className="mb-4">
        <label htmlFor="parentCategory" className="block font-semibold mb-2">
          Parent Category
        </label>
        <select
          id="parentCategory"
          value={parentCategoryId}
          onChange={handleParentCategoryChange}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="">Select Parent Category</option>
          {categories.map(renderCategoryOptions)}
        </select>
      </div>
      {subCategories.length > 0 && (
        <div className="mb-4">
          <label htmlFor="subCategory" className="block font-semibold mb-2">
            Subcategory
          </label>
          <select
            id="subCategory"
            value={subCategoryId}
            onChange={handleSubCategoryChange}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Subcategory</option>
            {subCategories.map((subCategory) => (
              <option key={subCategory._id} value={subCategory._id}>
                {subCategory.category}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="mb-4">
        <label htmlFor="category" className="block font-semibold mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => {
            const value = e.target.value;
            setCategory(value);
            setErrors(prev => ({ ...prev, category: validateCategory(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.category ? 'border-red-500' : ''}`}
          required
          maxLength={50}
        />
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
      <div className="mb-8">
        <label htmlFor="photo" className="block font-semibold mb-2">Photo</label>
        <input
          type="file"
          name="photo"
          id="photo"
          onChange={handlePhotoChange}
          className={`border rounded focus:outline-none ${errors.photo ? 'border-red-500' : ''}`}
          accept="image/jpeg,image/png,image/webp,image/gif"
        />
        {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}
        {photo && (
          <div className="mt-2 w-56 relative group">
            <img
              src={URL.createObjectURL(photo)}
              alt={altText}
              className="h-32 w-56 object-cover"
            />
            <button
              type="button"
              onClick={handleDeleteImage}
              className="absolute top-4 right-2 bg-red-500 text-white rounded-md p-1 size-6 flex items-center justify-center hover:bg-red-600 focus:outline-none"
            >
              X
            </button>
            <div className="mb-4">
              <label htmlFor="alt" className="block font-semibold mb-2">Alternative Text</label>
              <input
                type="text"
                id="alt"
                value={altText}
                onChange={(e) => {
                  const value = e.target.value;
                  setAltText(value);
                  setErrors(prev => ({ ...prev, altText: validatePhotoAlt(value) }));
                }}
                className={`w-full p-2 border rounded focus:outline-none ${errors.altText ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              {errors.altText && <p className="text-red-500 text-sm mt-1">{errors.altText}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="mb-4">
        <label htmlFor="slug" className="block font-semibold mb-2">Slug</label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => {
            const value = e.target.value;
            setSlug(value);
            setErrors(prev => ({ ...prev, slug: validateSlug(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.slug ? 'border-red-500' : ''}`}
          maxLength={100}
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="url" className="block font-semibold mb-2">URL</label>
        <input
          type="text"
          id="url"
          value={url}
          disabled
          className={`w-full p-2 border rounded focus:outline-none bg-gray-100 ${errors.url ? 'border-red-500' : ''}`}
        />
        {errors.url && <p className="text-red-500 text-sm mt-1">{errors.url}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metatitle" className="block font-semibold mb-2">Meta Title</label>
        <textarea
          id="metatitle"
          value={metatitle}
          onChange={(e) => {
            const value = e.target.value;
            setMetatitle(value);
            setErrors(prev => ({ ...prev, metatitle: validateMetaTitle(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metatitle ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={70}
        ></textarea>
        {errors.metatitle && <p className="text-red-500 text-sm mt-1">{errors.metatitle}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metadescription" className="block font-semibold mb-2">Meta Description</label>
        <textarea
          id="metadescription"
          value={metadescription}
          onChange={(e) => {
            const value = e.target.value;
            setMetadescription(value);
            setErrors(prev => ({ ...prev, metadescription: validateMetaDescription(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metadescription ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={160}
        ></textarea>
        {errors.metadescription && <p className="text-red-500 text-sm mt-1">{errors.metadescription}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metakeywords" className="block font-semibold mb-2">Meta Keywords</label>
        <textarea
          id="metakeywords"
          value={metakeywords}
          onChange={(e) => {
            const value = e.target.value;
            setMetakeywords(value);
            setErrors(prev => ({ ...prev, metakeywords: validateMetaKeywords(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metakeywords ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={200}
        ></textarea>
        {errors.metakeywords && <p className="text-red-500 text-sm mt-1">{errors.metakeywords}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metalanguage" className="block font-semibold mb-2">Meta Language</label>
        <textarea
          id="metalanguage"
          value={metalanguage}
          onChange={(e) => {
            const value = e.target.value;
            setMetalanguage(value);
            setErrors(prev => ({ ...prev, metalanguage: validateMetaLanguage(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metalanguage ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={5}
        ></textarea>
        {errors.metalanguage && <p className="text-red-500 text-sm mt-1">{errors.metalanguage}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metacanonical" className="block font-semibold mb-2">Meta Canonical</label>
        <textarea
          id="metacanonical"
          value={metacanonical}
          onChange={(e) => {
            const value = e.target.value;
            setMetacanonical(value);
            setErrors(prev => ({ ...prev, metacanonical: validateMetaCanonical(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metacanonical ? 'border-red-500' : ''}`}
          rows="3"
        ></textarea>
        {errors.metacanonical && <p className="text-red-500 text-sm mt-1">{errors.metacanonical}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="metaschema" className="block font-semibold mb-2">Schema</label>
        <textarea
          id="metaschema"
          value={metaschema}
          onChange={(e) => {
            const value = e.target.value;
            setMetaschema(value);
            setErrors(prev => ({ ...prev, metaschema: validateMetaSchema(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metaschema ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={2000}
        ></textarea>
        {errors.metaschema && <p className="text-red-500 text-sm mt-1">{errors.metaschema}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="otherMeta" className="block font-semibold mb-2">Other Meta</label>
        <textarea
          id="otherMeta"
          value={otherMeta}
          onChange={(e) => {
            const value = e.target.value;
            setOthermeta(value);
            setErrors(prev => ({ ...prev, otherMeta: validateOtherMeta(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.otherMeta ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={2000}
        ></textarea>
        {errors.otherMeta && <p className="text-red-500 text-sm mt-1">{errors.otherMeta}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="priority" className="block font-semibold mb-2">Priority</label>
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
          className={`w-full p-2 border rounded focus:outline-none ${errors.priority ? 'border-red-500' : ''}`}
        />
        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="changeFreq" className="block font-semibold mb-2">Change Frequency</label>
        <select
          id="changeFreq"
          value={changeFreq}
          onChange={(e) => {
            const value = e.target.value;
            setChangeFreq(value);
            setErrors(prev => ({ ...prev, changeFreq: validateChangeFreq(value) }));
          }}
          className={`w-full p-2 border rounded focus:outline-none ${errors.changeFreq ? 'border-red-500' : ''}`}
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
          className={`w-full p-2 border rounded focus:outline-none ${errors.status ? 'border-red-500' : ''}`}
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
      >
        Add Category
      </button>
    </form>
  );
};

export default NewCategoryForm;