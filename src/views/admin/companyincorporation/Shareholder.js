"use client";

import React, { useState, useEffect } from 'react';
import {
    Box,
    Stack,
    Typography,
    FormControl,
    Select,
    MenuItem,
    TextField,
    FormLabel,
    FormHelperText,
    Button,
    CircularProgress
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'


const ShareholdersForm = () => {

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

    const router = useRouter()

    const searchParams = useSearchParams()
    const company = searchParams.get("id");

    // Shareholders state management
    const [numShareholders, setNumShareholders] = useState(0);
    const [selectedShareholder, setSelectedShareholder] = useState(1);
    const [shareholders, setShareholders] = useState([]);
    const [shareholderErrors, setShareholderErrors] = useState({});
    const [formSubmitted, setFormSubmitted] = useState(false);
    const [validatingShareholder, setValidatingShareholder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [existingData, setExistingData] = useState(false);

    // Create empty shareholder object
    const createEmptyShareholder = () => ({
        company: company || "",
        type: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        mobile: '',
        holding_percentage: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        pincode: '',
        pan_number_file: null,
        address_proof: '',
        address_proof_file: null,
        bank_statement_file: null,
        id: null, // To track if this is an existing record
        pan_file_name: '', // To track existing file names
        address_proof_file_name: '',
        bank_statement_file_name: ''
    });

    // Fetch existing shareholders data
    useEffect(() => {
        if (company) {
            fetchShareholdersData();
        } else {
            setLoading(false);
        }
    }, [company]);

    const fetchShareholdersData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`http://192.168.1.20:8000/companyincorporation/share-holders/${company}/`);

            if (response.data && response.data.length > 0) {
                // Format the data from API to match our component state structure
                const formattedShareholders = response.data.map(sh => {
                    // Parse address JSON if it's a string
                    let address = sh.address;
                    if (typeof address === 'string') {
                        try {
                            address = JSON.parse(address);
                        } catch (e) {
                            console.error("Error parsing address JSON:", e);
                            address = { address_line_1: '', address_line_2: '', city: '', state: '', pincode: '' };
                        }
                    }

                    return {
                        id: sh.id,
                        company: sh.company,
                        type: sh.type_of_shareholder ? sh.type_of_shareholder.charAt(0).toUpperCase() + sh.type_of_shareholder.slice(1) : '',
                        first_name: sh.first_name || '',
                        middle_name: sh.middle_name || '',
                        last_name: sh.last_name || '',
                        email: sh.email || '',
                        mobile: sh.mobile || '',
                        holding_percentage: sh.holding_percentage || '',
                        address1: address.address_line_1 || '',
                        address2: address.address_line_2 || '',
                        city: address.city || '',
                        state: address.state || '',
                        pincode: address.pincode || '',
                        pan_number_file: null, // We don't get the actual file back
                        pan_number_file_name: sh.pan_number_file ? sh.pan_number_file.split('/').pop() : '',
                        address_proof: sh.address_proof || '',
                        address_proof_file: null,
                        address_proof_file_name: sh.address_proof_file ? sh.address_proof_file.split('/').pop() : '',
                        bank_statement_file: null,
                        bank_statement_file_name: sh.bank_statement_file ? sh.bank_statement_file.split('/').pop() : ''
                    };
                });

                setShareholders(formattedShareholders);
                setNumShareholders(formattedShareholders.length);
                setExistingData(true);
            } else {
                // No existing data, set empty state
                setNumShareholders(0);
                setShareholders([]);
                setExistingData(false);
            }
        } catch (error) {
            console.error('Error fetching shareholders data:', error);
            // Set empty state in case of error
            setShareholders([]);
            setExistingData(false);
        } finally {
            setLoading(false);
        }
    };

    // Handle shareholders count change - Modified to handle decreasing the count properly
    const handleNumShareholdersChange = (event) => {
        const inputValue = event.target.value;

        // Check if the input is empty
        if (inputValue === '') {
            setNumShareholders('');
            setShareholders([]);
            setShareholderErrors({});
            return;
        }

        // Parse as integer
        let count = parseInt(inputValue);

        // Validate the input
        if (isNaN(count) || count < 0) {
            return; // Ignore invalid inputs
        }

        // Limit to maximum of 15 shareholders
        if (count > 15) {
            count = 15;
        }

        // Store previous count for comparison
        const prevCount = numShareholders;
        setNumShareholders(count);

        if (count === 0) {
            setShareholders([]);
            setShareholderErrors({});
            return;
        }

        // If we're decreasing the number of shareholders
        if (count < prevCount) {
            // Keep only the data for the remaining shareholders
            const newShareholders = shareholders.slice(0, count);
            setShareholders(newShareholders);

            // Keep only the errors for the remaining shareholders
            const newErrors = {};
            for (let i = 0; i < count; i++) {
                if (shareholderErrors[i]) {
                    newErrors[i] = shareholderErrors[i];
                } else {
                    newErrors[i] = {};
                }
            }
            setShareholderErrors(newErrors);

            // If selected shareholder is now out of bounds, select the last available one
            if (selectedShareholder > count) {
                setSelectedShareholder(count);
            }
        }
        // If we're increasing the number of shareholders
        else if (count > prevCount) {
            // Create new empty shareholders for the additional ones
            const additionalShareholders = Array.from(
                { length: count - prevCount },
                () => createEmptyShareholder()
            );

            const newShareholders = [...shareholders, ...additionalShareholders];
            setShareholders(newShareholders);

            // Initialize empty errors for new shareholders
            const newErrors = { ...shareholderErrors };
            for (let i = prevCount; i < count; i++) {
                newErrors[i] = {};
            }
            setShareholderErrors(newErrors);

            // If this is the first addition (from 0), select the first shareholder
            if (prevCount === 0) {
                setSelectedShareholder(1);
            }
        }
    };

    // Handle shareholder field change
    const handleShareholderChange = (index, field, value) => {
        const updatedShareholders = [...shareholders];
        updatedShareholders[index] = { ...updatedShareholders[index], [field]: value };
        setShareholders(updatedShareholders);

        // Clear error for this field if it exists
        if (shareholderErrors[index]?.[field]) {
            const updatedErrors = { ...shareholderErrors };
            delete updatedErrors[index][field];
            setShareholderErrors(updatedErrors);
        }
        if (field === "pincode" && value.length === 6 && /^\d{6}$/.test(value)) {
            fetchPincodeData(value, index);
        }

        // If pincode is cleared, reset city and state
        if (field === "pincode" && value === "") {
            setShareholders(prev => {
                const updatedShareholders = [...prev];
                updatedShareholders[index] = {
                    ...updatedShareholders[index],
                    city: "",
                    state: ""
                };
                return updatedShareholders;
            });

            // Clear city and state errors
            setShareholderErrors(prev => {
                const updatedErrors = { ...prev };
                delete updatedErrors[index]?.city;
                delete updatedErrors[index]?.state;
                return updatedErrors;
            });
        }

    };

    const requiredAsterisk = (
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
    );

    // Handle file upload for shareholders
    // Handle file upload for shareholders
    const handleFileUpload = (index, field, event) => {
        const file = event.target.files[0];
        if (file) {
            // Update the actual file in the shareholders state
            const updatedShareholders = [...shareholders];
            updatedShareholders[index] = {
                ...updatedShareholders[index],
                [field]: file,
                [`${field.replace('_file', '')}_file_name`]: file.name // Fix: correctly set the file name field
            };
            setShareholders(updatedShareholders);

            // Clear any error for this field
            if (shareholderErrors[index]?.[field]) {
                const updatedErrors = { ...shareholderErrors };
                delete updatedErrors[index][field];
                setShareholderErrors(updatedErrors);
            }
        }
    };

    // Validation functions
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return email === '' || emailRegex.test(email) ? '' : 'Please enter a valid email address';
    };

    const validateMobile = (mobile) => {
        const mobileRegex = /^[6789]\d{9}$/; // Starts with 6-9 and has 10 digits
        return mobile === '' || mobileRegex.test(mobile) ? '' : 'Please enter a valid 10-digit mobile number starting with 6-9';
    };

    const validatePincode = (pincode) => {
        const pincodeRegex = /^[0-9]{6}$/;
        return pincode === '' || pincodeRegex.test(pincode) ? '' : 'Please enter a valid 6-digit PIN code';
    };

    // Validate single shareholder
    const validateShareholder = (shareholderIndex) => {
        // Check if the shareholder index is valid
        if (shareholderIndex < 0 || shareholderIndex >= numShareholders) {
            return false;
        }

        let isValid = true;
        const updatedErrors = { ...shareholderErrors };
        const shareholder = shareholders[shareholderIndex];

        if (!shareholder) return false;

        // Required fields
        const requiredFields = {
            type: 'Please select shareholder type',
            first_name: 'First name is required',
            last_name: 'Last name is required',
            holding_percentage: 'Holding percentage is required',
            email: 'Email is required',
            mobile: 'Mobile number is required',
            address1: 'Address Line 1 is required',
            city: 'City is required',
            state: 'State is required',
            pincode: 'PIN code is required',
            address_proof: 'This field is required',
        };

        // Check required fields
        for (const [field, errorMessage] of Object.entries(requiredFields)) {
            if (!shareholder[field]) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex][field] = errorMessage;
                isValid = false;
            }
        }

        // File validation only if new record or file is changed
        if (!shareholder.id) {
            // New shareholder - require all files
            if (!shareholder.pan_number_file) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex].pan_number_file = 'PAN upload is required';
                isValid = false;
            }

            if (!shareholder.address_proof_file) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex].address_proof_file = 'Address proof upload is required';
                isValid = false;
            }
        }

        // Email validation (if provided)
        if (shareholder.email) {
            const emailError = validateEmail(shareholder.email);
            if (emailError) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex].email = emailError;
                isValid = false;
            }
        }

        // Mobile validation (if provided)
        if (shareholder.mobile) {
            const mobileError = validateMobile(shareholder.mobile);
            if (mobileError) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex].mobile = mobileError;
                isValid = false;
            }
        }

        // Pincode validation
        if (shareholder.pincode) {
            const pincodeError = validatePincode(shareholder.pincode);
            if (pincodeError) {
                updatedErrors[shareholderIndex] = updatedErrors[shareholderIndex] || {};
                updatedErrors[shareholderIndex].pincode = pincodeError;
                isValid = false;
            }
        }

        setShareholderErrors(updatedErrors);
        return isValid;
    };

    // Validate entire form
    const validateForm = () => {
        let isValid = true;

        // Only validate existing shareholders
        for (let i = 0; i < numShareholders; i++) {
            if (!validateShareholder(i)) {
                isValid = false;
            }
        }

        return isValid;
    };

    const createShareholderFormData = (shareholder) => {
        const formData = new FormData();
        formData.append("company", company);
        formData.append("address",
            JSON.stringify({
                "address_line_1": shareholder.address1,
                "address_line_2": shareholder.address2,
                "city": shareholder.city,
                "state": shareholder.state,
                "pincode": shareholder.pincode
            })
        );
        formData.append("type_of_shareholder", shareholder.type.toLowerCase());
        formData.append("first_name", shareholder.first_name);
        formData.append("middle_name", shareholder.middle_name || '');
        formData.append("last_name", shareholder.last_name);
        formData.append("email", shareholder.email);
        formData.append("mobile", shareholder.mobile);
        formData.append("holding_percentage", shareholder.holding_percentage);
        formData.append("address_proof", shareholder.address_proof);

        // Check if files exist before appending
        if (shareholder.pan_number_file instanceof File) {
            console.log("Appending PAN file:", shareholder.pan_number_file.name);
            formData.append("pan_number_file", shareholder.pan_number_file);
        }

        if (shareholder.address_proof_file instanceof File) {
            console.log("Appending address proof file:", shareholder.address_proof_file.name);
            formData.append("address_proof_file", shareholder.address_proof_file);
        }

        if (shareholder.bank_statement_file instanceof File) {
            console.log("Appending bank statement file:", shareholder.bank_statement_file.name);
            formData.append("bank_statement_file", shareholder.bank_statement_file);
        }

        return formData;
    };

    const fetchPincodeData = async (pincode, index) => {
        if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) return; // Ensure valid pincode format

        try {
            const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
            const data = await response.json();

            if (data && data[0]?.Status === "Success" && data[0]?.PostOffice?.length > 0) {
                const postOffice = data[0].PostOffice[0];

                setShareholders(prev => {
                    const updatedShareholders = [...prev];
                    updatedShareholders[index] = {
                        ...updatedShareholders[index],
                        city: postOffice.Block || postOffice.Name,
                        state: postOffice.State,
                    };
                    return updatedShareholders;
                });

                // Remove errors for city and state if they exist
                setShareholderErrors(prev => {
                    const updatedErrors = { ...prev };
                    delete updatedErrors[index]?.city;
                    delete updatedErrors[index]?.state;
                    return updatedErrors;
                });
            }
        } catch (error) {
            console.error("Error fetching pincode data:", error);
        }
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormSubmitted(true);

        if (numShareholders <= 0) {
            return;
        }

        const currentIndex = selectedShareholder - 1;
        setValidatingShareholder(currentIndex);

        if (currentIndex >= 0 && currentIndex < numShareholders) {
            if (validateShareholder(currentIndex)) {
                if (selectedShareholder < numShareholders) {
                    setSelectedShareholder(selectedShareholder + 1);
                } else {
                    if (validateForm()) {
                        console.log('Form data is valid:', shareholders.slice(0, numShareholders));

                        // API call to save each shareholder individually
                        for (let i = 0; i < numShareholders; i++) {
                            const shareholder = shareholders[i];
                            const formData = createShareholderFormData(shareholder);

                            try {
                                let response;

                                if (shareholder.id) {
                                    response = await axios.put(
                                        `http://192.168.1.20:8000/companyincorporation/share-holders/${shareholder.id}/`,
                                        formData,
                                        { headers: { "Content-Type": "multipart/form-data" } }
                                    );
                                    console.log(`Shareholder ${i + 1} updated successfully`);
                                } else {
                                    response = await axios.post(
                                        "http://192.168.1.20:8000/companyincorporation/share-holders/",
                                        formData,
                                        { headers: { "Content-Type": "multipart/form-data" } }
                                    );
                                    console.log(`Shareholder ${i + 1} created successfully`);
                                }

                                if (response.status !== 200 && response.status !== 201) {
                                    throw new Error(`Failed to submit shareholder ${i + 1}`);
                                }
                            } catch (error) {
                                console.error('Error saving shareholder:', error);
                            }
                        }

                        // Navigate to next page after all shareholders are processed
                        router.push(`/companyincorporation/screen4?id=${company}`);
                    } else {
                        // Find first shareholder with errors and select it
                        for (let i = 0; i < numShareholders; i++) {
                            if (shareholderErrors[i] && Object.keys(shareholderErrors[i]).length > 0) {
                                setSelectedShareholder(i + 1);
                                break;
                            }
                        }
                    }
                }
            }
        }
        setValidatingShareholder(null);
    };

    // Shareholder types options
    const shareholderTypes = [
        'Individual',
        'Company'
    ];

    // Display loading state
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
                <Typography variant="h6" sx={{ ml: 2 }}>
                    Loading...
                </Typography>
            </Box>
        );
    }

    return (
        <Box sx={{ width: 700, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2, borderColor: "grey.400", }}>
            <Stack spacing={4}>
                <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
                    Shareholders Information
                </Typography>
                <Box>
                    <FormLabel>No. of Shareholders</FormLabel>
                    <TextField
                        fullWidth
                        size='small'
                        value={numShareholders}
                        onChange={handleNumShareholdersChange}
                        type="number"
                        InputProps={{ inputProps: { min: 0, max: 15 } }}
                        helperText={!numShareholders ? "Please enter the number of shareholders (maximum 15)" : "Maximum 15 shareholders allowed"}
                        error={formSubmitted && !numShareholders}
                    />
                </Box>

                {numShareholders > 0 && (
                    <Box mt={3}>
                        {/* Shareholder Selection Tabs */}
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 2, mb: 3, flexWrap: "wrap" }}>
                            {[...Array(parseInt(numShareholders))].map((_, index) => (
                                <Typography
                                    key={index}
                                    variant="subtitle1"
                                    sx={{
                                        cursor: "pointer",
                                        paddingBottom: "8px",
                                        borderBottom: selectedShareholder === index + 1 ? "3px solid #1976d2" : "none",
                                        color: selectedShareholder === index + 1 ? "#1976d2" : "black",
                                        margin: "0 4px 8px 4px",
                                    }}
                                    onClick={() => setSelectedShareholder(index + 1)}
                                >
                                    Shareholder {index + 1}
                                </Typography>
                            ))}
                        </Box>

                        {/* Shareholder Form */}
                        <Box sx={{ mt: 3 }}>
                            {shareholders.slice(0, numShareholders).map((shareholder, index) => (
                                <Box key={index} sx={{ display: selectedShareholder === index + 1 ? 'block' : 'none' }}>
                                    <Stack spacing={3}>
                                        <FormControl fullWidth required error={!!shareholderErrors[index]?.type}>
                                            <Typography variant="subtitle1" gutterBottom>Type of Shareholder{requiredAsterisk}</Typography>
                                            <Select
                                                value={shareholder.type}
                                                name='type'
                                                displayEmpty
                                                size='small'
                                                onChange={(e) => handleShareholderChange(index, 'type', e.target.value)}
                                            >
                                                <MenuItem value="" disabled defaultChecked>
                                                    Select
                                                </MenuItem>
                                                {shareholderTypes.map((type) => (
                                                    <MenuItem key={type} value={type}>
                                                        {type}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                            {shareholderErrors[index]?.type && (
                                                <FormHelperText error>{shareholderErrors[index].type}</FormHelperText>
                                            )}
                                        </FormControl>


                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Shareholder Name {requiredAsterisk}
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                                {/* First Name */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>First Name {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        value={shareholder.first_name}
                                                        onChange={(e) => handleShareholderChange(index, 'first_name', e.target.value)}
                                                        error={!!shareholderErrors[index]?.first_name}
                                                        helperText={shareholderErrors[index]?.first_name}
                                                        required
                                                    />
                                                </Box>

                                                {/* Middle Name */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Middle Name</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        value={shareholder.middle_name}
                                                        onChange={(e) => handleShareholderChange(index, 'middle_name', e.target.value)}
                                                    />
                                                </Box>

                                                {/* Last Name */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Last Name {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size='small'
                                                        value={shareholder.last_name}
                                                        onChange={(e) => handleShareholderChange(index, 'last_name', e.target.value)}
                                                        error={!!shareholderErrors[index]?.last_name}
                                                        helperText={shareholderErrors[index]?.last_name}
                                                        required
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>


                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Shareholder Contact Information {requiredAsterisk}
                                            </Typography>

                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                                {/* Email Field */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Email {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        type="email"
                                                        value={shareholder.email}
                                                        onChange={(e) => handleShareholderChange(index, 'email', e.target.value)}
                                                        error={!!shareholderErrors[index]?.email}
                                                        helperText={shareholderErrors[index]?.email}
                                                        onBlur={(e) => {
                                                            const error = validateEmail(e.target.value);
                                                            if (error) {
                                                                const updatedErrors = { ...shareholderErrors };
                                                                updatedErrors[index] = updatedErrors[index] || {};
                                                                updatedErrors[index].email = error;
                                                                setShareholderErrors(updatedErrors);
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* Mobile Number Field */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>Mobile Number {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={shareholder.mobile}
                                                        onChange={(e) => handleShareholderChange(index, 'mobile', e.target.value)}
                                                        error={!!shareholderErrors[index]?.mobile}
                                                        helperText={shareholderErrors[index]?.mobile}
                                                        onBlur={(e) => {
                                                            const error = validateMobile(e.target.value);
                                                            if (error) {
                                                                const updatedErrors = { ...shareholderErrors };
                                                                updatedErrors[index] = updatedErrors[index] || {};
                                                                updatedErrors[index].mobile = error;
                                                                setShareholderErrors(updatedErrors);
                                                            }
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>% of Holding{requiredAsterisk}</Typography>
                                            <TextField
                                                fullWidth
                                                size='small'
                                                value={shareholder.holding_percentage}
                                                onChange={(e) => handleShareholderChange(index, 'holding_percentage', e.target.value)}
                                                error={!!shareholderErrors[index]?.holding_percentage}
                                                helperText={shareholderErrors[index]?.holding_percentage || "Value must be between 0 and 100"}
                                                required
                                                type="number"
                                                InputProps={{ inputProps: { min: 0, max: 100, step: 0.01 } }}
                                            />
                                        </Box>


                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Address Details {requiredAsterisk}
                                            </Typography>

                                            {/* Address Line 1 */}
                                            <Box sx={{ mt: 2 }}>
                                                <FormLabel>Address Line 1 {requiredAsterisk}</FormLabel>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={shareholder.address1}
                                                    onChange={(e) => handleShareholderChange(index, 'address1', e.target.value)}
                                                    error={!!shareholderErrors[index]?.address1}
                                                    helperText={shareholderErrors[index]?.address1}
                                                    required
                                                />
                                            </Box>

                                            {/* Address Line 2 */}
                                            <Box sx={{ mt: 2, mb: 2 }}>
                                                <FormLabel>Address Line 2</FormLabel>
                                                <TextField
                                                    fullWidth
                                                    size="small"
                                                    value={shareholder.address2}
                                                    onChange={(e) => handleShareholderChange(index, 'address2', e.target.value)}
                                                />

                                            </Box>

                                            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
                                                {/* Pincode */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>PIN Code {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={shareholder.pincode}
                                                        onChange={(e) => handleShareholderChange(index, 'pincode', e.target.value)}
                                                        error={!!shareholderErrors[index]?.pincode}
                                                        helperText={shareholderErrors[index]?.pincode}
                                                        required
                                                        inputProps={{ maxLength: 6 }}
                                                        onBlur={(e) => {
                                                            const error = validatePincode(e.target.value);
                                                            if (error) {
                                                                const updatedErrors = { ...shareholderErrors };
                                                                updatedErrors[index] = updatedErrors[index] || {};
                                                                updatedErrors[index].pincode = error;
                                                                setShareholderErrors(updatedErrors);
                                                            }
                                                        }}
                                                    />
                                                </Box>

                                                {/* City */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>City {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={shareholder.city}
                                                        onChange={(e) => handleShareholderChange(index, 'city', e.target.value)}
                                                        error={!!shareholderErrors[index]?.city}
                                                        helperText={shareholderErrors[index]?.city}
                                                        required
                                                    />
                                                </Box>

                                                {/* State */}
                                                <Box sx={{ flex: 1 }}>
                                                    <FormLabel>State {requiredAsterisk}</FormLabel>
                                                    <TextField
                                                        fullWidth
                                                        size="small"
                                                        value={shareholder.state}
                                                        onChange={(e) => handleShareholderChange(index, 'state', e.target.value)}
                                                        error={!!shareholderErrors[index]?.state}
                                                        helperText={shareholderErrors[index]?.state}
                                                        required
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Box>
                                            <Typography variant="subtitle1" gutterBottom>
                                                Document Uploads
                                            </Typography>

                                            {/* PAN Card Upload */}
                                            <Box sx={{ mt: 2 }}>
                                                <FormLabel>PAN Card {requiredAsterisk}</FormLabel>
                                                <Button
                                                    component="label"
                                                    variant="contained"
                                                    startIcon={<CloudUploadIcon />}
                                                    sx={{ mr: 2, ml: 2 }}
                                                    color={shareholderErrors[index]?.pan_number_file ? "error" : "primary"}
                                                >
                                                    {"Upload"}
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(index, 'pan_number_file', e)}
                                                    />
                                                </Button>
                                                <Box sx={{ mt: 1, mb: 1, ml: 12 }}>
                                                    {shareholder.pan_number_file_name || (shareholder.pan_number_file && shareholder.pan_number_file.name)}
                                                </Box>
                                                {shareholderErrors[index]?.pan_number_file && (
                                                    <FormHelperText error>{shareholderErrors[index].pan_number_file}</FormHelperText>
                                                )}
                                            </Box>

                                            {/* Address Proof Type */}
                                            <Box sx={{ mt: 2 }}>
                                                <FormLabel>Address Proof Type {requiredAsterisk}</FormLabel>
                                                <FormControl fullWidth error={!!shareholderErrors[index]?.address_proof}>
                                                    <Select
                                                        value={shareholder.address_proof}
                                                        displayEmpty
                                                        size="small"
                                                        onChange={(e) => handleShareholderChange(index, 'address_proof', e.target.value)}
                                                    >
                                                        <MenuItem value="" disabled>Select Proof Type</MenuItem>
                                                        <MenuItem value="Aadhaar">Aadhaar Card</MenuItem>
                                                        <MenuItem value="Passport">Passport</MenuItem>
                                                        <MenuItem value="Driving License">Driving License</MenuItem>
                                                        <MenuItem value="Voter ID">Voter ID</MenuItem>
                                                    </Select>
                                                    {shareholderErrors[index]?.address_proof && (
                                                        <FormHelperText error>{shareholderErrors[index].address_proof}</FormHelperText>
                                                    )}
                                                </FormControl>
                                            </Box>

                                            {/* Address Proof Upload */}
                                            <Box sx={{ mt: 2 }}>
                                                <FormLabel>Address Proof Document {requiredAsterisk}</FormLabel>
                                                <Button
                                                    component="label"
                                                    variant="contained"
                                                    startIcon={<CloudUploadIcon />}
                                                    sx={{ mr: 2, ml: 2 }}
                                                    color={shareholderErrors[index]?.address_proof_file ? "error" : "primary"}
                                                >
                                                    Upload
                                                    <VisuallyHiddenInput
                                                        type="file"
                                                        accept=".pdf,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleFileUpload(index, 'address_proof_file', e)}
                                                    />
                                                </Button>
                                                <Box sx={{ mt: 1, mb: 1, ml: 5 }}>
                                                    {shareholder.address_proof_file_name || (shareholder.address_proof_file && shareholder.address_proof_file.name)}
                                                </Box>
                                                {shareholderErrors[index]?.address_proof_file && (
                                                    <FormHelperText error>{shareholderErrors[index].address_proof_file}</FormHelperText>
                                                )}
                                            </Box>
                                        </Box>
                                    </Stack>
                                </Box>
                            ))}

                            {/* Navigation and Submit Buttons */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => router.push(`/companyincorporation/screen2?id=${company}`)}
                                >
                                    Previous
                                </Button>

                                <Box>
                                    {selectedShareholder > 1 && (
                                        <Button
                                            variant="outlined"
                                            onClick={() => setSelectedShareholder(selectedShareholder - 1)}
                                            sx={{ mr: 2 }}
                                        >
                                            Previous Shareholder
                                        </Button>
                                    )}

                                    {selectedShareholder < numShareholders && (
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            sx={{ mr: 2 }}
                                        >
                                            Next Shareholder
                                        </Button>
                                    )}

                                    {selectedShareholder === numShareholders && (
                                        <Button
                                            variant="contained"
                                            onClick={handleSubmit}
                                            disabled={validatingShareholder !== null}
                                        >
                                            {validatingShareholder !== null ? (
                                                <CircularProgress size={24} color="inherit" />
                                            ) : (
                                                "Submit"
                                            )}
                                        </Button>
                                    )}
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};

export default ShareholdersForm;