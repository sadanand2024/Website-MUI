import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Dialog, DialogActions, DialogContent, DialogTitle, TextField, Button, Box, Grid, Typography, Divider } from '@mui/material';
import Grid2 from '@mui/material/Grid2'; // Import Grid2 from MUI system
import CustomInput from '@/utils/CustomInput';
import Factory from '@/utils/Factory';
import { useSnackbar } from '@/components/CustomSnackbar';
import { useSearchParams } from 'next/navigation';
import Modal from '@/components/Modal';
import { ModalSize } from '@/enum';
import Stack from '@mui/material/Stack';

export default function DesignationDialog({ open, handleClose, fetchDesignations, selectedRecord, type, setType }) {
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();
  const [payrollid, setPayrollId] = useState(null); // Payroll ID fetched from URL

  // Update payroll ID from search params
  useEffect(() => {
    const id = searchParams.get('payrollid');
    if (id) {
      setPayrollId(id);
    }
  }, [searchParams]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };
  const departmentFields = [{ name: 'designation_name', label: 'Designation Name' }];

  // Formik validation schema
  const validationSchema = Yup.object({
    designation_name: Yup.string().required('Designation name is required')
  });

  // Initialize Formik with initial values and validation schema
  const formik = useFormik({
    initialValues: {
      designation_name: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      const postData = { ...values, payroll: payrollid };
      const url = type === 'edit' ? `/payroll/designations/${selectedRecord.id}/` : `/payroll/designations/`;
      let postmethod = type === 'edit' ? 'put' : 'post';
      const { res } = await Factory(postmethod, url, postData);

      if (res?.status_cd === 0) {
        fetchDesignations();
        handleClose();
        setType('');
        resetForm();
        showSnackbar(type === 'edit' ? 'Record Updated Successfully' : 'Record Saved Successfully', 'success');
      } else {
        showSnackbar(JSON.stringify(res?.data?.data?.error || 'Unknown error'), 'error');
      }
    }
  });
  useEffect(() => {
    if (type === 'edit' && selectedRecord) {
      setValues(selectedRecord);
    }
  }, [type, selectedRecord]);

  // Render each field dynamically
  const renderFields = (fields) => {
    return fields.map((field) => (
      <Grid2 key={field.name} size={{ xs: 12 }}>
        <Typography gutterBottom>
          {field.label} {<span style={{ color: 'red' }}>*</span>}
        </Typography>
        <CustomInput
          fullWidth
          name={field.name}
          value={values[field.name]}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched[field.name] && Boolean(errors[field.name])}
          helperText={touched[field.name] && errors[field.name]}
        />
      </Grid2>
    ));
  };
  const { values, setValues, handleChange, errors, touched, handleSubmit, handleBlur, resetForm } = formik;

  return (
    <Modal
      open={open}
      maxWidth={ModalSize.SM}
      header={{ title: `${type === 'edit' ? 'Update' : 'Add'} designation`, subheader: '' }}
      modalContent={
        <Grid2 container spacing={3}>
          {/* Render dynamic fields for department */}
          {renderFields(departmentFields)}
        </Grid2>
      }
      footer={
        <Stack direction="row" sx={{ width: 1, justifyContent: 'space-between', gap: 2 }}>
          <Button
            variant="outlined"
            color="error"
            onClick={() => {
              resetForm();
              setType('');
              handleClose(); // Reset form and close dialog
            }}
          >
            Cancel
          </Button>
          <Button type="submit" variant="contained" onClick={handleSubmit}>
            Save
          </Button>
        </Stack>
      }
    />
  );
}
