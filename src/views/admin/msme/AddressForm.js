"use client";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  TextField,
  Typography,
  Stack,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Lastpage from "./Lastpage";
import axios from "axios";

const AddressForm = () => {
  const router = useRouter(); 
      const searchParams = useSearchParams();
      
  const id = searchParams.get("id");
  const [loading, setLoading] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Enterprise fields
    flatNo: "",
    buildingName: "",
    village: "",
    street: "",
    city: "",
    pincode: "",
    state: "",
    district: "",
    latitude: "",
    longitude: "",

    // Unit fields
    unitName: "",
    unitFlatNo: "",
    unitBuildingName: "",
    unitVillage: "",
    unitStreet: "",
    unitCity: "",
    unitState: "",
    unitDistrict: "",
    unitPinCode: "",
  });

  const [errors, setErrors] = useState({
    flatNo: false,
    buildingName: false,
    village: false,
    street: false,
    city: false,
    pincode: false,
    state: false,
    district: false,
    latitude: false,
    longitude: false,

    // Unit fields
    unitName: false,
    unitFlatNo: false,
    unitBuildingName: false,
    unitVillage: false,
    unitStreet: false,
    unitCity: false,
    unitState: false,
    unitDistrict: false,
    unitPinCode: false,
  });

  const [touched, setTouched] = useState({});
  const [apiError, setApiError] = useState("");

  // Create a styled required label with red asterisk
  const RequiredLabel = ({ children }) => (
    <FormLabel>
      {children} <span style={{ color: 'red' }}>*</span>
    </FormLabel>
  );

  // Fetch existing data on component mount
  useEffect(() => {
    if (id) {
      fetchExistingData();
    }
  }, [id]);

  const fetchExistingData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.20:8000/msmeregister/msme/${id}/`);
      if (response.status === 200 && response.data) {
        const data = response.data;

        // Parse the address data if it's stored as JSON strings
        const officialAddress = typeof data.official_address_of_enterprise === 'string'
          ? JSON.parse(data.official_address_of_enterprise)
          : data.official_address_of_enterprise;

        const locationOfPlant = typeof data.location_of_plant_or_unit === 'string'
          ? JSON.parse(data.location_of_plant_or_unit)
          : data.location_of_plant_or_unit;

        // Update form data with existing values
        setFormData({
          flatNo: officialAddress?.flatNo || "",
          buildingName: officialAddress?.buildingName || "",
          village: officialAddress?.village || "",
          street: officialAddress?.street || "",
          city: officialAddress?.city || "",
          pincode: officialAddress?.pincode || "",
          state: officialAddress?.state || "",
          district: officialAddress?.district || "",
          latitude: officialAddress?.latitude || "",
          longitude: officialAddress?.longitude || "",

          unitName: locationOfPlant?.unitName || "",
          unitFlatNo: locationOfPlant?.unitFlatNo || "",
          unitBuildingName: locationOfPlant?.unitBuildingName || "",
          unitVillage: locationOfPlant?.unitVillage || "",
          unitStreet: locationOfPlant?.unitStreet || "",
          unitCity: locationOfPlant?.unitCity || "",
          unitState: locationOfPlant?.unitState || "",
          unitDistrict: locationOfPlant?.unitDistrict || "",
          unitPinCode: locationOfPlant?.unitPinCode || "",
        });
      }
    } catch (error) {
      console.error("Error fetching existing data:", error);
      setApiError("Failed to load existing data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch details by pincode
  const fetchPincodeDetails = async (pincode, isUnit = false) => {
    if (!pincode || pincode.length !== 6) return;

    setPincodeLoading(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

      if (response.data && response.data[0] && response.data[0].Status === "Success") {
        const postOffice = response.data[0].PostOffice[0];

        if (isUnit) {
          setFormData(prev => ({
            ...prev,
            unitCity: postOffice.Block || postOffice.Name,
            unitState: postOffice.State,
            unitDistrict: postOffice.District
          }));
        } else {
          setFormData(prev => ({
            ...prev,
            city: postOffice.Block || postOffice.Name,
            state: postOffice.State,
            district: postOffice.District
          }));
        }
      } else {
        setApiError(`No details found for the pincode ${pincode}`);
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      setApiError("Failed to fetch location details from the pincode. Please enter manually.");
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: value });

    // Validate the field as the user types
    validateField(name, value);

    // Auto fetch details if pincode field is filled with 6 digits
    if (name === 'pincode' && value.length === 6) {
      fetchPincodeDetails(value);
    } else if (name === 'unitPinCode' && value.length === 6) {
      fetchPincodeDetails(value, true);
    }
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    setTouched({ ...touched, [name]: true });
    validateField(name, formData[name]);
  };

  const validateField = (name, value) => {
    let fieldError = false;

    // Basic required field validation
    if (value.trim() === "") {
      fieldError = true;
    }

    // PIN code validation
    if ((name === 'pincode' || name === 'unitPinCode') && value.trim() !== '') {
      fieldError = !/^[1-9][0-9]{5}$/.test(value);
    }

    setErrors(prev => ({ ...prev, [name]: fieldError }));
    return !fieldError;
  };

  const validateForm = () => {
    let formIsValid = true;
    let newErrors = { ...errors };
    let newTouched = { ...touched };

    // Validate all fields and mark them as touched
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
      const isValid = validateField(field, formData[field]);
      if (!isValid) formIsValid = false;
      newErrors[field] = !isValid;
    });

    setTouched(newTouched);
    setErrors(newErrors);
    return formIsValid;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formDataToSend = new FormData();

    const officialAddress = {
      flatNo: formData.flatNo,
      buildingName: formData.buildingName,
      village: formData.village,
      street: formData.street,
      city: formData.city,
      pincode: formData.pincode,
      state: formData.state,
      district: formData.district,
      latitude: formData.latitude,
      longitude: formData.longitude
    };

    // Convert unit-related fields into a JSON object
    const locationOfPlant = {
      unitName: formData.unitName,
      unitFlatNo: formData.unitFlatNo,
      unitBuildingName: formData.unitBuildingName,
      unitVillage: formData.unitVillage,
      unitStreet: formData.unitStreet,
      unitCity: formData.unitCity,
      unitState: formData.unitState,
      unitDistrict: formData.unitDistrict,
      unitPinCode: formData.unitPinCode
    };

    // Append JSON objects as stringified data
    formDataToSend.append("official_address_of_enterprise", JSON.stringify(officialAddress));
    formDataToSend.append("location_of_plant_or_unit", JSON.stringify(locationOfPlant));

    if (validateForm()) {
      try {
        const response = await axios.put(`http://192.168.1.20:8000/msmeregister/msme/${id}/`, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if ((response.status === 200 || response.status === 201) && response.data) {
          
          router.push(`/msme/screen3?id=${response.data.id}`);

          
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setApiError("Failed to submit the form. Please try again.");
      } finally {
      }
    } else {
      console.log("Form has errors, please correct them");
    }
  };

  const getHelperText = (field) => {
    if (!touched[field]) return "";

    if (field === 'pincode' || field === 'unitPinCode') {
      return errors[field] ?
        (formData[field].trim() === "" ? "This field is required" : "Invalid PIN Code") : "";
    }

    return errors[field] ? "This field is required" : "";
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>Loading data...</Typography>
      </Box>
    );
  }

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
      {apiError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {apiError}
        </Alert>
      )}

      <Typography variant="h5" align="center" gutterBottom sx={{ fontFamily: "'Archivo', sans-serif" }}>
        Official Address Of Enterprise
      </Typography>

      {/* First section - 3 fields per row */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Flat/Door/Block No</RequiredLabel>
            <TextField
              fullWidth
              name="flatNo"
              size="small"
              value={formData.flatNo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.flatNo && errors.flatNo}
              helperText={getHelperText("flatNo")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Name of Premises/Building</RequiredLabel>
            <TextField
              fullWidth
              name="buildingName"
              size="small"
              value={formData.buildingName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.buildingName && errors.buildingName}
              helperText={getHelperText("buildingName")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Village/Town</RequiredLabel>
            <TextField
              fullWidth
              name="village"
              size="small"
              value={formData.village}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.village && errors.village}
              helperText={getHelperText("village")}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Road/Street/Lane</RequiredLabel>
            <TextField
              fullWidth
              name="street"
              size="small"
              value={formData.street}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.street && errors.street}
              helperText={getHelperText("street")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>PIN Code</RequiredLabel>
            <TextField
              fullWidth
              size="small"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.pincode && errors.pincode}
              helperText={getHelperText("pincode")}
              InputProps={{
                endAdornment: pincodeLoading && <CircularProgress size={20} />
              }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>City</RequiredLabel>
            <TextField
              fullWidth
              name="city"
              size="small"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.city && errors.city}
              helperText={getHelperText("city")}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>State</RequiredLabel>
            <TextField
              fullWidth
              name="state"
              size="small"
              value={formData.state}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.state && errors.state}
              helperText={getHelperText("state")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>District</RequiredLabel>
            <TextField
              fullWidth
              name="district"
              size="small"
              value={formData.district}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.district && errors.district}
              helperText={getHelperText("district")}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 2 }}>
            <RequiredLabel>Latitude</RequiredLabel>
            <TextField
              fullWidth
              name="latitude"
              size="small"
              value={formData.latitude}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.latitude && errors.latitude}
              helperText={getHelperText("latitude")}
            />
          </Box>
          <Box sx={{ flex: 2 }}>
            <RequiredLabel>Longitude</RequiredLabel>
            <TextField
              fullWidth
              name="longitude"
              size="small"
              value={formData.longitude}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.longitude && errors.longitude}
              helperText={getHelperText("longitude")}
            />
          </Box>
        </Stack>
      </Stack>
      <br></br>
      <Typography variant="h5" align="center" gutterBottom sx={{ marginTop: 2, fontFamily: "'Archivo', sans-serif" }}>
        Location of Plant(s)/Unit(s)
      </Typography>

      {/* Second section - 3 fields per row */}
      <Stack spacing={2}>
        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Unit Name</RequiredLabel>
            <TextField
              fullWidth
              name="unitName"
              size="small"
              value={formData.unitName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitName && errors.unitName}
              helperText={getHelperText("unitName")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Flat/Door/Block No</RequiredLabel>
            <TextField
              fullWidth
              name="unitFlatNo"
              size="small"
              value={formData.unitFlatNo}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitFlatNo && errors.unitFlatNo}
              helperText={getHelperText("unitFlatNo")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Name of Premises/Building</RequiredLabel>
            <TextField
              fullWidth
              name="unitBuildingName"
              size="small"
              value={formData.unitBuildingName}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitBuildingName && errors.unitBuildingName}
              helperText={getHelperText("unitBuildingName")}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Village/Town</RequiredLabel>
            <TextField
              fullWidth
              name="unitVillage"
              size="small"
              value={formData.unitVillage}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitVillage && errors.unitVillage}
              helperText={getHelperText("unitVillage")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>Road/Street/Lane</RequiredLabel>
            <TextField
              fullWidth
              name="unitStreet"
              size="small"
              value={formData.unitStreet}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitStreet && errors.unitStreet}
              helperText={getHelperText("unitStreet")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>PIN Code</RequiredLabel>
            <TextField
              fullWidth
              size="small"
              name="unitPinCode"
              value={formData.unitPinCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitPinCode && errors.unitPinCode}
              helperText={getHelperText("unitPinCode")}
              InputProps={{
                endAdornment: pincodeLoading && <CircularProgress size={20} />
              }}
            />
          </Box>
        </Stack>

        <Stack direction="row" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>City</RequiredLabel>
            <TextField
              fullWidth
              name="unitCity"
              size="small"
              value={formData.unitCity}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitCity && errors.unitCity}
              helperText={getHelperText("unitCity")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>State</RequiredLabel>
            <TextField
              fullWidth
              name="unitState"
              size="small"
              value={formData.unitState}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitState && errors.unitState}
              helperText={getHelperText("unitState")}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <RequiredLabel>District</RequiredLabel>
            <TextField
              fullWidth
              name="unitDistrict"
              size="small"
              value={formData.unitDistrict}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.unitDistrict && errors.unitDistrict}
              helperText={getHelperText("unitDistrict")}
            />
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ width: "100%", display: "flex", justifyContent: "center", mt: 3 }}>
        <Button
          variant="outlined"
          color="primary"
          sx={{ mr: 2 }}
          onClick={() => navigate(`/msme/screen1?id=${id}`)} // Navigates back to the previous page
        >

          Previous
        </Button>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{ mr: 2 }}
          onClick={handleSubmit}
        >
          {"Save & Next"}
        </Button>
      </Box>
    </Box>
  );
};

export default AddressForm;