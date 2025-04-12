"use client";

import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, Grid, FormLabel, CircularProgress } from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const FileUploadForm = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id");

  const [formData, setFormData] = useState({
    business_pan: null,
    director_pan: null,
    aadhaar_card: null,
    photo: null,
    nature_of_business: "",
  });

  const [loading, setLoading] = useState(true);
  const [existingData, setExistingData] = useState(false);
  const [fileNames, setFileNames] = useState({
    business_pan: "",
    director_pan: "",
    aadhaar_card: "",
    photo: "",
  });


  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`http://192.168.1.20:8000/gst/business-documents/${id}/`);

          if (response.status === 200 && response.data) {
            console.log("Fetched data:", response.data);

            // Update text field with existing data
            setFormData(prevData => ({
              ...prevData,
              nature_of_business: response.data.nature_of_business || ""
            }));

            // Extract filenames from response
            // This handles different possible API response formats
            const extractedFileNames = {
              business_pan: getFilename(response.data.business_pan),
              director_pan: getFilename(response.data.director_pan),
              aadhaar_card: getFilename(response.data.aadhaar_card),
              photo: getFilename(response.data.photo)
            };

            setFileNames(extractedFileNames);
            setExistingData(true);
          }
        } catch (error) {
          console.log("No existing data found or error fetching:", error);
          // No existing data, continue with empty form
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Helper function to extract filename from URL or object
  const getFilename = (fileData) => {
    if (!fileData) return "";

    // If fileData is a string (URL), extract filename
    if (typeof fileData === 'string') {
      // Get the filename from the URL
      const urlParts = fileData.split('/');
      return urlParts[urlParts.length - 1];
    }

    // If fileData has a filename property
    if (fileData.filename) return fileData.filename;

    // If fileData has a name property
    if (fileData.name) return fileData.name;

    // If fileData is an object with a file_name or fileName property
    if (fileData.file_name) return fileData.file_name;
    if (fileData.fileName) return fileData.fileName;

    // Return the full value as string if nothing else works
    return String(fileData);
  };

  // Handle file changes
  const handleFileChange = (event, field) => {
    setFormData({ ...formData, [field]: event.target.files[0] });

    // Update the displayed filename
    const fileName = event.target.files[0] ? event.target.files[0].name : "";
    setFileNames(prev => ({ ...prev, [field]: fileName }));
  };

  // Handle text input change
  const handleTextChange = (event) => {
    setFormData({ ...formData, nature_of_business: event.target.value });
  };

  // Handle form submission
  const handleSaveAndContinue = async () => {
    const data = new FormData();

    // Only append fields that have been changed
    Object.entries(formData).forEach(([key, value]) => {
      if (value) {
        data.append(key, value);
      }
    });

    data.append("gst", id);

    try {
      let response;

      // Use PUT method if we already have existing data, otherwise use POST
      if (existingData) {
        console.log("Updating existing data using PUT");
        response = await axios.put(`http://192.168.1.20:8000/gst/business-documents/${id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        console.log("Creating new data using POST");
        response = await axios.post("http://192.168.1.20:8000/gst/business-documents/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if ((response.status === 200 || response.status === 201) && response.data) {
        console.log("Form submitted successfully");
        router.push(`/gst/screen6?id=${id}`);
      } else {
        console.error("Error submitting form");
      }
    } catch (error) {
      console.error("Error:", error);
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
    <Box sx={{ width: 700, margin: "auto", padding: 3, border: 1, borderRadius: 5, mt: 2, textAlign: "left", borderColor: "grey.400", }}>
      <FormLabel
        sx={{
          fontWeight: 500,
          fontSize: "20px",
          fontFamily: "Archivo, 'Archivo Fallback'",
          color: "rgb(28, 29, 31)",
        }}
      >
        Upload Documents:
      </FormLabel>

      <ul>
        <li>PAN Card of business</li>
        <li>PAN of Partner/Director/Individual etc.</li>
        <li>Aadhaar Card of Partner/Director/Individual etc.</li>
        <li>Photo of each Partner/Director/Individual etc.</li>
        <li>If there is an Authorized Representative, then upload his/her Aadhaar</li>
      </ul>

      <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: "10px" }}>
        {["business_pan", "director_pan", "aadhaar_card", "photo"].map((key) => (
          <Box key={key} sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <label htmlFor={key}>
              <input
                type="file"
                accept=".pdf,.jpg,.png"
                style={{ display: "none" }}
                id={key}
                onChange={(e) => handleFileChange(e, key)}
              />
              <Button variant="contained" component="span" color="primary" startIcon={<CloudUploadIcon />}>
                Upload
              </Button>
            </label>
            <Typography>
              {formData[key] ? formData[key].name : (fileNames[key] ? fileNames[key] : "No file chosen")}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ textAlign: "left", mt: 2 }}>
        <FormLabel>
          Enter Nature of Business <span style={{ color: "red" }}>*</span>
        </FormLabel>
        <TextField
          size="small"
          fullWidth
          margin="normal"
          required
          value={formData.nature_of_business}
          onChange={handleTextChange}
        />
      </Box>

      <Grid container spacing={2} justifyContent="center" sx={{ mt: 3, gap: 2 }}>
        <Grid>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => router.push(`/gst/screen4?id=${id}`)
            }
          >
            Previous
          </Button>
        </Grid>
        <Grid>
          <Button variant="contained" color="primary" onClick={handleSaveAndContinue}>
            {existingData ? "Update & Continue" : "Save & Continue"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FileUploadForm;