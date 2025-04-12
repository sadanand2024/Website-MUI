"use client";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Stack,
    MenuItem,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { styled } from '@mui/material/styles';
import axios from "axios";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

const Screen4 = () => {
    const [loading, setLoading] = useState(false);
    const [isExisting, setIsExisting] = useState(false);
    const searchParams = useSearchParams()
    const id = searchParams.get("id");

    const [fileNames, setFileNames] = useState({
        id_proof: null,
        photos_of_partnership: null,
        property_tax_receipt: null,
        rental_or_lease_deed: null,
    });

    const [formData, setFormData] = useState({
        license: id || "",
        license_validity: "",
        type_of_constitution: "",
        road_type: "",
        id_proof: null,
        photos_of_partnership: null,
        property_tax_receipt: null,
        rental_or_lease_deed: null,
    });

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

    const [partners, setPartners] = useState([
        { partner_name: "", partner_address: "", designation: "", id: null },
    ]);

    // Fetch existing data when component mounts
    useEffect(() => {
        const fetchData = async () => {
            if (!id) return;

            setLoading(true);
            try {
                const response = await axios.get(`http://192.168.1.20:8000/tradelicense/trade-entity/${id}/`);
                const data = response.data;
                fetchPartners(id);
                const existingFileNames = {
                    id_proof: data.id_proof ? data.id_proof.split('/').pop() : null,
                    photos_of_partnership: data.photos_of_partnership ? data.photos_of_partnership.split('/').pop() : null,
                    property_tax_receipt: data.property_tax_receipt ? data.property_tax_receipt.split('/').pop() : null,
                    rental_or_lease_deed: data.rental_or_lease_deed ? data.rental_or_lease_deed.split('/').pop() : null,
                };

                setFileNames(existingFileNames);

                setFormData({
                    ...formData,
                    license: id,
                    name_of_entity: data.name_of_entity || "",
                    trade_premises: data.trade_premises || "",
                    trade_description: data.trade_description || "",
                    total_area: data.total_area || "",
                    ownership_type: data.ownership_type || "",
                    license_validity: data.license_validity || "",
                    type_of_constitution: data.type_of_constitution || "",
                    road_type: data.road_type || "",
                    // Address fields
                    flatDoorNo: data.address.flatDoorNo || "",
                    streetName: data.address.streetName || "",
                    locality: data.address.locality || "",
                    colony: data.address.colony || "",
                    ward: data.address.ward || "",
                    zone: data.address.zone || "",
                    pinCode: data.address.pinCode || "",
                    state: data.address.state || "",
                    district: data.address.district || "",
                });

                setIsExisting(true);

            } catch (error) {
                console.error("Error fetching trade entity data:", error);
                // If data doesn't exist, we'll create a new entry
                setIsExisting(false);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    // Fetch partner details
    const fetchPartners = async (licenseId) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://192.168.1.20:8000/tradelicense/partner-details/${licenseId}/`);
            if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                // Map fetched partner data to component state
                const fetchedPartners = response.data.map(partner => ({
                    partner_name: partner.partner_name,
                    partner_address: partner.partner_address,
                    designation: partner.designation,
                    id: partner.id
                }));
                setPartners(fetchedPartners);
            }
        } catch (error) {
            console.error("Error fetching partner details:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddRow = () => {
        setPartners([...partners, { partner_name: "", partner_address: "", designation: "", id: null }]);
    };

    const handlePartnerChange = (index, field, value) => {
        const newPartners = [...partners];
        newPartners[index][field] = value;
        setPartners(newPartners);
    };

    const handleClearRow = async (index) => {
        const partner = partners[index];
        if (partner.id) {
            try {
                const response = await axios.delete(`http://192.168.1.20:8000/tradelicense/partner-details/${partner.id}/`);
                if (response.status === 204) {
                    alert("Partner details deleted successfully!");
                    const updatedPartners = partners.filter((_, i) => i !== index);
                    setPartners(updatedPartners.length ? updatedPartners : [{ partner_name: "", partner_address: "", designation: "", id: null }]);
                };
            } catch (error) {
                console.error("Error deleting partner:", error);
            }
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFormData({ ...formData, [e.target.name]: file });
        setFileNames({ ...fileNames, [e.target.name]: file.name });
    };

    const handleSavePartner = async (index) => {
        const partner = partners[index];

        // Validate partner data before saving
        if (!partner.partner_name || !partner.partner_address || !partner.designation) {
            alert("Please fill in all partner details before saving.");
            return;
        }

        const data = new FormData();
        data.append("partner_name", partner.partner_name);
        data.append("partner_address", partner.partner_address);
        data.append("designation", partner.designation);
        data.append("license", formData.license);
        try {
            let response;
            if (partner.id) {
                response = await axios.put(`http://192.168.1.20:8000/tradelicense/partner-details/${partner.id}/`, data);
            } else {
                response = await axios.post("http://192.168.1.20:8000/tradelicense/partner-details/", data);
            }

            if (response.status === 200 || response.status === 201) {
                alert("Partner details saved successfully!");

                // Update partners array with returned ID
                const newPartners = [...partners];
                if (response.data && response.data.id) {
                    newPartners[index].id = response.data.id;
                    setPartners(newPartners);
                }
            }
        } catch (error) {
            console.error("Error saving partner details:", error);
            alert("Failed to save partner details.");
        }
    };
    const router = useRouter()
    const handlePrevious = () => {
        router.push(`/tradelicense/screen3?id=${id}`)
    };

    const handleSubmitData = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();

        // Convert address object to JSON string
        const address = JSON.stringify({
            flatDoorNo: formData.flatDoorNo,
            streetName: formData.streetName,
            locality: formData.locality,
            colony: formData.colony,
            ward: formData.ward,
            zone: formData.zone,
            pinCode: formData.pinCode,
            state: formData.state,
            district: formData.district,
        });

        // Append all form fields
        data.append("license", formData.license);
        data.append("name_of_entity", formData.name_of_entity);
        data.append("trade_premises", formData.trade_premises);
        data.append("trade_description", formData.trade_description);
        data.append("total_area", formData.total_area);
        data.append("ownership_type", formData.ownership_type);
        data.append("address", address);
        data.append("license_validity", formData.license_validity);
        data.append("type_of_constitution", formData.type_of_constitution);
        data.append("road_type", formData.road_type);

        if (formData.id_proof instanceof File) {
            data.append("id_proof", formData.id_proof);
        }
        if (formData.photos_of_partnership instanceof File) {
            data.append("photos_of_partnership", formData.photos_of_partnership);
        }
        if (formData.property_tax_receipt instanceof File) {
            data.append("property_tax_receipt", formData.property_tax_receipt);
        }
        if (formData.rental_or_lease_deed instanceof File) {
            data.append("rental_or_lease_deed", formData.rental_or_lease_deed);
        }

        // Also send partner data indices
        // partners.forEach((partner, index) => {
        //   if (partner.id) {
        //     data.append(`partner_ids[${index}]`, partner.id);
        //   }
        // });

        try {
            let response;

            if (isExisting) {
                // Update existing entity
                response = await axios.put(`http://192.168.1.20:8000/tradelicense/trade-entity/${id}/`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            } else {
                // Create new entity
                response = await axios.put(`http://192.168.1.20:8000/tradelicense/trade-entity/${id}/`, data, {
                    headers: { "Content-Type": "multipart/form-data" },
                });
            }

            if (response.status === 200 || response.status === 201) {
                // If we created a new entity, update the license ID for future partner saves
                if (!isExisting && response.data && response.data.license) {
                    setFormData(prev => ({ ...prev, license: response.data.license }));
                }
                router.push(`/success?id=${id}`);
                console.log("Success:", response.data);
                alert(isExisting ? "Trade license updated successfully!" : "Trade license created successfully!");
            }
        } catch (error) {
            console.error("Error submitting form:", error);
            alert("Error submitting form. Please check your data and try again.");
        } finally {
            setLoading(false);
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
        <Box
            component="form"
            onSubmit={handleSubmitData}
            sx={{
                width: '100%',
                maxWidth: 800,
                margin: "auto",
                padding: 3,
                border: 1,
                borderRadius: 5,
                mt: 2,
                mb: 2,
                borderColor: "grey.400",
            }}
        >
            <Typography variant="h4" align="center" gutterBottom sx={{ padding: 1 }}>
                {isExisting ? "Update Trade License" : "Trade License Registration"}
            </Typography>

            <Stack spacing={3}>
                {/* License Validity & Type of Constitution */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>License Validity</FormLabel>
                        <TextField
                            select
                            name="license_validity"
                            value={formData.license_validity}
                            onChange={handleChange}
                            size="small"
                        >
                            <MenuItem value="1 Year">1 Year</MenuItem>
                            <MenuItem value="2 Year">2 Year</MenuItem>
                            <MenuItem value="3 Year">3 Year</MenuItem>
                        </TextField>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Type of Constitution</FormLabel>
                        <TextField
                            select
                            name="type_of_constitution"
                            value={formData.type_of_constitution}
                            onChange={handleChange}
                            size="small"
                        >
                            <MenuItem value="proprietorship">Proprietorship</MenuItem>
                            <MenuItem value="company">Company</MenuItem>
                            <MenuItem value="partnership">Partnership</MenuItem>
                            <MenuItem value="trust">Trust</MenuItem>
                        </TextField>
                    </FormControl>
                </Stack>

                {/* Partner's Details */}
                <Box sx={{ border: "1px solid gray", p: 2, borderRadius: 2 }}>
                    <Typography variant="h6" gutterBottom>
                        Partner's Details
                    </Typography>

                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            sx={{
                                fontWeight: "bold",
                                textAlign: "center",
                                mb: 2
                            }}
                        >
                            <Box sx={{ flex: 1 }}>S. No</Box>
                            <Box sx={{ flex: 3 }}>Name of Partner</Box>
                            <Box sx={{ flex: 4 }}>Address</Box>
                            <Box sx={{ flex: 3 }}>Designation in Company</Box>
                        </Stack>

                        {partners.map((partner, index) => (
                            <Stack key={index} spacing={2}>
                                <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={2}
                                >
                                    <Box sx={{ flex: 1, textAlign: "center" }}>{index + 1}.</Box>

                                    <Stack sx={{ flex: 3 }}>
                                        <FormLabel>Name Of Partner</FormLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={partner.partner_name || ""}
                                            onChange={(e) => handlePartnerChange(index, "partner_name", e.target.value)}
                                        />
                                    </Stack>

                                    <Stack sx={{ flex: 4 }}>
                                        <FormLabel>Address</FormLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={partner.partner_address || ""}
                                            onChange={(e) => handlePartnerChange(index, "partner_address", e.target.value)}
                                        />
                                    </Stack>

                                    <Stack sx={{ flex: 3 }}>
                                        <FormLabel>Designation of Applicant</FormLabel>
                                        <TextField
                                            fullWidth
                                            size="small"
                                            value={partner.designation || ""}
                                            onChange={(e) => handlePartnerChange(index, "designation", e.target.value)}
                                        />
                                    </Stack>
                                </Stack>

                                <Stack
                                    direction="row"
                                    justifyContent="center"
                                    spacing={2}
                                    sx={{ mt: 1 }}
                                >
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleSavePartner(index)}
                                    >
                                        Save
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        onClick={() => handleClearRow(index)}
                                    >
                                        Clear
                                    </Button>
                                </Stack>
                            </Stack>
                        ))}

                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleAddRow}
                            sx={{ alignSelf: 'flex-start', mt: 2 }}
                        >
                            + Add New Row
                        </Button>
                    </Stack>
                </Box>

                {/* File Uploads */}
                <Stack spacing={2}>
                    <Typography variant="h6">Upload Required Documents</Typography>
                    <Typography sx={{ fontSize: "12px", color: "red" }}>
                        * File size must be less than 5MB! Allowed formats: .pdf, .docx, .jpg, .jpeg, .png
                    </Typography>

                    {[
                        { name: "id_proof", label: "Id Proof" },
                        { name: "photos_of_partnership", label: "Photo of Partnership" },
                        { name: "property_tax_receipt", label: "Property Tax Receipt" },
                        { name: "rental_or_lease_deed", label: "Rental/Lease" }
                    ].map(({ name, label }) => (
                        <Stack
                            key={name}
                            direction="row"
                            alignItems="center"
                            spacing={2}
                        >
                            <FormLabel sx={{ flex: 2 }}>{label}</FormLabel>
                            <Button
                                component="label"
                                variant="contained"
                                startIcon={<CloudUploadIcon />}
                                sx={{
                                    flex: 1,
                                    width: '120px',  // Explicitly set a narrower width
                                    maxWidth: '120px' // Optional: ensure it doesn't get too wide
                                }}
                            >
                                Upload
                                <VisuallyHiddenInput
                                    type="file"
                                    onChange={handleFileChange}
                                    name={name}
                                />
                            </Button>
                            {fileNames[name] && (
                                <Typography sx={{ flex: 2 }}>
                                    {fileNames[name]}
                                </Typography>
                            )}
                        </Stack>
                    ))}
                </Stack>

                {/* Road Type */}
                <Stack spacing={1}>
                    <FormLabel>* Confirm the Road type (i.e, Single lane, Double lane)</FormLabel>
                    <TextField
                        select
                        name="road_type"
                        value={formData.road_type}
                        onChange={handleChange}
                        size="small"
                    >
                        <MenuItem value="single_lane">Single lane</MenuItem>
                        <MenuItem value="double_lane">Double lane</MenuItem>
                    </TextField>
                </Stack>

                {/* Navigation Buttons */}
                <Stack
                    direction="row"
                    justifyContent="center"
                    spacing={2}
                >
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
                        type="submit"
                    >
                        Submit
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default Screen4;