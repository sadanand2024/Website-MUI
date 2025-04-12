"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";

// API base URL for easier management
const API_BASE_URL = "http://192.168.1.20:8000";

const NextPage2 = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Track existing files
  const [existingFiles, setExistingFiles] = useState({
    pan_file: false,
    aadhar_card_file: false,
    photos_of_employer: false
  });

  // Form state with default values
  const [formData, setFormData] = useState({
    id: null,
    first_name: "",
    middle_name: "",
    last_name: "",
    designation: "",
    age: "",
    mobile_number: "",
    email: "",
    door_no: "",
    locality: "",
    district: "",
    mandal: "",
    village: "",
    state: "",
    pincode: "",
    nature_of_business: "",
    date_of_commencement: "",
    total_employees: 0,
    male_employees: 0,
    female_employees: 0,
    other_employees: 0,
    pan_file: null,
    aadhar_card_file: null,
    photos_of_employer: null,
    pan_file_url: "",
    aadhar_card_file_url: "",
    photos_of_employer_url: ""
  });

  // Helper function to extract filename from URL
  const getFilenameFromUrl = (url) => {
    if (!url) return "Unknown file";

    try {
      // Try to get the filename from the URL
      const parts = url.split('/');
      let filename = parts[parts.length - 1];

      // Remove query parameters if present
      if (filename.includes('?')) {
        filename = filename.split('?')[0];
      }

      // Decode URI components
      return decodeURIComponent(filename);
    } catch (e) {
      console.error("Error parsing filename from URL:", e);
      return "Unknown file";
    }
  };

  // Safely parse JSON data with type checking
  const safeParseJSON = (data, fallback = {}) => {
    if (typeof data === 'object' && data !== null) {
      return data;
    }

    try {
      return JSON.parse(data);
    } catch (error) {
      console.error("Error parsing JSON data:", error);
      return fallback;
    }
  };

  // Fetch employer data if editing
  useEffect(() => {
    if (id) {
      fetchEmployerData();
    }
  }, [id]);

  const fetchEmployerData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/labourlicense/employers/${id}/`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.status === 200) {
        const data = response.data;
        console.log("Raw data from API:", data);

        // Safely parse address and employee data
        const addressData = safeParseJSON(data.address_of_employer);
        const employeesData = safeParseJSON(data.total_employees);

        // Check if files exist - improved check for existence and non-empty strings
        const fileStatus = {
          pan_file: !!data.pan_file && data.pan_file.length > 0,
          aadhar_card_file: !!data.aadhar_card_file && data.aadhar_card_file.length > 0,
          photos_of_employer: !!data.photos_of_employer && data.photos_of_employer.length > 0
        };
        setExistingFiles(fileStatus);


        const maleEmployees = Math.max(0, Number(employeesData.male_employees) || 0);
        const femaleEmployees = Math.max(0, Number(employeesData.female_employees) || 0);
        const otherEmployees = Math.max(0, Number(employeesData.other_employees) || 0);
        const totalEmployees = maleEmployees + femaleEmployees + otherEmployees;

        setFormData({
          id: data.id,
          first_name: data.first_name || "",
          middle_name: data.middle_name || "",
          last_name: data.last_name || "",
          designation: data.designation || "",
          age: data.age || "",
          mobile_number: data.mobile_number || "",
          email: data.email || "",
          // Parsed address data
          door_no: addressData.door_no || "",
          locality: addressData.locality || "",
          district: addressData.district || "",
          mandal: addressData.mandal || "",
          village: addressData.village || "",
          state: addressData.state || "",
          pincode: addressData.pincode || "",
          nature_of_business: data.nature_of_business || "",
          date_of_commencement: data.date_of_commencement || "",
          // Employee data with proper type conversion and non-negative checking
          male_employees: maleEmployees,
          female_employees: femaleEmployees,
          other_employees: otherEmployees,
          total_employees: totalEmployees,
          // File URLs
          pan_file_url: data.pan_file || '',
          aadhar_card_file_url: data.aadhar_card_file || '',
          photos_of_employer_url: data.photos_of_employer || '',
          // Actual file objects remain null until updated
          pan_file: null,
          aadhar_card_file: null,
          photos_of_employer: null,
        });

        console.log("Form data loaded:", formData);
        console.log("Existing files status:", fileStatus);
      }
    } catch (error) {
      console.error("Error fetching employer data:", error);
      alert(`Failed to load employer data: ${error.response?.data?.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch address details based on pincode
  const fetchAddressByPincode = async (pincode) => {
    if (pincode.length === 6) {
      setPincodeLoading(true);
      try {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`, {
          headers: {
            'Accept': 'application/json'
          }
        });

        if (response.data &&
          response.data[0] &&
          response.data[0].Status === "Success" &&
          response.data[0].PostOffice &&
          response.data[0].PostOffice.length > 0) {
          const postOffice = response.data[0].PostOffice[0];
          setFormData(prev => ({
            ...prev,
            state: postOffice.State || "",
            district: postOffice.District || "",
            mandal: postOffice.Block || "", // Using Block as mandal equivalent
          }));
        }
      } catch (error) {
        console.error("Error fetching pincode data:", error);
      } finally {
        setPincodeLoading(false);
      }
    }
  };

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prevData) => {
      const updatedData = { ...prevData };

      // Ensure non-negative values for employee counts
      if (["male_employees", "female_employees", "other_employees"].includes(name)) {
        // Convert to number and ensure it's non-negative
        const numValue = Math.max(0, Number(value) || 0);
        updatedData[name] = numValue;

        // Recalculate total employees
        updatedData.total_employees =
          Number(updatedData.male_employees || 0) +
          Number(updatedData.female_employees || 0) +
          Number(updatedData.other_employees || 0);
      } else {
        updatedData[name] = value;
      }

      // Auto-fetch address for valid pincodes
      if (name === "pincode" && value.length === 6) {
        fetchAddressByPincode(value);
      }

      return updatedData;
    });


    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  // Handle file selection
  const handleFileChange = (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'application/pdf', 'application/msword'];

    if (validTypes.includes(file.type)) {
      setFormData((prev) => ({
        ...prev,
        [field]: file,
      }));
      setFormErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    } else {
      setFormErrors((prev) => ({
        ...prev,
        [field]: 'Invalid file type. Allowed types are .jpg, .pdf, and .doc.',
      }));
    }
  };

  // Validate form before submission
  const validateForm = () => {
    let errors = {};
    const isEditing = !!formData.id;

    // Basic field validations
    const requiredFields = [
      { name: 'first_name', label: 'First Name' },
      { name: 'last_name', label: 'Last Name' },
      { name: 'designation', label: 'Designation' },
      { name: 'age', label: 'Age' },
      { name: 'door_no', label: 'Door No' },
      { name: 'locality', label: 'Locality' },
      { name: 'mandal', label: 'Mandal' },
      { name: 'village', label: 'Village' },
      { name: 'state', label: 'State' },
      { name: 'district', label: 'District' },
      { name: 'nature_of_business', label: 'Nature of Business' },
      { name: 'date_of_commencement', label: 'Date of Commencement' }
    ];

    // Check required fields
    requiredFields.forEach(field => {
      if (!formData[field.name]) {
        errors[field.name] = `${field.label} is required`;
      }
    });

    // Special validation for mobile number
    if (!formData.mobile_number) {
      errors.mobile_number = "Mobile Number is required";
    } else if (String(formData.mobile_number).length !== 10) {
      errors.mobile_number = "Mobile number must be exactly 10 digits!";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email ID is required";
    } else if (!formData.email.match(/^\S+@\S+\.\S+$/)) {
      errors.email = "Invalid email format!";
    }

    // Pincode validation
    if (!formData.pincode) {
      errors.pincode = "Pincode is required";
    } else if (!formData.pincode.match(/^\d{6}$/)) {
      errors.pincode = "Pincode must be exactly 6 digits!";
    }

    // Validate employee counts are non-negative
    ["male_employees", "female_employees", "other_employees"].forEach(field => {
      if (formData[field] < 0) {
        errors[field] = "Employee count cannot be negative";
      }
    });

    // File validation - handle differently for new vs edit
    if (!isEditing) {
      // New record - require all files
      if (!formData.pan_file) {
        errors.pan_file = "PAN is required";
      }
      if (!formData.aadhar_card_file) {
        errors.aadhar_card_file = "Aadhaar is required";
      }
      if (!formData.photos_of_employer) {
        errors.photos_of_employer = "Photos of employer is required";
      }
    } else {
      // Editing - only require files if they weren't previously uploaded
      if (!existingFiles.pan_file && !formData.pan_file) {
        errors.pan_file = "PAN is required";
      }
      if (!existingFiles.aadhar_card_file && !formData.aadhar_card_file) {
        errors.aadhar_card_file = "Aadhaar is required";
      }
      if (!existingFiles.photos_of_employer && !formData.photos_of_employer) {
        errors.photos_of_employer = "Photos of employer is required";
      }
    }

    return errors;
  };

  // Save form data
  const handleSave = async () => {
    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    // Prepare form data for submission
    const data = new FormData();
    if (id) {
      data.append("license", id);
    }

    // Add basic text fields
    const textFields = [
      "first_name", "middle_name", "last_name", "designation", "age",
      "mobile_number", "email", "nature_of_business", "date_of_commencement"
    ];

    textFields.forEach(field => {
      data.append(field, formData[field]);
    });

    // Only append files if they are selected (for new records or if updated)
    if (formData.pan_file instanceof File) {
      data.append("pan_file", formData.pan_file);
    }
    if (formData.aadhar_card_file instanceof File) {
      data.append("aadhar_card_file", formData.aadhar_card_file);
    }
    if (formData.photos_of_employer instanceof File) {
      data.append("photos_of_employer", formData.photos_of_employer);
    }

    // Create address object
    const addressData = {
      door_no: formData.door_no,
      locality: formData.locality,
      district: formData.district,
      mandal: formData.mandal,
      village: formData.village,
      state: formData.state,
      pincode: formData.pincode
    };

    // Create employees object - ensure all values are non-negative
    const employeesData = {
      male_employees: Math.max(0, Number(formData.male_employees) || 0),
      female_employees: Math.max(0, Number(formData.female_employees) || 0),
      other_employees: Math.max(0, Number(formData.other_employees) || 0),
      total_employees: Math.max(0, Number(formData.total_employees) || 0)
    };

    // Stringify objects for API
    data.append("address_of_employer", JSON.stringify(addressData));
    data.append("total_employees", JSON.stringify(employeesData));

    try {
      let response;

      if (formData.id) {
        console.log("Updating existing employer with ID:", formData.id);
        response = await axios.put(`${API_BASE_URL}/labourlicense/employers/${id}/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        if (response.status === 201 || response.status === 200) {
          console.log("Form saved successfully:", response.data);
          router.push(`/labour/screen4?id=${id}`);
        }
      } else {
        console.log("Creating new employer");
        response = await axios.post(`${API_BASE_URL}/labourlicense/employers/`, data, {
          headers: {
            'Content-Type': 'multipart/form-data',
          }
        });
        if (response.status === 201 || response.status === 200) {
          console.log("Form saved successfully:", response.data);
          router.push(`/labour/screen4?id=${id}`);
        }
      }


    } catch (error) {
      console.error("Error saving employer details:", error.response?.data || error.message);
      alert(`Failed to save data: ${error.response?.data?.message || "Please try again."}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle navigation to previous page
  const handlePrevious = () => {
    // Navigate to the previous page
    navigate(`/labour/screen2${id ? `?id=${id}` : ''}`);
  };

  // Loading indicator
  if (loading && !pincodeLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  // Render file upload component - FIXED to properly display existing files
  const renderFileUpload = (label, fieldName) => {
    const hasExistingFile = existingFiles[fieldName];
    const hasNewFile = !!formData[fieldName];
    const fileUrl = formData[`${fieldName}_url`];
    const errorMessage = formErrors[fieldName];

    return (
      <>
        <Box flex={1} sx={{ display: "flex", alignItems: "center" }}>
          <FormLabel>{label} <span style={{ color: 'red' }}>*</span></FormLabel>
          <Button
            variant="contained"
            component="label"
            startIcon={<CloudUploadIcon />}
            sx={{ marginLeft: fieldName === "photos_of_employer" ? 9 : 19.5 }}
          >
            {hasExistingFile ? "Replace" : "Upload"}
            <input
              type="file"
              name={fieldName}
              accept=".jpg,.doc,.pdf"
              hidden
              onChange={(e) => handleFileChange(e, fieldName)}
            />
          </Button>
          {/* Show filename of either new file or existing file */}
          {(hasNewFile || (hasExistingFile && fileUrl)) && (
            <Typography
              variant="body2"
              sx={{ marginLeft: 2 }}
            >
              {hasNewFile ? formData[fieldName].name :
                (hasExistingFile && fileUrl) ? getFilenameFromUrl(fileUrl) : ""}
            </Typography>
          )}
        </Box>
        {errorMessage && <Box sx={{ color: "red", fontSize: "19px", marginLeft: "100px" }}>{errorMessage}</Box>}
      </>
    );
  };

  return (
    <Box sx={{ width: 700, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2, borderColor: "grey.400", }}>
      <Typography variant="h6" component="legend" sx={{ mb: 3, textAlign: "center" }}>
        Employer, Managing Partner (or) Managing Director
      </Typography>
      <Stack spacing={2}>
        {/* First Name, Middle Name, Last Name */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>First Name <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.first_name}
              helperText={formErrors.first_name}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Middle Name</FormLabel>
            <TextField
              size="small"
              name="middle_name"
              value={formData.middle_name}
              onChange={handleChange}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Last Name <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.last_name}
              helperText={formErrors.last_name}
            />
          </Box>
        </Stack>

        {/* Designation, Age */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Designation <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="designation"
              value={formData.designation}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.designation}
              helperText={formErrors.designation}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Age <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="age"
              type="number"
              value={formData.age}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.age}
              helperText={formErrors.age}
              inputProps={{ min: 0 }}
            />
          </Box>
        </Stack>

        {/* Mobile Number, Email */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Mobile Number <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.mobile_number}
              helperText={formErrors.mobile_number}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Email ID <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
          </Box>
        </Stack>

        {/* Upload Documents */}
        <FormLabel component="legend">Upload Documents</FormLabel>
        <Stack direction="column" spacing={2}>
          {renderFileUpload("PAN File", "pan_file")}
          {renderFileUpload("Aadhaar", "aadhar_card_file")}
          {renderFileUpload("Photos of Employer", "photos_of_employer")}
        </Stack>

        {/* Residential Address */}
        <FormLabel component="legend">Residential Address of the Employer</FormLabel>
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Door No <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="door_no"
              value={formData.door_no}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.door_no}
              helperText={formErrors.door_no}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Locality <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="locality"
              value={formData.locality}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.locality}
              helperText={formErrors.locality}
            />
          </Box>
        </Stack>

        {/* Pincode and Village */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Pincode <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.pincode}
              helperText={formErrors.pincode}
              InputProps={{
                endAdornment: pincodeLoading ? <CircularProgress size={20} /> : null
              }}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Village <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="village"
              value={formData.village}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.village}
              helperText={formErrors.village}
            />
          </Box>
        </Stack>

        {/* Mandal, District */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Mandal <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="mandal"
              value={formData.mandal}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.mandal}
              helperText={formErrors.mandal}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>District <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="district"
              value={formData.district}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.district}
              helperText={formErrors.district}
            />
          </Box>
        </Stack>

        {/* State */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>State <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="state"
              value={formData.state}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.state}
              helperText={formErrors.state}
            />
          </Box>
        </Stack>

        {/* Nature of Business */}
        <FormLabel>Nature of Business <span style={{ color: 'red' }}>*</span></FormLabel>
        <TextField
          size="small"
          name="nature_of_business"
          value={formData.nature_of_business}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.nature_of_business}
          helperText={formErrors.nature_of_business}
        />

        {/* Date of Commencement */}
        <FormLabel>Date of Commencement of Business <span style={{ color: 'red' }}>*</span></FormLabel>
        <TextField
          size="small"
          name="date_of_commencement"
          type="date"
          value={formData.date_of_commencement}
          onChange={handleChange}
          fullWidth
          error={!!formErrors.date_of_commencement}
          helperText={formErrors.date_of_commencement}
        />

        {/* Number of Employees */}
        <FormLabel>Number of Employees <span style={{ color: 'red' }}>*</span></FormLabel>
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>Male</FormLabel>
            <TextField
              size="small"
              name="male_employees"
              type="number"
              value={formData.male_employees}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.male_employees}
              helperText={formErrors.male_employees}
              inputProps={{ min: 0 }}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Female</FormLabel>
            <TextField
              size="small"
              name="female_employees"
              type="number"
              value={formData.female_employees}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.female_employees}
              helperText={formErrors.female_employees}
              inputProps={{ min: 0 }}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Other</FormLabel>
            <TextField
              size="small"
              name="other_employees"
              type="number"
              value={formData.other_employees}
              onChange={handleChange}
              fullWidth
              error={!!formErrors.other_employees}
              helperText={formErrors.other_employees}
              inputProps={{ min: 0 }}
            />
          </Box>
        </Stack>

        {/* Total Employees */}
        <FormLabel>Total Employees: {formData.total_employees}</FormLabel>
      </Stack>

      <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrevious}
          disabled={loading}
        >
          Previous
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Save & Next'}
        </Button>
      </Box>
    </Box>
  );
};

export default NextPage2;