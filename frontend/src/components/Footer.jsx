import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaLinkedin, FaInstagram, FaGoogle, FaBehance, FaPaperPlane } from 'react-icons/fa';
import { validateName, validateEmail } from '../utiles/validations';

const Footer = () => {
  const [footerData, setFooterData] = useState(null);
  const [logo, setLogo] = useState(""); 
  const [name, setName] = useState("");
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [services, setServices] = useState([]);
  const [openSections, setOpenSections] = useState({
    services: false,
    about: false, 
    legal: false,
  });
  const [errors, setErrors] = useState({ name: "", email: "" });

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setErrors((prev) => ({ ...prev, name: validateName(value) }));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setErrors((prev) => ({ ...prev, email: validateEmail(value) }));
  };


  useEffect(() => {
    const fetchFooterData = async () => {
      try {
        const response = await axios.get('/api/footer/getfooter');
        const transformedData = transformIncomingData(response.data);
        setFooterData(transformedData);
      } catch (error) {
        console.error('Error fetching footer data:', error);
      }
    };

    fetchFooterData();
  }, []);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await axios.get(`/api/services/getCategory`, {
          withCredentials: true,
        });
        setServices(response.data.map(item => ({ name: item.category, slug: item.slug })));
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post('/api/newsletter/postnewsletter', { name, email }, { withCredentials: true });
      setMessage(response.data.message);
      setEmail('');
      setName('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to subscribe');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchLogos = async () => {
      try {
        const response = await axios.get('/api/logo/footercolor', { withCredentials: true });
        setLogo(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLogos();
  }, []);

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!footerData) {
    return null;
  }

  return (
    <footer className="bg-[#F7F4EE] text-black max-w-8xl mx-auto">
      <section className="px-4 sm:px-6 md:px-8 lg:px-12 xl:px-24 2xl:px-36 py-8 sm:py-10 md:py-12 lg:py-14 xl:py-16 mb-14">
        <div className="max-w-8xl mx-auto">
          <div className="block sm:hidden space-y-8">
            <div className="text-center">
              <Link to="/" className="inline-block mb-4">
                {logo ? (
                  <img
                    src={`/api/logo/download/${logo.photo}`}
                    alt={logo.alt || ""}
                    title={logo.imgTitle || ""}
                    className="h-12 w-auto object-contain mx-auto"
                  />
                ) : null}
              </Link>
              <p className="text-sm text-gray-600 leading-relaxed px-4 text-justify">
                {footerData.description}
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h4 className="font-bold text-lg mb-3 text-gray-800 text-center">
                Weekly Design Juice
              </h4>
              <p className="text-gray-600 text-sm mb-4 leading-relaxed text-center">
                Subscribe to get weekly updates on design trends and inspiration.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <input
                  type="text"
                  name="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm 
                    focus:outline-none focus:border-[#ec2127] focus:ring-2 focus:ring-[#ec2127]/20 
                    transition-all duration-300 bg-gray-50 hover:bg-white"
                  placeholder="Your Name"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm 
                    focus:outline-none focus:border-[#ec2127] focus:ring-2 focus:ring-[#ec2127]/20 
                    transition-all duration-300 bg-gray-50 hover:bg-white"
                  placeholder="Your Email"
                  required
                />
                <button
                  type="submit"
                  className={`w-full px-4 py-3 bg-[#ec2127] text-white rounded-lg 
                    hover:bg-red-600 hover:shadow-lg active:transform active:scale-95
                    transition-all duration-300 flex items-center justify-center space-x-2 
                    text-sm font-medium shadow-sm
                    ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  <span>{loading ? 'Subscribing...' : 'Subscribe Now'}</span>
                  {!loading && <FaPaperPlane className="w-4 h-4" />}
                </button>
              </form>
              {message && (
                <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${
                  message.includes('successfully') 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {message}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Services Section */}
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-base uppercase text-gray-800">Services</h4>
                  <button
                    onClick={() => toggleSection('services')}
                    className="flex items-center justify-center text-gray-800 hover:text-[#ec2127] 
                      transition-colors duration-300 text-lg font-bold"
                  >
                    <span className="relative inline-block w-5 h-5">
                      <span className={`absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2 
                        transition-transform duration-300 ${openSections.services ? 'rotate-0' : 'rotate-90'}`}></span>
                      <span className="absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2"></span>
                    </span>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out 
                  ${openSections.services ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-2">
                    {services.map((service, index) => (
                      <li key={index}>
                        <Link 
                          to={`/${service.slug}`} 
                          className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                        >
                          {service.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* About Section */}
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-base uppercase text-gray-800">About</h4>
                  <button
                    onClick={() => toggleSection('about')}
                    className="flex items-center justify-center text-gray-800 hover:text-[#ec2127] 
                      transition-colors duration-300 text-lg font-bold"
                  >
                    <span className="relative inline-block w-5 h-5">
                      <span className={`absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2 
                        transition-transform duration-300 ${openSections.about ? 'rotate-0' : 'rotate-90'}`}></span>
                      <span className="absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2"></span>
                    </span>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out 
                  ${openSections.about ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-2">
                    {footerData.aboutLinks.map((link, index) => (
                      <li key={index}>
                        <Link 
                          to={link.path} 
                          className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Legal Section */}
              <div>
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-base uppercase text-gray-800">Legal</h4>
                  <button
                    onClick={() => toggleSection('legal')}
                    className="flex items-center justify-center text-gray-800 hover:text-[#ec2127] 
                      transition-colors duration-300 text-lg font-bold"
                  >
                    <span className="relative inline-block w-5 h-5">
                      <span className={`absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2 
                        transition-transform duration-300 ${openSections.legal ? 'rotate-0' : 'rotate-90'}`}></span>
                      <span className="absolute w-5 h-1 bg-gray-800 top-1/2 transform -translate-y-1/2"></span>
                    </span>
                  </button>
                </div>
                <div className={`overflow-hidden transition-all duration-500 ease-in-out 
                  ${openSections.legal ? 'max-h-[1000px] opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                  <ul className="space-y-2">
                    {footerData.legalLinks.map((link, index) => (
                      <li key={index}>
                        <Link 
                          to={link.path} 
                          className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="hidden sm:block md:hidden">
            <div className="grid grid-cols-2 gap-8 mb-8">
              <div className="flex flex-col">
                <Link to="/" className="inline-block mb-6">
                  {logo ? (
                    <img
                      src={`/api/logo/download/${logo.photo}`}
                      alt={logo.alt || ""}
                      title={logo.imgTitle || ""}
                      className="h-14 w-auto object-contain"
                    />
                  ) : null}
                </Link>
                <div className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-600 leading-relaxed mb-8">
                    {footerData.description}
                  </p>
                  <div className="grid grid-cols-2 gap-6 mt-auto">
                    <div>
                      <h4 className="font-bold text-base mb-4 uppercase text-gray-800">Services</h4>
                      <ul className="space-y-2">
                        {services.map((service, index) => (
                          <li key={index}>
                            <Link 
                              to={`/${service.slug}`} 
                              className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                            >
                              {service.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-bold text-base mb-4 uppercase text-gray-800">About</h4>
                        <ul className="space-y-2">
                          {footerData.aboutLinks.map((link, index) => (
                            <li key={index}>
                              <Link 
                                to={link.path} 
                                className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-bold text-base mb-4 uppercase text-gray-800">Legal</h4>
                        <ul className="space-y-2">
                          {footerData.legalLinks.map((link, index) => (
                            <li key={index}>
                              <Link 
                                to={link.path} 
                                className="text-gray-600 text-sm hover:text-[#ec2127] transition-colors duration-300"
                              >
                                {link.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit">
                  <h4 className="font-bold text-xl mb-4 text-gray-800">
                    Weekly Design Juice
                  </h4>
                  <p className="text-gray-600 text-sm mb-5 leading-relaxed">
                    Subscribe to get weekly updates on design trends and inspiration.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={handleNameChange}
                      className={`w-full px-4 md:px-5 py-3 md:py-3.5 border rounded-lg text-sm md:text-base 
                        focus:outline-none focus:ring-2 transition-all duration-300 bg-gray-50 hover:bg-white
                        ${errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#ec2127] focus:ring-[#ec2127]/20"}`}
                      placeholder="Your Name"
                      required
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={handleEmailChange}
                      className={`w-full px-4 md:px-5 py-3 md:py-3.5 border rounded-lg text-sm md:text-base 
                        focus:outline-none focus:ring-2 transition-all duration-300 bg-gray-50 hover:bg-white
                        ${errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-200" : "border-gray-200 focus:border-[#ec2127] focus:ring-[#ec2127]/20"}`}
                      placeholder="Your Email"
                      required
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                    <button
                      type="submit"
                      className={`w-full px-4 py-3 bg-[#ec2127] text-white rounded-lg 
                        hover:bg-red-600 hover:shadow-lg active:transform active:scale-95
                        transition-all duration-300 flex items-center justify-center space-x-2 
                        text-sm font-medium shadow-sm
                        ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      <span>{loading ? 'Subscribing...' : 'Subscribe Now'}</span>
                      {!loading && <FaPaperPlane className="w-4 h-4" />}
                    </button>
                  </form>
                  {message && (
                    <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${
                      message.includes('successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="hidden md:block">
            <div className="grid grid-cols-3 lg:grid-cols-6 gap-6 lg:gap-8">
              <div className="col-span-1 lg:col-span-1 md:col-span-3">
                <div className="flex flex-col h-full">
                  <Link to="/" className="inline-block mb-6">
                    {logo ? (
                      <div className="relative">
                        <img
                          src={`/api/logo/download/${logo.photo}`}
                          alt={logo.alt || ""}
                          title={logo.imgTitle || ""}
                          className="h-12 md:h-16 lg:h-20 w-auto object-contain"
                        />
                      </div>
                    ) : null}
                  </Link>
                  <div className="flex-1 flex flex-col justify-between">
                    <p className="text-sm md:text-sm text-gray-600 leading-relaxed mb-4">
                      {footerData.description}
                    </p>
                  </div>
                </div>
              </div>

              <div className="col-span-1">
                <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 uppercase text-gray-800">
                  Services
                </h4>
                <ul className="space-y-2 md:space-y-3">
                  {services.map((service, index) => (
                    <li key={index}>
                      <Link 
                        to={`/${service.slug}`} 
                        className="text-gray-600 text-sm md:text-sm hover:text-[#ec2127] transition-colors duration-300 block"
                      >
                        {service.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 uppercase text-gray-800">
                  About
                </h4>
                <ul className="space-y-2 md:space-y-3">
                  {footerData.aboutLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.path} 
                        className="text-gray-600 text-sm md:text-sm hover:text-[#ec2127] transition-colors duration-300 block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-1">
                <h4 className="font-bold text-base md:text-lg mb-4 md:mb-6 uppercase text-gray-800">
                  Legal
                </h4>
                <ul className="space-y-2 md:space-y-3">
                  {footerData.legalLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        to={link.path} 
                        className="text-gray-600 text-sm md:text-sm hover:text-[#ec2127] transition-colors duration-300 block"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="col-span-3 md:col-span-3 lg:col-span-2">
                <div className="bg-white px-6 md:px-0 md:py-4 rounded-xl shadow-sm border border-gray-100">
                  <h4 className="font-bold text-lg md:text-xl mb-4 md:mb-6 text-gray-800">
                    Weekly Design Juice
                  </h4>
                  <p className="text-gray-600 text-sm md:text-base mb-5 md:mb-6 leading-relaxed">
                    Subscribe to get weekly updates on design trends and inspiration.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
                    <input
                      type="text"
                      name="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 border border-gray-200 rounded-lg text-sm md:text-base 
                        focus:outline-none focus:border-[#ec2127] focus:ring-2 focus:ring-[#ec2127]/20 
                        transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Your Name"
                      required
                    />
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 md:px-5 py-3 md:py-3.5 border border-gray-200 rounded-lg text-sm md:text-base 
                        focus:outline-none focus:border-[#ec2127] focus:ring-2 focus:ring-[#ec2127]/20 
                        transition-all duration-300 bg-gray-50 hover:bg-white"
                      placeholder="Your Email"
                      required
                    />
                    <button
                      type="submit"
                      className={`w-full px-6 py-3 md:py-3.5 bg-[#ec2127] text-white rounded-lg 
                        hover:bg-red-600 hover:shadow-lg active:transform active:scale-95
                        transition-all duration-300 flex items-center justify-center space-x-3 
                        text-sm md:text-base font-medium md:font-semibold shadow-sm
                        ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
                      disabled={loading}
                    >
                      <span>{loading ? 'Subscribing...' : 'Subscribe Now'}</span>
                      {!loading && <FaPaperPlane className="w-4 h-4 md:w-5 md:h-5" />}
                    </button>
                  </form>
                  {message && (
                    <div className={`mt-4 md:mt-5 px-4 md:px-5 py-3 rounded-lg text-sm md:text-base font-medium ${
                      message.includes('successfully') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {message}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

const transformIncomingData = (data) => {
  return {
    logo: "../images/rndlogo.webp",
    description: data.newsletter || "Description not available",
    linkedinLink: data.linkedinLink || "",
    instagramLink: data.instagramLink || "",
    googleLink: data.googleLink || "",
    behanceLink: data.behanceLink || "",
    aboutLinks: [
      { name: "About Us", path: "/aboutus" },
      { name: "Career", path: "/career" },
      { name: "Collaboration", path: "/collabration" },
      { name: "Contact us", path: "/contact" },
      { name: "FAQ", path: "/helpCenter" }
    ],
    legalLinks: [
      { name: "Terms & Conditions", path: "/terms-conditions" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Cookies Policy", path: "/cookies-policy" },
    ]
  };
};

export default Footer;