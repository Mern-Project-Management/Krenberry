import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaEye, FaTimes, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";

Modal.setAppElement('#root');

const CareerOptionTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [careerOptions, setCareerOptions] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCoption, setSelectedCoption] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const navigate = useNavigate();

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const filteredCareerOptions = useMemo(() => {
    return careerOptions.filter((option) =>
      option.jobtitle.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [careerOptions, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Title",
        accessor: "jobtitle",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/careeroption/editCareerOption/${row.original._id}`)}
          >
            {row.original.jobtitle}
          </span>
        ),
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 text-wrap cursor-pointer truncate"
            onClick={() => navigate(`/careeroption/editCareerOption/${row.original._id}`)}
            dangerouslySetInnerHTML={{ __html: row.original.description }}
          />
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? <img src={`/api/image/download/${firstImage}`} alt="Career" className="w-20 h-12 sm:w-32 sm:h-20 object-cover rounded" /> : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value === "active" ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />,
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-2 sm:gap-4">
            <button className="text-blue-500 hover:text-blue-700 transition" onClick={() => handleView(row.original)}>
              <FaEye />
            </button>
            <button className="text-blue-500 hover:text-blue-700 transition">
              <Link to={`/careeroption/editCareerOption/${row.original._id}`}><FaEdit /></Link>
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setItemToDelete(row.original._id);
                setDeleteModalOpen(true);
              }}
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: filteredCareerOptions,
    },
    useSortBy
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/careeroption/getCareeroption`, { withCredentials: true });
      const careerOptionsWithIds = response.data.map((option, index) => ({
        ...option,
        id: index + 1,
      }));
      setCareerOptions(careerOptionsWithIds);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch career options.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCareerOption = async (id) => {
    try {
      const response = await axios.delete(
        `/api/careeroption/deleteCareeroption?id=${id}`, 
        { withCredentials: true }
      );
      
      if (response.status === 200) {
        // Filter out the deleted item from the local state
        setCareerOptions(prev => prev.filter(option => option._id !== id));
        toast.success("Career option deleted successfully!");
      }
    } catch (error) {
      console.error("Delete error:", error);
      const errorMessage = error.response?.data?.message || "Failed to delete career option";
      toast.error(errorMessage);
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };
  const handleConfirmDelete = () => {
    if (itemToDelete) {
      deleteCareerOption(itemToDelete);
    }
  };

  const handleCancelDelete = () => {
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  const handleView = (coption) => {
    setSelectedCoption(coption);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCoption(null);
  };

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=career', { withCredentials: true });
      const { heading, subheading } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
    } catch (error) {
      console.error(error);
    }
  };

  const saveHeadings = async () => {
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=career', {
        pagetype: 'career',
        heading,
        subheading,
      }, { withCredentials: true });
      notify();
    } catch (error) {
      console.error(error);
      toast.error("Failed to update headings.");
    }
  };

  useEffect(() => {
    fetchData();
    fetchHeadings();
  }, []);

  const handleHeadingChange = (e) => setHeading(e.target.value);
  const handleSubheadingChange = (e) => setSubheading(e.target.value);

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-x-auto">
      <ToastContainer />
      <div className="mb-6 sm:mb-8 border border-gray-200 shadow-lg p-4 sm:p-6 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm sm:text-base">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={handleHeadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm sm:text-base">Sub heading</label>
            <input
              type="text"
              value={subheading}
              onChange={handleSubheadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
        </div>
        <button
          onClick={saveHeadings}
          className="mt-4 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif text-sm sm:text-base"
        >
          Save
        </button>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 sm:mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 font-serif uppercase">Career Options</h1>
        <Link to="/careeroption/createCareerOption">
        <button className="mt-2 sm:mt-0 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif flex items-center gap-2 text-sm sm:text-base">
            <FaPlus size={15} />
        </button>
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
        />
      </div>
      <h2 className="text-md sm:text-lg font-semibold mb-4 font-serif">Manage Career Options</h2>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {careerOptions.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <iframe className="w-64 h-64 sm:w-96 sm:h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
            </div>
          ) : (
            <table className="w-full mt-4 border-collapse" {...getTableProps()}>
              <thead className="bg-slate-700 hover:bg-slate-800 text-white">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-2 px-2 sm:px-4 border-b border-gray-300 cursor-pointer uppercase font-serif text-sm sm:text-base"
                      >
                        <div className="flex items-center gap-2">
                          <span>{column.render("Header")}</span>
                          {column.canSort && (
                            <span className="ml-1">
                              {column.isSorted ? (
                                column.isSortedDesc ? (
                                  <FaArrowDown />
                                ) : (
                                  <FaArrowUp />
                                )
                              ) : (
                                <FaArrowDown className="text-gray-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map((row) => {
                  prepareRow(row);
                  return (
                    <tr {...row.getRowProps()} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                      {row.cells.map((cell) => (
                        <td {...cell.getCellProps()} className="py-2 px-2 sm:px-4 text-sm sm:text-base">
                          {cell.render("Cell")}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Career Option Details"
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4"
      >
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-gray-800">Career Option Details</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>
          {selectedCoption && (
            <div className="space-y-4 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Job Title:</p>
                <p>{selectedCoption.jobtitle || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Description:</p>
                <p>{selectedCoption.description || 'N/A'}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Short Description:</p>
                <ReactQuill
                  readOnly={true}
                  value={selectedCoption.shortDescription || ''}
                  modules={{ toolbar: false }}
                  theme="bubble"
                  className="quill"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Long Description:</p>
                <ReactQuill
                  readOnly={true}
                  value={selectedCoption.longDescription || ''}
                  modules={{ toolbar: false }}
                  theme="bubble"
                  className="quill"
                />
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Requirement:</p>
                <p>{selectedCoption.requirement || 'N/A'}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Photos:</p>
                {selectedCoption.photo && Array.isArray(selectedCoption.photo) && selectedCoption.photo.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {selectedCoption.photo.map((image, index) => (
                      <img
                        key={index}
                        src={`/api/image/download/${image}`}
                        alt={selectedCoption.alt?.[index] || `Career Image ${index + 1}`}
                        className="w-full h-32 sm:h-40 object-cover rounded-md"
                      />
                    ))}
                  </div>
                ) : (
                  <p>No photos available</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Status:</p>
                <p>{selectedCoption.status === 'active' ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Created At:</p>
                <p>{selectedCoption.createdAt ? new Date(selectedCoption.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Updated At:</p>
                <p>{selectedCoption.updatedAt ? new Date(selectedCoption.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
          <button
            onClick={closeModal}
            className="mt-6 px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif text-sm sm:text-base"
          >
            Close
          </button>
        </div>
      </Modal>
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-800 font-serif mb-4">Confirm Deletion</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Are you sure you want to delete this career option? This action cannot be undone.</p>
            <div className="flex justify-end gap-4">
              <button
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-300 text-sm sm:text-base"
                onClick={handleCancelDelete}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 text-sm sm:text-base"
                onClick={handleConfirmDelete}
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

export default CareerOptionTable;