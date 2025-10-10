export const validateJobTitle = (value) => {
  if (!value.trim()) return "Job Title is required";
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) return "Job Title can only contain letters, numbers, and spaces";
  if (value.trim().length < 2) return "Job Title must be at least 2 characters long";
  if (value.trim().length > 50) return "Job Title cannot exceed 50 characters";
  return "";
};

export const validateDepartment = (value) => {
  if (!value.trim()) return "Department is required";
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) return "Department can only contain letters, numbers, and spaces";
  if (value.trim().length < 2) return "Department must be at least 2 characters long";
  if (value.trim().length > 50) return "Department cannot exceed 50 characters";
  return "";
};

export const validateName = (value) => {
  if (!value.trim()) return "Name is required";
  if (!/^[a-zA-Z\s]+$/.test(value)) return "Name can only contain letters and spaces";
  if (value.trim().length < 2) return "Name must be at least 2 characters long";
  if (value.trim().length > 50) return "Name cannot exceed 50 characters";
  return "";
};

export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return "Email is required";
  }
  
  const trimmedEmail = email.trim().toLowerCase();
  
  // Check if @ symbol exists and appears only once
  const atCount = (trimmedEmail.match(/@/g) || []).length;
  if (atCount !== 1) {
    return "Email must contain exactly one @ symbol";
  }
  
  const [localPart, domainPart] = trimmedEmail.split("@");
  
  // Validate local part (before @)
  if (!localPart || localPart.length === 0) {
    return "Email must have characters before @";
  }
  
  // Local part cannot start or end with special characters
  if (/^[^a-zA-Z0-9]/.test(localPart) || /[^a-zA-Z0-9]$/.test(localPart)) {
    return "Email cannot start or end with special characters";
  }
  
  // Local part can only contain letters, numbers, dots, underscores, and hyphens
  if (!/^[a-zA-Z0-9._-]+$/.test(localPart)) {
    return "Email contains invalid characters before @";
  }
  
  // Check for consecutive dots in local part
  if (localPart.includes("..")) {
    return "Email cannot contain consecutive dots";
  }
  
  // Validate domain part (after @)
  if (!domainPart || domainPart.length < 3) {
    return "Please enter a valid email domain";
  }
  
  // Domain must contain at least one dot
  if (!domainPart.includes(".")) {
    return "Email domain must include a dot (e.g., example.com)";
  }
  
  // Domain can only contain letters, numbers, dots, and hyphens
  if (!/^[a-zA-Z0-9.-]+$/.test(domainPart)) {
    return "Email domain contains invalid characters";
  }
  
  // Domain cannot start or end with a dot or hyphen
  if (/^[.-]/.test(domainPart) || /[.-]$/.test(domainPart)) {
    return "Email domain cannot start or end with a dot or hyphen";
  }
  
  // Validate TLD (top-level domain)
  const domainParts = domainPart.split(".");
  const tld = domainParts[domainParts.length - 1];
  
  // TLD must be at least 2 characters and contain only letters
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return "Email must have a valid domain extension (e.g., .com, .org)";
  }
  
  // Check for numeric-only TLD (e.g., .23)
  if (/^\d+$/.test(tld)) {
    return "Email domain extension cannot be only numbers";
  }
  
  return "";
};

export const validateMobileNo = (value) => {
    if (!value) return "This field is required";
    if (!/^[6-9]\d{9}$/.test(value)) return "Please enter a valid  mobile number.";
    return "";
  };

export const validateResume = (file) => {
  if (!file) return "Resume is required";
  const validTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  if (!validTypes.includes(file.type)) return "Resume must be a PDF, DOC, or DOCX file";
  return "";
};

export const validateMessage = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Message must be at least 10 characters long";
  if (value.trim().length > 500) return "Message cannot exceed 500 characters";
  return "";
};

export const validateSearch = (value) => {
  if (value.trim().length === 0) return "";
  if (/^\s+$/.test(value)) return "Search cannot contain only spaces";
  return "";
};

export const validateJobType = (value) => {
  if (!value) return "Job Type is required";
  const validTypes = ["Onsite", "Remote", "Hybrid"];
  if (!validTypes.includes(value)) return "Please select a valid Job Type";
  return "";
};

export const validateEmploymentType = (value) => {
  if (!value) return "Employment Type is required";
  const validTypes = ["Full Time", "Part Time", "Contract", "Internship"];
  if (!validTypes.includes(value)) return "Please select a valid Employment Type";
  return "";
};

export const validateRequirement = (value) => {
  const text = value.replace(/<[^>]+>/g, "").trim(); // Strip HTML tags
  if (!text) return "Requirement is required";
  if (text.length < 10) return "Requirement must be at least 10 characters long";
  if (text.length > 2000) return "Requirement cannot exceed 2000 characters";
  return "";
};

export const validateDescription = (value) => {
  const text = value.replace(/<[^>]+>/g, "").trim(); // Strip HTML tags
  if (!text) return "Description is required";
  if (text.length < 10) return "Description must be at least 10 characters long";
  if (text.length > 2000) return "Description cannot exceed 2000 characters";
  return "";
};

export const validateDetails = (value) => {
  const text = value.replace(/<[^>]+>/g, "").trim(); // Strip HTML tags
  if (!text) return ""; // Optional
  if (text.length < 10) return "Details must be at least 10 characters long";
  if (text.length > 2000) return "Details cannot exceed 2000 characters";
  return "";
};

export const validateBlogDescription = (value) => {
  const text = value.replace(/<[^>]+>/g, "").trim(); // Strip HTML tags
  if (!text) return ""; // Optional
  if (text.length < 10) return "Details must be at least 10 characters long";
  if (text.length > 15000) return "Details cannot exceed 15000 characters";
  return "";
};

export const validatePhotos = (photos) => {
  if (photos.length === 0) return ""; // Optional
  if (photos.length > 5) return "You can only upload up to 5 photos";
  const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  for (const photo of photos) {
    if (!validTypes.includes(photo.type)) return "Photos must be JPEG, PNG, GIF, or WebP files";
  }
  return "";
};

export const validatePhotoAlt = (value) => {
  if (!value.trim()) return ""; // Optional
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) return "Alternative Text can only contain letters, numbers, and spaces";
  if (value.trim().length < 2) return "Alternative Text must be at least 2 characters long";
  if (value.trim().length > 100) return "Alternative Text cannot exceed 100 characters";
  return "";
};

export const validatePhotoTitle = (value) => {
  if (!value.trim()) return ""; // Optional
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) return "Image Title can only contain letters, numbers, and spaces";
  if (value.trim().length < 2) return "Image Title must be at least 2 characters long";
  if (value.trim().length > 100) return "Image Title cannot exceed 100 characters";
  return "";
};

export const validateCategory = (value) => {
  if (!value.trim()) return "Category is required";
  if (!/^[a-zA-Z0-9\s]+$/.test(value)) return "Category can only contain letters, numbers, and spaces";
  if (value.trim().length < 2) return "Category must be at least 2 characters long";
  if (value.trim().length > 50) return "Category cannot exceed 50 characters";
  return "";
};

export const validatePhoto = (photo, currentPhoto) => {
  if (!photo && !currentPhoto) return ""; // Optional
  if (photo) {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(photo.type)) return "Photo must be a JPEG, PNG, GIF, or WebP file";
  }
  return "";
};

export const validateSlug = (value) => {
  if (!value.trim()) return ""; // Optional
  if (!/^[a-z0-9-]+$/.test(value)) return "Slug can only contain lowercase letters, numbers, and hyphens";
  if (value.trim().length < 2) return "Slug must be at least 2 characters long";
  if (value.trim().length > 100) return "Slug cannot exceed 100 characters";
  if (/--/.test(value)) return "Slug cannot contain consecutive hyphens";
  if (/^-|-$/.test(value)) return "Slug cannot start or end with a hyphen";
  return "";
};

export const validateMetaTitle = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Meta Title must be at least 10 characters long";
  if (value.trim().length > 70) return "Meta Title cannot exceed 70 characters";
  return "";
};

export const validateMetaDescription = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Meta Description must be at least 10 characters long";
  if (value.trim().length > 160) return "Meta Description cannot exceed 160 characters";
  return "";
};

export const validateMetaKeywords = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Meta Keywords must be at least 10 characters long";
  if (value.trim().length > 200) return "Meta Keywords cannot exceed 200 characters";
  if (!/,/.test(value)) return "Meta Keywords must contain at least one comma-separated keyword";
  return "";
};

export const validateMetaLanguage = (value) => {
  if (!value.trim()) return ""; // Optional
  if (!/^[a-zA-Z-]{2,5}$/.test(value)) return "Meta Language must be a valid language code (e.g., 'en', 'es')";
  return "";
};

export const validateMetaCanonical = (value) => {
  if (!value.trim()) return ""; // Optional
  const urlPattern = /^https:\/\/.+$/;
  if (!urlPattern.test(value)) return "Meta Canonical must be a valid URL starting with 'https://'";
  return "";
};

export const validateMetaSchema = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Meta Schema must be at least 10 characters long";
  if (value.trim().length > 2000) return "Meta Schema cannot exceed 2000 characters";
  return "";
};

export const validateOtherMeta = (value) => {
  if (!value.trim()) return ""; // Optional
  if (value.trim().length < 10) return "Other Meta must be at least 10 characters long if provided";
  if (value.trim().length > 2000) return "Other Meta cannot exceed 2000 characters";
  return "";
};

export const validateUrl = (value) => {
  if (!value.trim()) return ""; // Optional
  const urlPattern = /^https:\/\/krenberry\.com\/.+$/;
  if (!urlPattern.test(value)) return "URL must start with 'https://krenberry.com/'";
  return "";
};

export const validateChangeFreq = (value) => {
  if (!value) return ""; // Optional
  const validFrequencies = ["always", "hourly", "daily", "weekly", "monthly", "yearly"];
  if (!validFrequencies.includes(value)) return "Please select a valid Change Frequency";
  return "";
};

export const validatePriority = (value) => {
  if (value === undefined || value === null || value === "") return ""; // Optional
  const num = parseFloat(value);
  if (isNaN(num)) return "Priority must be a number";
  if (num < 0 || num > 1) return "Priority must be between 0 and 1";
  return "";
};

export const validateTitle = (value) => {
  if (!value.trim()) return "Title is required";
  if (value.trim().length < 2) return "Title must be at least 2 characters long";
  if (value.trim().length > 100) return "Title cannot exceed 100 characters";
  if (/\d/.test(value)) return "Title cannot contain numbers";
  return "";
};

export const validatePostedBy = (value) => {
  if (!value.trim()) return "Posted By is required";
  if (!/^[a-zA-Z\s]+$/.test(value)) return "Posted By can only contain letters and spaces";
  if (value.trim().length < 2) return "Posted By must be at least 2 characters long";
  if (value.trim().length > 50) return "Posted By cannot exceed 50 characters";
  return "";
};

export const validateDate = (value) => {
  if (!value) return "Date is required";
  const datePattern = /^\d{4}-\d{2}-\d{2}$/;
  if (!datePattern.test(value)) return "Date must be in YYYY-MM-DD format";
  const date = new Date(value);
  if (isNaN(date.getTime())) return "Invalid date";
  return "";
};

export const validateCategoryId = (value) => {
  if (!value) return "Category selection is required";
  return "";
};

export const validateCoreValueDescription = (value) => {
  const text = value.replace(/<[^>]+>/g, "").trim(); // Strip HTML tags
  if (!text) return "Description is required";
  if (text.length < 10) return "Description must be at least 10 characters long";
  if (text.length > 350) return "Description cannot exceed 350 characters";
  return "";
};