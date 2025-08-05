import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown, FaEye, FaTimes } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const Inquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [countWithFields, setCountWithFields] = useState(0);
  const [countWithoutFields, setCountWithoutFields] = useState(0);
  const [dataWithFields, setDataWithFields] = useState([]);
  const [dataWithoutFields, setDataWithoutFields] = useState([]);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/inquiries/getInquiries`, { withCredentials: true });
      const { totalCount, countWithFields, countWithoutFields, dataWithFields, dataWithoutFields, inquiries } = response.data;

      setTotalCount(totalCount);
      setCountWithFields(countWithFields);
      setCountWithoutFields(countWithoutFields);
      setDataWithFields(dataWithFields);
      setDataWithoutFields(dataWithoutFields);
      setInquiries(inquiries);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch inquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const filteredData = useMemo(() => {
    let data = [];
    switch (selectedCategory) {
      case "GPM":
        data = dataWithFields || [];
        break;
      case "SEO":
        data = dataWithoutFields || [];
        break;
      default:
        data = inquiries || [];
    }
    return data.filter((inquiry) =>
      `${inquiry.firstname || ''} ${inquiry.lastname || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [selectedCategory, dataWithFields, dataWithoutFields, inquiries, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "_id",
        Cell: ({ row }) => <div>{row.index + 1}</div>,
      },
      {
        Header: "First Name",
        accessor: "firstname",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Last Name",
        accessor: "lastname",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Email",
        accessor: "email",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Mobile No",
        accessor: "mobileNo",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Company Size",
        accessor: "companysize",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Active Users",
        accessor: "activeuser",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Topic",
        accessor: "topic",
        Cell: ({ value }) => <span className="truncate">{value || 'N/A'}</span>,
      },
      {
        Header: "Message",
        accessor: "message",
        Cell: ({ value }) => <span className="truncate text-wrap">{value || 'N/A'}</span>,
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
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setInquiryToDelete({
                  id: row.original._id,
                  name: `${row.original.firstname || ''} ${row.original.lastname || ''}`.trim() || 'inquiry',
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
      data: filteredData,
    },
    useSortBy
  );

  const deleteInquiry = async (id) => {
    try {
      await axios.delete(`/api/inquiries/deleteInquiry?id=${id}`, { withCredentials: true });
      toast.success("Inquiry deleted successfully!");
      fetchData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete inquiry.");
    } finally {
      setIsDeleteModalOpen(false);
      setInquiryToDelete(null);
    }
  };

  const handleView = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedInquiry(null);
  };

  const handleConfirmDelete = () => {
    if (inquiryToDelete) {
      deleteInquiry(inquiryToDelete.id);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setInquiryToDelete(null);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-x-auto">
      <ToastContainer />
      <h1 className="text-xl md:text-2xl font-bold text-gray-700 font-serif uppercase mb-4 sm:mb-6">Inquiries</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-12 mt-6 sm:mt-8">
        <div className="rounded bg-gradient-to-r from-red-400 to-red-600 p-4 flex justify-between items-center px-6 sm:px-12">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-[45px] text-white font-serif">All</h3>
          <button className="font-bold text-xl sm:text-2xl md:text-[40px] text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{totalCount}</button>
        </div>
        <div className="rounded bg-gradient-to-r from-blue-400 to-blue-600 p-4 flex justify-between items-center px-6 sm:px-12">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-[45px] text-white font-serif">PM</h3>
          <p className="font-bold text-xl sm:text-2xl md:text-[40px] text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{countWithFields}</p>
        </div>
        <div className="rounded bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 flex justify-between items-center px-6 sm:px-12">
          <h3 className="font-semibold text-xl sm:text-2xl md:text-[45px] text-white font-serif">SEO</h3>
          <p className="font-bold text-xl sm:text-2xl md:text-[40px] text-black bg-white w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded shadow">{countWithoutFields}</p>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 mb-4">
        <h2 className="text-md sm:text-lg font-semibold mb-2 sm:mb-0 font-serif">Manage Inquiries</h2>
        <div className="relative">
          <select
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="appearance-none bg-white border border-gray-300 hover:border-gray-500 px-4 py-2 w-32 rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
          >
            <option value="All">ALL</option>
            <option value="GPM">PM</option>
            <option value="SEO">SEO</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 14.707a1 1 0 0 1-1.414 0l-4-4a1 1 0 1 1 1.414-1.414L9 12.586l3.293-3.293a1 1 0 1 1 1.414 1.414l-4 4z" />
            </svg>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {filteredData.length === 0 ? (
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
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        itemName={inquiryToDelete?.name || 'inquiry'}
        itemType="inquiry"
      />
      {isViewModalOpen && selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg max-w-sm sm:max-w-lg md:max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 font-serif">Inquiry Details</h2>
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={closeViewModal}
              >
                <FaTimes size={20} />
              </button>
            </div>
            <div className="space-y-4 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">First Name:</p>
                <p>{selectedInquiry.firstname || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Last Name:</p>
                <p>{selectedInquiry.lastname || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Email:</p>
                <p>{selectedInquiry.email || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Mobile No:</p>
                <p>{selectedInquiry.mobileNo || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Company Size:</p>
                <p>{selectedInquiry.companysize || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Active Users:</p>
                <p>{selectedInquiry.activeuser || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Topic:</p>
                <p>{selectedInquiry.topic || 'N/A'}</p>
              </div>
              <div className="flex flex-col">
                <p className="font-semibold font-serif mr-2">Message:</p>
                <p className="break-words">{selectedInquiry.message || 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Created At:</p>
                <p>{selectedInquiry.createdAt ? new Date(selectedInquiry.createdAt).toLocaleString() : 'N/A'}</p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <p className="font-semibold font-serif mr-2">Updated At:</p>
                <p>{selectedInquiry.updatedAt ? new Date(selectedInquiry.updatedAt).toLocaleString() : 'N/A'}</p>
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

export default Inquiry;