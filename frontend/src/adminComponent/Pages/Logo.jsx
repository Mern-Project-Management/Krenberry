import React, { useState, useEffect } from 'react';
import axios from 'axios';

const logoTypes = [
  { type: 'headerColor', label: 'Header Color' },
  { type: 'headerWhite', label: 'Header White' },
  { type: 'footerColor', label: 'Footer Color' },
  { type: 'footerWhite', label: 'Footer White' },
  { type: 'favicon', label: 'Favicon' },
];

const LogoCRUD = () => {
  const [logos, setLogos] = useState({});
  const [altTexts, setAltTexts] = useState({});
  const [imgtitle, setImgtitle] = useState({});
  const [logoFiles, setLogoFiles] = useState({});
  const [errors, setErrors] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState({});

  useEffect(() => {
    fetchLogos();
  }, []);

  const fetchLogos = async () => {
    try {
      const response = await axios.get('/api/logo', { withCredentials: true });
      const logosData = {};
      response.data.forEach(logo => {
        logosData[logo.type] = logo;
      });
      setLogos(logosData);
    } catch (error) {
      console.error(error);
    }
  };

  const validateFile = (file) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return 'Only image files (JPEG, PNG, GIF, SVG, WebP) are allowed';
    }

    if (file.size > maxSize) {
      return 'File size must be less than 5MB';
    }

    return null;
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    
    // Clear previous errors for this type
    setErrors(prevState => ({ ...prevState, [type]: null }));
    setUploadSuccess(prevState => ({ ...prevState, [type]: false }));

    if (files.length === 0) {
      return;
    }

    // Validate each file
    for (let file of files) {
      const error = validateFile(file);
      if (error) {
        setErrors(prevState => ({ ...prevState, [type]: error }));
        e.target.value = ''; // Clear the file input
        return;
      }
    }

    setLogoFiles(prevState => ({ ...prevState, [type]: files }));
  };

  const handleAltChange = (e, type) => {
    setAltTexts(prevState => ({ ...prevState, [type]: e.target.value }));
    // Clear error when user starts typing
    if (errors[type]) {
      setErrors(prevState => ({ ...prevState, [type]: null }));
    }
  };

  const handleImgtitleChange = (e, type) => {
    setImgtitle(prevState => ({ ...prevState, [type]: e.target.value }));
    // Clear error when user starts typing
    if (errors[type]) {
      setErrors(prevState => ({ ...prevState, [type]: null }));
    }
  };

  const handleUpload = async (type) => {
    try {
      // Validation checks
      if (!logoFiles[type] || logoFiles[type].length === 0) {
        setErrors(prevState => ({ ...prevState, [type]: 'Please select a file before uploading' }));
        return;
      }

      if (!altTexts[type] || altTexts[type].trim() === '') {
        setErrors(prevState => ({ ...prevState, [type]: 'Alternative Text is required' }));
        return;
      }

      if (!imgtitle[type] || imgtitle[type].trim() === '') {
        setErrors(prevState => ({ ...prevState, [type]: 'Image Title Text is required' }));
        return;
      }

      const formData = new FormData();
      logoFiles[type].forEach(file => {
        formData.append('photo', file);
      });
      formData.append('alt', altTexts[type].trim());
      formData.append('imgtitle', imgtitle[type].trim());
      formData.append('type', type);

      await axios.post('/api/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });

      // Success feedback
      setUploadSuccess(prevState => ({ ...prevState, [type]: true }));
      setTimeout(() => {
        setUploadSuccess(prevState => ({ ...prevState, [type]: false }));
      }, 3000);

      fetchLogos();
      
      // Clear form fields
      setAltTexts(prevState => ({ ...prevState, [type]: '' }));
      setImgtitle(prevState => ({ ...prevState, [type]: '' }));
      setLogoFiles(prevState => ({ ...prevState, [type]: null }));
      setErrors(prevState => ({ ...prevState, [type]: null }));
      
      // Clear file input
      const fileInput = document.getElementById(`file-${type}`);
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error(error);
      setErrors(prevState => ({ 
        ...prevState, 
        [type]: error.response?.data?.message || 'Upload failed. Please try again.' 
      }));
    }
  };

  const handleDeleteClick = (imageName, type) => {
    setShowDeleteConfirm({ imageName, type });
  };

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return;

    try {
      await axios.delete(`/api/logo/${showDeleteConfirm.imageName}`, { withCredentials: true });
      fetchLogos();
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error(error);
      setErrors(prevState => ({ 
        ...prevState, 
        [showDeleteConfirm.type]: 'Delete failed. Please try again.' 
      }));
      setShowDeleteConfirm(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  return (
    <div className="p-4 min-h-screen relative">
      <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-8 text-center">MANAGE LOGOS</h1>
      
      {logoTypes.map((logoType) => (
        <div key={logoType.type} className="mb-6 flex flex-col md:flex-row gap-2 bg-gray-200 justify-around rounded-md">
          <div className="p-4">
            <h2 className="text-xl font-medium mb-2 mt-4 font-serif">{logoType.label}</h2>
            
            <div className="mb-4">
              <label className="block font-semibold mb-2">Upload Image</label>
              <input
                type="file"
                id={`file-${logoType.type}`}
                accept="image/*"
                onChange={(e) => handleFileChange(e, logoType.type)}
                className="mb-2"
              />
              <p className="text-xs text-gray-600">Accepted formats: JPEG, PNG, GIF, SVG, WebP (Max 5MB)</p>
            </div>

            <div className="mb-4">
              <label htmlFor={`alt-${logoType.type}`} className="block font-semibold mb-2">
                Alternative Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`alt-${logoType.type}`}
                value={altTexts[logoType.type] || ''}
                onChange={(e) => handleAltChange(e, logoType.type)}
                className="p-2 border rounded focus:outline-none w-full"
                placeholder="Enter alt text for accessibility"
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor={`imgtitle-${logoType.type}`} className="block font-semibold mb-2">
                Image Title Text <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id={`imgtitle-${logoType.type}`}
                value={imgtitle[logoType.type] || ''}
                onChange={(e) => handleImgtitleChange(e, logoType.type)}
                className="p-2 border rounded focus:outline-none w-full"
                placeholder="Enter image title"
                required
              />
            </div>

            {errors[logoType.type] && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {errors[logoType.type]}
              </div>
            )}

            {uploadSuccess[logoType.type] && (
              <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                Logo uploaded successfully!
              </div>
            )}

            <button
              onClick={() => handleUpload(logoType.type)}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded mr-4 mb-2 transition-colors"
            >
              Upload
            </button>
          </div>

          <div className="max-w-96 p-4">
            {logos[logoType.type] && (
              <div key={logos[logoType.type]._id} className="p-4 mt-6 bg-white rounded shadow">
                <h3 className="font-semibold mb-2">Current Logo</h3>
                <img
                  src={`/api/logo/download/${logos[logoType.type].photo}`}
                  alt={logos[logoType.type].alt}
                  title={logos[logoType.type].imgtitle}
                  className="max-w-full h-auto mb-4"
                />
               
                <div className="mt-4">
                  <label htmlFor={`alt-${logos[logoType.type]._id}`} className="block font-semibold mb-2">
                    Alternative Text
                  </label>
                  <input
                    type="text"
                    id={`alt-${logos[logoType.type]._id}`}
                    value={logos[logoType.type].alt}
                    readOnly
                    className="p-2 border rounded focus:outline-none w-full bg-gray-50"
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor={`imgtitle-${logos[logoType.type]._id}`} className="block font-semibold mb-2">
                    Image Title Text
                  </label>
                  <input
                    type="text"
                    id={`imgtitle-${logos[logoType.type]._id}`}
                    value={logos[logoType.type].imgtitle}
                    readOnly
                    className="p-2 border rounded focus:outline-none w-full bg-gray-50"
                  />
                </div>

                <button
                  onClick={() => handleDeleteClick(logos[logoType.type].photo, logoType.type)}
                  className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded mr-4 mt-4 transition-colors"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this logo? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={cancelDelete}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogoCRUD;