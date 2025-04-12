"use client";

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { Box, Button, FormLabel, MenuItem, Select, TextField, Typography, Stack, CircularProgress } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { styled } from "@mui/system";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  whiteSpace: "nowrap",
  width: 1,
});

const PrincipalPlaceForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id");
  const [formData, setFormData] = useState({
    pincode: '',
    state: '',
    district: '',
    city: '',
    street: '',
    bno: '',
    latitude: '',
    longitude: '',
    possession_nature: '',
    address_proof: '',
    address_proof_file: null,
    noc_file: null,
    incorporationCert_file: null,
  });

  const [fileNames, setFileNames] = useState({
    address_proof_file: '',
    noc_file: '',
    incorporationCert_file: ''
  });


  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [initialDataLoading, setInitialDataLoading] = useState(false);

  const RequiredMark = () => <span style={{ color: "red" }}>*</span>;

  // Fetch initial data if ID is present
  useEffect(() => {
    if (id) {
      fetchPrincipalPlaceData();
    }
  }, [id]);

  const fetchPrincipalPlaceData = async () => {
    if (!id) return;

    setInitialDataLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.20:8000/gst/principal-place/${id}/`);

      if (response.status === 200 && response.data) {
        const { address, possession_nature, address_proof } = response.data;

        const addressData = typeof address === 'string' ? JSON.parse(address) : address;

        setFormData(prevData => ({
          ...prevData,
          pincode: addressData.pincode || '',
          state: addressData.state || '',
          district: addressData.district || '',
          city: addressData.city || '',
          street: addressData.street || '',
          bno: addressData.bno || '',
          latitude: addressData.latitude || '',
          longitude: addressData.longitude || '',
          possession_nature: possession_nature || '',
          address_proof: address_proof || '',
        }));

        // Set file names if they exist in the response
        if (response.data.address_proof_file) {
          setFileNames(prev => ({
            ...prev,
            address_proof_file: getFileNameFromPath(response.data.address_proof_file)
          }));
        }

        if (response.data.noc_file) {
          setFileNames(prev => ({
            ...prev,
            noc_file: getFileNameFromPath(response.data.noc_file)
          }));
        }

        if (response.data.incorporationCert_file) {
          setFileNames(prev => ({
            ...prev,
            incorporationCert_file: getFileNameFromPath(response.data.incorporationCert_file)
          }));
        }

        setIsEditMode(true);
      }
    } catch (error) {
      console.error('Error fetching principal place data:', error);
    } finally {
      setInitialDataLoading(false);
    }
  };

  const getFileNameFromPath = (path) => {
    if (!path) return '';
    return path.split('/').pop();
  };

  useEffect(() => {
    if (formData.pincode && formData.pincode.length === 6) {
      fetchPincodeData(formData.pincode);
    }
  }, [formData.pincode]);

  const fetchPincodeData = async (pincode) => {
    if (pincode.length !== 6) return;

    setLoading(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

      if (response.data && response.data[0].Status === "Success" && response.data[0].PostOffice) {
        const postOfficeData = response.data[0].PostOffice[0];

        setFormData(prevData => ({
          ...prevData,
          state: postOfficeData.State || '',
          district: postOfficeData.District || '',
          city: postOfficeData.Block || postOfficeData.Name || '',
        }));

        setErrors(prev => ({
          ...prev,
          state: undefined,
          district: undefined,
          city: undefined
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          pincode: 'Invalid PIN code - no location found'
        }));
      }
    } catch (error) {
      console.error('Error fetching PIN code data:', error);
      setErrors(prev => ({
        ...prev,
        pincode: 'Error fetching PIN code data'
      }));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let errors = {};
    const requiredFields = [
      'pincode', 'state', 'district', 'city',
      'street', 'bno', 'latitude', 'longitude',
      'possession_nature', 'address_proof'
    ];

    requiredFields.forEach(field => {
      if (!formData[field]) {
        errors[field] = 'This field is required';
      }
    });

    // File validation that properly handles edit mode
    if (!isEditMode) {
      // For new submissions, all files are required
      if (!formData.address_proof_file) {
        errors.address_proof_file = 'Proof of Business document is required';
      }
      if (!formData.noc_file) {
        errors.noc_file = 'NOC document is required';
      }
      if (!formData.incorporationCert_file) {
        errors.incorporationCert_file = 'Certificate of incorporation is required';
      }
    } else {
      // For edit mode, only validate files if there are no existing files
      if (!fileNames.address_proof_file && !formData.address_proof_file) {
        errors.address_proof_file = 'Proof of Business document is required';
      }
      if (!fileNames.noc_file && !formData.noc_file) {
        errors.noc_file = 'NOC document is required';
      }
      if (!fileNames.incorporationCert_file && !formData.incorporationCert_file) {
        errors.incorporationCert_file = 'Certificate of incorporation is required';
      }
    }

    if (formData.pincode && !formData.pincode.match(/^\d{6}$/)) {
      errors.pincode = 'Invalid PIN code (6 digits required)';
    }
    if (formData.latitude && isNaN(formData.latitude)) {
      errors.latitude = 'Latitude must be a valid number';
    }
    if (formData.longitude && isNaN(formData.longitude)) {
      errors.longitude = 'Longitude must be a valid number';
    }

    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e, fieldName) => {
    const { files } = e.target;
    if (files.length) {
      setFormData((prevData) => ({ ...prevData, [fieldName]: files[0] }));
      setFileNames((prevNames) => ({ ...prevNames, [fieldName]: files[0].name }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const data = new FormData();
      data.append("gst", id);
      data.append("address", JSON.stringify({
        "pincode": formData.pincode,
        "state": formData.state,
        "district": formData.district,
        "city": formData.city,
        "street": formData.street,
        "bno": formData.bno,
        "latitude": formData.latitude,
        "longitude": formData.longitude,
      }));

      data.append("possession_nature", formData.possession_nature);
      data.append("address_proof", formData.address_proof);

      if (formData.address_proof_file) {
        data.append("address_proof_file", formData.address_proof_file);
      }

      if (formData.noc_file) {
        data.append("noc_file", formData.noc_file);
      }

      if (formData.incorporationCert_file) {
        data.append("incorporationCert_file", formData.incorporationCert_file);
      }

      try {
        let response;

        if (isEditMode) {
          response = await axios.put(`http://192.168.1.20:8000/gst/principal-place/${id}/`, data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        } else {
          response = await axios.post("http://192.168.1.20:8000/gst/principal-place/", data, {
            headers: { "Content-Type": "multipart/form-data" },
          });
        }

        if ((response.status === 200 || response.status === 201) && response.data) {
          console.log(isEditMode ? "Form updated successfully" : "Form submitted successfully");
          // Navigate to success or next page
          // navigate('/success');
          router.push(`/success?id=${id}`);
        }
      } catch (error) {
        console.error(isEditMode ? "Error updating form:" : "Error submitting form:", error);
      }
    }
  };

  if (initialDataLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading ...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto', my: 4, border: '1px solid #ccc', borderRadius: 5, width: 800,borderColor: "grey.400", }} >
      <Typography variant="h5" mb={2} sx={{ ml: 25 }}>
        {'Details of Principal Place of Business'}
      </Typography>
      <form onSubmit={handleSubmit}>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <FormLabel>PIN Code <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="pincode"
              value={formData.pincode}
              onChange={handleChange}
              error={!!errors.pincode}
              helperText={errors.pincode || ''}
              fullWidth
              InputProps={{
                endAdornment: loading ? <CircularProgress size={20} /> : null
              }}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>State <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={!!errors.state}
              helperText={errors.state || ''}
              fullWidth
              disabled={loading}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>District <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="district"
              value={formData.district}
              onChange={handleChange}
              error={!!errors.district}
              helperText={errors.district || ''}
              fullWidth
              disabled={loading}
            />
          </Box>
        </Box>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1}>
            <FormLabel>City/Town/Village <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="city"
              value={formData.city}
              onChange={handleChange}
              error={!!errors.city}
              helperText={errors.city || ''}
              fullWidth
              disabled={loading}
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Road/Street <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="street"
              value={formData.street}
              onChange={handleChange}
              error={!!errors.street}
              helperText={errors.street || ''}
              fullWidth
            />
          </Box>
          <Box flex={1}>
            <FormLabel>Building/flat No <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="bno"
              value={formData.bno}
              onChange={handleChange}
              error={!!errors.bno}
              helperText={errors.bno || ''}
              fullWidth
            />
          </Box>
        </Box>
        <Box display="flex" gap={2} mb={2}>
          <Box flex={1} sx={{ mt: 1 }}>
            <FormLabel>Latitude <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              error={!!errors.latitude}
              helperText={errors.latitude || ''}
              fullWidth
            />
          </Box>
          <Box flex={1} sx={{ mt: 1 }}>
            <FormLabel>Longitude <RequiredMark /></FormLabel>
            <TextField
              size="small"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              error={!!errors.longitude}
              helperText={errors.longitude || ''}
              fullWidth
            />
          </Box>
          <Box mb={2} sx={{ width: 250, mt: 1 }}>
            <FormLabel>Nature Of Possession Primises <RequiredMark /> </FormLabel>
            <Select
              name="possession_nature"
              value={formData.possession_nature}
              onChange={handleChange}
              error={!!errors.possession_nature}
              displayEmpty
              fullWidth
              size="small"
            >
              <MenuItem value="select" disabled>Select </MenuItem>
              <MenuItem value="own">Own</MenuItem>
              <MenuItem value="rented">Rented</MenuItem>
              <MenuItem value="lease">Lease</MenuItem>
            </Select>
            {errors.possession_nature && (
              <Typography variant="caption" color="error">
                {errors.possession_nature}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ mt: -3 }}>
          <Typography variant="h6">Documents Upload</Typography>
          <Box display="flex" gap={2} mb={2}>
            <Box flex={1} sx={{ mt: 2, ml: 0 }}>
              <FormLabel>Proof Of Principal Place Of Business <RequiredMark /></FormLabel>
              <Select
                name="address_proof"
                value={formData.address_proof}
                onChange={handleChange}
                error={!!errors.address_proof}
                displayEmpty
                fullWidth
                size="small"
              >
                <MenuItem value="select" disabled>Select </MenuItem>
                <MenuItem value="Electricity Bill">Electricity Bill</MenuItem>
                <MenuItem value="Lease deed/Rental agreement">Lease Deed/Rental Agreement</MenuItem>
                <MenuItem value="Property tax receipt">Property Tax Receipt</MenuItem>
              </Select>
              {errors.address_proof && (
                <Typography variant="caption" color="error">
                  {errors.address_proof}
                </Typography>
              )}
            </Box>
            <Box mb={2} sx={{ width: 350, ml: 5, mt: 4 }}>
              <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                sx={{ mt: 1, width: 150 ,ml:5}}
              >
                Upload
                <VisuallyHiddenInput
                  type="file"
                  onChange={(e) => handleFileChange(e, 'address_proof_file')}
                />
              </Button>

              {fileNames.address_proof_file && (
                <Typography variant="body2" sx={{ mt: 1,ml:5 }}>
                  {fileNames.address_proof_file}
                  {isEditMode && !formData.address_proof_file && " (Already uploaded)"}
                </Typography>
              )}
              <Typography color="error" sx={{ mt: 1, fontSize: '0.75rem',ml:5 }}>
                {errors.address_proof_file}
              </Typography>
            </Box>
          </Box>

          <Box mb={2} sx={{ mt: 2 }}>
            <FormLabel variant="body2">In Case Of own Premises also upload Noc <RequiredMark /></FormLabel>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1, width: 150, ml: 18 }}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                onChange={(e) => handleFileChange(e, 'noc_file')}
              />
            </Button>
            {fileNames.noc_file && (
              <Typography variant="body2" sx={{ mt: 1, ml: 56 }}>
                {fileNames.noc_file}
                {isEditMode && !formData.noc_file && " (Already uploaded)"}
              </Typography>
            )}
            <Typography color="error" sx={{ mt: 1, fontSize: '0.75rem', ml: 56 }}>
              {errors.noc_file}
            </Typography>
          </Box>

          <Box mb={2} sx={{ mt: 2 }}>
            <FormLabel variant="body2">Upload Certificate of incorporation ,MOA & AOA <RequiredMark /></FormLabel>
            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
              sx={{ mt: 1, width: 150, ml: 13 }}
            >
              Upload
              <VisuallyHiddenInput
                type="file"
                onChange={(e) => handleFileChange(e, 'incorporationCert_file')}
              />
            </Button>
            {fileNames.incorporationCert_file && (
              <Typography variant="body2" sx={{ mt: 1, ml: 56 }}>
                {fileNames.incorporationCert_file}
                {isEditMode && !formData.incorporationCert_file && " (Already uploaded)"}
              </Typography>
            )}
            <Typography color="error" sx={{ mt: 1, fontSize: '0.75rem', ml: 56 }}>
              {errors.incorporationCert_file}
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" justifyContent="center" spacing={2} mt={2}>          <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push(`/gst/screen5?id=${id}`)}
        >
          Previous
        </Button>
          <Button variant="contained" color="primary" type="submit">
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Stack>
      </form>
    </Box>
  );
};

export default PrincipalPlaceForm;