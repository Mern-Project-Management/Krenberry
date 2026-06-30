import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import EditSubsectionForm from '../Pages/EditSubsection';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


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

const SubsectionsComponent = ({
  subsections,
  setSubsections,
  contentId,
  handlePhotoUpload,
}) => {
  const [newSubsection, setNewSubsection] = useState({
    photo: null,
    title: "",
    description: "",
    photoAlt: "",
    imgtitle: "",
    serviceparentCategoryId: "",
    servicesubCategoryId: "",
    servicesubSubCategoryId: ""
  });
  const [editingIndex, setEditingIndex] = useState(null);
  const [serviceCategories, setServiceCategories] = useState([]);
  const [autoSaveTimeout, setAutoSaveTimeout] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  const fetchServiceCategories = async () => {
    try {
      const response = await axios.get('/api/services/getAll', { withCredentials: true });
      setServiceCategories(response.data);
    } catch (error) {
      console.error('Error fetching service categories:', error);
    }
  };

  useEffect(() => {
    fetchServiceCategories();
  }, []);

  useEffect(() => {
    if (autoSaveTimeout) {
      clearTimeout(autoSaveTimeout);
    }

    // Only auto-save if there are subsections
    if (subsections && subsections.length > 0) {
      const timeoutId = setTimeout(() => {
        saveSubsections();
      }, 2000); // 2 second debounce

      setAutoSaveTimeout(timeoutId);
    }

    return () => {
      if (autoSaveTimeout) {
        clearTimeout(autoSaveTimeout);
      }
    };
  }, [subsections]);

  const saveSubsections = async () => {
    if (!subsections || subsections.length === 0) return;
    
    setIsSaving(true);
    try {
      await axios.put(
        `/api/content/newsubsections/${contentId}`,
        { subsections },
        { withCredentials: true }
      );
      setLastSaved(new Date());
      // window.location.reload();
      console.log("Auto-save successful");
    } catch (error) {
      console.error("Error auto-saving subsections:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubsectionChange = (field, value) => {
    setNewSubsection(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSubsection = async () => {
    try {
      const formData = new FormData();
      
      // Append all fields from newSubsection
      Object.entries(newSubsection).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Add the photo file if it exists
      if (newSubsection.photo) {
        formData.append('photo', newSubsection.photo);
      }
      
      const response = await axios.post(
        `/api/content/subsections/${contentId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          withCredentials: true,
        }
      );
      
      // Create a new array with the added subsection
      const updatedSubsections = [...subsections, response.data];
      
      // Update the parent's state
      setSubsections(updatedSubsections);
      
      // Reset the form
      setNewSubsection({
        photo: null,
        title: "",
        description: "",
        photoAlt: "",
        imgtitle: "",
        serviceparentCategoryId: "",
        servicesubCategoryId: "",
        servicesubSubCategoryId: ""
      });
      
      toast.success("Subsection added successfully");
      
    } catch (error) {
      console.error("Error adding subsection:", error);
      toast.error("Failed to add subsection");
    }
  };

  const handleDeleteSubsection = async (index) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm("Are you sure you want to delete this subsection? This action cannot be undone.");

    if (!confirmDelete) {
      return; // User cancelled the deletion
    }

    try {
      await axios.delete(`/api/content/subsections/${contentId}/${index}`, {
        withCredentials: true,
      });
      const updatedSubsections = subsections.filter((_, i) => i !== index);
      setSubsections(updatedSubsections);
    } catch (error) {
      console.error("Error deleting subsection:", error);
      alert("Failed to delete the subsection. Please try again.");
    }
  };

  const handleSubsectionsSubmit = async (e) => {
    e.preventDefault();
    try {
      // Save the current state to revert if the API call fails
      const previousSubsections = [...subsections];
      
      const response = await axios.put(
        `/api/content/newsubsections/${contentId}`,
        { subsections },
        { 
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      
      // Update the state with the server response
      if (response.data && response.data.subsections) {
        setSubsections(response.data.subsections);
      }
      
      // Show success message
      toast.success("Subsections updated successfully");
      window.location.reload();
      // Close any open edit forms
      setEditingIndex(null);
      
      console.log("Subsections updated successfully");
    } catch (error) {
      console.error("Error updating subsections:", error);
      toast.error("Failed to update subsections");
      // Optionally revert to previous state on error
      // setSubsections(previousSubsections);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Create a new object with the updated file
      const updatedSubsection = {
        ...newSubsection,
        photo: file,
        photoPreview: URL.createObjectURL(file)
      };
      
      // Update the state with a new object reference
      setNewSubsection(updatedSubsection);
    }
  };

  const renderCategoryOptions = (categories) => {
    return categories.map(category => (
      <option key={category._id} value={category.slug}>
        {category.category}
      </option>
    ));
  };

  const getSubCategories = (categoryId) => {
    const category = serviceCategories.find(cat => cat.slug === categoryId);
    return category?.subCategories || [];
  };

  const getSubSubCategories = (categoryId, subCategoryId) => {
    const category = serviceCategories.find(cat => cat.slug === categoryId);
    const subCategory = category?.subCategories.find(sub => sub.slug === subCategoryId);
    return subCategory?.subSubCategories || [];
  };

  const handleSubsectionUpdated = async (updatedSubsection) => {
    try {
      // Create a deep copy of the subsections array
      const updatedSubsections = JSON.parse(JSON.stringify(subsections));
      
      // Update the specific subsection
      updatedSubsections[editingIndex] = { ...updatedSubsection };
      
      // Update the parent's state with the new array
      setSubsections(updatedSubsections);
      
      // Close the edit form
      setEditingIndex(null);
      
      // Show success message
      toast.success("Subsection updated successfully");
      
      // Force a re-render by updating the state with a completely new array
      setSubsections([...updatedSubsections]);
      
    } catch (error) {
      console.error("Error updating subsection:", error);
      toast.error("Failed to update subsection");
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Subsections</h2>
        {isSaving ? (
          <span className="text-sm text-gray-500">Saving...</span>
        ) : lastSaved ? (
          <span className="text-sm text-gray-500">
            Last saved: {new Date(lastSaved).toLocaleTimeString()}
          </span>
        ) : null}
      </div>
      {/* <h2 className="font-semibold mb-4">Subsections</h2> */}
      {editingIndex !== null ? (
        <EditSubsectionForm
          subsection={subsections[editingIndex]}
          contentId={contentId}
          index={editingIndex}
          onEditCancel={() => setEditingIndex(null)}
          onSubsectionUpdated={handleSubsectionUpdated}
        />
      ) : (
        <>
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Add New Subsection</h3>

            {/* <div className="mb-4">
              <label htmlFor="serviceParentCategory" className="block font-semibold mb-2">
                Service Parent Category
              </label>
              <select
                id="serviceParentCategory"
                value={newSubsection.serviceparentCategoryId}
                onChange={(e) => handleSubsectionChange('serviceparentCategoryId', e.target.value)}
                className="w-full p-2 border rounded focus:outline-none"
                required
              >
                <option value="">Select Service Parent Category</option>
                {renderCategoryOptions(serviceCategories)}
              </select>
            </div> */}

            {newSubsection.serviceparentCategoryId && (
              <div className="mb-4">
                <label htmlFor="serviceSubCategory" className="block font-semibold mb-2">
                  Service Subcategory
                </label>
                <select
                  id="serviceSubCategory"
                  value={newSubsection.servicesubCategoryId}
                  onChange={(e) => handleSubsectionChange('servicesubCategoryId', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                >
                  <option value="">Select Service Subcategory</option>
                  {renderCategoryOptions(getSubCategories(newSubsection.serviceparentCategoryId))}
                </select>
              </div>
            )}

            {newSubsection.servicesubCategoryId && (
              <div className="mb-4">
                <label htmlFor="serviceSubSubCategory" className="block font-semibold mb-2">
                  Service Sub-Subcategory
                </label>
                <select
                  id="serviceSubSubCategory"
                  value={newSubsection.servicesubSubCategoryId}
                  onChange={(e) => handleSubsectionChange('servicesubSubCategoryId', e.target.value)}
                  className="w-full p-2 border rounded focus:outline-none"
                >
                  <option value="">Select Service Sub-Subcategory</option>
                  {renderCategoryOptions(getSubSubCategories(newSubsection.serviceparentCategoryId, newSubsection.servicesubCategoryId))}
                </select>
              </div>
            )}

            {/* Photo/Video Upload */}
            <div className="mb-4">
              <label className="block font-semibold mb-2">Upload Media (Image or WebM)</label>
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.webm"
                className="p-2 border rounded mb-2 w-full"
              />
              <p className="text-xs text-gray-500 mb-2">
                Supported formats: JPG, PNG, WebP, WebM. Max size: 50MB
              </p>

              {newSubsection.photo && (
                <div className="mt-2">
                  <label className="block font-semibold mb-2">Media Preview</label>
                  {newSubsection.photo.type === 'video/webm' || newSubsection.photo.name.endsWith('.webm') ? (
                    <video
                      src={URL.createObjectURL(newSubsection.photo)}
                      controls
                      className="w-full max-w-md h-auto max-h-48 object-contain"
                    />
                  ) : (
                    <img
                      src={URL.createObjectURL(newSubsection.photo)}
                      alt="Preview"
                      className="w-56 h-32 object-cover"
                    />
                  )}
                  <div className="mt-2">
                    <label className="block font-semibold mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={newSubsection.photoAlt}
                      onChange={(e) => handleSubsectionChange('photoAlt', e.target.value)}
                      placeholder="Describe this media for accessibility"
                      className="p-2 border rounded w-full"
                    />
                  </div>
                </div>
              )}
            </div>

            <label className="block mb-2">Title</label>
            <input
              type="text"
              value={newSubsection.title}
              onChange={(e) => handleSubsectionChange('title', e.target.value)}
              className="p-2 border rounded mb-2 w-full"
            />
            <label className="block mb-2">Image Title</label>
            <input
              type="text"
              value={newSubsection.imgtitle}
              onChange={(e) => handleSubsectionChange('imgtitle', e.target.value)}
              className="p-2 border rounded mb-2 w-full"
            />
            <label className="block mb-2">Description</label>
            <ReactQuill
              value={newSubsection.description}
              onChange={(value) => handleSubsectionChange('description', value)}
              modules={modules}
              style={{ height: '80px', marginBottom: '6rem' }}
            />



            <button
              onClick={handleAddSubsection}
              className="bg-green-500 text-white px-4 py-2 rounded"
            >
              Add Subsection
            </button>
          </div>

          <form onSubmit={handleSubsectionsSubmit}>
            <div className="grid xl:grid-cols-4 lg:grid-cols-3 grid-cols-1 gap-4">
              {subsections.map((sub, index) => (
                <div key={index} className="border p-4 mb-2 flex flex-col items-center">
                  <h4 className="font-semibold mb-2 text-center">{sub.title}</h4>

                  {sub.photo && (
                    sub.photo.endsWith(".webm") ? (
                      <video
                        src={`/api/image/download/${sub.photo}`}
                        controls
                        className="w-full h-48 object-contain mb-2"
                      />
                    ) : (
                      <img
                        src={`/api/image/download/${sub.photo}`}
                        alt={sub.photoAlt}
                        className="w-full h-48 object-cover mb-2"
                      />
                    )
                  )}

                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setEditingIndex(index)}
                      className="bg-blue-500 text-white px-4 py-2 rounded"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSubsection(index)}
                      className="bg-red-500 text-white px-4 py-2 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </form>
        </>
      )}
    </div>
  );
};

export default SubsectionsComponent;