import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes, FaEye, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
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

const TestimonialsTable = ({ categoryId }) => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");
  const [testimonials, setTestimonials] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [testimonialToDelete, setTestimonialToDelete] = useState(null);
  const pageSize = 5;
  const navigate = useNavigate();

  const filteredtestimonials = useMemo(() => {
    return testimonials.filter((testimonial) =>
      testimonial?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [testimonials, searchTerm]);

  const notify = () => {
    toast.success("Updated Successfully!", { autoClose: 3000 });
  };

  const columns = useMemo(
    () => [
      {
        Header: "ID",
        accessor: "id",
      },
      {
        Header: "Name",
        accessor: "name",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/testimonials/editTestimonials/${row.original._id}`)}
          >
            {row.original.name}
          </span>
        ),
      },
      {
        Header: "Designation",
        accessor: "designation",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/testimonials/editTestimonials/${row.original._id}`)}
          >
            {row.original.designation}
          </span>
        ),
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? <img src={`/api/image/download/${firstImage}`} alt="Testimonial" className="w-32 h-20 object-cover rounded" /> : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value === "true" ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />,
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button className="text-gray-600 hover:text-gray-800 transition" onClick={() => handleView(row.original)}>
              <FaEye />
            </button>
            <button className="text-blue-500 hover:text-blue-700 transition">
              <Link to={`/testimonials/editTestimonials/${row.original._id}`}> <FaEdit /></Link>
            </button>
            <button
              className="text-red-500 hover:text-red-700 transition"
              onClick={() => {
                setTestimonialToDelete(row.original._id);
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
      data: filteredtestimonials,
    },
    useSortBy
  );

  const handleView = (testimonial) => {
    setSelectedTestimonial(testimonial);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTestimonial(null);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setTestimonialToDelete(null);
  };

  const fetchData = async (pageIndex) => {
    setLoading(true);
    try {
      console.log('Fetching testimonials for categoryId:', categoryId, 'page:', pageIndex + 1);
      const response = await axios.get(`/api/testimonial/getTestimonial`, {
        params: {
          page: pageIndex + 1,
          categoryId: categoryId
        },
        withCredentials: true
      });
      console.log('API response:', response.data);

      // Validate response data
      const testimonialsWithIds = Array.isArray(response.data.data)
        ? response.data.data.map((testimonial, index) => ({
            ...testimonial,
            id: pageIndex * pageSize + index + 1,
          }))
        : [];
      
      setTestimonials(testimonialsWithIds);
      console.log('Testimonials state updated:', testimonialsWithIds);
      setPageCount(Math.ceil(response.data.total / pageSize) || 1);
      if (testimonialsWithIds.length === 0) {
        console.warn('No testimonials returned from API');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      toast.error("Failed to fetch testimonials.");
      setTestimonials([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteTestimonial = async (id) => {
    try {
      console.log('Deleting testimonial with id:', id);
      await axios.delete(`/api/testimonial/deleteTestimonial?id=${id}`, { withCredentials: true });
      toast.success("Testimonial deleted successfully!", { autoClose: 3000 });
      closeDeleteModal();
      await fetchData(pageIndex);
      console.log('Data refreshed after deletion');
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      toast.error("Failed to delete testimonial.");
      closeDeleteModal();
    }
  };

  useEffect(() => {
    fetchData(pageIndex);
  }, [pageIndex]);

  const fetchHeadings = async () => {
    try {
      const response = await axios.get('/api/pageHeading/heading?pageType=testimonial', { withCredentials: true });
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
      await axios.put('/api/pageHeading/updateHeading?pageType=testimonial', {
        pagetype: 'testimonial',
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
    <div className="p-4 overflow-x-auto">
      <ToastContainer />
      <div className="mb-8 border border-gray-200 shadow-lg p-4 rounded">
        <div className="grid md:grid-cols-2 md:gap-2 grid-cols-1">
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 uppercase font-sans text-base">Heading</label>
            <input
              type="text"
              value={heading}
              onChange={handleHeadingChange}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-bold mb-2 font-sans uppercase text-base">Sub heading</label>
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
          className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 font-sans text-base"
        >
          Save
        </button>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-sans text-gray-700 uppercase text-2xl">Testimonials</h1>
        <Link to={`/testimonials/createTestimonials/${categoryId}`}>
          <button className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 font-sans text-base">
            <FaPlus size={15} />
          </button>
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:border-blue-500 transition duration-300 font-sans text-base"
        />
      </div>
      <h2 className="text-md font-semibold mb-4 font-sans text-base">Manage Testimonials</h2>
      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>
      ) : (
        <>
          {testimonials.length === 0 ? (
            <div className="flex justify-center items-center">
              <iframe className="w-96 h-96" src="https://lottie.host/embed/1ce6d411-765d-4361-93ca-55d98fefb13b/AonqR3e5vB.json"></iframe>
            </div>
          ) : (
            <table className="w-full mt-4 border-collapse overflow-x-auto" {...getTableProps()}>
              <thead className="bg-slate-700 hover:bg-slate-800 text-white">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps(column.getSortByToggleProps())}
                        className="py-2 px-4 border-b border-gray-300 cursor-pointer uppercase font-sans text-base"
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
                        <td {...cell.getCellProps()} className="py-2 px-4 font-sans text-base">
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
      <div className="mt-4 flex justify-center">
        <button onClick={() => setPageIndex(0)} disabled={pageIndex === 0} className="mr-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition font-sans text-base">
          {"<<"}
        </button>
        <button onClick={() => setPageIndex(pageIndex - 1)} disabled={pageIndex === 0} className="mr-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition font-sans text-base">
          {"<"}
        </button>
        <button onClick={() => setPageIndex(pageIndex + 1)} disabled={pageIndex + 1 >= pageCount} className="mr-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition font-sans text-base">
          {">"}
        </button>
        <button onClick={() => setPageIndex(pageCount - 1)} disabled={pageIndex + 1 >= pageCount} className="mr-2 px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 transition font-sans text-base">
          {">>"}
        </button>
        <span className="font-sans text-base">
          Page{" "}
          <strong>
            {pageIndex + 1} of {pageCount}
          </strong>{" "}
        </span>
      </div>
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Testimonial Details"
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg w-96 relative overflow-y-auto max-h-[90vh] font-sans">
          <button onClick={closeModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Testimonial</h2>
          {selectedTestimonial && (
            <div className="flex flex-col gap-4 text-base">
              {selectedTestimonial.photo && Array.isArray(selectedTestimonial.photo) && selectedTestimonial.photo.length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700">Photo:</p>
                  <img
                    src={`/api/image/download/${selectedTestimonial.photo[0]}`}
                    alt={selectedTestimonial.name}
                    className="w-32 h-20 object-cover rounded mt-2 max-w-full"
                  />
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-700">Name:</p>
                <p className="text-gray-600">{selectedTestimonial.name}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Designation:</p>
                <p className="text-gray-600">{selectedTestimonial.designation}</p>
              </div>
              <div>
                <p className="font-semibold text-gray-700">Testimony:</p>
                <ReactQuill
                  readOnly={true}
                  value={selectedTestimonial.testimony}
                  modules={{ toolbar: false }}
                  theme="bubble"
                  className="quill text-gray-600"
                />
              </div>
            </div>
          )}
          <button
            onClick={closeModal}
            className="mt-6 px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 w-full text-base"
          >
            Close
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={isDeleteModalOpen}
        onRequestClose={closeDeleteModal}
        contentLabel="Delete Confirmation"
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white p-6 rounded shadow-lg w-96 relative font-sans">
          <button onClick={closeDeleteModal} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
            <FaTimes size={20} />
          </button>
          <h3 className="text-2xl font-bold mb-4 text-gray-800">Delete Testimonial</h3>
          <p className="text-gray-600 mb-4 text-base">
            Are you sure you want to delete this testimonial? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-4">
            <button
              onClick={closeDeleteModal}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition duration-300 text-base"
            >
              Cancel
            </button>
            <button
              onClick={() => deleteTestimonial(testimonialToDelete)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 transition duration-300 text-base"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TestimonialsTable;