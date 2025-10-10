import React, { useState, useEffect } from 'react';
import { Send } from 'lucide-react';
import contactBanner from '../assets/contact-banner.jpg'; // Corrected import
// import Call from '../assets/call.gif';
// import Email from '../assets/email.gif';
// import Location from '../assets/location.gif';
// import Enterprice from '../assets/enterprise.gif';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { validateName,
  validateEmail,
  validateMobileNo, validateDetails} from '../utiles/validations';

const ContactUs = () => {
  const [contactInfos, setContactInfos] = useState([]);
  const [heading, setHeading] = useState('');
  const [subheading, setSubheading] = useState('');
  const [photo, setPhoto] = useState(null)
  const [alt, setAlt] = useState("")
  const [imgTitle, setImgTitle] = useState("")
  const [headOfficeAddress, setHeadOfficeAddress] = useState('');
  const [salesOfficeAddress, setSalesOfficeAddress] = useState('');
  const [location, setLocation] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [clientIp, setClientIp] = useState('');
  const [utmParams, setUtmParams] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isTouched, setIsTouched] = useState({
    name: false,
    email: false,
    phone: false,
    subject: false,
    message: false
  });
  const navigate = useNavigate()

  useEffect(() => {
    const fetchClientIp = async () => {
      try {
        const response = await axios.get('https://api.ipify.org?format=json');
        setClientIp(response.data.ip);
      } catch (error) {
        console.error('Error fetching IP address', error);
      }
    };

    fetchClientIp();

    const params = new URLSearchParams(window.location.search);
    setUtmParams({
      utm_source: params.get('utm_source') || '',
      utm_medium: params.get('utm_medium') || '',
      utm_campaign: params.get('utm_campaign') || '',
      utm_id: params.get('utm_id') || '',
      gclid: params.get('gclid') || '',
      gcid_source: params.get('gcid_source') || '',
      utm_content: params.get('utm_content') || '',
      utm_term: params.get('utm_term') || '',
    });
  }, []);

  const validateField = (name, value) => {
    let error = '';
    
    if (!value.trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
      return error;
    }
    
    switch (name) {
      case 'name':
        error = validateName(value);
        break;
      case 'email':
        error = validateEmail(value);
        break;
      case 'phone':
        error = validateMobileNo(value);
        break;
      case 'message':
        error = validateDetails(value);
        break;
      default:
        break;
    }
    
    return error || '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setIsTouched(prev => ({ ...prev, [name]: true }));
    
    const error = validateField(name, value);
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update the corresponding state
    switch (name) {
      case 'name':
        setName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'phone':
        // Only allow numbers
        if (value === '' || /^\d*$/.test(value)) {
          setPhone(value);
        }
        break;
      case 'subject':
        setSubject(value);
        break;
      case 'message':
        setMessage(value);
        break;
      default:
        break;
    }
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      const error = validateField(name, value);
      setFormErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    const fields = [
      { name: 'name', value: name },
      { name: 'email', value: email },
      { name: 'phone', value: phone },
      { name: 'message', value: message }
    ];
    
    fields.forEach(field => {
      const error = validateField(field.name, field.value);
      if (error) {
        errors[field.name] = error;
        isValid = false;
      }
    });
    
    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);

    try {
      await axios.post('/api/contactinquiries/createcontactInquiry', {
        name,
        email,
        phone,
        subject,
        message,
        ipaddress: clientIp,
        ...utmParams,
      });

      // Reset form on success
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
      setFormErrors({});
      setIsTouched({
        name: false,
        email: false,
        phone: false,
        subject: false,
        message: false
      });
      
      navigate("/thankyou");
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'An error occurred while submitting the form.';
      setErrorMessage(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    axios.get(`/api/contactInfo/getcontactinfo`, { withCredentials: true })
      .then((response) => {
        const fetchedContactInfos = response.data.data || response.data; // Adjust based on response structure
        setContactInfos(fetchedContactInfos);
      })
      .catch((error) => {
        if (error.response?.status === 403) {
          navigate('/login'); // Redirect to login if unauthorized
        }
      });
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      try {
        const response = await axios.get('/api/address/getAddress', { withCredentials: true });
        const address = response.data;
        setHeadOfficeAddress(address.headOfficeAddress || '');
        setSalesOfficeAddress(address.salesOfficeAddress || '');
        setLocation(address.location || '');
      } catch (error) {
        console.error(error);
      }
    };

    fetchAddress();
  }, []);

  useEffect(() => {
    const fetchHeadings = async () => {
      try {
        const response = await axios.get('/api/pageHeading/heading?pageType=contactus', { withCredentials: true });
        const { heading, subheading, photo, alt, imgTitle } = response.data;
        setHeading(heading || '');
        setSubheading(subheading || '');
        setPhoto(photo || null);
        setAlt(alt || '');
        setImgTitle(imgTitle || '')
      } catch (error) {
        console.error(error);
      }
    };

    fetchHeadings();
  }, []);

  return (

    <div className="flex flex-col">


      <div className="relative">
        <img src={`/api/logo/download/${photo}`} alt={alt} title={imgTitle} className="w-full h-[55vh] object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center flex-col gap-8 pt-16 md:pt-32">
          <h1 className="text-white text-4xl md:text-7xl font-semibold capitalize">{heading}</h1>
          <p className="text-xl md:text-2xl text-white text-center">{subheading}</p>
        </div>
      </div>

      {/* Contact information row */}
      <div className='py-16'>
        <div className=" w-[90%] mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-2 xl:grid-cols-4 justify-center gap-8">
            {contactInfos.map((item, index) => (
              <div key={index} className=' rounded-md shadow-md px-2 py-2'>
                <div className="flex gap-2 items-center">
                  <img src={`/api/icon/download/${item.photo}`} alt={`${item.title} icon`} className="w-10 h-10 md:w-20 md:h-20" />
                  <div>
                    {item.type === 'Head Office Address' ? (
                      <>
                        <h3 className="font-bold">{item.title}</h3>
                        <a href={headOfficeAddress} target='_blank' className='hover:text-[#ec2127]'>{item.address}</a>
                      </>
                    ) : item.type === 'Phone No' ? (
                      <>
                        <h3 className="font-bold">{item.title}</h3>
                        <a href={`tel:${item.phone1}`} className='hover:text-[#ec2127]'>{item.phone1}</a><br />
                        {item.phone2 && <a href={`tel:${item.phone2}`} className='hover:text-[#ec2127]'>{item.phone2}</a>}
                      </>
                    ) : item.type === 'Email' ? (
                      <>
                        <h3 className="font-bold">{item.title}</h3>
                        <a href={`mailto:${item.email1}`} className='hover:text-[#ec2127]' >{item.email1}</a><br />
                        {item.email2 && <a href={`mailto:${item.email2}`} className='hover:text-[#ec2127]'>{item.email2}</a>}
                      </>
                    ) : (
                      <>
                        <h3 className="font-bold">{item.title}</h3>
                        <a href={salesOfficeAddress} target='_blank' className='hover:text-[#ec2127]'>{item.address}</a>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Map and Contact Form */}
        <div className="w-[90%] mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Contact Form */}
            <div className="flex-1">
              <h2 className="text-2xl mb-4 text-black font-serif">Get in Touch</h2>
              <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="w-full">
                    <label htmlFor="name" className="block mb-1">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={name}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your full name"
                      className={`w-full p-2 border rounded focus:border-[#ec2127] outline-none ${
                        formErrors.name && isTouched.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                      minLength={2}
                    />
                    {formErrors.name && isTouched.name && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <label htmlFor="email" className="block mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your email address"
                      className={`w-full p-2 border rounded focus:border-[#ec2127] outline-none ${
                        formErrors.email && isTouched.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.email && isTouched.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 w-full">
                  <div className="w-full">
                    <label htmlFor="phone" className="block mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={phone}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      placeholder="Enter your 10-digit mobile number"
                      maxLength="10"
                      className={`w-full p-2 border rounded focus:border-[#ec2127] outline-none ${
                        formErrors.phone && isTouched.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.phone && isTouched.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                  
                  <div className="w-full">
                    <label htmlFor="subject" className="block mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={subject}
                      onChange={handleChange}
                      placeholder="Enter subject"
                      className="w-full p-2 border border-gray-300 rounded focus:border-[#ec2127] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={message}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Enter your message (minimum 10 characters)"
                    rows="4"
                    className={`w-full p-2 border rounded focus:border-[#ec2127] outline-none resize-none ${
                      formErrors.message && isTouched.message ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors.message && isTouched.message && (
                    <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>
                  )}
                </div>

                {errorMessage && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <span className="block sm:inline">{errorMessage}</span>
                  </div>
                )}

                <div className="flex justify-start">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[#ec2127] hover:bg-[#ec2127] text-white font-medium py-2 px-6 rounded-md flex items-center gap-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Send Message
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Map */}
            <div className="flex-1">
              <h2 className="text-2xl mb-4 text-black font-serif">Our Location</h2>
              <iframe
                src={location}
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              >
              </iframe>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs;