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

const ServicesTable = ({ categoryId, subcategoryId }) => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const pageSize = 5;
  const navigate = useNavigate();

  const filteredServices = useMemo(() => {
    return services.filter((service) =>
      service.heading.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const columns = useMemo(
    () => [
      {
        Header: "Heading",
        accessor: "heading",
        Cell: ({ row }) => (
          <span
            className="hover:text-blue-500 cursor-pointer"
            onClick={() => navigate(`/services/editService/${row.original._id}`)}
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
            <img src={`/api/image/download/${firstImage}`} alt="Service" className="w-32 h-20 object-cover" />
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
            <button className="text-gray-600 hover:text-gray-800 transition" onClick={() => handleView(row.original)}>
              <FaEye />
            </button>
            <Link to={`/services/editSubService/${row.original._id}`} className="text-blue-500 hover:text-blue-700 transition">
              <FaEdit />
            </Link>
            <button className="text-red-500 hover:text-red-700 transition" onClick={() => deleteService(row.original._id)}>
              <FaTrashAlt />
            </button>
          </div>
        ),
        disableSortBy: true,
      },
    ],
    [navigate]
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
      data: filteredServices,
    },
    useSortBy
  );

  const handleView = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  const fetchData = async (pageIndex) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/serviceDetails/getSubServiceDetails?subcategoryId=${subcategoryId}&page=${pageIndex + 1}`, { withCredentials: true });
      const servicesWithIds = response.data.data.map((service, index) => ({
        ...service,
        id: pageIndex * pageSize + index + 1,
      }));
      setServices(servicesWithIds);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch services.");
    } finally {
      setLoading(false);
    }
  };

  const deleteService = async (id) => {
    try {
      await axios.delete(`/api/serviceDetails/deleteServiceDetail?id=${id}`, { withCredentials: true });
      toast.success("Service deleted successfully.");
      fetchData(0);
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete service.");
    }
  };

  useEffect(() => {
    if (categoryId && subcategoryId) {
      fetchData(0);
    }
  }, [categoryId, subcategoryId]);

  return (
    <div className="p-4 overflow-x-auto">
      <ToastContainer />

      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold font-serif text-gray-700 uppercase">Services</h1>
        <Link to={`/services/createService/${categoryId}/${subcategoryId}`} className="px-4 py-2 bg-slate-700 text-white rounded hover:bg-slate-900 transition duration-300 font-serif">
          <FaPlus size={15} />
        </Link>
      </div>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
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

      {/* Modal for viewing service details */}
      <Modal 
        isOpen={isModalOpen} 
        onRequestClose={closeModal}
        style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
          },
          content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            maxWidth: '80%',
            maxHeight: '90vh',
            overflow: 'auto',
            zIndex: 1001,
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            border: 'none'
          }
        }}
      >
        <div className="relative">
          <button 
            onClick={closeModal} 
            className="absolute top-0 right-0 text-gray-500 hover:text-gray-700"
            style={{ fontSize: '1.5rem' }}
          >
            &times;
          </button>
          <div className="flex justify-between items-center mb-4 font-bold text-2xl" dangerouslySetInnerHTML={{ __html: selectedService?.heading }} />
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedService?.description }} />
          
          {selectedService?.questions?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold mb-3">Frequently Asked Questions</h3>
              <ul className="space-y-4">
                {selectedService?.questions?.map((question) => (
                  <li key={question._id} className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-800" dangerouslySetInnerHTML={{ __html: question.question }} />
                    <p className="text-gray-600 mt-1" dangerouslySetInnerHTML={{ __html: question.answer }} />
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              onClick={closeModal} 
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServicesTable;
