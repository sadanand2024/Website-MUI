"use client";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Typography,
  Select,
  MenuItem,
  TextField,
  FormLabel,
  Stack,
  RadioGroup,
  Radio,
  FormControlLabel,
  Paper,
  Chip,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import * as yup from 'yup';  // Importing yup for form validation schema

const MSMEForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);

  // Extract ID from URL query parameters


  // Styled component for hidden file input
  const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
  });

  // Define organization type choices
  const ORGANIZATION_TYPE_CHOICES = [
    { value: "Sole Proprietorship", label: "Sole Proprietorship" },
    { value: "Freelancer/Independent Contractor", label: "Freelancer/Independent Contractor" },
    { value: "Home-Based Business", label: "Home-Based Business" },
    { value: "General Partnership (GP)", label: "General Partnership (GP)" },
    { value: "Limited Partnership (LP)", label: "Limited Partnership (LP)" },
    { value: "Limited Liability Partnership (LLP)", label: "Limited Liability Partnership (LLP)" },
    { value: "Joint Venture", label: "Joint Venture" },
    { value: "Private Limited Company (Pvt Ltd)", label: "Private Limited Company (Pvt Ltd)" },
    { value: "One Person Company (OPC)", label: "One Person Company (OPC)" },
    { value: "Small and Medium Enterprise (SME)", label: "Small and Medium Enterprise (SME)" },
    { value: "Public Limited Company (PLC)", label: "Public Limited Company (PLC)" },
    { value: "Listed Company (Stock Exchange Registered)", label: "Listed Company (Stock Exchange Registered)" },
    { value: "Unlisted Public Company", label: "Unlisted Public Company" },
    { value: "Government-Owned Enterprise", label: "Government-Owned Enterprise" },
    { value: "Public Sector Undertaking (PSU)", label: "Public Sector Undertaking (PSU)" },
    { value: "Municipal Corporation Business", label: "Municipal Corporation Business" },
    { value: "Non-Governmental Organization (NGO)", label: "Non-Governmental Organization (NGO)" },
    { value: "Trust", label: "Trust" },
    // Additional organization types can be added here
  ];
  const [isNextEnabled, setIsNextEnabled] = useState(false);

  // State for form data
  const [formData, setFormData] = useState({
    id: id || "",
    aadhar_number: "",
    name_of_entrepreneur: "",
    type_of_organisation: "",
    pan_number: "",
    pan_number_holder_name: "",
    dob: "",
    itr_previous_year: "",
    have_GSTIN: "",
    mobile_number: "",
    email: "",
    name_of_the_enterprise: "",
  });

  // State for form errors
  const [formErrors, setFormErrors] = useState({});

  // Fetch data if ID is available
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setLoading(true);
        try {
          const response = await axios.get(`http://192.168.1.20:8000/msmeregister/msme/${id}/`);
          if (response.status === 200 && response.data) {
            setFormData(response.data);
          }
        } catch (error) {
          console.error("Error fetching MSME data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  // Loading screen
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading ...</Typography>
      </Box>
    );
  }

  // Required field indicator
  const requiredAsterisk = (
    <span style={{ color: "red", marginLeft: 2 }}>*</span>
  );

  // Validation functions
  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validatemobile_number = (number) => /^[6-9]\d{9}$/.test(number);

  const validateaadhar_number = (aadhar_number) => /^[0-9]{12}$/.test(aadhar_number);

  const validatepan_number = (pan_number) => /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan_number);

  // Handle input change for text fields
  const handleChange = (event) => {
    const { name, value } = event.target;

    // Validate mobile_number number input to allow only numbers and limit to 10 digits
    if (name === "mobile_number" && !/^\d{0,10}$/.test(value)) return;

    // Validate aadhar_number input to allow only numbers and limit to 12 digits
    if (name === "aadhar_number" && !/^\d{0,12}$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  // Form submission handler
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Validation
    let errors = {};
    if (!formData.aadhar_number) errors.aadhar_number = "aadhar_number is required";
    else if (!validateaadhar_number(formData.aadhar_number)) errors.aadhar_number = "Please enter a valid 12-digit aadhar_number number";

    if (!formData.name_of_entrepreneur) errors.name_of_entrepreneur = "Name is required";
    if (!formData.type_of_organisation) errors.type_of_organisation = "Type of organization is required";

    if (!formData.pan_number) errors.pan_number = "Pan_number is required";
    else if (!validatepan_number(formData.pan_number)) errors.pan_number = "Invalid PAN format";

    if (!formData.pan_number_holder_name) errors.pan_number_holder_name = "Pan Holder Name is required";
    if (!formData.dob) errors.dob = "Date of Birth is required";
    if (!formData.itr_previous_year) errors.itr_previous_year = "This field is required";
    if (!formData.have_GSTIN) errors.have_GSTIN = "This field is required";

    if (!formData.mobile_number) errors.mobile_number = "mobile_number is required";
    else if (!validatemobile_number(formData.mobile_number)) errors.mobile_number = "Enter valid mobile_number (10 digits starting with 6-9)";

    if (!formData.email) errors.email = "Email is required";
    else if (!validateEmail(formData.email)) errors.email = "Invalid email format";

    if (!formData.name_of_the_enterprise) errors.name_of_the_enterprise = "Enterprise Name is required";

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setLoading(true);

    try {
      // Add a default value for official_address_of_enterprise if it's empty
      const dataToSend = {
        ...formData
      }

      let response;

      // If we have an ID, update the existing record with PUT, otherwise create a new one with POST
      if (id) {
        const dataToSend = {
          ...formData,
          official_address_of_enterprise: formData.official_address_of_enterprise || ""
        };
        response = await axios.put(`http://192.168.1.20:8000/msmeregister/msme/${id}/`, dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
      } else {
        response = await axios.post("http://192.168.1.20:8000/msmeregister/msme/", dataToSend, {
          headers: { "Content-Type": "application/json" },
        });
      }

      if ((response.status === 200 || response.status === 201) && response.data) {
        setFormData((prevData) => ({
          ...prevData,
          id: response.data.id,
        }));

        router.push(`/msme/screen2?id=${response.data.id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      if (error.response) {
        console.error("Server error response:", error.response.data);
        alert(`Submission error: ${JSON.stringify(error.response.data)}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        width: 800,
        marginTop: 3,
        marginLeft: "auto",
        marginRight: "auto",
        marginBottom: 3,
        padding: 3,
        border: "1px solid",
        borderRadius: 5,
        borderColor: "grey.400",
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        sx={{
          padding: "10px",
          borderRadius: "4px",
          fontFamily: "'Archivo', sans-serif"
        }}
      >
        MSME Registration
      </Typography>

      {/* ID Display */}


      {Object.keys(formErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          Please fill in all required fields correctly.
        </Alert>
      )}

      {/* aadhar_number Number */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Aadhar Number {requiredAsterisk}
      </FormLabel>
      <TextField
        fullWidth
        size="small"
        name="aadhar_number"
        value={formData.aadhar_number}
        onChange={handleChange}
        error={!!formErrors.aadhar_number}
        helperText={formErrors.aadhar_number}
        sx={{ mt: 1, mb: 2 }}
      />

      {/* Name of Entrepreneur */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Name of Entrepreneur {requiredAsterisk}
      </FormLabel>
      <TextField
        fullWidth
        size="small"
        name="name_of_entrepreneur"
        placeholder="As per Aadhar"
        value={formData.name_of_entrepreneur}
        onChange={handleChange}
        error={!!formErrors.name_of_entrepreneur}
        helperText={formErrors.name_of_entrepreneur}
        sx={{ mt: 1, mb: 2 }}
      />

      {/* Type of Organization */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Type of Organization {requiredAsterisk}
      </FormLabel>
      <FormControl fullWidth sx={{ mt: 1 }}>
        <Select
          size="small"
          name="type_of_organisation"
          value={formData.type_of_organisation}
          onChange={handleChange}
          displayEmpty
          error={!!formErrors.type_of_organisation}
        >
          <MenuItem value="" disabled>--Select--</MenuItem>
          {ORGANIZATION_TYPE_CHOICES.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ fontSize: "14px", padding: "5px 10px" }}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {formErrors.type_of_organisation && (
        <FormLabel color="error">{formErrors.type_of_organisation}</FormLabel>
      )}

      {/* pan_number and pan_number Holder Name */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        <Box sx={{ width: "50%" }}>
          <FormLabel variant="h6">
            PAN {requiredAsterisk}
          </FormLabel>
          <TextField
            fullWidth
            size="small"
            name="pan_number"
            value={formData.pan_number}
            onChange={handleChange}
            error={!!formErrors.pan_number}
            helperText={formErrors.pan_number}
            sx={{ mt: 1, mb: 2 }}
          />
        </Box>
        <Box sx={{ width: "50%" }}>
          <FormLabel variant="h6">
            Name of Pan Holder {requiredAsterisk}
          </FormLabel>
          <TextField
            fullWidth
            size="small"
            name="pan_number_holder_name"
            value={formData.pan_number_holder_name}
            onChange={handleChange}
            error={!!formErrors.pan_number_holder_name}
            helperText={formErrors.pan_number_holder_name}
            sx={{ mt: 1 }}
          />
        </Box>
      </Stack>

      {/* Date of Birth */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Date of Birth (As per PAN) {requiredAsterisk}
      </FormLabel>
      <TextField
        fullWidth
        size="small"
        type="date"
        name="dob"
        value={formData.dob}
        onChange={handleChange}
        error={!!formErrors.dob}
        helperText={formErrors.dob}
        sx={{ mt: 1, mb: 2 }}
      />

      {/* ITR Filed */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Have you filed ITR for the previous year? {requiredAsterisk}
      </FormLabel>
      <RadioGroup
        row
        name="itr_previous_year"
        value={formData.itr_previous_year}
        onChange={handleChange}
        sx={{ mt: 1 }}
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
      </RadioGroup>
      {formErrors.itr_previous_year && (
        <FormLabel color="error">{formErrors.itr_previous_year}</FormLabel>
      )}

      {/* have_GSTIN */}
      <FormLabel variant="h6" sx={{ mt: .5 }}>
        Do you have have GSTIN? {requiredAsterisk}
      </FormLabel>
      <RadioGroup
        row
        name="have_GSTIN"
        value={formData.have_GSTIN}
        onChange={handleChange}
        sx={{ mt: 1 }}
      >
        <FormControlLabel value="yes" control={<Radio />} label="Yes" />
        <FormControlLabel value="no" control={<Radio />} label="No" />
        <FormControlLabel value="exempted" control={<Radio />} label="Exempted" />
      </RadioGroup>
      {formErrors.have_GSTIN && (
        <FormLabel color="error">{formErrors.have_GSTIN}</FormLabel>
      )}

      {/* Contact Details */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Contact Details {requiredAsterisk}
      </FormLabel>
      <Stack direction="row" spacing={2} sx={{ mt: 1, mb: 2 }}>
        <Box sx={{ width: "50%" }}>
          <FormLabel variant="h6">
            Mobile number {requiredAsterisk}
          </FormLabel>
          <TextField
            fullWidth
            size="small"
            name="mobile_number"
            placeholder="Mobile Number"
            value={formData.mobile_number}
            onChange={handleChange}
            error={!!formErrors.mobile_number}
            helperText={formErrors.mobile_number}
          />
        </Box>
        <Box sx={{ width: "50%" }}>
          <FormLabel variant="h6">
            Email {requiredAsterisk}
          </FormLabel>
          <TextField
            fullWidth
            size="small"
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          /></Box>
      </Stack>

      {/* Enterprise Name */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        Name of Enterprise {requiredAsterisk}
      </FormLabel>
      <TextField
        fullWidth
        size="small"
        name="name_of_the_enterprise"
        value={formData.name_of_the_enterprise}
        onChange={handleChange}
        error={!!formErrors.name_of_the_enterprise}
        helperText={formErrors.name_of_the_enterprise}
        sx={{ mt: 1 }}
      />

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <CircularProgress size={24} color="inherit" sx={{ mr: 1 }} />
              Processing...
            </>
          ) : (
            id ? "Update & Next" : "Save & Next"
          )}
        </Button>
      </Box>
    </Box>
  );
};

export default MSMEForm;