"use client";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import axios from "axios";

// NIC data is kept outside the component since it's static
const nicData = {
  "2Digit": [
    { code: "01", description: "Agriculture, Forestry and Fishing" },
    { code: "10", description: "Manufacture of Food Products" },
    { code: "21", description: "Manufacture of Pharmaceuticals" },
    { code: "45", description: "Wholesale and Retail Trade" },
    { code: "62", description: "Computer Programming and Consultancy" },
    { code: "05", description: "Fishing and Aquaculture" },
    { code: "14", description: "Mining of Metal Ores" },
    { code: "25", description: "Manufacture of Fabricated Metal Products" },
    { code: "33", description: "Repair and Installation of Machinery" },
    { code: "85", description: "Education" }
  ],
  "4Digit": [
    { code: "0111", description: "Growing of Cereals" },
    { code: "1030", description: "Processing and Preserving of Fruit and Vegetables" },
    { code: "2100", description: "Manufacture of Pharmaceuticals, Medicinal Chemicals" },
    { code: "4520", description: "Maintenance and Repair of Motor Vehicles" },
    { code: "6201", description: "Software Development" },
    { code: "0510", description: "Fishing in Ocean and Inland Waters" },
    { code: "1410", description: "Mining of Iron Ores" },
    { code: "2510", description: "Manufacture of Structural Metal Products" },
    { code: "3312", description: "Repair of Machinery" },
    { code: "8510", description: "Pre-Primary and Primary Education" }
  ],
  "5Digit": [
    { code: "01111", description: "Growing of Wheat" },
    { code: "10301", description: "Canning of Fruits and Vegetables" },
    { code: "21009", description: "Other Pharmaceuticals Manufacturing" },
    { code: "45201", description: "Repair of Motor Vehicles" },
    { code: "62011", description: "Custom Software Development" },
    { code: "05101", description: "Fishing on a Commercial Basis" },
    { code: "14101", description: "Mining of Hematite and Magnetite Ores" },
    { code: "25101", description: "Manufacture of Prefabricated Metal Buildings" },
    { code: "33121", description: "Repair and Maintenance of Pumps and Compressors" },
    { code: "85101", description: "Primary Education in Government Schools" }
  ]
};

const Lastpage = () => {
  const router = useRouter(); 
      const searchParams = useSearchParams();
      
      const id = searchParams.get("id");

  // Add loading state
  const [isLoading, setIsLoading] = useState(false);

  // Required field indicator
  const requiredAsterisk = (
    <span style={{ color: "red", marginLeft: 2 }}>*</span>
  );

  // Flattened form data structure - all fields at root level
  const [formData, setFormData] = useState({
    uam_number: "",
    dateOfIncorporation: "",
    businessCommenced: "no",
    dateOfCommencement: "",
    major_activity_of_unit: "",
    bankName: "",
    ifsc: "",
    accountNumber: "",
    natureOfBusiness: "",  // Added nature of business field
    nic2Digit: "",
    nic4Digit: "",
    nic5Digit: "",
    male: "0",
    female: "0",
    others: "0",
    total: "0"
  });

  // Form errors state
  const [formErrors, setFormErrors] = useState({});

  
  const [activeNicLevel, setActiveNicLevel] = useState(null);

  // Fetch existing data when component mounts
  useEffect(() => {
    // Function to fetch existing data
    const fetchMsmeData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const response = await axios.get(`http://192.168.1.20:8000/msmeregister/msme/${id}/`);
          if (response.status === 200) {
            const data = response.data;
          

            // Populate form data from API response
            setFormData({
              uam_number: data.uam_number || "",
              dateOfIncorporation: data.status?.dateOfIncorporation || "",
              businessCommenced: data.status?.businessCommenced || "no",
              dateOfCommencement: data.status?.dateOfCommencement || "",
              major_activity_of_unit: data.major_activity_of_unit || "",
              bankName: data.bank_details?.bankName || "",
              ifsc: data.bank_details?.ifsc || "",
              accountNumber: data.bank_details?.accountNumber || "",
              natureOfBusiness: data.nic_code?.natureOfBusiness || "",
              nic2Digit: data.nic_code?.nic2Digit || "",
              nic4Digit: data.nic_code?.nic4Digit || "",
              nic5Digit: data.nic_code?.nic5Digit || "",
              male: data.no_of_persons_employed?.male || "0",
              female: data.no_of_persons_employed?.female || "0",
              others: data.no_of_persons_employed?.others || "0",
              total: data.no_of_persons_employed?.total || "0"
            });

            // Set active NIC level based on loaded data
            if (data.nic_code?.nic5Digit) {
              setActiveNicLevel("5Digit");
            } else if (data.nic_code?.nic4Digit) {
              setActiveNicLevel("4Digit");
            } else if (data.nic_code?.nic2Digit) {
              setActiveNicLevel("2Digit");
            }
          }
        } catch (error) {
          console.error("Error fetching MSME data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchMsmeData();
  }, [id]); // This will run when the component mounts and whenever id changes



  // Calculate total employees whenever any of the employee counts change
  useEffect(() => {
    const male = parseInt(formData.male) || 0;
    const female = parseInt(formData.female) || 0;
    const others = parseInt(formData.others) || 0;

    setFormData(prev => ({
      ...prev,
      total: (male + female + others).toString()
    }));
  }, [formData.male, formData.female, formData.others]);
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading ...</Typography>
      </Box>
    );
  }
  // Handler for employee count fields to prevent negative values
  const handleEmployeeChange = (e) => {
    const { name, value } = e.target;
    // Only allow non-negative integer values
    if (parseInt(value) >= 0 || value === "") {
      setFormData(prev => ({
        ...prev,
        [name]: value === "" ? "0" : value
      }));
    }
  };

  // Handler for NIC code selection
  const handleNicChange = (e) => {
    const { name, value } = e.target;

    // Determine which NIC level is being selected
    let level = null;
    if (name === "nic2Digit") level = "2Digit";
    else if (name === "nic4Digit") level = "4Digit";
    else if (name === "nic5Digit") level = "5Digit";

    // Set the active NIC level
    setActiveNicLevel(level);

    // Clear other NIC values if selecting a different level
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    if (level === "2Digit") {
      updatedFormData.nic4Digit = "";
      updatedFormData.nic5Digit = "";
    } else if (level === "4Digit") {
      updatedFormData.nic2Digit = "";
      updatedFormData.nic5Digit = "";
    } else if (level === "5Digit") {
      updatedFormData.nic2Digit = "";
      updatedFormData.nic4Digit = "";
    }

    setFormData(updatedFormData);

    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  // Single handler for all other form fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const prepareFormData = () => {
    const status = {
      dateOfIncorporation: formData.dateOfIncorporation,
      businessCommenced: formData.businessCommenced,
      dateOfCommencement: formData.dateOfCommencement
    };

    const bank_details = {
      bankName: formData.bankName,
      ifsc: formData.ifsc,
      accountNumber: formData.accountNumber,
    };

    const nic_code = {
      natureOfBusiness: formData.natureOfBusiness,  // Include nature of business with NIC code
      nic2Digit: formData.nic2Digit,
      nic4Digit: formData.nic4Digit,
      nic5Digit: formData.nic5Digit
    };

    const no_of_persons_employed = {
      male: formData.male,
      female: formData.female,
      others: formData.others,
      total: formData.total
    };

    // Create FormData object
    const formDataObj = new FormData();

    // Add individual objects as JSON strings
    formDataObj.append("uam_number", formData.uam_number);
    formDataObj.append("status", JSON.stringify(status));
    formDataObj.append("major_activity_of_unit", formData.major_activity_of_unit);
    formDataObj.append("bank_details", JSON.stringify(bank_details));
    formDataObj.append("nic_code", JSON.stringify(nic_code));
    formDataObj.append("no_of_persons_employed", JSON.stringify(no_of_persons_employed));

    return formDataObj;
  };

  const validateForm = () => {
    let errors = {};

    if (!formData.uam_number) errors.uam_number = "UAM Registration Number is required";
    if (!formData.dateOfIncorporation) errors.dateOfIncorporation = "Date of Incorporation is required";
    if (formData.businessCommenced === "yes" && !formData.dateOfCommencement)
      errors.dateOfCommencement = "Date of Commencement is required";
    if (!formData.major_activity_of_unit) errors.major_activity_of_unit = "Major Activity is required";

    // Bank validation
    if (!formData.bankName) errors.bankName = "Bank Name is required";
    if (!formData.ifsc) errors.ifsc = "IFSC Code is required";
    else if (!/^[A-Z]{4}[0-9]{7}$/.test(formData.ifsc))
      errors.ifsc = "Invalid IFSC Code (Format: 4 letters + 7 digits)";

    if (!formData.accountNumber) errors.accountNumber = "Account Number is required";
    else if (!/^\d{6,18}$/.test(formData.accountNumber))
      errors.accountNumber = "Account number must be 6-18 digits";

    // Nature of Business validation
    if (!formData.natureOfBusiness) errors.natureOfBusiness = "Nature of Business is required";

    // Validate that at least one NIC code is selected
    if (!formData.nic2Digit && !formData.nic4Digit && !formData.nic5Digit) {
      errors.nicCode = "At least one NIC code must be selected";
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      const formDataToSubmit = prepareFormData();

      // Log submission data for debugging
      console.log("Submitting to URL:", `http://192.168.1.20:8000/msmeregister/msme/${id}/`);
      console.log("Form data being submitted:", Object.fromEntries(formDataToSubmit.entries()));

      const response = await axios.put(
        `http://192.168.1.20:8000/msmeregister/msme/${id}/`,
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.status === 200 || response.status === 201) {
        router.push(`/success?id=${id}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);

      // Enhanced error reporting
      if (error.response) {
        // The server responded with a status other than 2xx
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        alert(`Error submitting form: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error("No response received:", error.request);
        alert("Error: No response received from server. Check your network connection or server status.");
      } else {
        // Something happened in setting up the request
        alert(`Error: ${error.message}`);
      }
    } finally {
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
        MSME Registration - Additional Details
      </Typography>

      {Object.keys(formErrors).length > 0 && (
        <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
          Please fill in all required fields correctly.
        </Alert>
      )}

      {/* UAM Registration Number */}
      <FormLabel variant="h6" sx={{ mt: 2 }}>
        UAM Registration Number {requiredAsterisk}
      </FormLabel>
      <FormControl fullWidth margin="normal" sx={{ mt: 1 }}>
        <RadioGroup
          row
          name="uam_number"
          value={formData.uam_number}
          onChange={handleChange}
        >
          <FormControlLabel value="n/a" control={<Radio />} label="N/A" />
          <FormControlLabel value="EM-II" control={<Radio />} label="EM-II" />
          <FormControlLabel value="previous UAM" control={<Radio />} label="Previous UAM" />
        </RadioGroup>
        {formErrors.uam_number && (
          <FormLabel color="error" sx={{ fontSize: '0.75rem' }}>{formErrors.uam_number}</FormLabel>
        )}
      </FormControl>

      {/* Status of Enterprise */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        Status of Enterprise {requiredAsterisk}
      </Typography>
      <Box sx={{ mt: 1 }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 3 }}>
          <FormLabel>Date of Incorporation</FormLabel>
          <TextField
            type="date"
            name="dateOfIncorporation"
            size="small"
            value={formData.dateOfIncorporation}
            onChange={handleChange}
            error={!!formErrors.dateOfIncorporation}
            helperText={formErrors.dateOfIncorporation}
          />
        </Stack>

        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mb: 1 }}>
          <FormLabel sx={{ minWidth: "300px" }}>Whether Production/Business Commenced</FormLabel>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <RadioGroup
              row
              name="businessCommenced"
              value={formData.businessCommenced}
              onChange={handleChange}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </Box>
        </Stack>

        {formData.businessCommenced === "yes" && (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 2 }}>
            <FormLabel>Date of Commencement</FormLabel>
            <TextField
              type="date"
              name="dateOfCommencement"
              size="small"
              value={formData.dateOfCommencement}
              onChange={handleChange}
              error={!!formErrors.dateOfCommencement}
              helperText={formErrors.dateOfCommencement}
            />
          </Stack>
        )}
      </Box>

      {/* Bank Details */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        Bank Details {requiredAsterisk}
      </Typography>
      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
        <Box sx={{ width: "33%" }}>
          <FormLabel>Bank Name</FormLabel>
          <TextField
            fullWidth
            size="small"
            name="bankName"
            placeholder="Enter Name"
            value={formData.bankName}
            onChange={handleChange}
            error={!!formErrors.bankName}
            helperText={formErrors.bankName}
          />
        </Box>

        <Box sx={{ width: "33%" }}>
          <FormLabel>IFSC Code</FormLabel>
          <TextField
            fullWidth
            size="small"
            name="ifsc"
            value={formData.ifsc}
            onChange={handleChange}
            error={!!formErrors.ifsc}
            helperText={formErrors.ifsc}
          />
        </Box>

        <Box sx={{ width: "33%" }}>
          <FormLabel>Bank Account Number</FormLabel>
          <TextField
            fullWidth
            size="small"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleChange}
            error={!!formErrors.accountNumber}
            helperText={formErrors.accountNumber}
          />
        </Box>
      </Stack>

      {/* Major Activity */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        Major Activity of Unit {requiredAsterisk}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "row", mt: 1 }}>
        <RadioGroup
          row
          name="major_activity_of_unit"
          value={formData.major_activity_of_unit}
          onChange={handleChange}
        >
          <FormControlLabel value="manufacturing" control={<Radio />} label="Manufacturing" />
          <FormControlLabel value="service" control={<Radio />} label="Service" />
        </RadioGroup>
      </Box>
      {formErrors.major_activity_of_unit && (
        <FormLabel color="error" sx={{ fontSize: '0.75rem' }}>{formErrors.major_activity_of_unit}</FormLabel>
      )}

      {/* Nature of Business */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        Nature of Business {requiredAsterisk}
      </Typography>
      <Box sx={{ mt: 1, mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          name="natureOfBusiness"
          placeholder="Enter Nature of Business"
          value={formData.natureOfBusiness}
          onChange={handleChange}
          error={!!formErrors.natureOfBusiness}
          helperText={formErrors.natureOfBusiness}
        />
      </Box>

      {/* NIC Codes */}
      <Typography variant="h6" sx={{ mt: 3 }}>
        NIC Codes {requiredAsterisk}
      </Typography>
      {formErrors.nicCode && (
        <FormLabel color="error" sx={{ fontSize: '0.75rem', display: 'block', mb: 1 }}>{formErrors.nicCode}</FormLabel>
      )}
      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
        <FormControl sx={{ flex: 1 }}>
          <FormLabel>NIC 2 Digit Code</FormLabel>
          <Select
            size="small"
            name="nic2Digit"
            value={formData.nic2Digit}
            onChange={handleNicChange}
            displayEmpty
            disabled={activeNicLevel && activeNicLevel !== "2Digit"}
          >
            <MenuItem value="" disabled>Select NIC 2 Digit Code</MenuItem>
            {nicData["2Digit"].map((item) => (
              <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }}>
          <FormLabel>NIC 4 Digit Code</FormLabel>
          <Select
            size="small"
            name="nic4Digit"
            value={formData.nic4Digit}
            onChange={handleNicChange}
            displayEmpty
            disabled={activeNicLevel && activeNicLevel !== "4Digit"}
          >
            <MenuItem value="" disabled>Select NIC 4 Digit Code</MenuItem>
            {nicData["4Digit"].map((item) => (
              <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ flex: 1 }}>
          <FormLabel>NIC 5 Digit Code</FormLabel>
          <Select
            size="small"
            name="nic5Digit"
            value={formData.nic5Digit}
            onChange={handleNicChange}
            displayEmpty
            disabled={activeNicLevel && activeNicLevel !== "5Digit"}
          >
            <MenuItem value="" disabled>Select NIC 5 Digit Code</MenuItem>
            {nicData["5Digit"].map((item) => (
              <MenuItem key={item.code} value={item.code}>{item.code} - {item.description}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      {/* Number of Persons Employed */}
      <Typography variant="h6" sx={{ mt: 1 }}>
        Number of Persons Employed {requiredAsterisk}
      </Typography>
      <Stack direction="row" spacing={3} sx={{ mt: 1 }}>
        <TextField
          label="Male"
          type="number"
          name="male"
          size="small"
          fullWidth
          onChange={handleEmployeeChange}
          value={formData.male}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Female"
          type="number"
          name="female"
          size="small"
          fullWidth
          onChange={handleEmployeeChange}
          value={formData.female}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Others"
          type="number"
          name="others"
          size="small"
          fullWidth
          onChange={handleEmployeeChange}
          value={formData.others}
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Total"
          type="number"
          name="total"
          size="small"
          fullWidth
          value={formData.total}
          disabled
        />
      </Stack>

      {/* Navigation Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => navigate(-1)} // Navigates back to the previous page
        >
          Previous
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
        >
          Submit
        </Button>
      </Box>
    </Box>
  );
};

export default Lastpage;