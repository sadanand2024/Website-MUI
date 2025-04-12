"use client";

import React, { useState, useEffect } from "react";
import { TextField, Button, Typography, Container, Box, CircularProgress } from "@mui/material";
import axios from "axios";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'

const AuthorizedCapitalForm = () => {
  const router = useRouter()

  const searchParams = useSearchParams()
  const company = searchParams.get("id");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    company: company || "",
    authorized_share_capital: "",
    paid_up_share_capital: "",
    face_value_per_share: "",
    no_of_shares: "",
    bank_name: "",
  });

  const [errors, setErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);

  const requiredAsterisk = <span style={{ color: "red", marginLeft: 2 }}>*</span>;

  // Fetch data if company ID is available
  useEffect(() => {
    const fetchData = async () => {
      if (company) {
        setLoading(true);
        try {
          const response = await axios.get(`http://192.168.1.20:8000/companyincorporation/authorized-capital/${company}/`);
          if (response.status === 200 && response.data) {
            const existingData = response.data;
            setFormData({
              id: existingData.id,
              company: existingData.company,
              authorized_share_capital: existingData.authorized_share_capital,
              paid_up_share_capital: existingData.paid_up_share_capital,
              face_value_per_share: existingData.face_value_per_share,
              no_of_shares: existingData.no_of_shares,
              bank_name: existingData.bank_name,
            });
            setIsUpdate(true); // Mark as update operation
          }
        } catch (error) {
          console.error("Error fetching capital data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [company]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });

    // Clear error when user types
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let newErrors = {};

    if (!formData.authorized_share_capital) newErrors.authorized_share_capital = "This field is required";
    if (!formData.paid_up_share_capital) newErrors.paid_up_share_capital = "This field is required";
    if (!formData.face_value_per_share) newErrors.face_value_per_share = "This field is required";
    if (!formData.no_of_shares) newErrors.no_of_shares = "This field is required";
    if (!formData.bank_name) newErrors.bank_name = "This field is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log("Form Data Submitted: ", formData);

    // Create FormData instance
    const formDataToSend = new FormData();
    formDataToSend.append("company", formData.company);
    formDataToSend.append("authorized_share_capital", formData.authorized_share_capital);
    formDataToSend.append("paid_up_share_capital", formData.paid_up_share_capital);
    formDataToSend.append("face_value_per_share", formData.face_value_per_share);
    formDataToSend.append("no_of_shares", formData.no_of_shares);
    formDataToSend.append("bank_name", formData.bank_name);

    try {
      let response;

      if (isUpdate && formData.id) {
        // If updating existing record
        response = await axios.put(
          `http://192.168.1.20:8000/companyincorporation/authorized-capital/${formData.id}/`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Form updated successfully");
      } else {
        // If creating new record
        response = await axios.post(
          "http://192.168.1.20:8000/companyincorporation/authorized-capital/",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        alert("Form submitted successfully");
      }

      console.log("Form submitted successfully:", response.data);
      router.push(`/success?id=${company}`)
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.response?.data?.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevious = () => {
    router.push(`/companyincorporation/screen3?id=${company}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
        <Typography variant="h6" ml={2}>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 600,
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
      <Container maxWidth="sm">
        <Typography variant="h5" sx={{ textAlign: "center", marginBottom: 2 }}>
          Authorized & Paid-up Capital
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body1">
            Authorized Share Capital {requiredAsterisk}
          </Typography>
          <TextField
            name="authorized_share_capital"
            variant="outlined"
            size="small"
            type="number"
            fullWidth
            value={formData.authorized_share_capital}
            onChange={handleChange}
            error={!!errors.authorized_share_capital}
            helperText={errors.authorized_share_capital}
            inputProps={{ min: 0 }}
          />

          <Typography variant="body1">
            Paid-up Share Capital {requiredAsterisk}
          </Typography>
          <TextField
            name="paid_up_share_capital"
            variant="outlined"
            size="small"
            type="number"
            fullWidth
            value={formData.paid_up_share_capital}
            onChange={handleChange}
            error={!!errors.paid_up_share_capital}
            helperText={errors.paid_up_share_capital}
            inputProps={{ min: 0 }}
          />

          <Typography variant="body1">
            Face Value per Share {requiredAsterisk}
          </Typography>
          <TextField
            name="face_value_per_share"
            variant="outlined"
            size="small"
            type="number"
            fullWidth
            value={formData.face_value_per_share}
            onChange={handleChange}
            error={!!errors.face_value_per_share}
            helperText={errors.face_value_per_share}
            inputProps={{ min: 0 }}
          />

          <Typography variant="body1">
            No. of Shares {requiredAsterisk}
          </Typography>
          <TextField
            name="no_of_shares"
            variant="outlined"
            size="small"
            type="number"
            fullWidth
            value={formData.no_of_shares}
            onChange={handleChange}
            error={!!errors.no_of_shares}
            helperText={errors.no_of_shares}
            inputProps={{ min: 0 }}
          />
          <Typography variant="body1">
            Name of Bank in which Company wants to open the Current Account with? {requiredAsterisk}
          </Typography>
          <TextField
            name="bank_name"
            variant="outlined"
            size="small"
            fullWidth
            value={formData.bank_name}
            onChange={handleChange}
            error={!!errors.bank_name}
            helperText={errors.bank_name}
          />

          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mt: 3 }}>
            <Button
              variant="outlined"
              onClick={handlePrevious}
            >
              Previous
            </Button>

            <Button
              type="submit"
              variant="contained"
            >
              {(
                isUpdate ? "Update" : "Save & Submit"
              )}
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default AuthorizedCapitalForm;