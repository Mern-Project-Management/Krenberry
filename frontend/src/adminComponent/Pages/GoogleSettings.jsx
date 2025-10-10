import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const GoogleSettingsForm = () => {
    const [formData, setFormData] = useState({
        headerscript: '',
        bodyscript: '',
        footerscript: '',
    });

    useEffect(() => {
        // Fetch initial Google settings data
        fetchGoogleSettings();
    }, []);

    const fetchGoogleSettings = async () => {
        try {
            const response = await axios.get('/api/googlesettings/getGoogleSettings');
            const data = {
                headerscript: response.data.headerscript || '',
                bodyscript: response.data.bodyscript || '',
                footerscript: response.data.footerscript || '',
            };
            setFormData(data);
        } catch (error) {
            console.error('Error fetching Google settings:', error);
            toast.error('Failed to load settings');
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            headerscript: formData.headerscript.trim(),
            bodyscript: formData.bodyscript.trim(),
            footerscript: formData.footerscript.trim(),
        };

        const fields = [
            { key: 'headerscript', label: 'Header' },
            { key: 'bodyscript', label: 'Body' },
            { key: 'footerscript', label: 'Footer' },
        ];

        let hasError = false;
        for (const field of fields) {
            const val = payload[field.key];
            if (val === '') {
                toast.error(`${field.label} Script field cannot be empty.`);
                hasError = true;
                break;
            }
            if (!val.startsWith('<script') || !val.endsWith('</script>')) {
                toast.error(`Invalid format for ${field.label} Script. Must be enclosed in <script> tags.`);
                hasError = true;
                break;
            }
        }

        if (hasError) return;

        try {
            await axios.put('/api/googlesettings/updateGoogleSettings', payload);
            toast.success("Updated Successfully!");
        } catch (error) {
            console.error('Error updating Google settings:', error);
            toast.error('Failed to update settings');
        }
    };

    return (
        <div className="container mx-auto p-4">
            <ToastContainer />
            <h1 className="text-xl font-bold text-gray-700 font-serif uppercase mb-8">Google Tag Manager</h1>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="headerscript" className="block text-gray-700 font-semibold">Header Script :</label>
                    <textarea
                        id="headerscript"
                        name="headerscript"
                        value={formData.headerscript}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full mt-2"
                        rows={5}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="bodyscript" className="block text-gray-700 font-semibold">Body Script :</label>
                    <textarea
                        id="bodyscript"
                        name="bodyscript"
                        value={formData.bodyscript}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full mt-2"
                        rows={5}
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="footerscript" className="block text-gray-700 font-semibold">Footer Script :</label>
                    <textarea
                        id="footerscript"
                        name="footerscript"
                        value={formData.footerscript}
                        onChange={handleChange}
                        className="p-2 border border-gray-300 rounded w-full mt-2"
                        rows={5}
                    />
                </div>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Save Changes
                </button>
            </form>
        </div>
    );
};

export default GoogleSettingsForm;