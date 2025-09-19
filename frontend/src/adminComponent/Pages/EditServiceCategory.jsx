import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const EditCategory = () => {
  const { categoryId, subCategoryId, subSubCategoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState("");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [photo, setPhoto] = useState("");
  const [altText, setAltText] = useState("");
  const [imgtitle, setImgtitle] = useState("");
  const [currentPhoto, setCurrentPhoto] = useState("");
  const [slug, setSlug] = useState("");
  const [metatitle, setMetatitle] = useState("");
  const [metadescription, setMetadescription] = useState("");
  const [metakeywords, setMetakeywords] = useState("");
  const [metalanguage, setMetalanguage] = useState("")
  const [metacanonical, setMetacanonical] = useState("")
  const [metaschema, setMetaschema] = useState("")
  const [otherMeta, setOthermeta] = useState("")
  const [url, setUrl] = useState()
  const [changeFreq, setChangeFreq] = useState()
  const [priority, setPriority] = useState(0)
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState({});
  const [loadedNode, setLoadedNode] = useState(null); // keep the full response to list subpages when available

  // limits
  const MAX_CATEGORY_LEN = 200;
  const MAX_META_LEN = 200;
  const META_RECOMMENDED = 160;

  useEffect(() => {
    const fetchData = async () => {
      let urls = "";

      if (categoryId && subCategoryId && subSubCategoryId) {
        urls = `/api/services/getSpecificSubSubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}`;
      } else if (categoryId && subCategoryId) {
        urls = `/api/services/getSpecificSubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
      } else if (categoryId) {
        urls = `/api/services/getSpecificCategory?categoryId=${categoryId}`;
      }

      try {
        const response = await axios.get(urls, { withCredentials: true });
        const { category,tag,description, photo, alt, imgtitle, slug, metatitle, metadescription, metakeywords, metalanguage, metacanonical, metaschema, otherMeta, changeFreq, priority } = response.data;

        setCategory(category);
        setTag(tag);
        setDescription(description)
        setCurrentPhoto(photo);
        setAltText(alt);
        setImgtitle(imgtitle)
        setSlug(slug);
        setStatus(status);

        setMetatitle(metatitle);
        setMetadescription(metadescription)
        setMetakeywords(metakeywords);
        setMetalanguage(metalanguage);
        setMetacanonical(metacanonical);
        setMetaschema(metaschema);
        setOthermeta(otherMeta);
        setChangeFreq(changeFreq)
        setPriority(priority)
        setLoadedNode(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [categoryId, subCategoryId, subSubCategoryId]);

  const validateFile = (file) => {
    if (!file) return true;
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 2 * 1024 * 1024;
    if (file && file.type && !validTypes.includes(file.type)) {
      return "Only JPG, PNG, and WebP files are allowed";
    }
    if (file && file.size && file.size > maxSize) {
      return "File size must be under 2MB";
    }
    return true;
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    const fv = validateFile(file);
    if (fv === true) {
      setPhoto(file);
      setErrors(prev => ({ ...prev, photo: '' }));
    } else {
      setErrors(prev => ({ ...prev, photo: fv }));
      setPhoto("");
    }
  };

  const handleDeleteImage = () => {
    setPhoto(null);
    setAltText("");
    setImgtitle("");
  };

  const generateUrl = () => {
    let baseUrl = "https://krenberry.com";
    if (categoryId && !subCategoryId) {
      return `${baseUrl}/${slug}`;
    } else if (categoryId && subCategoryId) {
      return `${baseUrl}/${slug}`;
    }
    return `${baseUrl}/${slug}`;
  };

  useEffect(() => {
    setUrl(generateUrl());
  }, [slug, categoryId, subCategoryId]);

  useEffect(() => {
    setSlug(category.replace(/\s+/g, '-')
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
    );
  }, [category])

  useEffect(() => {
    setSlug(slug.toLowerCase()
      .replace(/[^a-z0-9-]/g, '')
      .replace(/--+/g, '-')
    );
  }, [slug])

  const validateForm = () => {
    const newErrors = {};
    if (!category.trim()) {
      newErrors.category = "Category is required";
    } else {
      if (category.length > MAX_CATEGORY_LEN) newErrors.category = `Category must be ${MAX_CATEGORY_LEN} characters or fewer`;
      if (!/^[A-Za-z-]+$/.test(category)) newErrors.category = "Category Name should only contain letters and hyphens";
    }
    if (!slug.trim()) newErrors.slug = "Slug is required";
    else if (!/^[a-z0-9-]+$/.test(slug)) newErrors.slug = "Slug must contain lowercase letters, numbers and hyphens only";

    if (!metatitle.trim()) newErrors.metatitle = "Meta Title is required";
    if (!metadescription.trim()) newErrors.metadescription = "Meta Description is required";
    if (metatitle.length > MAX_META_LEN) newErrors.metatitle = `Meta Title must be ${MAX_META_LEN} characters or fewer`;
    if (metadescription.length > MAX_META_LEN) newErrors.metadescription = `Meta Description must be ${MAX_META_LEN} characters or fewer`;

    if (photo) {
      const fv = validateFile(photo);
      if (fv !== true) newErrors.photo = fv;
      if (!altText.trim()) newErrors.altText = "Alternative Text is required when a photo is uploaded";
      if (!imgtitle.trim()) newErrors.imgtitle = "Image Title Text is required when a photo is uploaded";
    }

    if (priority && (isNaN(priority) || priority < 0 || priority > 1)) newErrors.priority = "Priority must be a number between 0 and 1";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    let urls = "";
    const formData = new FormData();
    formData.append("category", category);
    formData.append("description", description);
    formData.append("tag", tag);
    formData.append("alt", altText);
    formData.append("imgtitle", imgtitle);
    formData.append('slug', slug);
    formData.append('metatitle', metatitle);
    formData.append('metakeywords', metakeywords);
    formData.append('metadescription', metadescription);
    formData.append('metalanguage', metalanguage);
    formData.append('metacanonical', metacanonical);
    formData.append('metaschema', metaschema);
    formData.append('otherMeta', otherMeta);
    formData.append('url', url);
    formData.append('changeFreq', changeFreq);
    formData.append('priority', priority);
    formData.append('status', status);

    if (photo) {
      formData.append("photo", photo);
    } else {
      formData.append("photo", currentPhoto);
    }

    if (categoryId && subCategoryId && subSubCategoryId) {
      urls = `/api/services/updatesubsubcategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}&subSubCategoryId=${subSubCategoryId}`;
    } else if (categoryId && subCategoryId) {
      urls = `/api/services/updateSubCategory?categoryId=${categoryId}&subCategoryId=${subCategoryId}`;
    } else if (categoryId) {
      urls = `/api/services/updateCategory?categoryId=${categoryId}`;
    }

    try {
      await axios.put(urls, formData, { withCredentials: true });
      navigate("/ServiceCategory");
    } catch (error) {
      console.error("Error updating data:", error);
    }
  };

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

  return (
    <form onSubmit={handleSubmit} className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Edit Category</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Back</button>
          <button type="button" onClick={() => navigate('/ServiceCategory')} className="bg-gray-200 text-gray-700 py-2 px-4 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block font-semibold mb-2">
          Category
        </label>
        <input
          type="text"
          id="category"
          value={category}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || /^[A-Za-z-]+$/.test(val)) {
              setCategory(val);
              setErrors(prev => ({ ...prev, category: '' }));
            } else {
              setCategory(val);
              setErrors(prev => ({ ...prev, category: 'Category Name should only contain letters and hyphens' }));
            }
          }}
          maxLength={MAX_CATEGORY_LEN}
          className={`w-full p-2 border rounded focus:outline-none ${errors.category ? 'border-red-500' : ''}`}
          required
        />
        <div className="text-xs text-gray-500 mt-1">{category.length}/{MAX_CATEGORY_LEN}</div>
        {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
          Description
        </label>
        <ReactQuill
          value={description}
          onChange={setDescription} // Directly update heading
          modules={modules}
          className="quill"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tag" className="block font-semibold mb-2">
          Tag
        </label>
        <input
          id="tag"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        ></input>
      </div>
      <div className="mb-8">
        <label htmlFor="photo" className="block font-semibold mb-2">Photo</label>
        <input
          type="file"
          name="photo"
          id="photo"
          onChange={handlePhotoChange}
          className={`border rounded focus:outline-none ${errors.photo ? 'border-red-500' : ''}`}
          accept="image/jpeg,image/png,image/webp"
        />
        {errors.photo && <p className="text-red-500 text-sm mt-1">{errors.photo}</p>}

        {(photo || currentPhoto) && (
          <div className="mt-2 w-56 relative group">
            <img
              src={photo ? URL.createObjectURL(photo) : `/api/logo/download/${currentPhoto}`}
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
                onChange={(e) => setAltText(e.target.value)}
                className={`w-full p-2 border rounded focus:outline-none ${errors.altText ? 'border-red-500' : ''}`}
                required
              />
              {errors.altText && <p className="text-red-500 text-sm mt-1">{errors.altText}</p>}
            </div>
            <div className="mb-4">
              <label htmlFor="imgtitle" className="block font-semibold mb-2">Image Title Text</label>
              <input
                type="text"
                id="imgtitle"
                value={imgtitle}
                onChange={(e) => setImgtitle(e.target.value)}
                className={`w-full p-2 border rounded focus:outline-none ${errors.imgtitle ? 'border-red-500' : ''}`}
                required
              />
              {errors.imgtitle && <p className="text-red-500 text-sm mt-1">{errors.imgtitle}</p>}
            </div>
          </div>
        )}
      </div>
      <div className="mb-4 mt-4">
        <label htmlFor="slug" className="block font-semibold mb-2">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className={`w-full p-2 border rounded focus:outline-none ${errors.slug ? 'border-red-500' : ''}`}
        />
        {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug}</p>}
      </div>
      <div className="mb-4 mt-4">
        <label htmlFor="url" className="block font-semibold mb-2">
          URL
        </label>
        <input
          type="text"
          id="url"
          value={url}
          disabled
          className="w-full p-2 border rounded focus:outline-none"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Title
        </label>
        <textarea
          id="meta"
          value={metatitle}
          onChange={(e) => setMetatitle(e.target.value)}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metatitle ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={MAX_META_LEN}
        ></textarea>
        <div className={`text-xs mt-1 ${metatitle.length > META_RECOMMENDED ? 'text-amber-600' : 'text-gray-500'}`}>
          {metatitle.length}/{MAX_META_LEN}{metatitle.length > META_RECOMMENDED ? ' (Recommended ≤ 160)' : ''}
        </div>
        {errors.metatitle && <p className="text-red-500 text-sm mt-1">{errors.metatitle}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Description
        </label>
        <textarea
          id="meta"
          value={metadescription}
          onChange={(e) => setMetadescription(e.target.value)}
          className={`w-full p-2 border rounded focus:outline-none ${errors.metadescription ? 'border-red-500' : ''}`}
          rows="3"
          maxLength={MAX_META_LEN}
        ></textarea>
        <div className={`text-xs mt-1 ${metadescription.length > META_RECOMMENDED ? 'text-amber-600' : 'text-gray-500'}`}>
          {metadescription.length}/{MAX_META_LEN}{metadescription.length > META_RECOMMENDED ? ' (Recommended ≤ 160)' : ''}
        </div>
        {errors.metadescription && <p className="text-red-500 text-sm mt-1">{errors.metadescription}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Keywords
        </label>
        <textarea
          id="meta"
          value={metakeywords}
          onChange={(e) => setMetakeywords(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Canonical
        </label>
        <textarea
          id="meta"
          value={metacanonical}
          onChange={(e) => setMetacanonical(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Meta Language
        </label>
        <textarea
          id="meta"
          value={metalanguage}
          onChange={(e) => setMetalanguage(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Other Meta
        </label>
        <textarea
          id="meta"
          value={otherMeta}
          onChange={(e) => setOthermeta(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
      </div>
      <div className="mb-4">
        <label htmlFor="meta" className="block font-semibold mb-2">
          Schema
        </label>
        <textarea
          id="meta"
          value={metaschema}
          onChange={(e) => setMetaschema(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
          rows="3"
        ></textarea>
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
          onChange={(e) => setPriority(e.target.value)}
          className={`w-full p-2 border rounded focus:outline-none ${errors.priority ? 'border-red-500' : ''}`}
        />
        {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority}</p>}
      </div>
      <div className="mb-4">
        <label htmlFor="changeFreq" className="block font-semibold mb-2">
          Change Frequency
        </label>
        <select
          id="changeFreq"
          value={changeFreq}
          onChange={(e) => setChangeFreq(e.target.value)}
          className="w-full p-2 border rounded focus:outline-none"
        >
          <option value="">Select Change Frequency</option>
          <option value="always">Always</option>
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
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

      {/* Subpages section: show subcategories and sub-subcategories when editing a parent or subcategory */}
      {loadedNode && !subCategoryId && loadedNode.subCategories && loadedNode.subCategories.length > 0 && (
        <div className="mb-6 border-t pt-4">
          <h2 className="text-lg font-semibold mb-2">Subpages</h2>
          <ul className="space-y-2">
            {loadedNode.subCategories.map((sub) => (
              <li key={sub.slug} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  {sub.photo && <img src={`/api/logo/download/${sub.photo}`} alt={sub.alt} className="w-6 h-6" />}
                  <span>{sub.category}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/ServiceCategory/editServiceCategory/${loadedNode.slug}/${sub.slug}`)}>Edit</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {loadedNode && subCategoryId && loadedNode.subSubCategory && loadedNode.subSubCategory.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Child Subpages</h2>
          <ul className="space-y-2">
            {loadedNode.subSubCategory.map((ss) => (
              <li key={ss.slug} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  {ss.photo && <img src={`/api/logo/download/${ss.photo}`} alt={ss.alt} className="w-6 h-6" />}
                  <span>{ss.category}</span>
                </div>
                <div className="flex gap-2">
                  <button type="button" className="text-blue-600 hover:underline" onClick={() => navigate(`/ServiceCategory/editServiceCategory/${categoryId}/${ss.slug}`)}>Edit</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded">
        Update Category
      </button>
    </form>
  );
};

export default EditCategory;
