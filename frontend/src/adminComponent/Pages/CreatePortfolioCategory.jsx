import React, { useState, useEffect } from "react";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const NewCategoryForm = () => {
    const [category, setCategory] = useState("");
    const [categoryError, setCategoryError] = useState("");
    const [photo, setPhoto] = useState(null);
    const [photoError, setPhotoError] = useState("");
    const [altText, setAltText] = useState("");
    const [altTextError, setAltTextError] = useState("");
    const [imgtitle, setImgtitle] = useState("");
    const [imgtitleError, setImgtitleError] = useState("");
    const [parentCategoryId, setParentCategoryId] = useState("");
    const [subCategoryId, setSubCategoryId] = useState("");
    const [categories, setCategories] = useState([]);
    const [priority, setPriority] = useState("0");
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
    const [status, setStatus] = useState("active");
    const navigate = useNavigate();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await axios.get('/api/portfolio/getall', { withCredentials: true });
            setCategories(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    const validateCategory = (value) => {
        if (!value.trim()) return "Category is required";
        if (value.trim().length < 3) return "Category must be at least 3 characters long";
        if (value.trim().length > 100) return "Category cannot exceed 100 characters";
        if (/^\s+$/.test(value)) return "Category cannot contain only spaces";
        if (!/^[a-zA-Z0-9\s-/]+$/.test(value)) {
            return "Category can only contain letters, numbers, spaces, hyphens, and slashes";
        }
        return "";
    };

    const validatePhoto = (file) => {
        if (!file) return "";
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) return "Photo must be an image (jpeg, png, gif, or webp)";
        if (file.size < 512 * 1024) return "Photo must be at least 512KB";
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

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setCategory(value);
            setCategoryError(validateCategory(value));
        }
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        setPhoto(file);
        setPhotoError(validatePhoto(file));
        setAltTextError(validateAltText(altText, file));
        setImgtitleError(validateImgtitle(imgtitle, file));
    };

    const handleAltTextChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setAltText(value);
            setAltTextError(validateAltText(value, photo));
        }
    };

    const handleImgtitleChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setImgtitle(value);
            setImgtitleError(validateImgtitle(value, photo));
        }
    };

    const handleDeleteImage = () => {
        setPhoto(null);
        setPhotoError("");
        setAltText("");
        setAltTextError("");
        setImgtitle("");
        setImgtitleError("");
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
        setUrl(generateUrl());
    }, [slug, parentCategoryId, subCategoryId]);

    useEffect(() => {
        setSlug(category.replace(/\s+/g, '-')
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/--+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '')
        );
    }, [category]);

    useEffect(() => {
        setSlug(slug.toLowerCase()
            .replace(/[^a-z0-9-]/g, '')
            .replace(/--+/g, '-')
        );
    }, [slug]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const categoryErr = validateCategory(category);
        const photoErr = validatePhoto(photo);
        const altTextErr = validateAltText(altText, photo);
        const imgtitleErr = validateImgtitle(imgtitle, photo);

        setCategoryError(categoryErr);
        setPhotoError(photoErr);
        setAltTextError(altTextErr);
        setImgtitleError(imgtitleErr);

        if (categoryErr || photoErr || altTextErr || imgtitleErr) {
            toast.error("Please fix the validation errors before submitting.");
            return;
        }

        try {
            let urls = '/api/portfolio/insertCategory';
            const formData = new FormData();
            formData.append('category', category);
            if (photo) {
                formData.append('photo', photo);
            }
            formData.append('alt', altText);
            formData.append('imgtitle', imgtitle);
            formData.append('slug', slug);
            formData.append('metatitle', metatitle);
            formData.append('metakeywords', metakeywords);
            formData.append('metadescription', metadescription);
            formData.append('metalanguage', metalanguage);
            formData.append('metacanonical', metacanonical);
            formData.append('metaschema', metaschema);
            formData.append('otherMeta', otherMeta);
            formData.append('url', url);
            formData.append('priority', priority);
            formData.append('changeFreq', changeFreq);
            formData.append('status', status);

            if (parentCategoryId && !subCategoryId) {
                urls = `/api/portfolio/insertSubCategory?categoryId=${parentCategoryId}`;
            } else if (parentCategoryId && subCategoryId) {
                urls = `/api/portfolio/insertSubSubCategory?categoryId=${parentCategoryId}&subCategoryId=${subCategoryId}`;
            }

            await axios.post(urls, formData, { withCredentials: true });

            setCategory("");
            setCategoryError("");
            setPhoto(null);
            setPhotoError("");
            setAltText("");
            setAltTextError("");
            setImgtitle("");
            setImgtitleError("");
            setParentCategoryId("");
            setSubCategoryId("");
            setSlug("");
            setStatus("active");
            setMetatitle("");
            setMetadescription("");
            setMetakeywords("");
            setMetalanguage("");
            setMetacanonical("");
            setMetaschema("");
            setOthermeta("");
            setUrl("");
            setPriority("0");
            setChangeFreq("");
            toast.success("Category added successfully!");
            navigate('/PortfolioCategory');
        } catch (error) {
            console.error(error);
            toast.error("Failed to add category. Please try again.");
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
        <div className="p-4">
            <ToastContainer />
            <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">Add Category</h1>
            <form onSubmit={handleSubmit}>
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
                                <option key={subCategory._id} value={subCategory._id}>
                                    {subCategory.category}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="mb-4">
                    <label htmlFor="title" className="block font-semibold mb-2">
                        Category <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={category}
                        onChange={handleCategoryChange}
                        className={`w-full p-2 border rounded focus:outline-none ${categoryError ? 'border-red-500' : ''}`}
                        required
                        maxLength={100}
                    />
                    {categoryError && (
                        <p className="text-red-500 text-sm mt-1">{categoryError}</p>
                    )}
                </div>
                <div className="mb-8">
                    <label htmlFor="photo" className="block font-semibold mb-2">
                        Photo
                    </label>
                    <input
                        type="file"
                        name="photo"
                        id="photo"
                        onChange={handlePhotoChange}
                        className={`border rounded focus:outline-none ${photoError ? 'border-red-500' : ''}`}
                        accept="image/jpeg,image/png,image/gif,image/webp"
                    />
                    {photoError && (
                        <p className="text-red-500 text-sm mt-1">{photoError}</p>
                    )}
                    {photo && (
                        <div className="mt-2 relative group w-56">
                            <img
                                src={URL.createObjectURL(photo)}
                                alt="Gallery"
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
                                <label htmlFor="alt" className="block font-semibold mb-2">
                                    Alternative Text <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="alt"
                                    value={altText}
                                    onChange={handleAltTextChange}
                                    className={`w-full p-2 border rounded focus:outline-none ${altTextError ? 'border-red-500' : ''}`}
                                    required={!!photo}
                                    maxLength={100}
                                />
                                {altTextError && (
                                    <p className="text-red-500 text-sm mt-1">{altTextError}</p>
                                )}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="imgtitle" className="block font-semibold mb-2">
                                    Image Title Text <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    id="imgtitle"
                                    value={imgtitle}
                                    onChange={handleImgtitleChange}
                                    className={`w-full p-2 border rounded focus:outline-none ${imgtitleError ? 'border-red-500' : ''}`}
                                    required={!!photo}
                                    maxLength={100}
                                />
                                {imgtitleError && (
                                    <p className="text-red-500 text-sm mt-1">{imgtitleError}</p>
                                )}
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
                        className="w-full p-2 border rounded focus:outline-none"
                    />
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
                        className="w-full p-2 border rounded focus:outline-none"
                        rows="3"
                    ></textarea>
                </div>
                <div className="mb-4">
                    <label htmlFor="meta" className="block font-semibold mb-2">
                        Meta Description
                    </label>
                    <textarea
                        id="meta"
                        value={metadescription}
                        onChange={(e) => setMetadescription(e.target.value)}
                        className="w-full p-2 border rounded focus:outline-none"
                        rows="3"
                    ></textarea>
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
                        className="w-full p-2 border rounded focus:outline-none"
                    />
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
                <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300">
                    Add Category
                </button>
            </form>
        </div>
    );
};

export default NewCategoryForm;