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
import DeleteConfirmationModal from "./DeleteConfirmationModal";

Modal.setAppElement('#root');

const CorevalueTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [corevalues, setCorevalues] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCorevalue, setSelectedCorevalue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [corevalueToDelete, setCorevalueToDelete] = useState(null);
  const navigate = useNavigate();

  const filteredCorevalues = useMemo(() => {
    return corevalues.filter((corevalue) =>
      corevalue.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [corevalues, searchTerm]);

  const notify = () => {
    toast.success("Updated Successfully!");
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Title",
        accessor: "title",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer truncate"
            onClick={() => navigate(`/corevalue/editCorevalue/${row.original._id}`)}
          >
            {row.original.title || 'N/A'}
          </span>
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? (
            <img src={`/api/image/download/${firstImage}`} alt="Core Value" className="w-20 h-12 sm:w-32 sm:h-20 object-cover rounded" />
          ) : (
            <span>N/A</span>
          );
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
            <button
              className="text-blue-500 hover:text-blue-700 transition"
              onClick={() => handleView(row.original)}
            >
              <FaEye />
            </button>
            <button className="text-blue-500 hover:text-blue-700 transition">
              <Link to={`/corevalue/editCorevalue/${row.original._id}`}><FaEdit /></Link>
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setCorevalueToDelete({
                  id: row.original._id,
                  name: row.original.title || 'core value',
                });
                setIsDeleteModalOpen(true);
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
      data: filteredCorevalues,
    },
    useSortBy
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/corevalue/getCorevalue`, { withCredentials: true });
      const corevaluesWithIds = response.data.data.map((corevalue, index) => ({
        ...corevalue,
        id: index + 1,
      }));
      setCorevalues(corevaluesWithIds);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch core values.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCorevalue = async (id) => {
    try {
      await axios.delete(`/api/corevalue/deleteCorevalue?id=${id}`, { withCredentials: true });
      toast.success("Core value deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete core value.");
    } finally {
      setIsDeleteModalOpen(false);
      setCorevalueToDelete(null);
    }
  };

  const handleView = (corevalue) => {
    setSelectedCorevalue(corevalue);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCorevalue(null);
  };

  const handleConfirmDelete = () => {
    if (corevalueToDelete) {
      deleteCorevalue(corevalueToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCorevalueToDelete(null);
  };

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=corevalue', { withCredentials: true });
      const { heading, subheading } = response.data;
      setHeading(heading || '');
      setSubheading(subheading || '');
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch headings.");
    }
  };

  const saveHeadings = async () => {
    try {
      await axios.put('/api/pageHeading/updateHeading?pageType=corevalue', {
        pagetype: 'corevalue',
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
    fetchHeadings();
  }, []);

  useEffect(() => {
    fetchData();
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
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2 uppercase font-serif text-sm sm:text-base">Sub heading</label>
            <input
              type="text"
              value={subheading}
              onChange={handleSubheadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 font-serif uppercase">Core Values</h1>
        <div className="flex flex-col items-stretch sm:items-end">
          <button
            onClick={() => {
              if (corevalues.length < 5) {
                navigate('/corevalue/createCorevalue');
              }
            }}
            disabled={corevalues.length >= 5}
            className={`px-4 py-2 rounded-md transition duration-300 font-serif flex items-center gap-2 text-sm sm:text-base mt-2 sm:mt-0
              ${corevalues.length >= 5 ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-slate-700 text-white hover:bg-slate-900'}`}
            aria-disabled={corevalues.length >= 5}
          >
            <FaPlus size={15} /> <span className="hidden sm:inline">Add Core Value</span>
          </button>
          {corevalues.length === 4 && (
            <p className="text-amber-600 text-xs sm:text-sm mt-1">
              Warning: You are nearing the limit (4 of 5). You can add one more core value.
            </p>
          )}
          {corevalues.length >= 5 && (
            <p className="text-red-600 text-xs sm:text-sm mt-1">
              Limit reached: Maximum 5 core values allowed. Delete an existing one to add more.
            </p>
          )}
        </div>
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
      <h2 className="text-md sm:text-lg font-semibold mb-4 font-serif">Manage Core Values</h2>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {filteredCorevalues.length === 0 ? (
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
                  )})
                }
              </tbody>
            </table>
          )}
        </>
      )}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Core Value Details"
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4"
      >
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold font-serif text-gray-800">Core Value Details</h2>
            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
              <FaTimes size={20} />
            </button>
          </div>
          {selectedCorevalue && (
            <div className="space-y-4 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Title:</p>
                <p>{selectedCorevalue.title || 'N/A'}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Description:</p>
                <ReactQuill
                  readOnly={true}
                  value={selectedCorevalue.description || ''}
                  modules={{ toolbar: false }}
                  theme="bubble"
                  className="quill"
                />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Photos:</p>
                {selectedCorevalue.photo && Array.isArray(selectedCorevalue.photo) && selectedCorevalue.photo.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {selectedCorevalue.photo.map((image, index) => (
                      <img
                        key={index}
                        src={`/api/image/download/${image}`}
                        alt={selectedCorevalue.alt?.[index] || `Core Value Image ${index + 1}`}
                        className="w-full h-32 sm:h-40 object-cover rounded-md"
                      />
                    ))}
                  </div>
                ) : (
                  <p>No photos available</p>
                )}
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif">Alt Text:</p>
                {selectedCorevalue.alt && Array.isArray(selectedCorevalue.alt) && selectedCorevalue.alt.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {selectedCorevalue.alt.map((altText, index) => (
                      <li key={index}>{altText || 'N/A'}</li>
                    ))}
                  </ul>
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Status:</p>
                <p>{selectedCorevalue.status === 'active' ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Created At:</p>
                <p>{selectedCorevalue.createdAt ? new Date(selectedCorevalue.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Updated At:</p>
                <p>{selectedCorevalue.updatedAt ? new Date(selectedCorevalue.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
          <div className="flex justify-end mt-6">
            <button
              onClick={closeModal}
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif text-sm sm:text-base"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={corevalueToDelete?.name || 'core value'}
        itemType="core value"
      />
    </div>
  );
};

export default CorevalueTable;