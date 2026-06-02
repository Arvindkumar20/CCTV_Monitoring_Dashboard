import * as XLSX from 'xlsx';

// Field mappings for different possible column names
const FIELD_MAPPINGS = {
  guardianName: [
    "guardianName", "guardian name", "parent name", "parentname", 
    "guardian_name", "parent_name", "name of guardian", "guardian's name",
    "father name", "mother name", "guardian"
  ],
  studentName: [
    "studentName", "student name", "child name", "student_name", 
    "pupil name", "learner name", "name of student", "student's name",
    "child's name", "ward name"
  ],
  mobile: [
    "mobile", "phone", "contact", "phone number", "mobile number", 
    "contact number", "phone_no", "mobile_no", "cell", "cell number",
    "whatsapp number", "telephone"
  ],
  email: [
    "email", "e-mail", "email address", "email_id", "emailid", 
    "mail", "electronic mail"
  ],
  dob: [
    "dob", "date of birth", "birth date", "date_of_birth", "birthday",
    "student dob", "child dob", "birthdate"
  ],
  class: [
    "class", "grade", "standard", "class_", "grade_level", "class/grade",
    "student class", "academic class", "year", "class name"
  ],
  section: [
    "section", "division", "sec", "section_", "class section", "batch",
    "section name"
  ],
  group: [
    "group", "stream", "subject group", "academic group", "group_",
    "subject stream", "elective group", "optional subject"
  ],
  relationship: [
    "relationship", "relation", "guardian relation", "relation with student",
    "parent relation", "relationship_with_student"
  ],
  alternatePhone: [
    "alternatePhone", "alternate phone", "secondary phone", "phone2",
    "alternate number", "other phone", "home phone", "alternate mobile"
  ],
  emergencyContact: [
    "emergencyContact", "emergency contact", "emergency number",
    "emergency_phone", "emergency phone", "emergency mobile"
  ],
  address: [
    "address", "street", "street address", "residence", "home address",
    "postal address", "permanent address", "full address"
  ],
  city: [
    "city", "town", "municipality", "city/town", "district"
  ],
  state: [
    "state", "province", "region", "state/province"
  ],
  pincode: [
    "pincode", "pin code", "zip", "postal code", "zip code", "pin",
    "postal code", "pincode/zip"
  ],
  occupation: [
    "occupation", "profession", "job", "employment", "career", "work"
  ],
  annualIncome: [
    "annualIncome", "annual income", "income", "yearly income",
    "family income", "household income", "salary"
  ]
};

// Valid class options
const VALID_CLASSES = [
  "Nursery", "KG", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12",
  "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th", "10th", "11th", "12th",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", 
  "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"
];

// Valid section options
const VALID_SECTIONS = ["A", "B", "C", "D", "E", "F", "A1", "B1", "C1"];

// Valid group options
const VALID_GROUPS = ["Science", "Commerce", "Arts", "Vocational", ""];

// Relationship options
const VALID_RELATIONSHIPS = ["Father", "Mother", "Guardian", "Other"];

/**
 * Detect header row and map columns to fields
 * @param {Array} headerRow - First row of the sheet
 * @returns {Object} Column mappings
 */
const detectColumnMapping = (headerRow) => {
  const mapping = {};
  
  headerRow.forEach((header, index) => {
    if (!header) return;
    
    const headerLower = String(header).toLowerCase().trim();
    
    // Find matching field
    for (const [field, patterns] of Object.entries(FIELD_MAPPINGS)) {
      if (patterns.some(pattern => headerLower.includes(pattern.toLowerCase()))) {
        mapping[field] = index;
        break;
      }
    }
  });
  
  return mapping;
};

/**
 * Normalize class value
 * @param {string} classValue - Raw class value
 * @returns {string} Normalized class
 */
const normalizeClass = (classValue) => {
  if (!classValue) return '';
  
  const value = String(classValue).trim();
  
  // Remove "Class" or "th" etc.
  let normalized = value.replace(/^(class|grade|standard)\s+/i, '');
  normalized = normalized.replace(/(st|nd|rd|th)$/i, '');
  
  // Map common values
  const classMap = {
    'nursery': 'Nursery',
    'kg': 'KG',
    'k.g': 'KG',
    '1': '1', '2': '2', '3': '3', '4': '4', '5': '5',
    '6': '6', '7': '7', '8': '8', '9': '9', '10': '10',
    '11': '11', '12': '12'
  };
  
  return classMap[normalized.toLowerCase()] || normalized;
};

/**
 * Format date from various formats to DD-MM-YYYY
 * @param {string} dateValue - Raw date value
 * @returns {string} Formatted date
 */
const formatDate = (dateValue) => {
  if (!dateValue) return '';
  
  // If it's already in DD-MM-YYYY format
  if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
    return dateValue;
  }
  
  // If it's in YYYY-MM-DD format (from Excel)
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) {
    const [year, month, day] = dateValue.split('-');
    return `${day}-${month}-${year}`;
  }
  
  // If it's a date object (from Excel)
  if (dateValue instanceof Date) {
    const day = String(dateValue.getDate()).padStart(2, '0');
    const month = String(dateValue.getMonth() + 1).padStart(2, '0');
    const year = dateValue.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  // If it's an Excel serial number
  if (typeof dateValue === 'number') {
    const date = new Date((dateValue - 25569) * 86400 * 1000);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }
  
  return String(dateValue);
};

/**
 * Validate mobile number
 * @param {string} mobile - Mobile number
 * @returns {boolean} Is valid
 */
const validateMobile = (mobile) => {
  if (!mobile) return false;
  const cleaned = mobile.replace(/\s+/g, '').replace(/^\+91/, '');
  return /^[6-9]\d{9}$/.test(cleaned);
};

/**
 * Validate email
 * @param {string} email - Email address
 * @returns {boolean} Is valid
 */
const validateEmail = (email) => {
  if (!email) return true; // Email is optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

/**
 * Validate age from DOB
 * @param {string} dobStr - DOB in DD-MM-YYYY format
 * @returns {Object} Validation result with age
 */
const validateAge = (dobStr) => {
  if (!dobStr || !/^\d{2}-\d{2}-\d{4}$/.test(dobStr)) {
    return { isValid: false, age: null };
  }
  
  const [day, month, year] = dobStr.split('-').map(Number);
  const dob = new Date(year, month - 1, day);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return {
    isValid: age >= 3 && age <= 20,
    age
  };
};

/**
 * Validate guardian record with detailed error messages
 * @param {Object} record - Record to validate
 * @param {number} index - Row index
 * @returns {Object} Validation result
 */
const validateGuardianRecord = (record, index) => {
  const errors = [];
  const warnings = [];

  // Required fields check
  REQUIRED_FIELDS.forEach(field => {
    if (!record[field] || String(record[field]).trim() === '') {
      errors.push(`${field.replace(/([A-Z])/g, ' $1').trim()} is required`);
    }
  });

  // Guardian Name validation
  if (record.guardianName && record.guardianName.length < 3) {
    errors.push('Guardian name must be at least 3 characters');
  } else if (record.guardianName && record.guardianName.length > 100) {
    errors.push('Guardian name cannot exceed 100 characters');
  }

  // Student Name validation
  if (record.studentName && record.studentName.length < 3) {
    errors.push('Student name must be at least 3 characters');
  }

  // Mobile validation
  if (record.mobile) {
    const cleanedMobile = record.mobile.replace(/\s+/g, '');
    if (!validateMobile(cleanedMobile)) {
      errors.push('Invalid mobile number (must be 10 digits starting with 6-9)');
    }
  }

  // Email validation (optional)
  if (record.email && !validateEmail(record.email)) {
    errors.push('Invalid email format');
  }

  // DOB validation
  if (record.dob) {
    const formattedDob = formatDate(record.dob);
    record.dob = formattedDob;
    
    const ageValidation = validateAge(formattedDob);
    if (!ageValidation.isValid) {
      if (ageValidation.age === null) {
        errors.push('Invalid date format (use DD-MM-YYYY)');
      } else {
        errors.push(`Student age must be between 3 and 20 years (current: ${ageValidation.age})`);
      }
    }
  }

  // Class validation
  if (record.class) {
    const normalizedClass = normalizeClass(record.class);
    record.class = normalizedClass;
    
    if (!VALID_CLASSES.includes(normalizedClass) && !normalizedClass.match(/^\d+$/)) {
      warnings.push(`Class "${record.class}" may be invalid`);
    }
  }

  // Section validation
  if (record.section && !VALID_SECTIONS.includes(record.section.toUpperCase())) {
    warnings.push(`Section "${record.section}" may be invalid`);
    record.section = record.section.toUpperCase();
  }

  // Group validation (warning only)
  if (record.group && !VALID_GROUPS.includes(record.group)) {
    warnings.push(`Group "${record.group}" may be invalid`);
  }

  // Relationship validation
  if (record.relationship && !VALID_RELATIONSHIPS.includes(record.relationship)) {
    warnings.push(`Relationship "${record.relationship}" may be invalid`);
  }

  // Pincode validation
  if (record.pincode && !/^\d{6}$/.test(record.pincode.toString())) {
    warnings.push('Pincode should be 6 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    errorMessage: errors[0] || null,
    warningMessage: warnings[0] || null
  };
};

/**
 * Parse Excel/CSV file with intelligent column detection
 * @param {File} file - File to parse
 * @returns {Promise<Array>} Parsed records
 */
export const parseExcelFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        
        // Convert to JSON with header detection
        const jsonData = XLSX.utils.sheet_to_json(firstSheet, { 
          header: 1,
          defval: '' 
        });

        if (jsonData.length < 2) {
          reject(new Error('File must contain header row and at least one data row'));
          return;
        }

        const headerRow = jsonData[0];
        const columnMapping = detectColumnMapping(headerRow);

        // Parse data rows
        const records = jsonData.slice(1).map((row, index) => {
          const record = {};
          
          // Map columns based on detected mapping
          Object.entries(columnMapping).forEach(([field, colIndex]) => {
            record[field] = row[colIndex] || '';
          });

          // Add row number for reference
          record.rowNumber = index + 2; // +2 because header is row 1

          // Validate record
          const validation = validateGuardianRecord(record, index);

          return {
            ...record,
            validation,
          };
        });

        // Filter out completely empty rows
        const nonEmptyRecords = records.filter(record => 
          record.guardianName || record.studentName || record.mobile
        );

        resolve(nonEmptyRecords);
      } catch (error) {
        reject(new Error('Failed to parse file: ' + error.message));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Generate enhanced sample template with instructions
 * @returns {Object} XLSX workbook object
 */
export const generateSampleTemplate = () => {
  const wb = XLSX.utils.book_new();
  
  // Create instructions sheet
  const instructionsData = [
    ['GUARDIAN BULK UPLOAD TEMPLATE - INSTRUCTIONS'],
    [''],
    ['REQUIRED FIELDS (*)'],
    ['Guardian Name - Full name of parent/guardian'],
    ['Student Name - Full name of student'],
    ['Mobile - 10-digit Indian mobile number'],
    ['DOB - Date of birth in DD-MM-YYYY format'],
    ['Class - Class/Grade (Nursery, KG, 1-12)'],
    ['Section - Section (A, B, C, D, E, F)'],
    [''],
    ['OPTIONAL FIELDS'],
    ['Email - Valid email address'],
    ['Group - Science, Commerce, Arts, Vocational'],
    ['Relationship - Father, Mother, Guardian, Other'],
    ['Alternate Phone - Secondary contact number'],
    ['Emergency Contact - Emergency contact number'],
    ['Address - Full street address'],
    ['City - City name'],
    ['State - State name'],
    ['Pincode - 6-digit postal code'],
    ['Occupation - Guardian\'s occupation'],
    ['Annual Income - Annual income (numeric)'],
    [''],
    ['NOTES:'],
    ['- Do not change the column headers'],
    ['- Mobile numbers must be 10 digits and start with 6-9'],
    ['- DOB format must be DD-MM-YYYY (e.g., 15-05-2010)'],
    ['- Student age must be between 3 and 20 years'],
    ['- Remove any empty rows before uploading'],
  ];
  
  const instructionsWs = XLSX.utils.aoa_to_sheet(instructionsData);
  XLSX.utils.book_append_sheet(wb, instructionsWs, 'Instructions');
  
  // Create data template sheet
  const templateData = [
    ['Guardian Name*', 'Student Name*', 'Mobile*', 'DOB* (DD-MM-YYYY)', 'Class*', 'Section*', 'Group', 'Email', 'Relationship', 'Alternate Phone', 'Emergency Contact', 'Address', 'City', 'State', 'Pincode', 'Occupation', 'Annual Income'],
    ['Mahesh Singh', 'Rohan Singh', '9876543210', '15-05-2010', '10', 'A', 'Science', 'mahesh.s@example.com', 'Father', '9988776655', '9876543211', '123 Green Park', 'New Delhi', 'Delhi', '110016', 'Business', '500000'],
    ['Anjali Kapoor', 'Sana Kapoor', '9123456789', '20-08-2008', '12', 'B', 'Commerce', 'anjali.k@example.com', 'Mother', '', '', '456 Park Avenue', 'Mumbai', 'Maharashtra', '400001', 'Teacher', '400000'],
    ['Rajesh Kumar', 'Amit Kumar', '9876543212', '12-05-2012', '8', 'C', '', 'rajesh.k@example.com', 'Father', '9988776644', '', '789 Lake Road', 'Bangalore', 'Karnataka', '560001', 'Engineer', '800000'],
  ];

  const templateWs = XLSX.utils.aoa_to_sheet(templateData);
  
  // Set column widths
  const colWidths = [
    { wch: 20 }, // Guardian Name
    { wch: 20 }, // Student Name
    { wch: 15 }, // Mobile
    { wch: 15 }, // DOB
    { wch: 10 }, // Class
    { wch: 10 }, // Section
    { wch: 15 }, // Group
    { wch: 25 }, // Email
    { wch: 15 }, // Relationship
    { wch: 15 }, // Alternate Phone
    { wch: 18 }, // Emergency Contact
    { wch: 25 }, // Address
    { wch: 15 }, // City
    { wch: 15 }, // State
    { wch: 10 }, // Pincode
    { wch: 15 }, // Occupation
    { wch: 15 }, // Annual Income
  ];
  
  templateWs['!cols'] = colWidths;
  
  XLSX.utils.book_append_sheet(wb, templateWs, 'Template');
  
  return wb;
};

/**
 * Validate multiple records and return summary
 * @param {Array} records - Records to validate
 * @returns {Object} Validation summary
 */
export const validateBatch = (records) => {
  const summary = {
    total: records.length,
    valid: 0,
    invalid: 0,
    validRecords: [],
    invalidRecords: [],
    errorsByType: {},
  };

  records.forEach((record, index) => {
    const validation = validateGuardianRecord(record, index);
    
    if (validation.isValid) {
      summary.valid++;
      summary.validRecords.push(record);
    } else {
      summary.invalid++;
      summary.invalidRecords.push({ ...record, validation });
      
      // Count error types
      validation.errors.forEach(error => {
        summary.errorsByType[error] = (summary.errorsByType[error] || 0) + 1;
      });
    }
  });

  return summary;
};

/**
 * Convert records to CSV format
 * @param {Array} records - Records to convert
 * @returns {string} CSV string
 */
export const recordsToCSV = (records) => {
  const headers = [
    'Guardian Name', 'Student Name', 'Mobile', 'DOB', 'Class', 
    'Section', 'Group', 'Email', 'Relationship', 'Alternate Phone',
    'Emergency Contact', 'Address', 'City', 'State', 'Pincode',
    'Occupation', 'Annual Income', 'Status', 'Errors'
  ];

  const rows = records.map(record => [
    record.guardianName || '',
    record.studentName || '',
    record.mobile || '',
    record.dob || '',
    record.class || '',
    record.section || '',
    record.group || '',
    record.email || '',
    record.relationship || '',
    record.alternatePhone || '',
    record.emergencyContact || '',
    record.address || '',
    record.city || '',
    record.state || '',
    record.pincode || '',
    record.occupation || '',
    record.annualIncome || '',
    record.validation?.isValid ? 'VALID' : 'INVALID',
    record.validation?.errors?.join('; ') || ''
  ]);

  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

// Required fields constant
const REQUIRED_FIELDS = [
  "guardianName",
  "mobile",
  "studentName",
  "dob",
  "class",
  "section"
];

// Export all functions
export {
  validateGuardianRecord,
  detectColumnMapping,
  normalizeClass,
  formatDate,
  validateMobile,
  validateEmail,
  validateAge,
  VALID_CLASSES,
  VALID_SECTIONS,
  VALID_GROUPS,
  VALID_RELATIONSHIPS,
  REQUIRED_FIELDS
};