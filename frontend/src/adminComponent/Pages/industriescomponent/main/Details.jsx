import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaTrashAlt, FaCheck, FaTimes, FaEye, FaPlus } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Modal from 'react-modal';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";

Modal.setAppElement('#root');

const customModalStyles = {
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    transform: 'none',
    margin: '20px',
    maxWidth: '90%',
    width: '800px',
    maxHeight: '90vh',
    overflow: 'auto',
    padding: '2rem',
    zIndex: 1001,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
    borderRadius: '0.5rem',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
  },
};

const IndustriessTable = ({ categoryId ,subcategoryId,subsubcategoryId}) => {
  const [Industriess, setIndustriess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIndustries, setSelectedIndustries] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const navigate = useNavigate();

  const filteredIndustriess = useMemo(() => {
    if (!searchTerm.trim()) return Industriess;
    
    const searchTerms = searchTerm
      .toLowerCase()
      .split(' ')
      .filter(term => term.length > 0);

    return Industriess.filter((Industries) => {
      const heading = Industries.heading.toLowerCase();
      return searchTerms.every(term => heading.includes(term));
    });
  }, [Industriess, searchTerm]);

  const columns = useMemo(
    () => [
   
      {
        Header: "Heading",
        accessor: "heading",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/industries/editIndustries/${row.original._id}`)}
            dangerouslySetInnerHTML={{ __html: row.original.heading }}
          />
        ),
      },
      {
        Header: "Description",
        accessor: "description",
        Cell: ({ value }) => <span dangerouslySetInnerHTML={{ __html: value }} />,
      },
      {
        Header: "Photo",
        accessor: "photo",
        Cell: ({ value }) => {
          const firstImage = Array.isArray(value) && value.length > 0 ? value[0] : null;
          return firstImage ? (
            <img src={`/api/image/download/${firstImage}`} alt="Industries" className="w-32 h-20 object-cover" />
          ) : null;
        },
        disableSortBy: true,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => value ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" />,
        disableSortBy: true,
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button 
              onClick={() => handleView(row.original)}
              className="text-blue-500 hover:text-blue-700 transition"
              title="View Details"
            >
              <FaEye />
            </button>
            <Link to={`/industries/editIndustries/${row.original._id}`} className="text-blue-500 hover:text-blue-700 transition" title="Edit">
              <FaEdit />
            </Link>
            <button 
              onClick={() => deleteIndustries(row.original._id)}
              className="text-red-500 hover:text-red-700 transition"
              title="Delete"
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
      data: filteredIndustriess,
    },
    useSortBy
  );

  const handleView = (Industries) => {
    setSelectedIndustries(Industries);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndustries(null);
  };

  const fetchData = async (pageIndex) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/industiesDetails/getIndustriesDetails?categoryId=${categoryId}&page=${pageIndex + 1}`, { withCredentials: true });
      const IndustriessWithIds = response.data.data.map((Industries, index) => ({
        ...Industries,
        id: pageIndex * pageSize + index + 1,
      }));
      setIndustriess(IndustriessWithIds);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch Industriess.");
    } finally {
      setLoading(false);
    }
  };

  const deleteIndustries = async (id) => {
    try {
      await axios.delete(`/api/industiesDetails/deleteIndustriesDetail?id=${id}`, { withCredentials: true });
      toast.success("Industries deleted successfully.");
      fetchData(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete Industries.");
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchData(0);
    }
  }, [categoryId]);

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-serif text-gray-700 uppercase">Industries</h1>
        <Link to={`/industries/createIndustries/${categoryId}`} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 font-serif">
          <FaPlus size={15} />
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name (supports multiple words)..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ' ').trimStart())}
          className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      {loading ? (
        <UseAnimations animation={loading} />
      ) : (
        <table {...getTableProps()} className="min-w-full border-collapse border border-gray-300">
          <thead>
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()} className="bg-gray-100">
                {headerGroup.headers.map(column => (
                  <th {...column.getHeaderProps()} className="border border-gray-300 p-2 text-left font-bold">
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="border border-gray-300 hover:bg-gray-50">
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="border border-gray-300 p-2">
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* Modal for viewing Industries details */}
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal}
        style={customModalStyles}
        contentLabel="Industry Details"
        ariaHideApp={false}
        className="bg-white rounded-lg"
        overlayClassName="fixed inset-0"
      >
        <div className="max-w-4xl w-full">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-800" dangerouslySetInnerHTML={{ __html: selectedIndustries?.heading || '' }} />
            <button 
              onClick={closeModal} 
              className="text-gray-500 hover:text-gray-700 focus:outline-none"
              aria-label="Close modal"
            >
              <FaTimes size={24} />
            </button>
          </div>
          
          <div className="prose max-w-none mb-6" dangerouslySetInnerHTML={{ __html: selectedIndustries?.description || '' }} />
          
          {selectedIndustries?.questions?.length > 0 && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-gray-800">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {selectedIndustries.questions.map((question) => (
                  <div key={question._id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-800 mb-2">
                      {question.question}
                    </h4>
                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: question.answer || 'No answer provided' }} />
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end">
            <button 
              onClick={closeModal} 
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default IndustriessTable;
