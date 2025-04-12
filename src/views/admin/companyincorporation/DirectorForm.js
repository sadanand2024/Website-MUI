"use client";


import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { Box, Button, CircularProgress, Container, FormControl, FormControlLabel, FormLabel, Grid, IconButton, MenuItem, Radio, RadioGroup, Select, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import axios from "axios";
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const DirectorForm = () => {
  const defaultDirectors = [
    {
      id: '', company: "", first_name: '', middle_name: '', last_name: '', father_first_name: '', father_middle_name: '', father_last_name: '', gender: '', dob: '', occupation: '', area_occupation: '', educational: '', nationality: '', address1: '', address2: '', city: '', state: '', pincode: '',
      category_of_directors: '', share_file: null, no_of_share: '', capital: '', percentage_of_holding: '', shareholder: '', proof_address_file: null, proof_address: '', dsc: '', email: '', phone_number: '', pan_number: '', pan_number_file: null, pan_number_file_name: '', aadhar_number: '', aadhar_file_name: '', aadhar_file: null, din: '', din_number: '',
      passport_photo: null, proof_address_file_name: '', passport_photo_name: '', share_file_name: '', signatory_name: ''
    },
  ];

  const router = useRouter()

  const searchParams = useSearchParams()
  const company = searchParams.get("id");
  const RequiredMark = () => <span style={{ color: "red" }}>*</span>;
  const [directors, setDirectors] = useState(defaultDirectors);
  const [currentDirector, setCurrentDirector] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isCompanyEditing, setIsCompanyEditing] = useState(false);
  const [directorsDirectorships, setDirectorsDirectorships] = useState(
    defaultDirectors.map(() => [])
  );
  const [companyFields, setCompanyFields] = useState([]);


  const processCompanyDetails = (data) => {
    if (!data) return [];
    const companiesArray = Array.isArray(data) ? data : [data];

    return companiesArray.map(company => ({
      id: company.id,
      directorId: company.director,
      companyName: company.companyName || '',
      cin: company.cin || '',
      typeOfCompany: company.typeOfCompany || '',
      positionHeld: company.positionHeld || '',
    }));
  };

  // Group directorships by director
  const groupDirectorshipsByDirector = (processedDirectorships) => {
    const groupedDirectorships = directors.map(() => []);
    processedDirectorships.forEach(directorship => {
      const directorIndex = directorship.directorIndex || 0;
      if (directorIndex < groupedDirectorships.length) {
        groupedDirectorships[directorIndex].push(directorship);
      }
    });

    return groupedDirectorships;
  };

  const postData = async () => {
    try {
      const formdata = new FormData();
      formdata.append("company", company);
      const response = await axios.post('http://192.168.1.20:8000/companyincorporation/directors-details/', formdata,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response.data && (response.status === 200 || response.status === 201)) {
        const newDirector = {
          ...defaultDirectors[0],
          id: response.data.id,
          company: company
        };
        setDirectors([newDirector]);
        setDirectorsDirectorships([[]]);
      }
    } catch (error) {
      console.error("Error creating new director:", error);
      setDirectors(defaultDirectors);
      setDirectorsDirectorships(defaultDirectors.map(() => []));
    }
  };

  useEffect(() => {
    const fetchDirectorDetails = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`http://192.168.1.20:8000/companyincorporation/directors-details/${company}/`);
        if (response.status === 200) {
          let responseData = Array.isArray(response.data) ? response.data : [response.data];

          if (responseData.length > 0) {
            const directorsWithNames = responseData.map((director) => {
              let address = director.address;
              let shareholder_details = director.shareholder_details;

              if (typeof address === "string") {
                try {
                  address = JSON.parse(address);
                } catch (e) {
                  console.error("Error parsing address:", e);
                  address = {};
                }
              }
              if (typeof shareholder_details === "string") {
                try {
                  shareholder_details = JSON.parse(shareholder_details);
                } catch (e) {
                  console.error("Error parsing shareholder_details:", e);
                  shareholder_details = {};
                }
              }

              const extractFileName = (filePath) => {
                if (!filePath) return "";
                const parts = filePath.split('/');
                return parts[parts.length - 1];
              };

              const fileNames = {
                proof_address_file: extractFileName(director.proof_address_file),
                pan_number_file: extractFileName(director.pan_number_file),
                aadhar_file: extractFileName(director.aadhar_file),
                passport_photo: extractFileName(director.passport_photo),
                share_file: extractFileName(director.share_file)
              };

              return {
                ...director,
                middle_name: director.middle_name || "",
                address1: address?.address1 || "",
                address2: address?.address2 || "",
                city: address?.city || "",
                state: address?.state || "",
                pincode: address?.pincode || "",
                id: director.id || "",
                no_of_share: shareholder_details?.no_of_share || "",
                capital: shareholder_details?.capital || "",
                percentage_of_holding: shareholder_details?.percentage_of_holding || "",
                proof_address_file_name: fileNames.proof_address_file,
                pan_number_file_name: fileNames.pan_number_file,
                aadhar_file_name: fileNames.aadhar_file,
                passport_photo_name: fileNames.passport_photo,
                share_file_name: fileNames.share_file
              };
            });

            setDirectors(directorsWithNames);
            setDirectorsDirectorships(directorsWithNames.map(() => []));
          }
        } else {
          await postData();
        }
      } catch (error) {
        console.error("Error fetching director details:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDirectorDetails();
  }, [company]);

  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length !== 6) {
      return null;
    }

    try {
      const newDirectors = [...directors];
      newDirectors[currentDirector].pincodeLoading = true;
      newDirectors[currentDirector].pincodeError = '';
      setDirectors(newDirectors);

      // Fetch pincode details
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();

      // Reset loading state
      const resetDirectors = [...directors];
      resetDirectors[currentDirector].pincodeLoading = false;

      // Check if postal data is available
      if (data[0].Status === "Success" && data[0].PostOffice) {
        const postOffice = data[0].PostOffice[0];
        resetDirectors[currentDirector].city = postOffice.Block;
        resetDirectors[currentDirector].state = postOffice.State;
        resetDirectors[currentDirector].pincodeError = '';
        setDirectors(resetDirectors);
        return {
          city: postOffice.Block,
          state: postOffice.State
        };
      } else {
        // No data found
        resetDirectors[currentDirector].city = '';
        resetDirectors[currentDirector].state = '';
        resetDirectors[currentDirector].pincodeError = 'Invalid Pincode';
        setDirectors(resetDirectors);
        return null;
      }
    } catch (error) {
      const errorDirectors = [...directors];
      errorDirectors[currentDirector].pincodeLoading = false;
      errorDirectors[currentDirector].pincodeError = 'Error fetching pincode details';
      setDirectors(errorDirectors);
      return null;
    }
  };

  const handleChange = (index, field, value) => {
    const newDirectors = [...directors];
    newDirectors[index][field] = value;

    if (field === 'pincode' && value.length === 6) {
      fetchPincodeDetails(value);
    }


    setDirectors(newDirectors);
  };

  const addDirector = async () => {
    try {
      const formdata = new FormData();
      formdata.append("company", company);
      const response1 = await axios.post('http://192.168.1.20:8000/companyincorporation/directors-details/', formdata,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      if (response1.data && (response1.status === 200 || response1.status === 201)) {
        console.log(response1.data.id);
        const idx = response1.data.id;

        setDirectors([...directors, {
          id: response1.data.id, company: '', first_name: '', middle_name: '', last_name: '', father_first_name: '', father_middle_name: '', father_last_name: '', gender: '', dob: '', occupation: '', area_occupation: '', educational: '', nationality: '', address1: '', address2: '', city: '', state: '', pincode: '',
          category_of_directors: '', share_file: null, no_of_share: '', capital: '', percentage_of_holding: '', shareholder: '', proof_address_file: null, proof_address: '', dsc: '', email: '', phone_number: '', pan_number: '', pan_number_file: null, aadhar_number: '', aadhar_file: null, din: '', din_number: '',
          passport_photo: null, signatory_name: ''
        },
        ]);
        setCurrentDirector(directors.length);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleFileChange = (index, field, event) => {
    const newDirectors = [...directors];
    const file = event.target.files[0];
    const fileNameField = `${field}_name`;
    newDirectors[index][field] = file;
    newDirectors[index][fileNameField] = file ? file.name : '';
    setDirectors(newDirectors);
  };

  const handleTabChange = (event, newValue) => {
    // Reset company editing state
    setIsCompanyEditing(false);

    // Calculate direction of movement
    const isMovingForward = newValue > currentDirector;
    const targetDirector = directors[newValue];

    if (targetDirector) {
      // Fetch company details for the target director
      fetchCompanyDetails(targetDirector.id);
    }

    // Update current director
    setCurrentDirector(newValue);
  };

  const handleNext = () => {
    if (currentDirector < directors.length - 1) {
      const nextDirectorId = directors[currentDirector + 1].id;

      // Reset company editing state
      setIsCompanyEditing(false);

      if (nextDirectorId) {
        fetchCompanyDetails(nextDirectorId);
      }

      setCurrentDirector(currentDirector + 1);
    }
    if (currentDirector === directors.length - 1) {
      router.push(`/companyincorporation/screen3?id=${company}`);
    }
  };

  const handlePrevious = () => {
    if (currentDirector > 0) {
      setCurrentDirector(currentDirector - 1);
    }
  };

  // Add this after your state declarations
  const handleSave = async (e) => {
    e.preventDefault();

    const directorData = directors[currentDirector];
    const formData = new FormData();
    Object.keys(directorData).forEach((key) => {
      if (
        key !== "address1" &&
        key !== "address2" &&
        key !== "city" &&
        key !== "state" &&
        key !== "pincode" &&
        key !== "shareholder_details" &&
        key !== "no_of_share" &&
        key !== "capital" &&
        key !== "percentage_of_holding" && key !== 'proof_address_file' && key !== "pan_number_file" && key !== "aadhar_file" && key !== "passport_photo" && key !== "share_file"
      ) {
        formData.append(key, directorData[key]);
      }
    });
    if (directorData['percentage_of_holding'] instanceof File) {
      formData.append('percentage_of_holding', directorData['percentage_of_holding']);
    }
    if (directorData['proof_address_file'] instanceof File) {
      formData.append('proof_address_file', directorData['proof_address_file']);
    }
    if (directorData['pan_number_file'] instanceof File) {
      formData.append('pan_number_file', directorData['pan_number_file']);
    }
    if (directorData['aadhar_file'] instanceof File) {
      formData.append('aadhar_file', directorData['aadhar_file']);
    }
    if (directorData['passport_photo'] instanceof File) {
      formData.append('passport_photo', directorData['passport_photo']);
    }
    if (directorData['share_file'] instanceof File) {
      formData.append('share_file', directorData['share_file']);
    }
    formData.append("address", JSON.stringify({
      address1: directorData.address1,
      address2: directorData.address2,
      city: directorData.city,
      state: directorData.state,
      pincode: directorData.pincode,
    }));
    formData.append("company", company);

    formData.append("shareholder_details", JSON.stringify({
      no_of_share: directorData.no_of_share,
      capital: directorData.capital,
      percentage_of_holding: directorData.percentage_of_holding,
    }));
    const id = directorData.id;
    try {
      const response = await axios.put(`http://192.168.1.20:8000/companyincorporation/directors-details/${id}/`, formData,
        {
          headers: { "Content-Type": "multipart/form-data" }
        }
      )
      if (response.status === 200 && response.data) {
        console.log('success')
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (directorId) => {
    try {
      await axios.delete(`http://192.168.1.20:8000/companyincorporation/directors-details/${directorId}/`);

      const newDirectors = directors.filter(director => director.id !== directorId);
      setDirectors(newDirectors);

      if (currentDirector >= newDirectors.length) {
        setCurrentDirector(newDirectors.length - 1);
      }
    } catch (error) {
      console.error('Error deleting director:', error);
    }
  };
  const addDirectorship = async () => {
    const newDirectorsDirectorships = [...directorsDirectorships];

    if (!newDirectorsDirectorships[currentDirector]) {
      newDirectorsDirectorships[currentDirector] = [];
    }
    const formData = new FormData();
    formData.append('director', directors[currentDirector].id);
    const response = await axios.post(
      `http://192.168.1.20:8000/companyincorporation/existing-company/`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );


    newDirectorsDirectorships[currentDirector].push({
      id: response.data.id,
      companyName: '',
      cin: '',
      typeOfCompany: '',
      positionHeld: ''
    });

    // Update the state with the new array
    setDirectorsDirectorships(newDirectorsDirectorships);
  };

  const updateDirectorship = (field, value, index) => {
    const newDirectorsDirectorships = [...directorsDirectorships];

    // Ensure the current director's directorships exist
    if (!newDirectorsDirectorships[currentDirector]) {
      newDirectorsDirectorships[currentDirector] = [];
    }

    // Update the specific field for the directorship
    newDirectorsDirectorships[currentDirector][index] = {
      ...newDirectorsDirectorships[currentDirector][index],
      [field]: value
    };

    setDirectorsDirectorships(newDirectorsDirectorships);
  };

  // Similar implementation for removeDirectorship
  const removeDirectorship = async (company, index) => {
    const newDirectorsDirectorships = [...directorsDirectorships];
    const response = await axios.delete(`http://192.168.1.20:8000/companyincorporation/existing-company/${company.id}/`);
    if (response.status === 204) {
      newDirectorsDirectorships[currentDirector].splice(index, 1);
      setDirectorsDirectorships(newDirectorsDirectorships);
    }
  };

  const handleSaveDirectorships = async (company) => {
    try {
      const formData = new FormData();

      // Prepare form data
      formData.append('companyName', company.companyName);
      formData.append('cin', company.cin);
      formData.append('typeOfCompany', company.typeOfCompany);
      formData.append('positionHeld', company.positionHeld);
      let response;

      if (company.id) {
        response = await axios.put(
          `http://192.168.1.20:8000/companyincorporation/existing-company/${company.id}/`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      if (response.status === 200 || response.status === 201) {
        console.log('Company details saved successfully', response.data);
        alert('Company Details Saved Successfully');
      }
    } catch (error) {
      console.error('Error saving company details:', error);
      alert('Failed to save Company Details');
    }
  };

  const fetchCompanyDetails = async () => {
    try {
      // Create a new array to store directorships for all directors
      const newDirectorsDirectorships = [...directorsDirectorships];

      // Iterate through all directors
      for (let index = 0; index < directors.length; index++) {
        const directorId = directors[index].id;

        if (!directorId) {
          console.warn(`No ID found for director at index ${index}`);
          newDirectorsDirectorships[index] = [];
          continue;
        }

        try {
          const response = await axios.get(
            `http://192.168.1.20:8000/companyincorporation/existing-company/${directorId}/`,
            {
              headers: { "Content-Type": "application/json" }
            }
          );
          console.log(`Company details for Director ${index + 1}:`, response.data);

          // Process company details for this director
          const processedDirectorships = processCompanyDetails(response.data);

          // Store processed directorships for this director
          newDirectorsDirectorships[index] = processedDirectorships;
        } catch (error) {
          console.error(`Error fetching company details for Director ${index + 1}:`, error);

          // If no existing directorships, set to empty array
          newDirectorsDirectorships[index] = [];

          // Optional: Show a user-friendly message for specific director
          alert(`No existing company details found for Director ${index + 1}`);
        }
      }

      setDirectorsDirectorships(newDirectorsDirectorships);
    } catch (error) {
      console.error('Error in fetching all directors\' company details:', error);
      alert('Failed to fetch company details for all directors');
    }
  };
  useEffect(() => {
    if (directors.length > 0) {
      fetchCompanyDetails();
    }
  }, [directors]);

  const renderDirectorshipsSection = () => {
    // Ensure we're using the current director's directorships
    const currentDirectorDirectorships = directorsDirectorships[currentDirector] || [];

    if (currentDirectorDirectorships.length === 0) {
      return (
        <Typography variant="body2" color="textSecondary">
          No directorships found for this director.
        </Typography>
      );
    }

    return currentDirectorDirectorships.map((directorship, index) => (
      <Grid
        container
        spacing={2}
        key={directorship.id || index}
        sx={{ mb: 2, alignItems: 'center' }}
      >
        <Grid item xs={12} sm={3}>
          <TextField

            label="Company Name"
            variant="outlined"
            size="small"
            value={directorship.companyName || ""}
            onChange={(e) => updateDirectorship('companyName', e.target.value, index)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField

            label="CIN"
            variant="outlined"
            size="small"
            value={directorship.cin || ""}
            onChange={(e) => updateDirectorship('cin', e.target.value, index)}
          />
        </Grid>
        <Grid item xs={12} sm={3}>
          <TextField

            label="Type of Company"
            variant="outlined"
            size="small"
            value={directorship.typeOfCompany || ""}
            onChange={(e) => updateDirectorship('typeOfCompany', e.target.value, index)}
          />
        </Grid>
        <Grid item xs={12} sm={2}>
          <TextField

            label="Position Held"
            variant="outlined"
            size="small"
            value={directorship.positionHeld || ""}
            onChange={(e) => updateDirectorship('positionHeld', e.target.value, index)}
          />
        </Grid>
        <Grid item xs={12} sm={1} sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
          <IconButton
            color="primary"
            onClick={() => handleSaveDirectorships(directorship)}
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            color="error"
            onClick={() => removeDirectorship(directorship, index)}
            sx={{ mr: 1 }}
          >
            <DeleteOutlineIcon />
          </IconButton>
        </Grid>
      </Grid>
    ));
  };

  return (

    <Box sx={{ width: 800, marginTop: 3, marginLeft: "auto", marginRight: "auto", marginBottom: 3, padding: 3, border: "1px solid", borderRadius: 5, borderColor: "grey.400", }}>
      <Button variant="contained" color="primary" onClick={addDirector}>
        Add Director
      </Button>
      <Container>
        <Tabs
          value={currentDirector}
          onChange={handleTabChange}
          centered
          sx={{ display: "flex", justifyContent: "center" }}
        >
          {directors.map((director, index) => (
            <Tab
              key={director.id} // Changed from index to director.id for better stability
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  {`Director ${index + 1}`}
                  {directors.length > 1 && (
                    <IconButton
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent tab switch when clicking delete
                        handleDelete(director.id);
                      }}
                      aria-label="delete"
                      size="small"
                      sx={{ ml: 1 }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  )}
                </Box>
              }
            />
          ))}
        </Tabs>

        <Box mt={2}>
          <Stack direction="row" spacing={2} width="100%">
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>First Name <RequiredMark /></FormLabel>
              <TextField
                required
                variant="outlined"
                size='small'
                sx={{ flex: 1 }}
                value={directors[currentDirector].first_name}
                onChange={(e) => handleChange(currentDirector, 'first_name', e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Middle Name</FormLabel>
              <TextField
                variant="outlined"
                size='small'
                sx={{ flex: 1 }}
                value={directors[currentDirector].middle_name || ''}
                onChange={(e) => handleChange(currentDirector, 'middle_name', e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Last Name <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].last_name}
                onChange={(e) => handleChange(currentDirector, 'last_name', e.target.value)}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Father First Name <RequiredMark /></FormLabel>
              <TextField
                variant="outlined"
                size='small'
                sx={{ flex: 1 }}
                value={directors[currentDirector].father_first_name}
                onChange={(e) => handleChange(currentDirector, 'father_first_name', e.target.value)}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Father Middle Name</FormLabel>
              <TextField
                variant="outlined"
                size='small'
                sx={{ flex: 1 }}
                value={directors[currentDirector].father_middle_name || ''}
                onChange={(e) => handleChange(currentDirector, 'father_middle_name', e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Father Last Name <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].father_last_name}
                onChange={(e) => handleChange(currentDirector, 'father_last_name', e.target.value)}

              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Gender <RequiredMark /></FormLabel>
              <TextField
                select
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].gender}
                onChange={(e) => handleChange(currentDirector, 'gender', e.target.value)}

              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Date of Birth <RequiredMark /></FormLabel>
              <TextField
                size='small'
                type="date"
                variant="outlined"
                sx={{ flex: 1 }}
                InputLabelProps={{
                  shrink: true,
                }}
                value={directors[currentDirector].dob}
                onChange={(e) => handleChange(currentDirector, 'dob', e.target.value)}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Occupation <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].occupation}
                onChange={(e) => handleChange(currentDirector, 'occupation', e.target.value)}

              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Area of Occupation <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].area_occupation}
                onChange={(e) => handleChange(currentDirector, 'area_occupation', e.target.value)}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Educational Qualification <RequiredMark /></FormLabel>
              <TextField
                select
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].educational}
                onChange={(e) => handleChange(currentDirector, 'educational', e.target.value)}

              >
                <MenuItem value="highSchool">High School</MenuItem>
                <MenuItem value="bachelor">Bachelor's Degree</MenuItem>
                <MenuItem value="master">Master's Degree</MenuItem>
                <MenuItem value="doctorate">Doctorate</MenuItem>
                <MenuItem value="professional">Professional Degree</MenuItem>
              </TextField>
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Nationality <RequiredMark /></FormLabel>
              <TextField
                size='small'
                select
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].nationality}
                onChange={(e) => handleChange(currentDirector, 'nationality', e.target.value)}

              >
                <MenuItem value="indian">Indian</MenuItem>
                <MenuItem value="nri">NRI</MenuItem>
                <MenuItem value="foreign">Foreign National</MenuItem>
              </TextField>
            </FormControl>
          </Stack>
          <Typography sx={{ mt: 1.5 }}>Residential Address <RequiredMark /></Typography>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Address Line 1 <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                multiline
                maxRows={3}
                value={directors[currentDirector].address1}
                onChange={(e) => handleChange(currentDirector, 'address1', e.target.value)}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Address Line 2</FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                multiline
                maxRows={3}
                value={directors[currentDirector].address2}
                onChange={(e) => handleChange(currentDirector, 'address2', e.target.value)}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Pincode <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].pincode}
                onChange={(e) => handleChange(currentDirector, 'pincode', e.target.value)}
                placeholder="Enter 6-digit pincode"
                inputProps={{
                  maxLength: 6,
                  pattern: "\\d{6}"
                }}
                InputProps={{
                  endAdornment: directors[currentDirector].pincodeLoading ? (
                    <CircularProgress size={20} />
                  ) : null
                }}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>City <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].city}
                onChange={(e) => handleChange(currentDirector, 'city', e.target.value)}
                disabled={!directors[currentDirector].pincodeError}

              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>State <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].state}
                onChange={(e) => handleChange(currentDirector, 'state', e.target.value)}
                disabled={!directors[currentDirector].pincodeError}

              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2} alignItems="center">
            <Box sx={{ flex: 1, maxWidth: "600px" }}>
              <FormControl sx={{ width: "100%" }}>
                <FormLabel>Proof of Address <RequiredMark /></FormLabel>
                <Select
                  value={directors[currentDirector].proof_address}
                  onChange={(e) => handleChange(currentDirector, "proof_address", e.target.value)}
                  size="small"
                  sx={{}}

                >
                  <MenuItem value="" disabled defaultChecked>Select</MenuItem>
                  <MenuItem value="proof of residence">Proof of Residence</MenuItem>
                  <MenuItem value="bank statement">Bank Statement</MenuItem>
                  <MenuItem value="passport">Passport</MenuItem>
                  <MenuItem value="driving license">Driving License</MenuItem>
                  <MenuItem value="utility bill">Utility Bill</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Button
                sx={{ mt: 2.5, ml: 2.5 }}
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  onChange={(e) => handleFileChange(currentDirector, 'proof_address_file', e)}
                />
              </Button>
            </Box>

          </Stack>
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            {directors[currentDirector].proof_address_file_name && (
              <Typography sx={{ fontSize: "14px" }}>
                {directors[currentDirector].proof_address_file_name}
              </Typography>
            )}

          </Box>
          <Typography sx={{ mt: 1.5 }}>Contact Information <RequiredMark /></Typography>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Email Address <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].email}
                onChange={(e) => handleChange(currentDirector, 'email', e.target.value)}
              />
            </FormControl>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Phone Number <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1 }}
                value={directors[currentDirector].phone_number}
                onChange={(e) => handleChange(currentDirector, 'phone_number', e.target.value)}
              />
            </FormControl>
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2} alignItems="center">
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Pan Number <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1, width: 600 }}
                value={directors[currentDirector].pan_number}
                onChange={(e) => handleChange(currentDirector, 'pan_number', e.target.value)}
              />
            </FormControl>
            <Box>
              <Button
                sx={{ mt: 2.75 }}
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  onChange={(e) => handleFileChange(currentDirector, 'pan_number_file', e)}
                />
              </Button>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            {directors[currentDirector].pan_number_file_name && (
              <Typography sx={{ fontSize: "14px" }}>
                {directors[currentDirector].pan_number_file_name}
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={2} width="100%" mt={2} alignItems="center">
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Aadhar Number <RequiredMark /></FormLabel>
              <TextField
                size='small'
                variant="outlined"
                sx={{ flex: 1, width: 600 }}
                value={directors[currentDirector].aadhar_number}
                onChange={(e) => handleChange(currentDirector, 'aadhar_number', e.target.value)}
              />
            </FormControl>
            <Box>
              <Button
                sx={{ mt: 2.75 }}
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
              >
                Upload
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  hidden
                  onChange={(e) => handleFileChange(currentDirector, 'aadhar_file', e)}
                />
              </Button>
            </Box>
          </Stack>
          <Box sx={{ textAlign: 'right', mt: 1 }}>
            {directors[currentDirector].aadhar_file_name && (
              <Typography sx={{ fontSize: "14px" }}>
                {directors[currentDirector].aadhar_file_name}
              </Typography>
            )}
          </Box>
          <Stack
            direction="column"
            spacing={2}
            mt={2}
            width="100%"
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              width="100%"
            >
              <FormLabel sx={{ minWidth: "200px" }}>DIN Available? <RequiredMark /></FormLabel>
              <RadioGroup
                row
                value={directors[currentDirector].din || ""}
                onChange={(e) => handleChange(currentDirector, "din", e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </Stack>

            {directors[currentDirector].din === "yes" && (
              <Stack direction="row" spacing={2} width="100%" alignItems="center">
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>DIN Number <RequiredMark /></FormLabel>
                  <TextField
                    size='small'
                    variant="outlined"
                    sx={{ flex: 1, width: 300 }}
                    value={directors[currentDirector].din_number}
                    onChange={(e) => handleChange(currentDirector, 'din_number', e.target.value)}
                  />
                </FormControl>
              </Stack>
            )}
          </Stack>
          <Stack direction="row" spacing={2} width="100%" mt={2}>
            <FormControl sx={{ width: "100%" }}>
              <FormLabel>Authorized Signatory Name <RequiredMark /></FormLabel>
              <TextField
                variant="outlined"
                size='small'
                sx={{ flex: 1, width: 400 }}
                value={directors[currentDirector].signatory_name}
                onChange={(e) => handleChange(currentDirector, 'signatory_name', e.target.value)}
              />
            </FormControl>
          </Stack>

          <Stack direction="row" spacing={2} alignItems="center" mt={3}>
            <FormLabel>Passport Size Photo <RequiredMark /></FormLabel>

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                onChange={(e) => handleFileChange(currentDirector, 'passport_photo', e)}
              />
            </Button>

            {directors[currentDirector].passport_photo_name && (
              <Typography sx={{ fontSize: "14px" }}>
                {directors[currentDirector].passport_photo_name}
              </Typography>
            )}
          </Stack>
          {/* Directorship Section */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", mt: 2 }}>
            Details of Existing Directorships
          </Typography>

          <FormControl>
            <FormLabel sx={{ mt: 2 }}>Do You have an existing directorship</FormLabel>
            <RadioGroup
              row
              value={directors[currentDirector].directorship || ""}
              onChange={(e) => handleChange(currentDirector, "directorship", e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          {/* Show Company Details ONLY if "Yes" is selected */}
          {directors[currentDirector].directorship === 'yes' ? (
            <>
              <Typography variant="subtitle1" gutterBottom>
                Existing Directorships for {directors[currentDirector].name}
              </Typography>

              {renderDirectorshipsSection()}

              <Button
                variant="outlined"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                onClick={addDirectorship} // No arguments needed now
                sx={{ mt: 2 }}
              >
                Add Directorship
              </Button>
            </>
          ) : (
            <Typography variant="body1" color="textSecondary">
              Directorships not applicable for this director.
            </Typography>
          )}

          <Stack spacing={2} mt={3}>
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              width="100%"
            >
              <FormLabel sx={{ minWidth: "200px" }}>DSC is Available? <RequiredMark /></FormLabel>
              <RadioGroup
                row
                value={directors[currentDirector].dsc || ""}
                onChange={(e) => handleChange(currentDirector, "dsc", e.target.value)}
              >
                <FormControlLabel value="yes" control={<Radio />} label="Yes" />
                <FormControlLabel value="no" control={<Radio />} label="No" />
              </RadioGroup>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              width="100%"
            >
              <FormLabel sx={{ minWidth: "200px" }}>Form DIR-2</FormLabel>
              <Button
                variant="contained"
                sx={{ width: '20%' }}>
                Generate
              </Button>
            </Stack>
          </Stack>
          <Stack spacing={2} mt={2} >
            <Box sx={{ minWidth: "200px" }}>
              <FormLabel>Category of Director <RequiredMark /></FormLabel>
              <FormControl
                sx={{ width: "100%", mt: 1 }}
                error={!!formErrors[`${currentDirector}-category_of_directors`]}
              >
                <Select
                  value={directors[currentDirector].category_of_directors || ''}
                  onChange={(e) => handleChange(currentDirector, "category_of_directors", e.target.value)}
                  size="small"
                  sx={{ borderRadius: "5px", width: 300 }}
                >
                  <MenuItem value="Chairman">Chairman</MenuItem>
                  <MenuItem value="Executive">Executive</MenuItem>
                  <MenuItem value="Non-Executive">Non-Executive</MenuItem>
                </Select>
                {formErrors[`${currentDirector}-category_of_directors`] && (
                  <Typography color="error" variant="caption">
                    {formErrors[`${currentDirector}-category_of_directors`]}
                  </Typography>
                )}
              </FormControl>
            </Box>
          </Stack>
          {/* Shareholding Details */}
          <Typography variant="h6" sx={{ fontWeight: "bold", color: "black", mt: 3 }}>Shareholding Details</Typography>

          <FormControl sx={{ mt: 2 }}>
            <FormLabel>Is this director also a shareholder? <RequiredMark /></FormLabel>
            <RadioGroup
              row
              value={directors[currentDirector].shareholder || ""}
              onChange={(e) => handleChange(currentDirector, 'shareholder', e.target.value)}
            >
              <FormControlLabel value="yes" control={<Radio />} label="Yes" />
              <FormControlLabel value="no" control={<Radio />} label="No" />
            </RadioGroup>
          </FormControl>

          {directors[currentDirector].shareholder === "yes" && (
            <Stack spacing={3} mt={2}>
              <Stack direction="row" spacing={2}>
                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>No of Share</FormLabel>
                  <TextField

                    variant="outlined"
                    placeholder="No of shares"
                    type="number"
                    size="small"
                    value={directors[currentDirector].no_of_share || ''}
                    onChange={(e) => handleChange(currentDirector, "no_of_share", e.target.value)}
                    inputProps={{ min: "0", step: "1" }}
                  />
                </FormControl>

                <FormControl sx={{ width: "100%" }}>
                  <FormLabel>% of Holdings</FormLabel>
                  <TextField

                    variant="outlined"
                    placeholder="% of holdings"
                    type="number"
                    size="small"
                    value={directors[currentDirector].percentage_of_holding || ''}
                    onChange={(e) => handleChange(currentDirector, "percentage_of_holding", e.target.value)}
                    inputProps={{ min: "0", step: "0.01" }}
                  />
                </FormControl>
              </Stack>

              {/* Paid Up Capital Section */}
              <Stack direction="row" spacing={2}>
                <Box sx={{ flex: 1, minWidth: "200px" }}>
                  <FormLabel>Paid Up Capital</FormLabel>
                  <TextField

                    variant="outlined"
                    placeholder="Capital"
                    size="small"
                    type="number"
                    value={directors[currentDirector].capital || ''}
                    onChange={(e) => handleChange(currentDirector, "capital", e.target.value)}
                    inputProps={{ step: "0.1", min: "0" }}
                  />
                </Box>
              </Stack>
            </Stack>
          )}

          <Stack direction="row" spacing={2} alignItems="center" mt={3}>
            <FormLabel>Signature of Director <RequiredMark /></FormLabel>

            <Button
              component="label"
              variant="contained"
              startIcon={<CloudUploadIcon />}
            >
              Upload
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                hidden
                onChange={(e) => handleFileChange(currentDirector, 'share_file', e)}
              />
            </Button>

            {directors[currentDirector].share_file_name && (
              <Typography sx={{ fontSize: "14px" }}>
                {directors[currentDirector].share_file_name}
              </Typography>
            )}
          </Stack>

          <Box mt={5} display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              onClick={handlePrevious}
              disabled={currentDirector === 0}
            >
              Previous
            </Button>
            <Button variant="contained" color="success" onClick={handleSave}>
              Save
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={currentDirector === directors.length - 1}
            >
              Next
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};
export default DirectorForm;
