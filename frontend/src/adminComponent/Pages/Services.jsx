import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useTable, useSortBy, usePagination } from "react-table";
import { FaEdit, FaChevronRight, FaChevronDown, FaTrashAlt } from "react-icons/fa";

const CategorySelection = () => {
  const [allRows, setAllRows] = useState([]); // flattened full list
  const [expandedIds, setExpandedIds] = useState({}); // id:boolean
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/services/getall", { withCredentials: true });
      setAllRows(flattenCategories(response.data));
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch categories");
    }
  };

  // Flatten the categories to include hierarchy and indentation and helper metadata
  const flattenCategories = (categories) => {
    const flattened = [];
    categories.forEach((category) => {
      const hasChildren = Array.isArray(category.subCategories) && category.subCategories.length > 0;
      flattened.push({
        ...category,
        indent: 0,
        hasChildren,
      });
      if (category.subCategories) {
        category.subCategories.forEach((subcategory) => {
          const hasChildrenSub = Array.isArray(subcategory.subSubCategory) && subcategory.subSubCategory.length > 0;
          flattened.push({
            ...subcategory,
            indent: 1,
            parentCategoryId: category._id,
            parentCategorySlug: category.slug,
            hasChildren: hasChildrenSub,
          });
          if (subcategory.subSubCategory) {
            subcategory.subSubCategory.forEach((subsubcategory) => {
              flattened.push({
                ...subsubcategory,
                indent: 2,
                parentCategoryId: category._id,
                parentCategorySlug: category.slug,
                parentSubcategoryId: subcategory._id,
                parentSubcategorySlug: subcategory.slug,
                hasChildren: false,
              });
            });
          }
        });
      }
    });
    return flattened;
  };

  // Derive visible rows based on expandedIds state
  const visibleRows = useMemo(() => {
    return allRows.filter((row) => {
      if (row.indent === 0) return true; // always show roots
      if (row.indent === 1) return !!expandedIds[row.parentCategoryId];
      if (row.indent === 2) return !!expandedIds[row.parentSubcategoryId] && !!expandedIds[row.parentCategoryId];
      return true;
    });
  }, [allRows, expandedIds]);

  const toggleExpand = (row) => {
    if (!row.hasChildren) return;
    setExpandedIds((prev) => ({ ...prev, [row._id]: !prev[row._id] }));
  };

  const handleEditCategory = (category) => {
    if (category.indent === 0) {
      // If it's a top-level category
      navigate(`/services/edit-service/${category._id}`);
    } else if (category.indent === 1) {
      // If it's a subcategory
      navigate(`/services/edit-subcategory/${category.parentCategoryId}/${category._id}`);
    } else if (category.indent === 2) {
      // If it's a subsubcategory
      navigate(`/services/edit-subsubcategory/${category.parentCategoryId}/${category.parentSubcategoryId}/${category._id}`);
    }
  };

  const handleAskDelete = (row) => {
    // Build delete target using slugs similar to Servicecategory.jsx
    if (row.indent === 0) {
      setDeleteTarget({ type: "category", id: row.slug });
    } else if (row.indent === 1) {
      setDeleteTarget({ type: "subcategory", categoryId: row.parentCategorySlug, subCategoryId: row.slug });
    } else if (row.indent === 2) {
      setDeleteTarget({ type: "subsubcategory", categoryId: row.parentCategorySlug, subCategoryId: row.parentSubcategorySlug, subSubCategoryId: row.slug });
    }
    setShowDeleteModal(true);
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;
    let url = "";
    if (deleteTarget.type === "subsubcategory") {
      url = `/api/services/deletesubsubcategory?categoryId=${deleteTarget.categoryId}&subCategoryId=${deleteTarget.subCategoryId}&subSubCategoryId=${deleteTarget.subSubCategoryId}`;
    } else if (deleteTarget.type === "subcategory") {
      url = `/api/services/deletesubcategory?categoryId=${deleteTarget.categoryId}&subCategoryId=${deleteTarget.subCategoryId}`;
    } else {
      url = `/api/services/deletecategory?id=${deleteTarget.id}`;
    }
    try {
      await axios.delete(url, { withCredentials: true });
      toast.success("Deleted successfully");
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchCategories();
    } catch (e) {
      console.error(e);
      toast.error("Failed to delete");
    }
  };

  // Set up table columns
  const columns = useMemo(
    () => [
      {
        Header: "Category",
        accessor: "category",
        Cell: ({ row }) => (
          <div className="flex items-center" style={{ marginLeft: `${row.original.indent * 20}px` }}>
            {row.original.hasChildren ? (
              <button
                type="button"
                className="mr-2 text-gray-700 hover:text-black"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpand(row.original);
                }}
                aria-label={expandedIds[row.original._id] ? "Collapse" : "Expand"}
              >
                {expandedIds[row.original._id] ? <FaChevronDown /> : <FaChevronRight />}
              </button>
            ) : (
              <span className="w-4 mr-2" />
            )}
            <span>{row.original.category}</span>
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditCategory(row.original)}
              className="bg-gray-500 text-white px-3 py-1 rounded"
              title="Edit"
            >
              <FaEdit />
            </button>
            <button
              onClick={() => handleAskDelete(row.original)}
              className="bg-red-500 text-white px-3 py-1 rounded"
              title="Delete"
            >
              <FaTrashAlt />
            </button>
          </div>
        ),
      },
    ],
    [expandedIds]
  );

  const data = useMemo(() => visibleRows, [visibleRows]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page, // instead of rows
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 10 },
    },
    useSortBy,
    usePagination
  );

  return (
    <div className="p-4">
      <ToastContainer />
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Select Service Category</h2>
        {/* <div className="flex gap-2">
          <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded hover:bg-gray-100">Back</button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 border rounded hover:bg-gray-100">Cancel</button>
        </div> */}
      </div>
      <table {...getTableProps()} className="min-w-full bg-white">
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="px-4 py-2 text-left bg-gray-100"
                >
                  {column.render("Header")}
                  <span>
                    {column.isSorted
                      ? column.isSortedDesc
                        ? " 🔽"
                        : " 🔼"
                      : ""}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} className="border-t">
                {row.cells.map((cell) => (
                  <td {...cell.getCellProps()} className="px-4 py-2">
                    {cell.render("Cell")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Pagination Controls */}
      <div className="flex items-center bg-gray-100 p-3 rounded-md justify-between mt-4 gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <strong>
            {pageIndex + 1} of {pageOptions.length || 1}
          </strong>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            « First
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            ‹ Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next ›
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            onClick={() => gotoPage(pageOptions.length - 1)}
            disabled={!canNextPage}
          >
            Last »
          </button>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="pageSize" className="text-sm">Rows per page:</label>
          <select
            id="pageSize"
            className="border rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-2">Confirm Delete</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button className="px-4 py-2 border rounded" onClick={() => { setShowDeleteModal(false); setDeleteTarget(null); }}>Cancel</button>
              <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={deleteItem}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelection;
