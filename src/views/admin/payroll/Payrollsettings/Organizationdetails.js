'use client';
import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CardContent, Button, Box, Typography, Tooltip, Card } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import HomeCard from '@/components/cards/HomeCard';
import CustomAutocomplete from '@/utils/CustomAutocomplete';
import CustomInput from '@/utils/CustomInput';
import CustomUpload from '@/utils/CustomUpload';
import { indian_States_And_UTs } from '@/utils/indian_States_And_UT';
import { industries } from '@/utils/industries';
import { useSnackbar } from '@/components/CustomSnackbar';
import Factory from '@/utils/Factory';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import useCurrentUser from '@/hooks/useCurrentUser';
import Loader from '@/components/PageLoader';
import MainCard from '@/components/MainCard';
import { entity_choices } from '@/utils/Entity-types';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { IconChevronDown, IconHelp } from '@tabler/icons-react';
import CustomDatePicker from '@/utils/CustomDateInput';
import dayjs from 'dayjs';
import { IconEdit } from '@tabler/icons-react';
import FilingAddressDialog from './FilingAddressDialog';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Organizationdetails({ tab }) {
  const { userData } = useCurrentUser();
  let businessId = userData.user_type === 'Business' ? userData.business_affiliated[0].id : userData.businesssDetails.business[0].id;

  const router = useRouter();
  const searchParams = useSearchParams();
  const [payrollid, setPayrollId] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showSnackbar } = useSnackbar();
  const [logoDetails, setLogoDetails] = useState([]);
  const [filingAddress, setFilingAddress] = useState({});
  const [filingAddressDialog, setFilingAddressDialog] = useState(false);
  useEffect(() => {
    const id = searchParams.get('payrollid');
    if (id) {
      setPayrollId(id);
    }
  }, [searchParams]);
  const initialData = {
    business_name: '',
    logo: null,
    business_nature: '',
    pan: '',
    entityType: '',
    registration_number: '',
    dob_or_incorp_date: dayjs().format('YYYY-MM-DD'),
    primary_email: '',
    city: '',
    sender_email: '',
    org_address_line1: '',
    org_address_line2: '',
    country: 'IN',
    org_address_state: '',
    org_address_city: '',
    org_address_pincode: '',
    filling_address_line1: '',
    filling_address_line2: '',
    filling_address_state: '',
    filling_address_city: '',
    filling_address_pincode: ''
  };

  const fields = [
    { name: 'business_name', label: 'Business Name' },
    { name: 'logo', label: 'Logo' },
    { name: 'business_nature', label: 'Business Nature' },
    { name: 'pan', label: 'Business PAN' },
    { name: 'entityType', label: 'Entity Type' },
    { name: 'registration_number', label: 'CIN/ LLPIN / Reg. No' },
    { name: 'dob_or_incorp_date', label: 'DOB / DOI' },
    { name: 'primary_email', label: 'Primary Email' },
    { name: 'sender_email', label: 'Sender Email' }
  ];

  const organizationAddress = [
    { name: 'org_address_line1', label: 'Address Line 1' },
    { name: 'org_address_line2', label: 'Address Line 2' },
    { name: 'country', label: 'Country' },
    { name: 'org_address_state', label: 'State' },
    { name: 'org_address_city', label: 'City' },
    { name: 'org_address_pincode', label: 'Pincode' }
  ];

  const validationSchema = Yup.object({
    business_name: Yup.string().required('Organization name is required'),
    business_nature: Yup.string().required('Business Nature is required'),
    pan: Yup.string()
      .required('PAN Number is required')
      .matches(/^[A-Z]{5}[0-9]{4}[A-Z]$/, 'Invalid PAN Number format'),
    entityType: Yup.string().required('Entity Type is required'),
    // registration_number: Yup.string().required('This field is required'),
    dob_or_incorp_date: Yup.string().required('This field is required'),

    primary_email: Yup.string().email('Invalid email address').required('Email is required'),
    sender_email: Yup.string().email('Invalid email address').required('Email is required'),
    org_address_line1: Yup.string().required('Address Line 1 is required'),
    org_address_state: Yup.string().required('State is required'),
    org_address_city: Yup.string().required('City is required'),
    org_address_pincode: Yup.string()
      .required('Pincode is required')
      .matches(/^[0-9]{6}$/, 'Invalid Pincode format. It must be exactly 6 digits Number.')
  });

  const formik = useFormik({
    initialValues: { ...initialData },
    validationSchema,
    onSubmit: async (values) => {
      let postData = new FormData();
      postData.append('business', businessId);
      setLoading(true);
      const postBusinessDetails = {
        business_details: {
          nameOfBusiness: values.nameOfBusiness,
          pan: values.pan,
          dob_or_incorp_date: values.dob_or_incorp_date,
          entityType: values.entityType,
          business_nature: values.business_nature,
          registrationNumber: values.registration_number,
          headOffice: {
            address_line1: values.org_address_line1,
            address_line2: values.org_address_line2,
            city: values.org_address_city,
            state: values.org_address_state,
            pincode: values.org_address_pincode
          },
          email: values.primary_email
        }
      };

      postData.append('business_details', JSON.stringify(postBusinessDetails.business_details));
      postData.append('logo', values.logo);
      postData.append('sender_email', values.sender_email);
      postData.append('filling_address_line1', values.filling_address_line1);
      postData.append('filling_address_line2', values.filling_address_line2);
      postData.append('filling_address_state', values.filling_address_state);
      postData.append('filling_address_city', values.filling_address_city);
      postData.append('filling_address_pincode', values.filling_address_pincode);

      const url = `/payroll/orgs/`;
      const { res, error } = await Factory('post', url, postData);
      setLoading(false);
      if (res.status_cd === 0) {
        showSnackbar('Data Saved Successfully', 'success');
        router.back();
      } else {
        showSnackbar(JSON.stringify(res.data.data), 'error');
      }
    }
  });

  const renderFields = (fields) => {
    return fields.map((field) => {
      if (field.name === 'logo') {
        return (
          <Grid2 key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <CustomUpload title="Upload Logo" setData={setLogoDetails} logoDetails={values.logo} existingImageUrl={values.logo} />
          </Grid2>
        );
      }

      if (
        field.name === 'org_address_state' ||
        field.name === 'filling_address_state' ||
        field.name === 'business_nature' ||
        field.name === 'entityType'
      ) {
        return (
          <Grid2 key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography gutterBottom>
              {field.label} {<span style={{ color: 'red' }}>*</span>}
            </Typography>
            <CustomAutocomplete
              value={values[field.name]}
              name={field.name}
              onChange={(e, newValue) => setFieldValue(field.name, newValue)}
              options={field.name === 'business_nature' ? industries : field.name === 'entityType' ? entity_choices : indian_States_And_UTs}
              error={touched[field.name] && Boolean(errors[field.name])}
              helperText={touched[field.name] && errors[field.name]}
              sx={{ width: '100%' }}
              // disabled={field.name === 'org_address_state'}
            />
          </Grid2>
        );
      }
      if (field.name === 'dob_or_incorp_date') {
        return (
          <Grid2 key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
            <Typography gutterBottom>
              {field.label} {<span style={{ color: 'red' }}>*</span>}
            </Typography>
            <CustomDatePicker
              views={['year', 'month', 'day']}
              value={dayjs(values[field.name]) || null}
              onChange={(newDate) => {
                setFieldValue(field.name, newDate);
              }}
              sx={{
                width: '100%',
                '& .MuiInputBase-root': {
                  fontSize: '0.75rem',
                  height: '40px'
                }
              }}
            />
          </Grid2>
        );
      }
      return (
        <Grid2 key={field.name} size={{ xs: 12, sm: 6, md: 4 }}>
          <Typography gutterBottom>
            {field.label}{' '}
            {field.name !== 'org_address_line2' && field.name !== 'filling_address_line2' && field.name !== 'registration_number' && (
              <span style={{ color: 'red' }}>*</span>
            )}{' '}
            {field.name === 'sender_email' && (
              <Tooltip title="Pay slips, offer letters, and emails will be sent through this email." placement="right" arrow>
                <InfoOutlinedIcon sx={{ fontSize: 18, ml: 0.5, color: 'gray', cursor: 'pointer' }} />
              </Tooltip>
            )}
          </Typography>
          <CustomInput
            name={field.name}
            value={values[field.name]}
            onChange={(e) => {
              const value = e.target.value;

              if (field.name === 'pan' && value.length > 10) {
                return;
              }
              if (field.name === 'pan') {
                setFieldValue(field.name, value.toUpperCase());
              } else {
                setFieldValue(field.name, value);
              }
            }}
            onBlur={handleBlur}
            error={touched[field.name] && Boolean(errors[field.name])}
            helperText={touched[field.name] && errors[field.name]}
            sx={{ width: '100%' }}
            disabled={field.name === 'country'}
          />
        </Grid2>
      );
    });
  };
  const getOrgDetails = async (id) => {
    setLoading(true);
    const url = `/payroll/orgs/${id}/`;
    const { res, error } = await Factory('get', url, {});
    setLoading(false); // Stop loading after the request completes
    if (res.status_cd === 0) {
      if (res?.data) {
        const data = res.data;
        console.log(data);
        setValues((prev) => ({
          ...prev,
          business_name: data.business_details.nameOfBusiness || '',
          logo: data.logo,
          business_nature: data.business_details.business_nature || '',
          pan: data.business_details.pan || '',
          entityType: data.business_details.entityType || '',
          registration_number: data.business_details.registrationNumber || '',
          dob_or_incorp_date: data.business_details.dob_or_incorp_date
            ? dayjs(data.business_details.dob_or_incorp_date).format('YYYY-MM-DD')
            : dayjs().format('YYYY-MM-DD'),
          primary_email: data.business_details.email || '',
          city: data.business_details.headOffice?.city || '',
          sender_email: data.sender_email,
          org_address_line1: data.business_details.headOffice?.address_line1 || '',
          org_address_line2: data.business_details.headOffice?.address_line2 || '',
          country: 'IN',
          org_address_state: data.business_details.headOffice?.state || '',
          org_address_city: data.business_details.headOffice?.city || '',
          org_address_pincode: data.business_details.headOffice?.pincode || '',

          filling_address_line1:
            data.filling_address_line1 === '' ? data.business_details.headOffice?.address_line1 : data.filling_address_line1,
          filling_address_line2:
            data.filling_address_line1 === '' ? data.business_details.headOffice?.address_line2 : data.filling_address_line2,
          filling_address_state: data.filling_address_line1 === '' ? data.business_details.headOffice?.state : data.filling_address_state,
          filling_address_city: data.filling_address_line1 === '' ? data.business_details.headOffice?.city : data.filling_address_city,
          filling_address_pincode:
            data.filling_address_line1 === '' ? data.business_details.headOffice?.pincode : data.filling_address_pincode
        }));
      }
    } else {
      showSnackbar(JSON.stringify(res.data.data), 'error');
    }
  };
  const individual_Business_get = async () => {
    setLoading(true);
    const url = `/user_management/businesses/${businessId}/`;
    const { res, error } = await Factory('get', url, {});

    setLoading(false); // Stop loading after the request completes
    if (error) {
      showSnackbar('Failed to fetch business details', 'error');
      return;
    }
    if (res?.data) {
      const data = res.data;
      setValues((prev) => ({
        ...prev,
        business_name: data.nameOfBusiness || '',
        logo: null,
        business_nature: data.business_nature || '',
        pan: data.pan || '',
        entityType: data.entityType || '',
        registration_number: data.registrationNumber || '',
        dob_or_incorp_date: data.dob_or_incorp_date ? dayjs(data.dob_or_incorp_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        primary_email: data.email || '',
        city: data.headOffice?.city || '',
        sender_email: '',
        org_address_line1: data.headOffice?.address_line1 || '',
        org_address_line2: data.headOffice?.address_line2 || '',
        country: 'IN',
        org_address_state: data.headOffice?.state || '',
        org_address_city: data.headOffice?.city || '',
        org_address_pincode: data.headOffice?.pincode || '',
        filling_address_line1: data.headOffice?.address_line1 || '',
        filling_address_line2: data.headOffice?.address_line2 || '',
        filling_address_state: data.headOffice?.state || '',
        filling_address_city: data.headOffice?.city || '',
        filling_address_pincode: data.headOffice?.pincode || ''
      }));
    } else {
      showSnackbar('Invalid response data', 'error');
    }
  };

  // useEffect(() => {
  //   if (payrollid) {
  //     getOrgDetails(payrollid);
  //   } else if (businessId && !payrollid) {
  //     // Prevent overwriting when payrollid is set later
  //     individual_Business_get();
  //   }
  // }, [payrollid, businessId]);
  useEffect(() => {
    let timeout;
    if (payrollid) {
      getOrgDetails(payrollid);
    } else if (businessId) {
      // Wait 500ms to check if payrollid arrives
      timeout = setTimeout(() => {
        if (!payrollid) {
          individual_Business_get();
        }
      }, 500);
    }

    return () => clearTimeout(timeout); // Cleanup on re-run
  }, [payrollid, businessId]);

  useEffect(() => {
    setFieldValue('logo', logoDetails);
  }, [logoDetails]);
  const { values, setValues, handleChange, errors, touched, handleSubmit, handleBlur, setFieldValue } = formik;
  // console.log(values);
  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <HomeCard title="Business profile" tagline="Setup company name, registration details, and basic business information.">
          <MainCard>
            <Box component="form" onSubmit={handleSubmit} sx={{ padding: 1 }}>
              <Grid2 container spacing={2}>
                {renderFields(fields)}
              </Grid2>

              <Typography variant="subtitle1" gutterBottom sx={{ flexShrink: 0, fontWeight: 'bold', color: 'primary.main', mt: 3, mb: 2 }}>
                Organization Address
                <span>
                  {' '}
                  <Tooltip title="This will be your primary work location." placement="right" arrow>
                    <InfoOutlinedIcon sx={{ fontSize: 18, ml: 0.5, color: 'gray', cursor: 'pointer' }} />
                  </Tooltip>
                </span>
              </Typography>

              <Grid2 container spacing={2}>
                {renderFields(organizationAddress)}
              </Grid2>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  mt: 3,
                  mb: 2
                }}
              >
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Typography variant="subtitle1" gutterBottom sx={{ flexShrink: 0, fontWeight: 'bold', color: 'primary.main' }}>
                    Filing Address
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<IconEdit size={16} />}
                    onClick={() => {
                      setFilingAddressDialog(true);
                    }}
                    sx={{ mt: -1 }}
                  >
                    Change
                  </Button>
                </Box>
                <Typography>This address will be used across all Forms and Payslips.</Typography>

                <Card
                  sx={{
                    flex: 1,
                    p: 1,
                    borderRadius: 2,
                    boxShadow: 3,
                    backgroundColor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    maxWidth: 350
                  }}
                >
                  <CardContent>
                    {[
                      { label: 'Address Line 1', value: values.filling_address_line1 },
                      { label: 'Address Line 2', value: values.filling_address_line2 },
                      { label: 'Country', value: values.country },
                      { label: 'State', value: values.filling_address_state },
                      { label: 'City', value: values.filling_address_city },
                      { label: 'Pincode', value: values.filling_address_pincode }
                    ].map((item, index) => (
                      <Typography
                        key={index}
                        variant="body2"
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          p: 0.5,
                          fontWeight: 500,
                          borderBottom: index !== 5 ? '1px solid' : 'none',
                          borderColor: 'divider'
                        }}
                      >
                        <strong>{item.label}:</strong> {item.value}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </Box>

              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Button
                  variant="outlined"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => {
                    router.back();
                  }}
                >
                  Back to Dashboard
                </Button>
                <Button type="submit" variant="contained" color="primary">
                  Save
                </Button>
              </Box>
              {filingAddressDialog === true && (
                <FilingAddressDialog
                  getOrgDetails={getOrgDetails}
                  filingAddressDialog={filingAddressDialog}
                  setFilingAddressDialog={setFilingAddressDialog}
                />
              )}
            </Box>
          </MainCard>
        </HomeCard>
      )}
    </>
  );
}

export default Organizationdetails;
