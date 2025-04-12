"use client";

import {
  Alert,
  Box,
  Button,
  FormLabel,
  Stack,
  TextField,
  Typography,
  MenuItem,
  Select,
  FormControl,
  CircularProgress,
  Container,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

const LabourLicenseForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [loading, setLoading] = useState(id ? true : false);
  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [formData, setFormData] = useState({
    mobile: "",
    name: "",
    email: "",
    gender: "",
    state: "",
    district: "",
    mandal: "",
    village: "",
    address: "",
    pincode: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (id) {
      fetchFormData();
    }
  }, [id]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://192.168.1.20:8000/labourlicense/entrepreneurs/${id}/`,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.status === 200) {
        const data = response.data;
        let addressData = {};

        if (typeof data.address_of_entrepreneur === 'string') {
          addressData = JSON.parse(data.address_of_entrepreneur);
        } else {
          addressData = data.address_of_entrepreneur;
        }

        setFormData({
          mobile: data.mobile_number || "",
          name: data.name || "",
          email: data.email || "",
          gender: data.gender ? data.gender.charAt(0).toUpperCase() + data.gender.slice(1) : "",
          state: addressData.state || "",
          district: addressData.district || "",
          mandal: addressData.mandal || "",
          village: addressData.village || "",
          address: addressData.address || "",
          pincode: addressData.pincode || "",
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPincodeData = async (pincode) => {
    if (pincode.length !== 6) return;

    try {
      setPincodeLoading(true);
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

      if (response.data && response.data[0].Status === "Success" && response.data[0].PostOffice) {
        const postOffice = response.data[0].PostOffice[0];

        setFormData(prev => ({
          ...prev,
          state: postOffice.State || prev.state,
          district: postOffice.District || prev.district,
          mandal: postOffice.Block || postOffice.Taluk || prev.mandal
        }));
      }
    } catch (error) {
      console.error("Error fetching pincode data:", error);
    } finally {
      setPincodeLoading(false);
    }
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePIN = (pin) => /^[1-9][0-9]{5}$/.test(pin);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));

    if (name === "pincode" && value.length === 6) {
      fetchPincodeData(value);
    }
  };

  const validateForm = () => {
    let errors = {};
    ["mobile", "name", "email", "gender", "state", "district", "pincode", "mandal", "village", "address"].forEach((field) => {
      if (!formData[field]) errors[field] = "This field is required";
    });
    if (String(formData.mobile).length !== 10) errors.mobile = "Must be 10 digits";
    if (!validateEmail(formData.email)) errors.email = "Invalid email";
    if (!validatePIN(formData.pincode)) errors.pincode = "Invalid PIN code";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) {
      console.error("Form validation failed");
      return;
    }

    const data = new FormData();
    data.append("mobile_number", formData.mobile);
    data.append("email", formData.email);
    data.append("name", formData.name);
    data.append("gender", formData.gender.toLowerCase());
    data.append("address_of_entrepreneur", JSON.stringify({
      "address": formData.address,
      "village": formData.village,
      "mandal": formData.mandal,
      "district": formData.district,
      "state": formData.state,
      "pincode": formData.pincode
    }));

    try {
      let response;

      if (id) {
        response = await axios.put(
          `http://192.168.1.20:8000/labourlicense/entrepreneurs/${id}/`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status !== 200) {
          throw new Error("Failed to update data");
        } else {
          router.push(`/labour/screen2?id=${id}`);
        }
      } else {
        response = await axios.post(
          "http://192.168.1.20:8000/labourlicense/entrepreneurs/",
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.status !== 201) {
          throw new Error("Failed to submit data");
        } else {
          router.push(`/labour/screen2?id=${response.data.id}`);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          padding: 3,
          border: 1,
          borderRadius: 5,
          mt: 2,
          borderColor: 'grey.400',
        }}
      >
        <Typography
          variant="h4"
          align="center"
          fontFamily={"Archivo, 'Archivo Fallback'"}
          gutterBottom
        >
          Labour License Registration
        </Typography>

        <Typography
          variant="h6"
          fontFamily={"Archivo, 'Archivo Fallback'"}
          gutterBottom
        >
          Enterprise Details
        </Typography>

        {Object.keys(formErrors).length > 0 && (
          <Alert severity="warning">
            Please fill in all required fields.
          </Alert>
        )}

        <Stack spacing={2}>
          {/* Personal Details */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Mobile No <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                error={!!formErrors.mobile}
                helperText={formErrors.mobile}
                size="small"
                variant="outlined"
                inputProps={{ maxLength: 10 }}
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Name <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!formErrors.name}
                helperText={formErrors.name}
                size="small"
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Gender <span style={{ color: "red" }}>*</span></FormLabel>
              <Select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                error={!!formErrors.gender}
                size="small"
                variant="outlined"
              >
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Contact Details */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Email <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
                size="small"
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>PIN Code <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="pincode"
                value={formData.pincode}
                onChange={handleChange}
                error={!!formErrors.pincode}
                helperText={formErrors.pincode}
                InputProps={{
                  endAdornment: pincodeLoading ? <CircularProgress size={20} /> : null,
                }}
                size="small"
                variant="outlined"
                inputProps={{ maxLength: 6 }}
              />
            </FormControl>
          </Box>

          {/* Location Details */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <FormLabel>Village <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="village"
                value={formData.village}
                onChange={handleChange}
                error={!!formErrors.village}
                helperText={formErrors.village}
                size="small"
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>Mandal <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="mandal"
                value={formData.mandal}
                onChange={handleChange}
                error={!!formErrors.mandal}
                helperText={formErrors.mandal}
                size="small"
                variant="outlined"
              />
            </FormControl>

            <FormControl fullWidth>
              <FormLabel>District <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="district"
                value={formData.district}
                onChange={handleChange}
                error={!!formErrors.district}
                helperText={formErrors.district}
                size="small"
                variant="outlined"
              />
            </FormControl>
          </Box>

          {/* State and Address */}
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl fullWidth>
              <FormLabel>State <span style={{ color: "red" }}>*</span></FormLabel>
              <TextField
                name="state"
                value={formData.state}
                onChange={handleChange}
                error={!!formErrors.state}
                helperText={formErrors.state}
                size="small"
                variant="outlined"
              />
            </FormControl>
          </Box>

          <FormControl fullWidth>
            <FormLabel>Address <span style={{ color: "red" }}>*</span></FormLabel>
            <TextField
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!formErrors.address}
              helperText={formErrors.address}
              size="small"
              variant="outlined"
              multiline
              rows={3}
            />
          </FormControl>

          <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
            >
              {id ? "Update & Next" : "Save & Next"}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Container>
  );
};

export default LabourLicenseForm;