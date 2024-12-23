// src/components/CustomerEditDialog.js
import React, { useState, useEffect } from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, Grid } from '@mui/material';

import CustomInput from '@/utils/CustomInput';
const INvoiceEditDialog = ({ open, handleClose, customer, handleSave }) => {
  const [formData, setFormData] = useState({}); // Initialize as empty object by default

  // Effect to set form data when customer prop changes
  useEffect(() => {
    if (customer) {
      setFormData(customer); // Only update formData when customer is valid
    }
  }, [customer]);

  // Handle form field changes
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = () => {
    handleSave(formData); // Save the updated data
    handleClose(); // Close the dialog
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md">
      <DialogTitle textAlign="center">Edit Customer</DialogTitle>
      <DialogContent>
        {/* Render inputs only when formData is available */}

        {formData && (
          <Grid container spacing={2}>
            {' '}
            {/* Container for the grid layout */}
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="nameofthe_business">Business Name</label>
              </div>
              <CustomInput
                name="nameofthe_business"
                value={formData.nameofthe_business || ''}
                onChange={handleChange}
                id="nameofthe_business"
              />
            </Grid>
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="pan">PAN</label>
              </div>
              <CustomInput name="pan" value={formData.pan || ''} onChange={handleChange} id="pan" />
            </Grid>
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="email">Email</label>
              </div>
              <CustomInput name="email" value={formData.email || ''} onChange={handleChange} id="email" />
            </Grid>
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="mobile">Mobile</label>
              </div>
              <CustomInput name="mobile" value={formData.mobile || ''} onChange={handleChange} id="mobile" />
            </Grid>
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="gstin">GSTIN</label>
              </div>
              <CustomInput name="gstin" value={formData.gstin || ''} onChange={handleChange} id="gstin" />
            </Grid>
            <Grid item xs={12}>
              <div style={{ paddingBottom: '5px' }}>
                <label htmlFor="receivables_date">Receivables Date</label>
              </div>
              <CustomInput name="receivables_date" value={formData.receivables_date || ''} onChange={handleChange} id="receivables_date" />
            </Grid>
          </Grid>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default INvoiceEditDialog;