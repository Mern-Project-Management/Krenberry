import React, { useState, useEffect } from "react";
import {
  Briefcase,
  Search,
  ChevronDown,
  ChevronRight,
  MapPin,
  Clock,
  X,
} from "lucide-react";
import Modal from "react-modal";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

const Banner = () => {
  const [heading, setHeading] = useState("");
  const [subheading, setSubheading] = useState("");

  useEffect(() => {
    const fetchHeadings = async () => {
      try {
        const response = await axios.get(
          "/api/pageHeading/heading?pageType=career",
          { withCredentials: true }
        );
        const { heading, subheading } = response.data;
        setHeading(heading || "");
        setSubheading(subheading || "");
      } catch (error) {
        console.error(error);
      }
    };

    fetchHeadings();
  }, []);
  return (
    <div className="relative bg-gradient-to-r from-[#ec2127] to-black h-80 md:h-[70vh] leading-none overflow-hidden">
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="relative h-full flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-semibold text-white mb-4">
            {heading}
          </h1>
          <p className="text-xl md:text-2xl text-red-100 font-semibold">
            {subheading}
          </p>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 -mb-[1px]">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
          <path
            fill="#f3f4f6"
            fillOpacity="1"
            d="M0,288L48,272C96,256,192,224,288,197.3C384,171,480,149,576,165.3C672,181,768,235,864,250.7C960,267,1056,245,1152,224C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          ></path>
        </svg>
      </div>
    </div>
  );
};

const JobCard = ({ job, onApply }) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    if (modalIsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [modalIsOpen]);

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl h-full flex flex-col">
      <img
        src={`/api/image/download/${job.photo}`}
        alt={`${job.department} department`}
        className="w-full h-[17rem] object-cover"
      />
      <div className="p-6 flex flex-col flex-grow">
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {job.jobtitle}
          </h2>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center text-sm text-gray-500">
              <MapPin size={16} className="mr-1" /> {job.jobType}
            </span>
            <span className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" /> {job.employmentType}
            </span>
          </div>
        </div>

        <div className="flex-grow mb-4 text-gray-700">
          <ReactQuill
            readOnly={true}
            value={job.description}
            modules={{ toolbar: false }}
            theme="bubble"
            className="quill"
          />
        </div>

        <div className="mt-auto flex flex-col sm:flex-row justify-between items-center gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={onApply}
            className="w-full sm:w-auto bg-[#ec2127] hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full flex items-center justify-center transition duration-300"
          >
            Apply Now
            <ChevronRight className="ml-2" size={18} />
          </button>
          <button
            onClick={openModal}
            className="w-full sm:w-auto text-[#ec2127] hover:text-red-700 font-semibold flex items-center justify-center transition duration-300"
          >
            Learn More
          </button>
        </div>
      </div>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Job Requirements"
        className="fixed inset-0 bg-white p-8 max-w-lg mx-auto my-16 rounded-lg shadow-lg overflow-auto max-h-[80vh]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50"
      >
        <div className="flex justify-between items-center relative">
          <h2 className="text-2xl font-bold mb-4">
            Requirements for {job.jobtitle}
          </h2>
          <button
            onClick={closeModal}
            aria-label="Close"
            className="absolute -top-4 -right-6 text-black hover:text-[#ec2127]"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="text-gray-700">
          <ReactQuill
            readOnly={true}
            value={job.requirement}
            modules={{ toolbar: false }}
            theme="bubble"
            className="quill"
          />
        </div>
        <button
          onClick={closeModal}
          className="mt-4 bg-[#ec2127] hover:bg-red-700 text-white py-2 px-4 rounded-full transition duration-300"
        >
          Close
        </button>
      </Modal>
    </div>
  );
};

const JobApplicationModal = ({ job, isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNo, setMobileNo] = useState("");
  const [message, setMessage] = useState("");
  const [resume, setResume] = useState(null);
  const [clientIp, setClientIp] = useState("");
  const [utmParams, setUtmParams] = useState({});
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [mobileNoError, setMobileNoError] = useState("");
  const [resumeError, setResumeError] = useState("");
  const [messageError, setMessageError] = useState("");
  const navigate = useNavigate();

  const validateName = (value) => {
    if (!value.trim()) return "Name is required";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces";
    if (value.trim().length < 2) return "Name must be at least 2 characters long";
    if (value.trim().length > 50) return "Name cannot exceed 50 characters";
    return "";
  };

  const validateEmail = (value) => {
    if (!value.trim()) return "Email is required";
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(value)) return "Please enter a valid email address";
    return "";
  };

  const validateMobileNo = (value) => {
    if (!value.trim()) return "Phone number is required";
    if (!/^\d+$/.test(value)) return "Phone number can only contain digits";
    if (value.length !== 10) return "Phone number must be exactly 10 digits";
    return "";
  };

  const validateResume = (file) => {
    if (!file) return "Resume is required";
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) return "Resume must be a PDF, DOC, or DOCX file";
    return "";
  };

  const validateMessage = (value) => {
    if (!value.trim()) return ""; // Message is optional
    if (value.trim().length < 10) return "Message must be at least 10  characters long";
    if (!/^[a-zA-Z\s]+$/.test(value)) return "Message can only contain letters and spaces";
    if (value.trim().length > 500) return "Message cannot exceed 500 characters";
    return "";
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setResume(file);
    setResumeError(validateResume(file));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);
    setNameError(validateName(value));
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError(validateEmail(value));
  };

  const handleMobileNoChange = (e) => {
    const value = e.target.value;
    setMobileNo(value);
    setMobileNoError(validateMobileNo(value));
  };

  const handleMobileNoKeyPress = (e) => {
    const charCode = e.charCode;
    if (charCode < 48 || charCode > 57) {
      e.preventDefault();
    }
  };

  const handleMessageChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    setMessageError(validateMessage(value));
  };

  useEffect(() => {
    const fetchClientIp = async () => {
      try {
        const response = await axios.get("https://api.ipify.org?format=json");
        setClientIp(response.data.ip);
      } catch (error) {
        console.error("Error fetching IP address", error);
      }
    };

    fetchClientIp();

    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utm_source: params.get("utm_source") || "",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_id: params.get("utm_id") || "",
      gclid: params.get("gclid") || "",
      gcid_source: params.get("gcid_source") || "",
      utm_content: params.get("utm_content") || "",
      utm_term: params.get("utm_term") || "",
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nameErr = validateName(name);
    const emailErr = validateEmail(email);
    const mobileNoErr = validateMobileNo(mobileNo);
    const resumeErr = validateResume(resume);
    const messageErr = validateMessage(message);

    setNameError(nameErr);
    setEmailError(emailErr);
    setMobileNoError(mobileNoErr);
    setResumeError(resumeErr);
    setMessageError(messageErr);

    if (nameErr || emailErr || mobileNoErr || resumeErr || messageErr) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("mobileNo", mobileNo);
      formData.append("resume", resume);
      formData.append("message", message);
      formData.append("ipaddress", clientIp);
      Object.entries(utmParams).forEach(([key, value]) => {
        formData.append(key, value);
      });

      await axios.post(
        "/api/careerInquiries/createCareerInquiry",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      navigate("/thankyou");
      onClose();
      setName("");
      setEmail("");
      setMobileNo("");
      setMessage("");
      setResume(null);
      setNameError("");
      setEmailError("");
      setMobileNoError("");
      setResumeError("");
      setMessageError("");
    } catch (err) {
      console.error("Failed to submit application", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-lg w-full relative">
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X size={24} />
        </button>
        <h2 className="text-2xl font-semibold mb-4">
          Apply for {job.jobtitle}
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleNameChange}
              className={`w-full p-2 border rounded-lg ${nameError ? "border-red-500" : ""}`}
              required
              maxLength={50}
            />
            {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="mobileNo" 
              value={mobileNo}
              onChange={handleMobileNoChange}
              onKeyPress={handleMobileNoKeyPress}
              className={`w-full p-2 border rounded-lg ${mobileNoError ? "border-red-500" : ""}`}
              required
              maxLength={10}
            />
            {mobileNoError && <p className="text-red-500 text-sm mt-1">{mobileNoError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              className={`w-full p-2 border rounded-lg ${emailError ? "border-red-500" : ""}`}
              required
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Upload Resume <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              name="resume"
              onChange={handleFileChange}
              className={`w-full ${resumeError ? "border-red-500" : ""}`}
              accept=".pdf,.doc,.docx"
              required
            />
            {resumeError && <p className="text-red-500 text-sm mt-1">{resumeError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Message (optional)</label>
            <textarea
              name="message"
              value={message}
              onChange={handleMessageChange}
              className={`w-full p-2 border rounded-lg ${messageError ? "border-red-500" : ""}`}
              maxLength={500}
            />
            {messageError && <p className="text-red-500 text-sm mt-1">{messageError}</p>}
          </div>
          <button
            type="submit"
            className="bg-[#ec2127] hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg w-full"
          >
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

const CareerPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("All");
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [careerOptions, setCareerOptions] = useState([]);
  const [searchError, setSearchError] = useState("");

  const validateSearch = (value) => {
    if (value.trim().length === 0) return "";
    if (/^\s+$/.test(value)) return "Search cannot contain only spaces";
    return "";
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSearchError(validateSearch(value));
  };

  const fetchData = async () => {
    try {
      const response = await axios.get(
        `/api/careeroption/getActiveCareeroption`,
        { withCredentials: true }
      );
      const careerOptionsWithIds = response.data;
      setCareerOptions(careerOptionsWithIds);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

// Replace the filteredJobs logic with this improved version:

const filteredJobs = careerOptions.filter((job) => {
  // Create a searchable string that includes all relevant job fields
  const searchableText = [
    job.department,
    job.jobtitle,
    job.jobType,
    job.employmentType,
    // You can add more fields here if needed
  ].join(' ').toLowerCase();
  
  const searchTermLower = searchTerm.toLowerCase().trim();
  
  // Check if search term matches - split search term into words and check each
  let matchesSearch = true;
  if (searchTermLower !== '') {
    const searchWords = searchTermLower.split(/\s+/);
    matchesSearch = searchWords.every(word => 
      searchableText.split(/\s+/).some(textWord => 
        textWord.startsWith(word) || textWord.includes(word)
      )
    );
  }
  
  // Check if department filter matches
  const matchesDepartment = filterDepartment === "All" || job.department === filterDepartment;
  
  // Return true only if there's no search error and both conditions are met
  return !searchError && matchesSearch && matchesDepartment;
});

  const openModal = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const departments = [
    "All",
    ...new Set(careerOptions.map((job) => job.department)),
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <Banner />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 mt-4">
        <div className="mb-12 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-start gap-2">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDepartment(dept)}
                className={`px-4 py-2 rounded-full border border-gray-300 
                            ${
                              filterDepartment === dept
                                ? "bg-black text-white"
                                : "bg-white text-black"
                            } transition duration-300`}
              >
                {dept}
              </button>
            ))}
          </div>
          <div className="w-full md:w-1/2">
            <div className="relative flex flex-col">
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder="Search jobs..."
                  className={`w-full pl-10 pr-4 py-2 rounded-full border ${searchError ? "border-red-500" : "border-gray-300"} focus:outline-none focus:ring-1 focus:ring-black`}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <button className="absolute right-3 top-2.5 text-gray-400">
                  <Search size={20} />
                </button>
              </div>
              {searchError && <p className="text-red-500 text-sm mt-1">{searchError}</p>}
            </div>
          </div>
        </div>
        <p className="text-gray-400">
          Can&apos;t find the job you want? Send your resume to <span className="hover:text-blue-900 transition-all duration-300 text-gray-500"><a href="mailto:hr@krenberry.com">hr@krenberry.com</a></span> and we&apos;ll contact you when a new position opens.
        </p>

        {filteredJobs.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 my-16">
            {filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} onApply={() => openModal(job)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-xl text-gray-600">
              No job openings match your criteria.
            </p>
          </div>
        )}
      </div>
   
      {selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default CareerPage;