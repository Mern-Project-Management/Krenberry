import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes, FaArrowUp, FaArrowDown, FaPlus, FaFileImport, FaFileExport, FaEye } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from 'axios';
import * as FaIcons from "react-icons/fa";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const CountersTable = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [counters, setCounters] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCounter, setSelectedCounter] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [counterToDelete, setCounterToDelete] = useState(null);
  const navigate = useNavigate();

  const filteredCounters = useMemo(() => {
    return counters.filter((counter) =>
      counter.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [counters, searchTerm]);

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
        Header: "Icon",
        accessor: "icon",
        Cell: ({ value }) => <DynamicFaIcon name={value} />,
        disableSortBy: true,
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => (
          value ? <img src={`/api/icon/download/${value}`} alt="counter" className="w-20 h-12 sm:w-32 sm:h-20 object-cover rounded" /> : <span>N/A</span>
        ),
        disableSortBy: true,
      },
      {
        Header: "Title",
        accessor: "title",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer truncate"
            onClick={() => navigate(`/counter/editCounter/${row.original._id}`)}
          >
            {row.original.title || 'N/A'}
          </span>
        ),
      },
      {
        Header: "No",
        accessor: "no",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer truncate"
            onClick={() => navigate(`/counter/editCounter/${row.original._id}`)}
          >
            {row.original.no || '0'}
          </span>
        ),
      },
      {
        Header: "Sign",
        accessor: "sign",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer truncate"
            onClick={() => navigate(`/counter/editCounter/${row.original._id}`)}
          >
            {row.original.sign || 'N/A'}
          </span>
        ),
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
              <Link to={`/counter/editCounter/${row.original._id}`}>
                <FaEdit />
              </Link>
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setCounterToDelete({
                  id: row.original._id,
                  name: row.original.title || 'counter',
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
      data: filteredCounters,
    },
    useSortBy
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/counter/getCounter`, { withCredentials: true });
      const countersWithIds = response.data.map((counter, index) => ({
        ...counter,
        icon: counter.icon,
        id: index + 1,
      }));
      setCounters(countersWithIds);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch counters.");
    } finally {
      setLoading(false);
    }
  };

  const deleteCounter = async (id) => {
    try {
      await axios.delete(`/api/counter/deleteCounter?id=${id}`, { withCredentials: true });
      toast.success("Counter deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete counter.");
    } finally {
      setIsDeleteModalOpen(false);
      setCounterToDelete(null);
    }
  };

  const handleView = (counter) => {
    setSelectedCounter(counter);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedCounter(null);
  };

  const handleConfirmDelete = () => {
    if (counterToDelete) {
      deleteCounter(counterToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setCounterToDelete(null);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const DynamicFaIcon = ({ name }) => {
    const IconComponent = FaIcons[name];
    if (!IconComponent) {
      return <FaIcons.FaQuestionCircle size={25} />;
    }
    return <IconComponent size={25} />;
  };

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=counter', { withCredentials: true });
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
      await axios.put('/api/pageHeading/updateHeading?pageType=counter', {
        pagetype: 'counter', // Fixed to match pageType
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
        <h1 className="text-xl md:text-2xl font-bold text-gray-700 font-serif uppercase">Counters</h1>
        <div className="flex flex-col sm:flex-row gap-2 mt-2 sm:mt-0">
          <Link to="/counter/createCounter">
            <button
              className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif flex items-center gap-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={counters.length >= 10}
            >
              <FaPlus size={15} />
              <span className="hidden sm:inline">Add Counter</span>
            </button>
          </Link>
        </div>
      </div>
      {counters.length >=10 ? <p className="text-red-500 text-end">Maximum limit reached</p> : null}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
        />
      </div>
      <h2 className="text-md sm:text-lg font-semibold mb-4 font-serif">Manage Counters</h2>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {filteredCounters.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <iframe className="w-64 h-64 sm:w-96 sm:h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
            </div>
          ) : (
            <table className="w-full mt-4 border-collapse" {...getTableProps()}>
              <thead className="bg-slate-700 hover:bg-slate-800 text-white">
                {headerGroups.map((headerGroup) => (
                  <tr key={headerGroup.id} {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        key={column.id}
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
                    <tr key={row.id} {...row.getRowProps()} className="border-b border-gray-300 hover:bg-gray-100 transition duration-150">
                      {row.cells.map((cell) => (
                        <td key={cell.id} {...cell.getCellProps()} className="py-2 px-2 sm:px-4 text-sm sm:text-base">
                          {cell.render(   "Cell")}
                        </td>
                      ))}
                    </tr>
                  )}
                )}
              </tbody>
            </table>
          )}
        </>
      )}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={counterToDelete?.name || 'counter'}
        itemType="counter"
      />
      {isViewModalOpen && selectedCounter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-sm sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 font-serif">Counter Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeViewModal}
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Icon:</p>
                <DynamicFaIcon name={selectedCounter.icon} />
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif mr-2">Photo:</p>
                {selectedCounter.photo ? (
                  <img
                    src={`/api/icon/download/${selectedCounter.photo}`}
                    alt="Counter"
                    className="w-32 h-20 sm:w-40 sm:h-24 object-cover rounded-md mt-2"
                  />
                ) : (
                  <p>N/A</p>
                )}
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Title:</p>
                <p>{selectedCounter.title || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Number:</p>
                <p>{selectedCounter.no || '0'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Sign:</p>
                <p>{selectedCounter.sign || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Status:</p>
                <p>{selectedCounter.status === 'active' ? 'Active' : 'Inactive'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Created At:</p>
                <p>{selectedCounter.createdAt ? new Date(selectedCounter.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Updated At:</p>
                <p>{selectedCounter.updatedAt ? new Date(selectedCounter.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-900 transition duration-300 font-serif text-sm sm:text-base"
                onClick={closeViewModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CountersTable;