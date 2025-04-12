"use client";


import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Grid,
    Input,
    MenuItem,
    Select,
    TextField,
    Typography,
    CircularProgress,
    InputAdornment,
    Backdrop,
} from "@mui/material";
import { styled } from '@mui/material/styles';
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";

const NextPage = () => {
    const searchParams = useSearchParams()

    const id = searchParams.get("id");
    const router = useRouter()
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
    const [fileNames, setFileNames] = useState({
        trade_license_file: "",
        upload_photo: ""
    });
    const [loading, setLoading] = useState(false);
    const [fetchingData, setFetchingData] = useState(false);

    const [isNextEnabled, setIsNextEnabled] = useState(false);
    const [isExistingData, setIsExistingData] = useState(false);

    const [formData, setFormData] = useState({
        have_trade_license: "",
        license: id || "",
        tin_number: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        father_name: "",
        dob: "",
        address: {
            address: "",
            city: "",
            state: "",
            pincode: "",
        },
        email: "",
        mobile_number: "",
        trade_license_file: null,
        upload_photo: null,
        relationship_with_applicant: "",
    });
    const [formErrors, setformErrors] = useState({});


    // Fetch existing data when the component mounts if ID is provided
    useEffect(() => {
        if (id) {
            fetchExistingData();
        }
    }, [id]);

    // Additional effect to handle when have_trade_license changes to "yes"
    useEffect(() => {
        if (formData.have_trade_license === "yes" && id) {
            fetchBasicDetails();
        }
    }, [formData.have_trade_license]);

    const fetchBasicDetails = async () => {
        try {
            setFetchingData(true);
            const response = await axios.get(`http://192.168.1.20:8000/tradelicense/basic-details/${id}/`);
            if (response.status === 200) {
                const data = response.data;

                // Update file names if photo exists
                if (data.upload_photo) {
                    setFileNames(prev => ({
                        ...prev,
                        upload_photo: data.upload_photo.split('/').pop() || '',
                    }));
                }

                // Set form data from API response
                setFormData(prevFormData => ({
                    ...prevFormData,
                    ...data,
                    have_trade_license: "yes",
                    address: {
                        address: data.address?.address || "",
                        city: data.address?.city || "",
                        state: data.address?.state || "",
                        pincode: data.address?.pincode || "",
                    },
                    license: id,
                    upload_photo: null, // Keep as null to prevent unwanted file upload
                }));

                setIsExistingData(true);
                setIsNextEnabled(true);
            }
        } catch (error) {
            console.error("Error fetching basic details:", error);
        } finally {
            setFetchingData(false);
        }
    };

    const fetchExistingData = async () => {
        try {
            // Show loading indicator while fetching data
            setFetchingData(true);

            // First, check if we have basic details about license preference
            const response = await axios.get(`http://192.168.1.20:8000/tradelicense/basic-details/${id}/`);

            if (response.status === 200) {
                const licensePreference = response.data.have_trade_license;

                if (licensePreference === "yes") {
                    // If they have a trade license, use the basic details
                    const data = response.data;

                    if (data.upload_photo) {
                        setFileNames(prev => ({
                            ...prev,
                            upload_photo: data.upload_photo.split('/').pop() || '',
                        }));
                    }

                    // Set form data from API response
                    setFormData({
                        ...data,
                        have_trade_license: "yes",
                        license: id,
                        address: {
                            address: data.address?.address || "",
                            city: data.address?.city || "",
                            state: data.address?.state || "",
                            pincode: data.address?.pincode || "",
                        },
                        upload_photo: null, // Keep as null to prevent unwanted file upload
                    });

                    setIsExistingData(true);
                    setIsNextEnabled(true);
                } else if (licensePreference === "no") {
                    // If they don't have a trade license, fetch from the other endpoint
                    try {
                        const response1 = await axios.get(`http://192.168.1.20:8000/tradelicense/trade-license-exist/${id}/`);
                        const data = response1.data;

                        // Update file names if files exist
                        if (data.trade_license_file) {
                            setFileNames(prev => ({
                                ...prev,
                                trade_license_file: data.trade_license_file.split('/').pop() || ''
                            }));
                        }

                        setFormData({
                            ...data,
                            have_trade_license: "no",
                            license: id,
                            tin_number: data.tin_number || "",
                            trade_license_file: null,
                            address: {
                                address: "",
                                city: "",
                                state: "",
                                pincode: "",
                            },
                        });

                        setIsExistingData(true);
                        setIsNextEnabled(true);
                    } catch (error) {
                        console.error("Error fetching trade license data:", error);
                        // If this fails, at least set the license preference from the first API
                        setFormData(prev => ({
                            ...prev,
                            have_trade_license: "no",
                            license: id,
                        }));
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching existing data:", error);
        } finally {
            // Hide loading indicator after fetch completes (success or error)
            setFetchingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            address: {
                ...formData.address,
                [name]: value,
            },
        });

        // Auto-fetch state and city when pincode is entered
        if (name === "pincode" && value.length === 6) {
            fetchPincodeDetails(value);
        }
    };

    const fetchPincodeDetails = async (pincode) => {
        if (pincode.length !== 6) return;

        setLoading(true);
        try {
            const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

            if (response.data && response.data[0].Status === "Success" && response.data[0].PostOffice) {
                const postOfficeData = response.data[0].PostOffice[0];

                setFormData({
                    ...formData,
                    address: {
                        ...formData.address,
                        pincode,
                        city: postOfficeData.Block || postOfficeData.Name || '',
                        state: postOfficeData.State || '',
                        district: postOfficeData.District || '',
                    }
                });

                // Clear any previous pincode error
                setformErrors(prev => ({
                    ...prev,
                    pincode: undefined
                }));
            } else {
                setformErrors(prev => ({
                    ...prev,
                    pincode: 'Invalid PIN code - no location found'
                }));

                // Clear city, state and district if pincode is invalid
                setFormData({
                    ...formData,
                    address: {
                        ...formData.address,
                        pincode,
                        city: "",
                        state: "",
                        district: "",
                    }
                });
            }
        } catch (error) {
            console.error("Error fetching pincode details:", error);
            setformErrors(prev => ({
                ...prev,
                pincode: 'Error fetching PIN code data'
            }));

            // Clear city, state and district if there's an error
            setFormData({
                ...formData,
                address: {
                    ...formData.address,
                    pincode,
                    city: "",
                    state: "",
                    district: "",
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0]
        if (file && file.size / (1024 * 1024) > 5) {
            alert("File size must be less than 5MB!");
            e.target.value = "";
        } else {
            setFormData({ ...formData, [e.target.name]: file });
            setFileNames({ ...fileNames, [e.target.name]: file.name });
        }
    };

    const requiredAsterisk = (
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
    );

    const validateForm = () => {
        let newformErrors = {};

        if (formData.have_trade_license === "no") {
            // Validation for "No" option
            if (!formData.tin_number) {
                newformErrors.tin_number = "This field is required";
            }

            // Only require trade_license_file for new entries, not when editing
            if (!formData.trade_license_file && !isExistingData) {
                newformErrors.trade_license_file = "This field is required";
            }
        } else if (formData.have_trade_license === "yes") {
            // Validation for "Yes" option
            const requiredFields = [
                "first_name",
                "last_name",
                "father_name",
                "dob",
                "email",
                "mobile_number",
                "relationship_with_applicant",
            ];

            requiredFields.forEach((field) => {
                if (!formData[field]) {
                    newformErrors[field] = "This field is required";
                }
            });

            // Only require upload_photo for new entries, not when editing
            if (!formData.upload_photo && !isExistingData) {
                newformErrors.upload_photo = "This field is required";
            }

            // Validate address fields
            if (!formData.address.address) newformErrors.address = "This field is required";
            if (!formData.address.city) newformErrors.city = "This field is required";
            if (!formData.address.state) newformErrors.state = "This field is required";
            if (!formData.address.pincode) newformErrors.pincode = "This field is required";

            // Format validations
            if (formData.mobile_number && !/^[6-9]\d{9}$/.test(formData.mobile_number)) {
                newformErrors.mobile_number = "Invalid mobile number. Must be 10 digits.";
            }

            if (formData.address.pincode && !/^\d{6}$/.test(formData.address.pincode)) {
                newformErrors.pincode = "Invalid pin code. Must be 6 digits.";
            }

            if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
                newformErrors.email = "Invalid email format.";
            }
        }

        setformErrors(newformErrors);
        return Object.keys(newformErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (key === "trade_license_file" && value) {
                data.append(key, value);
            } else if (key === "upload_photo" && value) {
                data.append(key, value);
            } else if (key === "address") {
                data.append("address", JSON.stringify(value));
            } else if (value !== null && value !== undefined) {
                data.append(key, value);
            }
        });

        try {
            let response;

            if (formData.have_trade_license === "no") {
                if (isExistingData) {
                    // Update existing trade license
                    response = await axios.put(`http://192.168.1.20:8000/tradelicense/trade-license-exist/${id}/`, data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                } else {
                    // Create new trade license
                    response = await axios.post("http://192.168.1.20:8000/tradelicense/trade-license-exist/", data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }
            } else {
                // "yes" option - update basic details
                if (isExistingData) {
                    response = await axios.put(`http://192.168.1.20:8000/tradelicense/basic-details/${id}/`, data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                } else {
                    response = await axios.post("http://192.168.1.20:8000/tradelicense/basic-details/", data, {
                        headers: { "Content-Type": "multipart/form-data" },
                    });
                }
            }

            if (response.status === 200 || response.status === 201) {
                console.log("Success:", response.data);
                setIsNextEnabled(true);
                // Get the license ID from the response if it's a new submission
                const licenseId = isExistingData ? id : response.data.license || response.data.id;
                router.push(`/tradelicense/screen3?id=${id}`)
            }
        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    // Handle going to previous page
    const handlePrevious = () => {
        router.push(`/tradelicense/screen1?id=${id}`)
    };

    if (fetchingData) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" ml={2}>Loading ...</Typography>
            </Box>
        );
    }

    return (
        <>
            <Box sx={{ width: 800, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2, mb: 2, borderColor: "grey.400", }} component="form" onSubmit={handleSubmit}>
                <Typography variant="h4" align="center" gutterBottom sx={{ padding: 1 }}>
                    Trade License Registration
                </Typography>

                <FormLabel>Apply for New Trade License</FormLabel>
                <FormControl fullWidth sx={{ mt: 1, mb: 2 }}>
                    <Select name="have_trade_license" value={formData.have_trade_license} onChange={handleChange} displayEmpty
                        sx={{ height: "50px", fontSize: "16px", input: { height: "18px", padding: "10px" } }}
                    >
                        <MenuItem value="" disabled>Select</MenuItem>
                        <MenuItem value="yes">Yes</MenuItem>
                        <MenuItem value="no">No</MenuItem>
                    </Select>
                </FormControl>

                {formData.have_trade_license === "no" && (
                    <>
                        <FormLabel>Tin Number{requiredAsterisk}</FormLabel>
                        <TextField fullWidth name="tin_number" value={formData.tin_number} onChange={handleChange} margin="normal" error={!!formErrors.tin_number} helperText={formErrors.tin_number} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} />
                        <FormLabel sx={{ mt: 2 }}>Upload Latest Trade License Certificate{requiredAsterisk}</FormLabel><br></br><br></br>
                        <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                            Upload File
                            <VisuallyHiddenInput type="file" onChange={handleFileChange} name="trade_license_file" error={!!formErrors.trade_license_file} helperText={formErrors.trade_license_file} />
                        </Button>
                        {fileNames.trade_license_file && <Typography>{fileNames.trade_license_file}</Typography>}
                        {formErrors.trade_license_file && <Typography color="error">{formErrors.trade_license_file}</Typography>}
                    </>
                )}

                {formData.have_trade_license === "yes" && (
                    <Box>
                        <Typography variant="subtitle1" sx={{ mt: 2 }}>Applicant Details</Typography>

                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <FormLabel>First Name{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="first_name" value={formData.first_name} onChange={handleChange} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} error={!!formErrors.first_name} helperText={formErrors.first_name} />
                            </Grid>
                            <Grid item xs={4}>
                                <FormLabel>Middle Name</FormLabel>
                                <TextField fullWidth name="middle_name" value={formData.middle_name} onChange={handleChange} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} />
                            </Grid>
                            <Grid item xs={4}>
                                <FormLabel>Last Name{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="last_name" value={formData.last_name} onChange={handleChange} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} error={!!formErrors.last_name} helperText={formErrors.last_name} />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid item xs={6}>
                                <FormLabel>Father's Name{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="father_name" value={formData.father_name} onChange={handleChange} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} error={!!formErrors.father_name} helperText={formErrors.father_name} />
                            </Grid>
                            <Grid item xs={6}>
                                <FormLabel>Date of Birth{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="dob" type="date" value={formData.dob} onChange={handleChange} InputLabelProps={{ shrink: true }} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} error={!!formErrors.dob} helperText={formErrors.dob} />
                            </Grid>
                        </Grid>

                        <Box sx={{ mt: 0 }}>
                            <FormLabel sx={{ mt: 2, mr: 9 }}>Upload Your Photograph{requiredAsterisk}</FormLabel>
                            <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
                                Upload Photo
                                <VisuallyHiddenInput type="file" onChange={handleFileChange} name="upload_photo" error={!!formErrors.upload_photo} helperText={formErrors.upload_photo} />
                            </Button>
                            {isExistingData && fileNames.upload_photo && <Typography sx={{ ml: 27 }}>{fileNames.upload_photo}</Typography>}
                            {!isExistingData && fileNames.upload_photo && <Typography sx={{ ml: 27 }}>{fileNames.upload_photo}</Typography>}
                            {formErrors.upload_photo && <Typography color="error" sx={{ ml: 27 }}>{formErrors.upload_photo}</Typography>}
                        </Box>

                        <Box sx={{ mt: 2 }}>
                            <FormLabel>Address{requiredAsterisk}</FormLabel>
                            <TextField
                                fullWidth
                                name="address"
                                multiline
                                rows={1}
                                value={formData.address.address}
                                onChange={handleAddressChange}
                                error={!!formErrors.address} helperText={formErrors.address}
                                margin="normal"
                            />
                        </Box>

                        <Grid container spacing={2}>
                            <Grid item xs={4}>
                                <FormLabel>Pin Code{requiredAsterisk}</FormLabel>
                                <TextField
                                    fullWidth
                                    name="pincode"
                                    value={formData.address.pincode}
                                    onChange={handleAddressChange}
                                    error={!!formErrors.pincode}
                                    helperText={formErrors.pincode}
                                    sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                {loading && <CircularProgress size={20} />}
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>

                            <Grid item xs={4}>
                                <FormLabel>State{requiredAsterisk}</FormLabel>
                                <TextField
                                    fullWidth
                                    name="state"
                                    value={formData.address.state}
                                    onChange={handleAddressChange}
                                    sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }}
                                    error={!!formErrors.state}
                                    helperText={formErrors.state}
                                />
                            </Grid>
                            <Grid item xs={4}>
                                <FormLabel>City{requiredAsterisk}</FormLabel>
                                <TextField
                                    fullWidth
                                    name="city"
                                    value={formData.address.city}
                                    onChange={handleAddressChange}
                                    sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }}
                                    error={!!formErrors.city}
                                    helperText={formErrors.city}
                                />
                            </Grid>
                        </Grid>

                        <Grid container spacing={2} sx={{ mt: 0 }}>
                            <Grid item xs={6}>
                                <FormLabel>Email{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="email" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} />
                            </Grid>
                            <Grid item xs={6}>
                                <FormLabel>Mobile Number{requiredAsterisk}</FormLabel>
                                <TextField fullWidth name="mobile_number" value={formData.mobile_number} onChange={handleChange} error={!!formErrors.mobile_number} helperText={formErrors.mobile_number} sx={{ height: "60px", fontSize: "16px", input: { height: "20px", padding: "10px" } }} />
                            </Grid>
                            <FormLabel sx={{ mt: 1, paddingLeft: "15px" }}>Relationship of Applicant With Company{requiredAsterisk}</FormLabel>
                            <FormControl fullWidth sx={{ mt: 1, paddingLeft: "15px" }}>
                                <Select
                                    name="relationship_with_applicant"
                                    value={formData.relationship_with_applicant}
                                    onChange={handleChange}
                                    sx={{ height: "40px", fontSize: "16px", input: { height: "18px", padding: "15px" } }}
                                    displayEmpty
                                    error={!!formErrors.relationship_with_applicant}
                                >
                                    <MenuItem value="" disabled>Select</MenuItem>
                                    <MenuItem value="author_signatory">Authorized Signatory</MenuItem>
                                    <MenuItem value="director">Director</MenuItem>
                                    <MenuItem value="partner">Partner</MenuItem>
                                    <MenuItem value="proprietor">Proprietor</MenuItem>
                                </Select>
                                {formErrors.relationship_with_applicant && <Typography color="error">{formErrors.relationship_with_applicant}</Typography>}
                            </FormControl>
                        </Grid>
                    </Box>
                )}

                <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mt: 2 }}>
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                    >
                        Save & Next
                    </Button>
                </Box>
            </Box>
        </>
    );
};

export default NextPage;