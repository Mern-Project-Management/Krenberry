import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const HeroSection = ({ categoryId }) => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const notifySuccess = useCallback(() => {
    toast.success("Updated Successfully!");
  }, []);

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

  // Helper to strip HTML from ReactQuill value
  const stripHtml = (html) =>
    (html || "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

  // Validate all required fields
  const validate = () => {
    const newErrors = {};
    if (!title.trim()) newErrors.title = "Tagline is required";
    if (!stripHtml(heading)) newErrors.heading = "Paragraph is required";
    if (!subheading.trim()) newErrors.subheading = "Middle Tagline is required";
    return newErrors;
  };

  // Fetch headings from the API
  const fetchHeadings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`/api/herosection/${categoryId}`, {
        withCredentials: true,
      });
      const { heading = "", subheading = "", title = "" } = response.data || {};
      setHeading(heading);
      setTitle(title);
      setSubheading(subheading);
      setErrors({});
    } catch (error) {
      console.error(error);
      setError("Failed to fetch headings. Please try again later.");
      setHeading("");
      setSubheading("");
      setTitle("");
      setErrors({});
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  // Save headings to the API
  const saveHeadings = async () => {
    setError("");
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `/api/herosection/main/${categoryId}`,
        {
          heading,
          subheading,
          title,
        },
        { withCredentials: true }
      );
      notifySuccess();
    } catch (error) {
      console.error(error);
      setError("Failed to save headings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes for heading and subheading
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "heading") {
      setHeading(value);
      setErrors((prev) => ({ ...prev, heading: stripHtml(value) ? "" : prev.heading }));
    } else if (name === "subheading") {
      setSubheading(value);
      setErrors((prev) => ({ ...prev, subheading: value.trim() ? "" : prev.subheading }));
    } else if (name === "title") {
      setTitle(value);
      setErrors((prev) => ({ ...prev, title: value.trim() ? "" : prev.title }));
    }
  };

  // Separate handler for ReactQuill
  const handleQuillChange = (value) => {
    setHeading(value);
    setErrors((prev) => ({ ...prev, heading: stripHtml(value) ? "" : prev.heading }));
  };

  // Fetch headings on component mount and when categoryId changes
  useEffect(() => {
    if (categoryId) {
      fetchHeadings();
    }
  }, [categoryId, fetchHeadings]);

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded">
        <div className="">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Tagline <span className="text-red-500">*</span>
            </label>
            <textarea
              type="text"
              name="title"
              value={title}
              onChange={handleInputChange}
              disabled={loading}
              required
              aria-invalid={!!errors.title}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 ${errors.title ? "border-red-500" : ""}`}
              placeholder="Enter title"
            />
            {errors.title && <p className="text-red-500 mt-1 text-sm">{errors.title}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Paragraph <span className="text-red-500">*</span>
            </label>
            <ReactQuill
              value={heading}
              onChange={handleQuillChange}
              modules={modules}
              className={`quill ${errors.heading ? "border border-red-500" : ""}`}
            />
            {errors.heading && <p className="text-red-500 mt-1 text-sm">{errors.heading}</p>}
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif">
              Middle Tagline <span className="text-red-500">*</span>
            </label>
            <textarea
              type="text"
              name="subheading"
              value={subheading}
              onChange={handleInputChange}
              disabled={loading}
              required
              aria-invalid={!!errors.subheading}
              className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 ${errors.subheading ? "border-red-500" : ""}`}
              placeholder="Enter subheading"
            />
            {errors.subheading && (
              <p className="text-red-500 mt-1 text-sm">{errors.subheading}</p>
            )}
          </div>
        </div>
        <button
          onClick={saveHeadings}
          disabled={loading}
          className={`px-4 py-2 rounded hover:bg-slate-900 transition duration-300 font-serif ${
            loading ? "bg-gray-400" : "bg-slate-700 text-white"
          }`}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default HeroSection;
