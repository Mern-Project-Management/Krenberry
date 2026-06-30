import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaArrowUp, FaArrowDown, FaEye, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UseAnimations from "react-useanimations";
import loadingAnimation from "react-useanimations/lib/loading";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const Inquiry = () => {
  const [inquiries, setInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageCount, setPageCount] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [totalCount, setTotalCount] = useState(0);
  const [countWithFields, setCountWithFields] = useState(0);
  const [countWithoutFields, setCountWithoutFields] = useState(0);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [inquiryToDelete, setInquiryToDelete] = useState(null);

  const fetchData = async (page = pageIndex, size = pageSize, category = selectedCategory, search = searchTerm) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`/api/inquiries/getInquiries`, {
        params: {
          page: page + 1, // Backend expects 1-based page index
          limit: size,
          category: category,
          search: search,
        },
        withCredentials: true
      });
      const { inquiries: paginatedInquiries, total, totalCount, countWithFields, countWithoutFields } = response.data;

      setInquiries(paginatedInquiries);
      setPageCount(Math.ceil(total / size));
      setFilteredTotal(total);
      setTotalCount(totalCount);
      setCountWithFields(countWithFields);
      setCountWithoutFields(countWithoutFields);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch inquiries.");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchData(pageIndex, pageSize, selectedCategory, searchTerm);
  }, [pageIndex, pageSize, selectedCategory, searchTerm]);

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setPageIndex(0);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPageIndex(0);
  }

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "_id",
        Cell: ({ row }) => <div>{pageIndex * pageSize + row.index + 1}</div>,
      },
      {
        Header: "Info",
        accessor: "info",
        Cell: ({ row }) => (
          <div>
            <div className="font-medium">{`${row.original.firstname || ''} ${row.original.lastname || ''}`.trim() || 'N/A'}</div>
            <div className="text-sm text-gray-500 truncate" title={row.original.email}>{row.original.email || 'N/A'}</div>
            <div className="text-sm text-gray-500 truncate">{row.original.mobileNo || 'N/A'}</div>
          </div>
        ),
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
    [pageIndex, pageSize]
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
      data: inquiries,
    },
    useSortBy
  );

  const deleteInquiry = async (id) => {
    try {
      await axios.delete(`/api/inquiries/deleteInquiry?id=${id}`, { withCredentials: true });
      toast.success("Inquiry deleted successfully!"); 
      
      // Check if current page will be empty after deletion
      const remainingItems = filteredTotal - 1;
      const newPageCount = Math.ceil(remainingItems / pageSize);
      
      // If current page will be empty and it's not the first page, go to previous page
      if (pageIndex >= newPageCount && pageIndex > 0) {
        setPageIndex(pageIndex - 1);
      } else {
        fetchData();
      }
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

  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (pageCount <= maxVisiblePages) {
      for (let i = 0; i < pageCount; i++) {
        pages.push(i);
      }
    } else {
      if (pageIndex < 3) {
        for (let i = 0; i < 4; i++) pages.push(i);
        pages.push('...');
        pages.push(pageCount - 1);
      } else if (pageIndex >= pageCount - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = pageCount - 4; i < pageCount; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = pageIndex - 1; i <= pageIndex + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(pageCount - 1);
      }
    }
    
    return pages;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 overflow-auto">
      <ToastContainer />
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 font-serif uppercase mb-6">Inquiries</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full max-w-lg px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 text-sm sm:text-base"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
        <div className="rounded-lg bg-gradient-to-r from-red-400 to-red-600 p-4 sm:p-6 flex justify-between items-center shadow-lg">
          <h3 className="font-semibold text-2xl lg:text-3xl text-white font-serif">All</h3>
          <div className="font-bold text-2xl lg:text-3xl text-black bg-white/90 w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full shadow-md">{totalCount}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 p-4 sm:p-6 flex justify-between items-center shadow-lg">
          <h3 className="font-semibold text-2xl lg:text-3xl text-white font-serif">PM</h3>
          <div className="font-bold text-2xl lg:text-3xl text-black bg-white/90 w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full shadow-md">{countWithFields}</div>
        </div>
        <div className="rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-600 p-4 sm:p-6 flex justify-between items-center shadow-lg">
          <h3 className="font-semibold text-2xl lg:text-3xl text-white font-serif">SEO</h3>
          <div className="font-bold text-2xl lg:text-3xl text-black bg-white/90 w-14 h-14 lg:w-16 lg:h-16 flex items-center justify-center rounded-full shadow-md">{countWithoutFields}</div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 sm:mt-8 mb-4 gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm sm:text-base">Show</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPageIndex(0);
            }}
            className="appearance-none bg-white border border-gray-300 hover:border-gray-500 px-2 py-1 rounded-md focus:outline-none focus:border-blue-500 transition duration-300 text-sm sm:text-base"
          >
            {[10, 20, 30, 40, 50].map(size => (<option key={size} value={size}>{size}</option>))}
          </select>
          <span className="text-sm sm:text-base">entries</span>
        </div>
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
      {isLoading ? (
        <div className="flex justify-center"><UseAnimations animation={loadingAnimation} size={56} /></div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow mt-4">
            {rows.length === 0 ? (
              <div className="flex justify-center items-center h-64">
                <iframe className="w-64 h-64 sm:w-96 sm:h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json" title="No data found"></iframe>
              </div>
            ) : (
              <table className="min-w-full mt-4 border-collapse" {...getTableProps()}>
                <thead className="bg-slate-700 hover:bg-slate-800 text-white">
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()}>
                      {headerGroup.headers.map((column) => (
                        <th
                          {...column.getHeaderProps(column.getSortByToggleProps())}
                          className="py-3 px-4 border-b border-gray-300 cursor-pointer uppercase font-serif text-sm sm:text-base text-left"
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
                      <tr {...row.getRowProps()} className="border-b border-gray-200 hover:bg-gray-100 transition duration-150">
                        {row.cells.map((cell) => (
                          <td {...cell.getCellProps()} className="py-3 px-4 text-sm sm:text-base">
                            {cell.render("Cell")}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination Controls */}
          {rows.length > 0 && pageCount > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
              <div className="text-sm text-gray-600"> 
                Showing {pageIndex * pageSize + 1} to {Math.min((pageIndex + 1) * pageSize, filteredTotal)} of {filteredTotal} entries (Page {pageIndex + 1} of {pageCount})
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageIndex(0)}
                  disabled={!canPreviousPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition duration-300 ${
                    canPreviousPage
                      ? 'bg-slate-700 text-white hover:bg-slate-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  First
                </button>
                
                <button
                  onClick={() => setPageIndex(pageIndex - 1)}
                  disabled={!canPreviousPage}
                  className={`p-2 rounded-md transition duration-300 ${
                    canPreviousPage
                      ? 'bg-slate-700 text-white hover:bg-slate-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaChevronLeft />
                </button>

                <div className="flex items-center gap-1">
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setPageIndex(page)}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition duration-300 ${
                          pageIndex === page
                            ? 'bg-slate-700 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {page + 1}
                      </button>
                    )
                  ))}
                </div>

                <button
                  onClick={() => setPageIndex(pageIndex + 1)}
                  disabled={!canNextPage}
                  className={`p-2 rounded-md transition duration-300 ${
                    canNextPage
                      ? 'bg-slate-700 text-white hover:bg-slate-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <FaChevronRight />
                </button>
                
                <button
                  onClick={() => setPageIndex(pageCount - 1)}
                  disabled={!canNextPage}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition duration-300 ${
                    canNextPage
                      ? 'bg-slate-700 text-white hover:bg-slate-800'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Last
                </button>
              </div>
            </div>
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
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg w-full max-w-sm sm:max-w-lg md:max-w-2xl max-h-[90vh] overflow-y-auto">
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