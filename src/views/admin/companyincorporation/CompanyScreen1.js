"use client";

import {
  Alert,
  Box,
  Button,
  FormControl,
  Select,
  MenuItem,
  FormLabel,
  CircularProgress,
  TextField,
  Typography,
  Stack,
  TextareaAutosize,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import axios from "axios";

const CompanyScreen1 = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const id = searchParams.get("id");
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [initialData, setInitialData] = useState(null);

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

  const COMPANY_TYPE_CHOICES = [
    { value: "private limited", label: "Private Limited Company" },
    { value: "foreign company", label: "Foreign Company" },
    { value: "llp", label: "LLP" },
    { value: "public limited", label: "Public Limited Company" },
    { value: "section8", label: "Section 8 Company" },
    { value: "one person", label: "One-Person Company" },
    { value: "government company", label: "Government Company" },
    { value: "any other", label: "Any Other" },
  ];

  const OWNERSHIP_TYPE_CHOICES = [
    { value: "owned", label: "Owned" },
    { value: "rented", label: "Rented" },
    { value: "leased", label: "Leased" },
  ];

  const [formData, setFormData] = useState({
    company_type: "",
    option1: "",
    option2: "",
    option3: "",
    business_objective: "",
    business_activity: "",
    nic_code: "",
    address1: "",
    address2: "",
    ownership_type: "",
    city: "",
    state: "",
    pincode: "",
    email: "",
    mobile_number: "",
    utility_bill: null,
    noc: null,
    rental_agreement: null,
    property_tax: null,
  });

  const [fileNames, setFileNames] = useState({
    utility_bill: "",
    noc: "",
    rental_agreement: "",
    property_tax: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isPincodeLoading, setIsPincodeLoading] = useState(false);
  const fetchPincodeData = async (pincode) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return;  // Ensure valid pincode format

    setIsPincodeLoading(true);
    try {
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
        const postOffice = data[0].PostOffice[0];

        setFormData((prev) => ({
          ...prev,
          city: postOffice.Block || postOffice.Name,
          state: postOffice.State,
        }));
      } else {
        alert("Invalid Pincode or no data available.");
        setFormData((prev) => ({
          ...prev,
          city: "",
          state: "",
        }));
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
    } finally {
      setIsPincodeLoading(false);
    }
  };

  // Fetch data if ID is provided
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://192.168.1.20:8000/companyincorporation/company/${id}/`);

          if (response.status === 200 && response.data) {
            const data = response.data;

            // Parse address if it's a JSON string
            let addressData = {};
            if (typeof data.address === 'string') {
              try {
                addressData = JSON.parse(data.address);
              } catch (e) {
                console.error("Error parsing address JSON:", e);
                addressData = {};
              }
            } else if (typeof data.address === 'object') {
              addressData = data.address;
            }

            setFormData({
              company_type: data.company_type || "",
              option1: data.option1 || "",
              option2: data.option2 || "",
              option3: data.option3 || "",
              business_objective: data.business_objective || "",
              business_activity: data.business_activity || "",
              nic_code: data.nic_code || "",
              address1: addressData.address1 || "",
              address2: addressData.address2 || "",
              ownership_type: data.ownership_type || "",
              city: addressData.city || "",
              state: addressData.state || "",
              pincode: addressData.pincode || "",
              email: data.email || "",
              mobile_number: data.mobile_number || "",
              utility_bill: data.utility_bill ? data.utility_bill.split('/').pop() : null,
              noc: data.noc ? data.noc.split('/').pop() : null,
              rental_agreement: data.rental_agreement ? data.rental_agreement.split('/').pop() : null,
              property_tax: data.property_tax ? data.property_tax.split('/').pop() : null,
            });

            // Set file names if files exist
            setFileNames({
              utility_bill: data.utility_bill ? getFileNameFromUrl(data.utility_bill) : "",
              noc: data.noc ? getFileNameFromUrl(data.noc) : "",
              rental_agreement: data.rental_agreement ? getFileNameFromUrl(data.rental_agreement) : "",
              property_tax: data.property_tax ? getFileNameFromUrl(data.property_tax) : "",
            });

            setInitialData({ ...data, addressData });
          }
        } catch (error) {
          console.error("Error fetching company data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  // Helper function to extract filename from URL
  const getFileNameFromUrl = (url) => {
    if (!url) return "";
    const parts = url.split('/');
    return parts[parts.length - 1];
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fieldName = e.target.name;

    if (file && file.size / (1024 * 1024) > 5) {
      alert("File size must be less than 5MB!");
      e.target.value = "";
    } else {
      setFormData({ ...formData, [fieldName]: file });
      setFileNames({ ...fileNames, [fieldName]: file ? file.name : "" });
      setIsEditing(true);
    }
  };

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateMobile = (number) => /^[6-9]\d{9}$/.test(number);

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "mobile_number" && !/^\d{0,10}$/.test(value)) return;

    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
    setIsEditing(true);
    if (name === "pincode" && value.length === 6 && /^\d{6}$/.test(value)) {
      fetchPincodeData(value);
    }
  };

  const validateForm = () => {
    let errors = {};
    if (!formData.company_type) errors.company_type = "This field is required";
    if (!formData.option1) errors.option1 = "This field is required";
    if (!formData.option2) errors.option2 = "This field is required";
    if (!formData.option3) errors.option3 = "This field is required";
    if (!formData.business_objective) errors.business_objective = "This field is required";
    if (!formData.business_activity) errors.business_activity = "This field is required";
    if (!formData.nic_code) errors.nic_code = "This field is required";
    if (!formData.address1) errors.address1 = "This field is required";
    if (!formData.ownership_type) errors.ownership_type = "This field is required";
    if (!formData.city) errors.city = "This field is required";
    if (!formData.state) errors.state = "This field is required";
    if (!formData.pincode) errors.pincode = "This field is required";
    if (!formData.email) errors.email = "This field is required";
    if (!formData.mobile_number) errors.mobile_number = "This field is required";

    // Only validate file fields if this is a new submission or if file not already present
    if (!id) {
      if (!formData.utility_bill && !fileNames.utility_bill) errors.utility_bill = "This field is required";
      if (!formData.noc && !fileNames.noc) errors.noc = "This field is required";
      if (!formData.rental_agreement && !fileNames.rental_agreement) errors.rental_agreement = "This field is required";
      if (!formData.property_tax && !fileNames.property_tax) errors.property_tax = "This field is required";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!validateEmail(formData.email)) {
      errors.email = "Invalid email format";
    }

    if (!formData.mobile_number) {
      errors.mobile_number = "Mobile number is required";
    } else if (!validateMobile(formData.mobile_number)) {
      errors.mobile_number = "Invalid mobile number (10 digits starting with 6-9)";
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const formDataToSend = new FormData();

    // Append all text fields
    Object.keys(formData).forEach((key) => {
      if (
        key !== "utility_bill" &&
        key !== "noc" &&
        key !== "rental_agreement" &&
        key !== "property_tax" &&
        key !== "address1" &&
        key !== "address2" &&
        key !== "pincode" &&
        key !== "city" &&
        key !== "state"
      ) {
        formDataToSend.append(key, formData[key]);
      }
    });

    // Convert address fields into JSON format
    const addressData = JSON.stringify({
      address1: formData.address1,
      address2: formData.address2,
      pincode: formData.pincode,
      city: formData.city,
      state: formData.state,
    });
    formDataToSend.append("address", addressData);

    // Only append files if they've been selected
    // Only append files if they've been selected or if they exist and haven't been changed
    if (formData.utility_bill instanceof File) {
      formDataToSend.append("utility_bill", formData.utility_bill);
    }

    if (formData.noc instanceof File) {
      formDataToSend.append("noc", formData.noc);
    }

    if (formData.rental_agreement instanceof File) {
      formDataToSend.append("rental_agreement", formData.rental_agreement);
    }

    if (formData.property_tax instanceof File) {
      formDataToSend.append("property_tax", formData.property_tax);
    }

    try {
      let response;

      if (id && initialData) {
        // Update existing record
        response = await axios.put(
          `http://192.168.1.20:8000/companyincorporation/company/${id}/`,
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      } else {
        // Create new record
        response = await axios.post(
          "http://192.168.1.20:8000/companyincorporation/company/create/",
          formDataToSend,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }

      if ((response.status === 200 || response.status === 201) && response.data) {
        // Navigate to the next screen with the ID
        const nextId = response.data.id || id;
        router.push(`/companyincorporation/screen2?id=${nextId}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Handle API errors
      if (error.response && error.response.data) {
        const apiErrors = error.response.data;
        const formattedErrors = {};

        // Format API errors to match our form fields
        Object.keys(apiErrors).forEach(key => {
          formattedErrors[key] = Array.isArray(apiErrors[key])
            ? apiErrors[key].join(', ')
            : apiErrors[key];
        });

        setFormErrors({ ...formErrors, ...formattedErrors });
      }
    }
  };

  const requiredAsterisk = (
    <span style={{ color: "red", marginLeft: 2 }}>*</span>
  );

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading ...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 800,
        margin: "auto",
        mt: 3,
        mb: 3,
        p: 3,
        border: "1px solid",
        borderRadius: 5,
        borderColor: "grey.400",
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h6" align="center" gutterBottom>
        Company Incorporation
      </Typography>

      {Object.keys(formErrors).length > 0 && (
        <Alert severity="warning">Please fill in all required fields.</Alert>
      )}

      {/* Company Type */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <FormLabel>Company Type {requiredAsterisk}</FormLabel>
        <Select
          size="small"
          name="company_type"
          value={formData.company_type}
          onChange={handleChange}
          displayEmpty
          error={!!formErrors.company_type}
        >
          <MenuItem value="" disabled>
            Select
          </MenuItem>
          {COMPANY_TYPE_CHOICES.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
        {formErrors.company_type && (
          <Typography color="error">{formErrors.company_type}</Typography>
        )}
      </FormControl>

      {/* Proposed Company Names */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Proposed Company Names {requiredAsterisk}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        {["option1", "option2", "option3"].map((option, index) => (
          <FormControl fullWidth key={option}>
            <FormLabel>{`Option ${index + 1}`}</FormLabel>
            <TextField
              size="small"
              name={option}
              value={formData[option] || ""}
              onChange={handleChange}
              error={!!formErrors[option]}
              helperText={formErrors[option]}
            />
          </FormControl>
        ))}
      </Stack>

      {/* Business Objectives */}
      <FormControl fullWidth sx={{ mt: 2 }}>
        <FormLabel>Business Objectives {requiredAsterisk}</FormLabel>
        <TextareaAutosize
          minRows={3}
          name="business_objective"
          value={formData.business_objective}
          onChange={handleChange}
          style={{ width: "100%", padding: 10, borderRadius: 4, borderColor: "#ccc" }}
        />
      </FormControl>

      {/* Business Activity & NIC Code */}
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        {/* Business Activity Field */}
        <FormControl fullWidth>
          <FormLabel>Business Activity {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="business_activity"
            value={formData.business_activity}
            onChange={handleChange}
            error={!!formErrors.business_activity}
            helperText={formErrors.business_activity}
          />
        </FormControl>

        {/* NIC Code Field */}
        <FormControl fullWidth>
          <FormLabel>NIC Code {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="nic_code"
            value={formData.nic_code}
            onChange={handleChange}
            error={!!formErrors.nic_code}
            helperText={formErrors.nic_code}
          />
        </FormControl>
      </Stack>



      {/* Address Fields */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Registered Office Address {requiredAsterisk}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        {/* Address Line 1 */}
        <FormControl fullWidth>
          <FormLabel>Address Line 1 {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="address1"
            value={formData.address1}
            onChange={handleChange}
            error={!!formErrors.address1}
            helperText={formErrors.address1}
          />
        </FormControl>

        {/* Ownership Type */}
        <FormControl fullWidth>
          <FormLabel>Ownership Type {requiredAsterisk}</FormLabel>
          <Select
            size="small"
            name="ownership_type"
            value={formData.ownership_type}
            onChange={handleChange}
            displayEmpty
            error={!!formErrors.ownership_type}
          >
            <MenuItem value="" disabled>
              Select Ownership Type
            </MenuItem>
            {OWNERSHIP_TYPE_CHOICES.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <FormControl fullWidth sx={{ mt: 1 }}>
        <FormLabel>Address Line 2 {requiredAsterisk}</FormLabel>
        <TextField
          size="small"
          name="address2"
          value={formData.address2}
          onChange={handleChange}
          error={!!formErrors.address2}
          helperText={formErrors.address2}
        />
      </FormControl>


      {/* City, State, Pincode */}
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        {/* Pincode Field */}
        <FormControl fullWidth>
          <FormLabel>Pin Code {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="pincode"
            value={formData.pincode}
            onChange={handleChange}
            error={!!formErrors.pincode}
            helperText={formErrors.pincode}
            InputProps={{
              endAdornment: isPincodeLoading ? <CircularProgress size={20} /> : null
            }}
          />
        </FormControl>

        {/* City Field */}
        <FormControl fullWidth>
          <FormLabel>City {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="city"
            value={formData.city}
            onChange={handleChange}


          />
        </FormControl>

        {/* State Field */}
        <FormControl fullWidth>
          <FormLabel>State {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="state"
            value={formData.state}
            onChange={handleChange}


          />
        </FormControl>
      </Stack>



      {/* Email & Mobile Number */}
      <Typography variant="h6" sx={{ mt: 2 }}>
        Company Contact Details {requiredAsterisk}
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
        {/* Email Field */}
        <FormControl fullWidth>
          <FormLabel>Email {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={!!formErrors.email}
            helperText={formErrors.email}
          />
        </FormControl>

        {/* Mobile Number Field */}
        <FormControl fullWidth>
          <FormLabel>Mobile Number {requiredAsterisk}</FormLabel>
          <TextField
            size="small"
            name="mobile_number"
            type="text"
            value={formData.mobile_number}
            onChange={handleChange}
            error={!!formErrors.mobile_number}
            helperText={formErrors.mobile_number}
          />
        </FormControl>
      </Stack>

      <Typography variant="h6" sx={{ mt: 2 }}>
        Address Proof Upload {requiredAsterisk}
      </Typography>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1, mb: 1 }}>
        <Typography variant="h6">Utility Bill:</Typography>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Photo
          <VisuallyHiddenInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            name="utility_bill"
            error={!!formErrors.utility_bill}
            helperText={formErrors.utility_bill}
          />
        </Button>
      </Stack>
      {fileNames.utility_bill && <Typography align="right">{fileNames.utility_bill}</Typography>}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3, mb: 1 }}>
        <Typography variant="h6">NOC:</Typography>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Photo
          <VisuallyHiddenInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            name="noc"
            error={!!formErrors.noc}
            helperText={formErrors.noc}
          />
        </Button>
      </Stack>
      {fileNames.noc && <Typography align="right">{fileNames.noc}</Typography>}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3, mb: 1 }}>
        <Typography variant="h6">Rental Agreement:</Typography>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Photo
          <VisuallyHiddenInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            name="rental_agreement"
            error={!!formErrors.rental_agreement}
            helperText={formErrors.rental_agreement}
          />
        </Button>
      </Stack>
      {fileNames.rental_agreement && <Typography align="right">{fileNames.rental_agreement}</Typography>}

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 3, mb: 1 }}>
        <Typography variant="h6">Property Tax Receipt:</Typography>
        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
          Upload Photo
          <VisuallyHiddenInput
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
            name="property_tax"
            error={!!formErrors.property_tax}
            helperText={formErrors.property_tax}
          />
        </Button>
      </Stack>
      {fileNames.property_tax && <Typography align="right">{fileNames.property_tax}</Typography>}

      {/* Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button type="submit" variant="contained">
          Save & continue
        </Button>
      </Box>
    </Box>
  );
};


export default CompanyScreen1;