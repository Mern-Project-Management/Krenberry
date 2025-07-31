import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const NewPackageForm = () => {
  const { categoryId } = useParams();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [packageType, setPackageType] = useState("normal");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [photos, setPhotos] = useState([]);
  const [status, setStatus] = useState("active");
  const [price, setPrice] = useState("");
  const [priceError, setPriceError] = useState("");
  const [whatIsTheir, setWhatIsTheir] = useState([]);
  const [whatIsTheirError, setWhatIsTheirError] = useState("");
  const [whatIsNotTheir, setWhatIsNotTheir] = useState([]);
  const [categories, setCategories] = useState([]);
  const [parentCategoryId, setParentCategoryId] = useState("");
  const [subCategoryId, setSubCategoryId] = useState("");
  const [subSubCategoryId, setSubSubCategoryId] = useState("");
  const [servicecategories, setServiceCategories] = useState([]);
  const [serviceparentCategoryId, setServiceParentCategoryId] = useState("");
  const [servicesubCategoryId, setServiceSubCategoryId] = useState("");
  const [servicesubSubCategoryId, setServiceSubSubCategoryId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
    fetchServiceCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/packages/getall", {
        withCredentials: true,
      });
      setCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get("/api/services/getall", {
        withCredentials: true,
      });
      setServiceCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const validateTitle = (value) => {
    if (!value.trim()) return "Title is required";
    if (value.trim().length < 3) return "Title must be at least 3 characters long";
    if (value.trim().length > 100) return "Title cannot exceed 100 characters";
    if (/^\s+$/.test(value)) return "Title cannot contain only spaces";
    if (!/^[a-zA-Z0-9\s-/]+$/.test(value)) {
      return "Title can only contain letters, numbers, spaces, hyphens, and slashes";
    }
    return "";
  };

  const validateDescription = (value) => {
    const text = value.replace(/<[^>]+>/g, '').trim();
    if (!text) return "Description is required";
    if (text.length < 10) return "Description must be at least 10 characters long";
    return "";
  };

  const validatePrice = (value) => {
    if (value === "" || value === null) return "Price is required";
    if (isNaN(value) || Number(value) < 0) return "Price must be a non-negative number";
    return "";
  };

  const validateWhatIsTheir = (items) => {
    if (items.length === 0) return "At least one item is required in What Is Included";
    for (const item of items) {
      if (!item.trim()) return "Items in What Is Included cannot be empty";
      if (item.trim().length < 3) return "Each item in What Is Included must be at least 3 characters long";
      if (item.trim().length > 100) return "Each item in What Is Included cannot exceed 100 characters";
      if (/^\s+$/.test(item)) return "Items in What Is Included cannot contain only spaces";
    }
    return "";
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    if (value.length <= 100) {
      setTitle(value);
      setTitleError(validateTitle(value));
    }
  };

  const handleDescriptionChange = (value) => {
    setDescription(value);
    setDescriptionError(validateDescription(value));
  };

  const handlePriceChange = (e) => {
    const value = e.target.value;
    setPrice(value);
    setPriceError(validatePrice(value));
  };

  const handleWhatIsTheirChange = (index, value) => {
    if (value.length <= 100) {
      const newItems = [...whatIsTheir];
      newItems[index] = value;
      setWhatIsTheir(newItems);
      setWhatIsTheirError(validateWhatIsTheir(newItems));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const titleErr = validateTitle(title);
    const descErr = validateDescription(description);
    const priceErr = validatePrice(price);
    const whatIsTheirErr = validateWhatIsTheir(whatIsTheir);

    setTitleError(titleErr);
    setDescriptionError(descErr);
    setPriceError(priceErr);
    setWhatIsTheirError(whatIsTheirErr);

    if (titleErr || descErr || priceErr || whatIsTheirErr) {
      toast.error("Please fix the validation errors before submitting.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("packagetype", packageType);
      formData.append("status", status);
      formData.append("price", price);
      formData.append("categories", parentCategoryId);
      formData.append("subcategories", subCategoryId);
      formData.append("subSubcategories", subSubCategoryId);
      formData.append("servicecategories", serviceparentCategoryId);
      formData.append("servicesubcategories", servicesubCategoryId);
      formData.append("servicesubSubcategories", servicesubSubCategoryId);
      formData.append("whatIsTheir", JSON.stringify(whatIsTheir));
      formData.append("whatIsNotTheir", JSON.stringify(whatIsNotTheir));

      const response = await axios.post(
        "/api/packages/insertPackage",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      );

      toast.success("Package added successfully!");
      resetForm();
      navigate("/package");
    } catch (error) {
      console.error(error);
      toast.error("Failed to add package. Please try again.");
    }
  };

  const resetForm = () => {
    setTitle("");
    setTitleError("");
    setPackageType("normal");
    setDescription("");
    setDescriptionError("");
    setStatus("active");
    setPrice("");
    setPriceError("");
    setWhatIsTheir([]);
    setWhatIsTheirError("");
    setWhatIsNotTheir([]);
    setParentCategoryId("");
    setSubCategoryId("");
    setSubSubCategoryId("");
    setServiceParentCategoryId("");
    setServiceSubCategoryId("");
    setServiceSubSubCategoryId("");
    setPhotos([]);
  };

  const renderCategoryOptions = (category) => (
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

  const subCategories = parentCategoryId ? findSubCategories(categories, parentCategoryId) : [];
  const subSubCategories = parentCategoryId && subCategoryId ? findSubSubCategories(categories, parentCategoryId, subCategoryId) : [];

  const addItem = (setter, item) => {
    setter((prev) => [...prev, item]);
    if (setter === setWhatIsTheir) {
      setWhatIsTheirError(validateWhatIsTheir([...whatIsTheir, item]));
    }
  };

  const handleFileChange = (e) => {
    setPhotos(Array.from(e.target.files));
  };

  const renderServiceCategoryOptions = (category) => (
    <option key={category._id} value={category.slug}>
      {category.category}
    </option>
  );

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

  const findServiceCategoryById = (categories, id) => {
    for (const category of categories) {
      if (category.slug === id) return category;
      if (category.subCategories) {
        const subCategory = findServiceCategoryById(category.subCategories, id);
        if (subCategory) return subCategory;
      }
    }
    return null;
  };

  const findServiceSubCategories = (categories, serviceparentCategoryId) => {
    const parentCategory = findServiceCategoryById(categories, serviceparentCategoryId);
    return parentCategory ? parentCategory.subCategories || [] : [];
  };

  const findServiceSubSubCategories = (categories, serviceparentCategoryId, servicesubCategoryId) => {
    const parentCategory = findServiceCategoryById(categories, serviceparentCategoryId);
    if (parentCategory && parentCategory.subCategories) {
      const subCategory = findServiceCategoryById(parentCategory.subCategories, servicesubCategoryId);
      return subCategory ? subCategory.subSubCategory || [] : [];
    }
    return [];
  };

  const subServiceCategories = serviceparentCategoryId ? findServiceSubCategories(servicecategories, serviceparentCategoryId) : [];
  const subSubServiceCategories = serviceparentCategoryId && servicesubCategoryId ? findServiceSubSubCategories(servicecategories, serviceparentCategoryId, servicesubCategoryId) : [];

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">
        Add Package
      </h1>
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
          <label htmlFor="parentCategory" className="block font-semibold mb-2">
            Parent Service Category
          </label>
          <select
            id="parentCategory"
            value={serviceparentCategoryId}
            onChange={handleServiceParentCategoryChange}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Parent Category</option>
            {servicecategories.map(renderServiceCategoryOptions)}
          </select>
        </div>
        {subServiceCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subCategory" className="block font-semibold mb-2">
              Sub-Service Category (optional)
            </label>
            <select
              id="subCategory"
              value={servicesubCategoryId}
              onChange={handleServiceSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Subcategory</option>
              {subServiceCategories.map(renderServiceCategoryOptions)}
            </select>
          </div>
        )}
        {subSubServiceCategories.length > 0 && (
          <div className="mb-4">
            <label htmlFor="subSubCategory" className="block font-semibold mb-2">
              Sub-Sub-Service Category (optional)
            </label>
            <select
              id="subSubCategory"
              value={servicesubSubCategoryId}
              onChange={handleServiceSubSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Sub-Subcategory</option>
              {subSubServiceCategories.map(renderServiceCategoryOptions)}
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
          <label htmlFor="description" className="block font-semibold mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <ReactQuill
            value={description}
            onChange={handleDescriptionChange}
            modules={modules}
            className={`quill ${descriptionError ? 'border-red-500' : ''}`}
          />
          {descriptionError && (
            <p className="text-red-500 text-sm mt-1">{descriptionError}</p>
          )}
        </div>
        <div className="mb-4">
          <label htmlFor="price" className="block font-semibold mb-2">
            Price <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="price"
            min={0}
            value={price}
            onChange={handlePriceChange}
            className={`w-full p-2 border rounded focus:outline-none ${priceError ? 'border-red-500' : ''}`}
            required
          />
          {priceError && (
            <p className="text-red-500 text-sm mt-1">{priceError}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">
            What Is Included <span className="text-red-500">*</span>
          </label>
          {whatIsTheir.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleWhatIsTheirChange(index, e.target.value)}
                className={`w-full p-2 border rounded focus:outline-none ${whatIsTheirError ? 'border-red-500' : ''}`}
                maxLength={100}
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = whatIsTheir.filter((_, i) => i !== index);
                  setWhatIsTheir(newItems);
                  setWhatIsTheirError(validateWhatIsTheir(newItems));
                }}
                className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-700 transition duration-300"
              >
                Remove
              </button>
            </div>
          ))}
          {whatIsTheirError && (
            <p className="text-red-500 text-sm mt-1">{whatIsTheirError}</p>
          )}
          <button
            type="button"
            onClick={() => addItem(setWhatIsTheir, "")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Add What Is Included
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">What Is Not Included</label>
          {whatIsNotTheir.map((item, index) => (
            <div key={index} className="flex items-center mb-2">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newItems = [...whatIsNotTheir];
                  newItems[index] = e.target.value;
                  setWhatIsNotTheir(newItems);
                }}
                className="w-full p-2 border rounded focus:outline-none"
              />
              <button
                type="button"
                onClick={() => {
                  const newItems = whatIsNotTheir.filter((_, i) => i !== index);
                  setWhatIsNotTheir(newItems);
                }}
                className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-700 transition duration-300"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => addItem(setWhatIsNotTheir, "")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2"
          >
            Add What Is Not Included
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">Package Type</label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="normal"
                checked={packageType === "normal"}
                onChange={(e) => setPackageType(e.target.value)}
                className="mr-2"
              />
              <span>Normal</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="hourly"
                checked={packageType === "hourly"}
                onChange={(e) => setPackageType(e.target.value)}
                className="mr-2"
              />
              <span>Hourly</span>
            </label>
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
        <button
          type="submit"
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Add Package
        </button>
      </form>
    </div>
  );
};

export default NewPackageForm;