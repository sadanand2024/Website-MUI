"use client";


import {
    Alert,
    Box,
    Button,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import axios from "axios";

const License = () => {
    const router = useRouter()

    const searchParams = useSearchParams()

    const idFromUrl = searchParams.get("id");

    const [loading, setLoading] = useState(!!idFromUrl);
    const [dataModified, setDataModified] = useState(false);
    const [initialData, setInitialData] = useState(null);

    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        father_name: "",
        gender: "",
        mobile_number: "",
        email: "",
        age: "",
        id: idFromUrl || "",
    });

    const [formErrors, setFormErrors] = useState({});

    // Fetch existing data if ID is present
    useEffect(() => {
        const fetchData = async () => {
            if (!idFromUrl) return;

            try {
                setLoading(true);
                const response = await axios.get(`http://192.168.1.20:8000/tradelicense/basic-details/${idFromUrl}/`);

                if (response.status === 200 && response.data) {
                    delete response.data.upload_photo;
                    setFormData(response.data);
                    setInitialData(JSON.stringify(response.data)); // Store initial data for comparison
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [idFromUrl]);

    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleChange = (event) => {
        const { name, value } = event.target;

        // Validate mobile number input
        if (name === "mobile_number" && !/^\d{0,10}$/.test(value)) return;

        setFormData((prevData) => ({ ...prevData, [name]: value }));
        setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    };

    const validateForm = () => {
        let errors = {};
        const requiredFields = ["first_name", "last_name", "father_name", "gender", "mobile_number", "email", "age"];

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                errors[field] = "This field is required";
            }
        });
        if (formData.mobile_number && String(formData.mobile_number).length !== 10) {
            errors.mobile_number = "Mobile number must be exactly 10 digits!";
        }

        if (formData.email && !validateEmail(formData.email)) {
            errors.email = "Please enter a valid email address";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!validateForm()) return;

        try {

            if (formData.id) {
                const response = await axios.put(
                    `http://127.0.0.1:8000/tradelicense/basic-details/${formData.id}/`,
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                if ((response.status === 200 || response.status === 201) && response.data) {
                    router.push(`/tradelicense/screen2?id=${response.data.id}`)
                }
            } else {
                const response = await axios.post(
                    "http://192.168.1.20:8000/tradelicense/basic-details/",
                    formData,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );
                if ((response.status === 200 || response.status === 201) && response.data) {
                    setFormData((prevData) => ({
                        ...prevData,
                        id: response.data.id,
                    }));
                    router.push(`/tradelicense/screen2?id=${response.data.id}`)
                }
            }


        } catch (error) {
            console.error("Error submitting form:", error);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" ml={2}>Loading ...</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: 700, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2 ,borderColor: "grey.400",}} component="form" onSubmit={handleSubmit}>
            <Box display="flex" justifyContent="center">
                <FormLabel sx={{ textAlign: "center", margin: 0, fontWeight: 500, fontSize: "40px", lineHeight: "40px", fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)" }}>
                    Trade License Registration
                </FormLabel>
            </Box><br></br>
            <Typography variant="h6" sx={{ textAlign: "left", margin: 0, fontWeight: 500, fontSize: "25px", lineHeight: "25px", fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)" }}>
                Basic Details {idFromUrl ? "(Edit Mode)" : ""}
            </Typography>
            {Object.keys(formErrors).length > 0 && <Alert severity="warning">Please fill in all required fields.</Alert>}

            <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>First Name<Typography component="span" color="red">*</Typography></FormLabel>
                        <TextField fullWidth name="first_name" variant="outlined" size="small" value={formData.first_name} onChange={handleChange} error={!!formErrors.first_name} helperText={formErrors.first_name} />
                    </Box>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Middle Name</FormLabel>
                        <TextField fullWidth name="middle_name" variant="outlined" size="small" value={formData.middle_name} onChange={handleChange} />
                    </Box>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Last Name<Typography component="span" color="red">*</Typography></FormLabel>
                        <TextField fullWidth name="last_name" variant="outlined" size="small" value={formData.last_name} onChange={handleChange} error={!!formErrors.last_name} helperText={formErrors.last_name} />
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Father Name<Typography component="span" color="red">*</Typography></FormLabel><br></br>
                        <TextField sx={{ width: "70%" }} name="father_name" variant="outlined" size="small" value={formData.father_name} onChange={handleChange} error={!!formErrors.father_name} helperText={formErrors.father_name} />
                    </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Gender<Typography component="span" color="red">*</Typography></FormLabel>
                        <RadioGroup row name="gender" value={formData.gender} onChange={handleChange}>
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                            <FormControlLabel value="other" control={<Radio />} label="Other" />
                        </RadioGroup>
                        {formErrors.gender && <Typography color="error">{formErrors.gender}</Typography>}
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2}>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Mobile Number<Typography component="span" color="red">*</Typography></FormLabel>
                        <TextField fullWidth name="mobile_number" variant="outlined" size="small" value={formData.mobile_number} onChange={handleChange} inputProps={{ maxLength: 10 }} error={!!formErrors.mobile_number} helperText={formErrors.mobile_number} />
                    </Box>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Email<Typography component="span" color="red">*</Typography></FormLabel>
                        <TextField fullWidth name="email" variant="outlined" size="small" value={formData.email} onChange={handleChange} error={!!formErrors.email} helperText={formErrors.email} />
                    </Box>
                    <Box flex={1}>
                        <FormLabel sx={{
                            margin: 0, fontWeight: 500, fontSize: "16px", lineHeight: "20px",
                            fontFamily: "Archivo, 'Archivo Fallback'", color: "rgb(28, 29, 31)"
                        }}>Age<Typography component="span" color="red">*</Typography></FormLabel>
                        <TextField fullWidth name="age" type="number" variant="outlined" size="small" value={formData.age} onChange={handleChange} error={!!formErrors.age} helperText={formErrors.age} />
                    </Box>
                </Stack>

                <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                    <Button type="submit" variant="contained" color="primary">
                        {formData.id ? "Update & Next" : "Save & Next"}
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default License;