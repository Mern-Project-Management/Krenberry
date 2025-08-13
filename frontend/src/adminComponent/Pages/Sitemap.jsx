import React, { useMemo, useState, useEffect } from "react";
import { useTable, useSortBy } from "react-table";
import { FaEdit, FaArrowUp, FaArrowDown, FaPlus } from "react-icons/fa";
import { Link } from 'react-router-dom';
import axios from 'axios';
import UseAnimations from "react-useanimations";
import loading from "react-useanimations/lib/loading";



const flattenData = (sitemaps, data, type) => {
  const flattened = [];
  let sequentialId = sitemaps.length + 2;
  data.forEach((item) => {
    flattened.push({
      id: sequentialId++,
      _id: item._id,
      url: item.url,
      priority: item.priority,
      changeFreq: item.changeFreq,
      lastmod: item.lastmod,
      type: type
    });

    item.subCategories.forEach((sub) => {
      flattened.push({
        id: sequentialId++,
        _id: sub._id,
        url: sub.url,
        priority: sub.priority,
        changeFreq: sub.changeFreq,
        lastmod: sub.lastmod,
        type: type
      });

      // sub.subSubCategory.forEach((subSub) => {
      //   flattened.push({
      //     id: sequentialId++,
      //     _id: subSub._id,
      //     url: subSub.url,
      //     priority: subSub.priority,
      //     changeFreq: subSub.changeFreq,
      //     lastmod: subSub.lastmod,
      //     type: type
      //   });
      // });
    });
  });

  return flattened;
};

const SitemapTable = () => {
  const [mainSitemaps, setMainSitemaps] = useState([]);
  const [dataSitemaps, setDataSitemaps] = useState([]);
  // const [productSitemaps, setProductSitemaps] = useState([]);
  const [serviceSitemaps, setServiceSitemaps] = useState([]);
  const [newsSitemaps, setNewsSitemaps] = useState([]);
  const [loadings, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSitemaps = useMemo(() => {
    if (!searchTerm) return mainSitemaps;
    return mainSitemaps.filter((sitemap) =>
      sitemap.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mainSitemaps, searchTerm]);

  const columns = useMemo(

    () => [
      // {
      //   Header: "ID",
      //   accessor: index + 1,
      // },
      {
        Header: "URL",
        accessor: "url",
      },
      {
        Header: "Priority",
        accessor: "priority",
      },
      {
        Header: "Change Frequency",
        accessor: "changeFreq",
      },
      {
        Header: "Last Modification",
        accessor: "lastmod",
      },
      {
        Header: "Options",
        Cell: ({ row }) => (
          <div className="flex gap-4">
            <button className="text-blue-500 hover:text-blue-700 transition">
              <Link to={`/sitemap/editSitemap/${row.original._id}/${row.original.type}`}><FaEdit /></Link>
            </button>
            {/* <button className="text-red-500 hover:text-red-700 transition" onClick={() => deleteSitemap(row.original.id, row.original.type)}>
              <FaTrashAlt />
            </button> */}
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
      data: filteredSitemaps,
    },
    useSortBy
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const dataResponse = await axios.get(`/api/sitemap/fetchUrlPriorityFreq`, { withCredentials: true })
      const data = dataResponse.data.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        url: item.url,
        priority: item.priority,
        changeFreq: item.changeFreq,
        lastmod: item.lastmod,
        type: 'data'
      }));
      setDataSitemaps([...data]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // const fetchProductData = async () => {
  //   setLoading(true);
  //   try {
  //     const [productResponse, categoryResponse] = await Promise.all([
  //       axios.get(`/api/product/fetchUrlPriorityFreq`, { withCredentials: true }),
  //       axios.get(`/api/product/fetchCategoryUrlPriorityFreq`, { withCredentials: true })
  //     ]);

  //     const productData = productResponse.data.map((item, index) => ({
  //       id: index + 1,
  //       _id: item._id,
  //       url: item.url,
  //       priority: item.priority,
  //       changeFreq: item.changeFreq,
  //       lastmod: item.lastmod,
  //       type: 'products'
  //     }));

  //     setProductSitemaps(productData);
  //     const categoryData = flattenData(productSitemaps, categoryResponse.data, 'product-category');

  //     setProductSitemaps([...productData, ...categoryData]);
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchServiceData = async () => {
    setLoading(true);
    try {
      const [serviceResponse, categoryResponse] = await Promise.all([
        axios.get(`/api/services/fetchUrlPriorityFreq`, { withCredentials: true }),
        axios.get(`/api/services/fetchCategoryUrlPriorityFreq`, { withCredentials: true })
      ]);
      const serviceData = serviceResponse.data.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        url: item.url,
        priority: item.priority,
        changeFreq: item.changeFreq,
        lastmod: item.lastmod,
        type: 'service'
      }));
    
      const categoryData = flattenData(serviceSitemaps, categoryResponse.data, 'service-category');
    
      setServiceSitemaps([...serviceData, ...categoryData]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNewsData = async () => {
    setLoading(true);
    try {
      const [newsResponse, categoryResponse] = await Promise.all([
        axios.get(`/api/news/fetchUrlPriorityFreq`, { withCredentials: true }),
        axios.get(`/api/news/fetchCategoryUrlPriorityFreq`, { withCredentials: true })
      ]);
      const newsData = newsResponse.data.map((item, index) => ({
        id: index + 1,
        _id: item._id,
        url: item.url,
        priority: item.priority,
        changeFreq: item.changeFreq,
        lastmod: item.lastmod,
        type: 'new'
      }));
      const categoryData = flattenData(newsSitemaps, categoryResponse.data, 'news-category');

      setNewsSitemaps([...newsData, ...categoryData]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteSitemap = async (id, type) => {
    const endpoint = type === 'product' ? 'deleteUrlPriorityFreq' : 'deleteCategoryUrlPriorityFreq';
    try {
      await axios.delete(`/api/product/${endpoint}?id=${id}`, { withCredentials: true });
      // fetchProductData();
      fetchServiceData();
    } catch (error) {
      console.error(error);
    }
  };

  // const generateProductSitemap = async () => {
  //   try {
  //     await axios.post('/api/sitemap/generateproductsitemap', { productSitemaps }, { withCredentials: true });
  //     alert("Sitemap generated successfully!");
  //   } catch (error) {
  //     console.error(error);
  //     alert("Failed to generate sitemap.");
  //   }
  // };

  const generateServiceSitemap = async () => {
    try {
      await axios.post('/api/sitemap/generateservicesitemap', { serviceSitemaps }, { withCredentials: true });
      alert("Sitemap generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate sitemap.");
    }
  };

  const generateNewsSitemap = async () => {
    try {
      await axios.post('/api/sitemap/generatenewssitemap', { newsSitemaps }, { withCredentials: true });
      alert("Sitemap generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate sitemap.");
    }
  };

  const generateMainSitemap = async () => {
    try {
      await axios.post('/api/sitemap/generatemainssitemap', { dataSitemaps }, { withCredentials: true });
      alert("Sitemap generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate sitemap.");
    }
  };

  const generateSitemapIndex = async () => {
    try {
      await axios.post('/api/sitemap/generateSitemapIndex', { withCredentials: true });
      alert("Sitemap generated successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to generate sitemap.");
    }
  };

  useEffect(() => {
    fetchData();
    // fetchProductData();
    fetchServiceData();
    fetchNewsData();
  }, []);

  useEffect(() => {
    setMainSitemaps([...dataSitemaps]);
  }, [dataSitemaps]);

  return (
    <div className="p-4 overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold  text-gray-700 font-serif uppercase">Sitemaps</h1>
      </div>
      
      <div className="flex gap-4">
      <Link to="/sitemap.xml"> 
           <button  className="bg-slate-700 text-white py-2 px-4 rounded">Show Main Sitemap</button>
          </Link>
        <button onClick={generateSitemapIndex} className="bg-slate-700 text-white py-2 px-4 rounded">Generate Sitemap</button>
        <button onClick={generateMainSitemap} className="bg-slate-700 text-white py-2 px-4 rounded">Generate Main Sitemap</button>
        {/* <button onClick={generateProductSitemap} className="bg-slate-700 text-white py-2 px-4 rounded">Generate Product Sitemap</button> */}
        <button onClick={generateServiceSitemap} className="bg-slate-700 text-white py-2 px-4 rounded">Generate Service Sitemap</button>
        <button onClick={generateNewsSitemap} className="bg-slate-700 text-white py-2 px-4 rounded">Generate News Sitemap</button>
      </div>

      {loadings ? (
        <div className="flex justify-center"><UseAnimations animation={loading} size={56} /></div>

      ) : (
        <>

        </>

      )}
    </div>
  );
};

export default SitemapTable;
