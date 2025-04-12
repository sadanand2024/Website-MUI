"use client";
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import {
    Box,
    Button,
    FormLabel,
    Grid,
    Typography
} from "@mui/material";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const NextPage3 = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const id = searchParams.get("id");

    const [formData, setFormData] = useState({
        pan_entity_file: null,
        address_proof_of_establishment: null,
        name_board_file: null,
        authorization_letter: null,
        partnership_deed: null,
        certificate_of_incorporation: null,
        memorandum_of_articles: null,
        photo_file: null
    });

    // State to store original file names from the server
    const [originalFiles, setOriginalFiles] = useState({
        pan_entity_file: null,
        address_proof_of_establishment: null,
        name_board_file: null,
        authorization_letter: null,
        partnership_deed: null,
        certificate_of_incorporation: null,
        memorandum_of_articles: null,
        photo_file: null
    });

    const [errors, setErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);

    // Fetch existing data when component mounts
    useEffect(() => {
        const fetchExistingData = async () => {
            if (id) {
                try {
                    const response = await axios.get(`http://192.168.1.20:8000/labourlicense/employers-file/${id}/`);
                    if (response.data) {
                        // Update original files state with existing file names
                        const existingFiles = {
                            pan_entity_file: response.data.pan_entity_file ? response.data.pan_entity_file.split('/').pop() : null,
                            address_proof_of_establishment: response.data.address_proof_of_establishment ? response.data.address_proof_of_establishment.split('/').pop() : null,
                            name_board_file: response.data.name_board_file ? response.data.name_board_file.split('/').pop() : null,
                            authorization_letter: response.data.authorization_letter ? response.data.authorization_letter.split('/').pop() : null,
                            partnership_deed: response.data.partnership_deed ? response.data.partnership_deed.split('/').pop() : null,
                            certificate_of_incorporation: response.data.certificate_of_incorporation ? response.data.certificate_of_incorporation.split('/').pop() : null,
                            memorandum_of_articles: response.data.memorandum_of_articles ? response.data.memorandum_of_articles.split('/').pop() : null,
                            photo_file: response.data.photo_file ? response.data.photo_file.split('/').pop() : null
                        };
                        setOriginalFiles(existingFiles);
                        setIsEditing(true);
                    }
                } catch (error) {
                    console.error("Error fetching existing data:", error);
                }
            }
        };

        fetchExistingData();
    }, [id]);

    const handleFileChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.files[0] });
    };

    const validateForm = () => {
        let newErrors = {};
        // Your existing validation logic
        const requiredFields = [
            'pan_entity_file',
            'address_proof_of_establishment',
            'name_board_file',
            'authorization_letter',
            'partnership_deed',
            'photo_file'
        ];

        requiredFields.forEach(field => {
            if (!formData[field] && !originalFiles[field]) {
                newErrors[field] = `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} is required`;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const data = new FormData();
                data.append("license", id);

                // Append files, prioritizing newly uploaded files
                const fileFields = [
                    'pan_entity_file',
                    'address_proof_of_establishment',
                    'name_board_file',
                    'authorization_letter',
                    'partnership_deed',
                    'certificate_of_incorporation',
                    'memorandum_of_articles',
                    'photo_file'
                ];

                fileFields.forEach(field => {
                    if (formData[field]) {
                        // New file uploaded
                        data.append(field, formData[field]);
                    } else if (originalFiles[field]) {
                        // Keep existing file if no new file uploaded
                        data.append(`keep_existing_${field}`, 'true');
                    }
                });


                const apiMethod = isEditing ? 'put' : 'post';
                const apiUrl = isEditing

                    ? `http://192.168.1.20:8000/labourlicense/employers-file/${id}/`
                    : "http://192.168.1.20:8000/labourlicense/employers-file/";

                const response = await axios[apiMethod](apiUrl, data);

                if (response.status === 200 || response.status === 201) {
                    console.log("Form saved successfully:", formData);
                    router.push(`/success?id=${id}`);
                    // Optional: navigate to next page or show success message
                }
            } catch (error) {
                console.error("Error saving partner details:", error);
            }
        }
    };

    return (
        <Box sx={{ maxWidth: 600, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2,borderColor: "grey.400", }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold", textAlign: 'center' }}>
                Employee & Establishment Documents
            </Typography>
            <Grid container spacing={3} sx={{ width: 400 }}>
                {[
                    { name: "pan_entity_file", label: "Pan Of Entity" },
                    { name: "address_proof_of_establishment", label: "Address Proof of Establishment (Electricity Bill/Rental Deed)" },
                    { name: "name_board_file", label: "Local Language Name Board Photo of the Shop" },
                    { name: "photo_file", label: "Photo of the Proprietor/Partner/Owner" },
                    { name: "authorization_letter", label: "Authorization Letter" },
                    { name: "partnership_deed", label: "Partnership Deed" },
                    { name: "certificate_of_incorporation", label: "Certificate of Incorporation (Companies)" },
                    { name: "memorandum_of_articles", label: "Memorandum of Articles (Companies)" },
                ].map((fileField, index) => (
                    <Grid item xs={12} key={index}>
                        <FormLabel>{fileField.label} <span style={{ color: 'red' }}>*</span></FormLabel>
                        <Grid container spacing={2} alignItems="center">
                            <Grid item>
                                <input
                                    type="file"
                                    name={fileField.name}
                                    accept=".pdf,.jpg,.png"
                                    style={{ display: "none" }}
                                    id={fileField.name}
                                    onChange={handleFileChange}
                                />
                                <label htmlFor={fileField.name}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        component="span"
                                        startIcon={<CloudUploadIcon />}
                                    >
                                        Upload
                                    </Button>
                                </label>
                            </Grid>
                            <Grid item>
                                <Typography variant="body2">
                                    {formData[fileField.name]
                                        ? formData[fileField.name].name
                                        : (originalFiles[fileField.name]
                                            ? `${originalFiles[fileField.name]}`
                                            : "No file chosen")}
                                </Typography>
                            </Grid>
                        </Grid>
                        {errors[fileField.name] && <Typography color="error">{errors[fileField.name]}</Typography>}
                    </Grid>
                ))}

                {/* Buttons */}
                <Grid item xs={12} sx={{ display: "flex", justifyContent: "space-between", mt: 3, ml: 30 }}>
                    <Button variant="contained" color="primary" onClick={handleSubmit}>
                        {isEditing ? "Update" : "Submit"}
                    </Button>
                </Grid>
            </Grid>
        </Box>
    );
};

export default NextPage3;