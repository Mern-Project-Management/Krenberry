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

const EditPackageForm = () => {
  const { packageId } = useParams();
  const [title, setTitle] = useState("");
  const [titleError, setTitleError] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [status, setStatus] = useState("active");
  const [packageType, setPackageType] = useState("");
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
    fetchPackageDetails();
    fetchCategories();
    fetchServiceCategories();
  }, [packageId]);

  const fetchPackageDetails = async () => {
    try {
      const response = await axios.get(`/api/packages/single/${packageId}`, {
        withCredentials: true,
      });
      const packageData = response.data;
      setTitle(packageData.title);
      setTitleError(validateTitle(packageData.title));
      setDescription(packageData.description);
      setDescriptionError(validateDescription(packageData.description));
      setStatus(packageData.status);
      setPackageType(packageData.packagetype);
      setPrice(packageData.price);
      setPriceError(validatePrice(packageData.price));
      const whatIsTheirData = JSON.parse(packageData.whatIsTheir[0] || "[]");
      setWhatIsTheir(whatIsTheirData);
      setWhatIsTheirError(validateWhatIsTheir(whatIsTheirData));
      setWhatIsNotTheir(JSON.parse(packageData.whatIsNotTheir[0] || "[]"));

      try {
        const categoryResponse = await axios.get(
          `/api/packages/getSpecificCategory?categoryId=${packageData.categories}`,
          { withCredentials: true }
        );
        const category = categoryResponse.data;
        setParentCategoryId(category.slug);
      } catch (error) {
        console.error("Error fetching parent category:", error);
      }

      try {
        const subCategoryResponse = await axios.get(
          `/api/packages/getSpecificSubcategory?categoryId=${packageData.categories}&subCategoryId=${packageData.subcategories}`,
          { withCredentials: true }
        );
        const subCategory = subCategoryResponse.data;
        setSubCategoryId(subCategory.slug);
      } catch (error) {
        console.error("Error fetching subcategory:", error);
      }

      try {
        const subSubCategoryResponse = await axios.get(
          `/api/packages/getSpecificSubSubcategory?categoryId=${packageData.categories}&subCategoryId=${packageData.subcategories}&subSubCategoryId=${packageData.subSubcategories}`,
          { withCredentials: true }
        );
        const subSubCategory = subSubCategoryResponse.data;
        setSubSubCategoryId(subSubCategory.slug);
      } catch (error) {
        console.error("Error fetching sub-subcategory:", error);
      }

      try {
        const serviceCategoryResponse = await axios.get(
          `/api/services/getSpecificCategory?categoryId=${packageData.servicecategories}`,
          { withCredentials: true }
        );
        const serviceCategory = serviceCategoryResponse.data;
        setServiceParentCategoryId(serviceCategory.slug);
      } catch (error) {
        console.error("Error fetching service parent category:", error);
      }

      try {
        const serviceSubCategoryResponse = await axios.get(
          `/api/services/getSpecificSubcategory?categoryId=${packageData.servicecategories}&subCategoryId=${packageData.servicesubcategories}`,
          { withCredentials: true }
        );
        const serviceSubCategory = serviceSubCategoryResponse.data;
        setServiceSubCategoryId(serviceSubCategory.slug);
      } catch (error) {
        console.error("Error fetching service subcategory:", error);
      }

      try {
        const servicesubSubCategoryResponse = await axios.get(
          `/api/services/getSpecificSubSubcategory?categoryId=${packageData.servicecategories}&subCategoryId=${packageData.servicesubcategories}&subSubCategoryId=${packageData.servicesubSubcategories}`,
          { withCredentials: true }
        );
        const servicesubSubCategory = servicesubSubCategoryResponse.data;
        setServiceSubSubCategoryId(servicesubSubCategory.slug);
      } catch (error) {
        console.error("Error fetching service sub-subcategory:", error);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch package details.");
    }
  };

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get("/api/services/getAll", {
        withCredentials: true,
      });
      setServiceCategories(response.data);
    } catch (error) {
      console.error(error);
    }
  };

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
      if (item.trim().length > 150) return "Each item in What Is Included cannot exceed 150 characters";
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
      formData.append("status", status);
      formData.append("price", price);
      formData.append("packagetype", packageType);
      formData.append("categories", parentCategoryId);
      formData.append("subcategories", subCategoryId);
      formData.append("subSubcategories", subSubCategoryId);
      formData.append("servicecategories", serviceparentCategoryId);
      formData.append("servicesubcategories", servicesubCategoryId);
      formData.append("servicesubSubcategories", servicesubSubCategoryId);
      formData.append("whatIsTheir", JSON.stringify(whatIsTheir));
      formData.append("whatIsNotTheir", JSON.stringify(whatIsNotTheir));

      await axios.put(`/api/packages/updatePackage/${packageId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      toast.success("Package updated successfully!");
      navigate("/package");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update package. Please try again.");
    }
  };

  const removeItem = (setter, index) => {
    setter((prev) => {
      const newItems = prev.filter((_, i) => i !== index);
      if (setter === setWhatIsTheir) {
        setWhatIsTheirError(validateWhatIsTheir(newItems));
      }
      return newItems;
    });
  };

  const addItem = (setter, item) => {
    setter((prev) => {
      const newItems = [...prev, item];
      if (setter === setWhatIsTheir) {
        setWhatIsTheirError(validateWhatIsTheir(newItems));
      }
      return newItems;
    });
  };

  const renderInputList = (items, setter) => {
    return items.map((item, index) => (
      <div key={index} className="flex items-center mb-2">
        <input
          type="text"
          value={item}
          onChange={(e) => {
            if (setter === setWhatIsTheir) {
              handleWhatIsTheirChange(index, e.target.value);
            } else {
              const newItems = [...items];
              newItems[index] = e.target.value;
              setter(newItems);
            }
          }}
          className={`w-full p-2 border rounded focus:outline-none ${setter === setWhatIsTheir && whatIsTheirError ? 'border-red-500' : ''}`}
          maxLength={setter === setWhatIsTheir ? 100 : undefined}
        />
        <button
          type="button"
          onClick={() => removeItem(setter, index)}
          className="bg-red-500 text-white px-2 py-1 rounded ml-2 hover:bg-red-700 transition duration-300"
        >
          Remove
        </button>
      </div>
    ));
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

  const getSubCategories = (categoryId) => {
    const category = categories.find((category) => category.slug === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryId) => {
    const category = categories.find((category) => category.slug === categoryId);
    if (!category) return [];
    const subCategory = category.subCategories.find((sub) => sub.slug === subCategoryId);
    return subCategory ? subCategory.subSubCategory || [] : [];
  };

  const getServiceSubCategories = (categoryId) => {
    const category = servicecategories.find((category) => category.slug === categoryId);
    return category?.subCategories || [];
  };

  const getServiceSubSubCategories = (categoryId, subCategoryId) => {
    const category = servicecategories.find((category) => category.slug === categoryId);
    if (!category) return [];
    const subCategory = category.subCategories.find((sub) => sub.slug === subCategoryId);
    return subCategory ? subSubCategory.subSubCategory || [] : [];
  };

  return (
    <div className="p-4">
      <ToastContainer />
      <h1 className="text-xl font-bold font-serif text-gray-700 uppercase text-center">
        Edit Package
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
        {getSubCategories(parentCategoryId).length > 0 && (
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
              {getSubCategories(parentCategoryId).map(renderSubCategoryOptions)}
            </select>
          </div>
        )}
        {getSubSubCategories(parentCategoryId, subCategoryId).length > 0 && (
          <div className="mb-4">
            <label htmlFor="subSubCategory" className="block font-semibold mb-2">
              Sub-Subcategory
            </label>
            <select
              id="subSubCategory"
              value={subSubCategoryId}
              onChange={handleSubSubCategoryChange}
              className="w-full p-2 border rounded focus:outline-none"
            >
              <option value="">Select Sub-Subcategory</option>
              {getSubSubCategories(parentCategoryId, subCategoryId).map(renderSubSubCategoryOptions)}
            </select>
          </div>
        )}
        <div className="mb-4">
          <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
            Service Parent Category
          </label>
          <select
            id="serviceParentCategory"
            value={serviceparentCategoryId}
            onChange={handleServiceParentCategoryChange}
            className="w-full p-2 border rounded focus:outline-none"
          >
            <option value="">Select Service Parent Category</option>
            {servicecategories.map(renderServiceCategoryOptions)}
          </select>
        </div>
        {getServiceSubCategories(serviceparentCategoryId).length > 0 && (
          <div className="mb-4">
            <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">
              Service Subcategory
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
              Service Sub-Subcategory
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
          {/* ✅ Show remaining characters */}
          <p className={`text-sm mt-1 ${title.length === 50 ? "text-red-500" : "text-gray-500"}`}>
              {title.length}/50 characters {title.length === 50 && "(Max limit reached)"}
          </p>
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
          {renderInputList(whatIsTheir, setWhatIsTheir)}
          {whatIsTheirError && (
            <p className="text-red-500 text-sm mt-1">{whatIsTheirError}</p>
          )}
          <button
            type="button"
            onClick={() => addItem(setWhatIsTheir, "")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition duration-300"
          >
            Add What Is Included
          </button>
        </div>
        <div className="mb-4">
          <label className="block font-semibold mb-2">What Is Not Included</label>
          {renderInputList(whatIsNotTheir, setWhatIsNotTheir)}
          <button
            type="button"
            onClick={() => addItem(setWhatIsNotTheir, "")}
            className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-700 transition duration-300"
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
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300"
        >
          Update Package
        </button>
      </form>
    </div>
  );
};

export default EditPackageForm;