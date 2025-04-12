"use client";

import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  InputAdornment,
  MenuItem,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import Tab from '@mui/material/Tab';
import * as React from 'react';

import axios from "axios";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
export default function PartnersForm() {
  const router = useRouter()

  const searchParams = useSearchParams()

  const id = searchParams.get("id");
  const [numPartners, setNumPartners] = React.useState();
  const [activeTab, setActiveTab] = React.useState('1');
  const [partners, setPartners] = React.useState([
    {
      first_name: '', middle_name: '', last_name: '', father_first_name: '', father_middle_name: '', father_last_name: '', email: '', mobile: '', dob: '', gender: '', designation: '', pan_number: '', country: 'India', pincode: '', state: '',
      city: '', street: '', district: '', flat_no: '', name_of_premises: '',
    }
  ]);
  const [errors, setErrors] = React.useState([]);
  const [savedPartners, setSavedPartners] = React.useState([]);
  const [isLoadingPincode, setIsLoadingPincode] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [partnerIds, setPartnerIds] = React.useState([]);
  const RequiredMark = () => <span style={{ color: "red" }}>*</span>;

  // Fetch existing partner data when component mounts
  React.useEffect(() => {
    if (id) {
      fetchExistingPartners();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const fetchExistingPartners = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`http://192.168.1.20:8000/gst/partners/${id}/`);

      // Handle both single object and array responses
      const responseData = Array.isArray(response.data) ? response.data : [response.data];

      if (responseData.length > 0) {
        const fetchedPartners = responseData.map(partner => {
          let address = partner.address;
          if (typeof partner.address === 'string') {
            try {
              address = JSON.parse(partner.address);
            } catch (e) {
              console.error("Error parsing address:", e);
              address = {};
            }
          }

          return {
            partnerid: partner.id,
            first_name: partner.first_name || '',
            middle_name: partner.middle_name || '',
            last_name: partner.last_name || '',
            father_first_name: partner.father_first_name || '',
            father_middle_name: partner.father_middle_name || '',
            father_last_name: partner.father_last_name || '',
            email: partner.email || '',
            mobile: partner.mobile || '',
            dob: partner.dob || '',
            gender: partner.gender || '',
            designation: partner.designation || '',
            pan_number: partner.pan_number || '',
            country: address.country || 'India',
            pincode: address.pincode || '',
            state: address.state || '',
            city: address.city || '',
            street: address.street || '',
            district: address.district || '',
            flat_no: address.flat_no || '',
            name_of_premises: partner.name_of_premises || '',
            file_name: partner.file ? partner.file.split('/').pop() : null // Extract filename if present
          };
        });

        setPartners(fetchedPartners);
        // Extract just the IDs for later use with PUT requests
        setPartnerIds(fetchedPartners.map(partner => partner.id));
        setNumPartners(fetchedPartners.length);
        setSavedPartners(fetchedPartners);

        // Initialize errors array
        setErrors(Array(fetchedPartners.length).fill({}));
      }
    } catch (error) {
      console.error("Error fetching partner data:", error);
      alert("Error loading partner data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (!isLoading) {
      setPartners(prevPartners => {
        const newPartners = [...prevPartners.slice(0, numPartners)];
        while (newPartners.length < numPartners) {
          newPartners.push({
            first_name: '', middle_name: '', last_name: '', father_first_name: '', father_middle_name: '', father_last_name: '', email: '', mobile: '', dob: '', gender: '', designation: '', pan_number: '', country: 'India',
            pincode: '', state: '', district: '', city: '', street: '', flat_no: '', name_of_premises: '',
          });
        }
        return newPartners;
      });

      setErrors(prevErrors => {
        const newErrors = [...prevErrors.slice(0, numPartners)];
        while (newErrors.length < numPartners) {
          newErrors.push({});
        }
        return newErrors;
      });
    }
  }, [numPartners, isLoading]);

  const validatePartnerForm = (index) => {
    const partner = partners[index];
    const partnerError = {
      first_name: !partner.first_name.trim(),
      last_name: !partner.last_name.trim(),
      father_first_name: !partner.father_first_name.trim(),
      father_last_name: !partner.father_last_name.trim(),
      email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(partner.email),
      mobile: !/^\d{10}$/.test(partner.mobile),
      dob: !partner.dob.trim(),
      gender: !partner.gender,
      pan_number: !/^[A-Z]{5}\d{4}[A-Z]$/.test(partner.pan_number),
      designation: !partner.designation.trim(),
      country: !partner.country,
      pincode: !/^\d{6}$/.test(partner.pincode),
      state: !partner.state,
      city: !partner.city.trim(),
      street: !partner.street.trim(),
      district: !partner.district.trim(),
      flat_no: !partner.flat_no,
      name_of_premises: !partner.name_of_premises,
    };

    // Update the errors state for this partner
    setErrors(prev => {
      const newErrors = [...prev];
      newErrors[index] = partnerError;
      return newErrors;
    });

    // Return true if valid (no errors), false otherwise
    return !Object.values(partnerError).some(error => error);
  };

  const fetchLocationDetailsByPincode = async (pincode, index) => {
    if (pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      return;
    }

    setIsLoadingPincode(true);
    try {
      const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

      if (response.data && response.data[0].Status === "Success" && response.data[0].PostOffice && response.data[0].PostOffice.length > 0) {
        const postOffice = response.data[0].PostOffice[0];

        // Update the partner's details with the fetched location data
        setPartners(prevPartners => {
          const updatedPartners = [...prevPartners];
          updatedPartners[index] = {
            ...updatedPartners[index],
            state: postOffice.State || '',
            district: postOffice.District || '',
            city: postOffice.Block || postOffice.Name || ''
          };
          return updatedPartners;
        });
      } else {
        // Handle case where pincode is not found
        alert("No location details found for this pincode. Please enter location details manually.");
      }
    } catch (error) {
      console.error("Error fetching pincode details:", error);
      alert("Error fetching location details. Please enter them manually.");
    } finally {
      setIsLoadingPincode(false);
    }
  };

  const handleSaveAndContinue = async () => {
    // Get the current tab index (activeTab is a string)
    const currentIndex = parseInt(activeTab) - 1;

    // Validate current partner's form
    if (!validatePartnerForm(currentIndex)) {
      alert("THESE FIELDS ARE NOT CORRECT");
      return;
    }

    const data = partners[currentIndex];
    const formData = new FormData();

    // Add all partner data to FormData
    formData.append('gst', id);
    formData.append('first_name', data.first_name);
    formData.append('middle_name', data.middle_name);
    formData.append('last_name', data.last_name);
    formData.append('father_first_name', data.father_first_name);
    formData.append('father_middle_name', data.father_middle_name);
    formData.append('father_last_name', data.father_last_name);
    formData.append('email', data.email);
    formData.append('mobile', data.mobile);
    formData.append('dob', data.dob);
    formData.append('gender', data.gender);
    formData.append('designation', data.designation);
    formData.append('pan_number', data.pan_number);
    formData.append('name_of_premises', data.name_of_premises);
    const address = {
      country: data.country,
      pincode: data.pincode,
      state: data.state,
      district: data.district,
      city: data.city,
      street: data.street,
      flat_no: data.flat_no
    };

    // Convert address object to a JSON string and append it
    formData.append('address', JSON.stringify(address));

    try {
      let response;
      if (data.partnerid || partnerIds[currentIndex]) {
        const partnerId = data.partnerid || partnerIds[currentIndex];
        response = await axios.put(`http://192.168.1.20:8000/gst/partners/${partnerId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Updated existing partner");
      } else {
        // POST request to create new partner
        response = await axios.post("http://192.168.1.20:8000/gst/partners/", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Created new partner");

        // If we created a new partner, save the ID
        if (response.data && response.data.id) {
          setPartnerIds(prev => {
            const newIds = [...prev];
            newIds[currentIndex] = response.data.id;
            return newIds;
          });

          // Update the partners array with the new ID
          setPartners(prev => {
            const updatedPartners = [...prev];
            updatedPartners[currentIndex] = {
              ...updatedPartners[currentIndex],
              id: response.data.id
            };
            return updatedPartners;
          });
        }
      }

      if ((response.status === 200 || response.status === 201) && response.data) {
        console.log("Success");
      }

      console.log(`Partner ${currentIndex + 1} data saved:`, data);

      // Add or update the saved partner in our array
      setSavedPartners(prev => {
        const newSavedPartners = [...prev];
        newSavedPartners[currentIndex] = { ...data };
        return newSavedPartners;
      });

      // Show success message
      alert(`Partner ${currentIndex + 1} data saved successfully!`);

      // Move to next partner if available
      if (currentIndex < numPartners - 1) {
        setActiveTab((currentIndex + 2).toString()); // Move to next tab
      } else {
        console.log("All partners saved:", savedPartners);
        alert("All partners data saved successfully! Moving to next page.");
        router.push(`/gst/screen5?id=${id}`);
        console.log("Complete partners data:", [...savedPartners, data]);
      }
    } catch (error) {
      console.error("Error saving partner:", error);
      alert("Error saving partner information. Please try again.");
    }
  };

  const handlePartnerChange = (index, field, value) => {
    setPartners(prevPartners => {
      const updatedPartners = [...prevPartners];
      updatedPartners[index] = { ...updatedPartners[index], [field]: value };
      return updatedPartners;
    });

    // If pincode field is updated and has 6 digits, fetch location details
    if (field === 'pincode' && value.length === 6 && /^\d{6}$/.test(value)) {
      fetchLocationDetailsByPincode(value, index);
    }
  };


  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading partner data...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: 'auto', my: 4, border: '1px solid #ccc', borderRadius: 5, width: 800, borderColor: "grey.400", }}>
      <Typography variant="h5" gutterBottom sx={{ width: "100%", textAlign: "center" }}>Partner Details</Typography>
      <Box
        sx={{
          mt: 2,
          mb: 2,
          textAlign: "left",
          width: "100%",
          maxWidth: "600px",
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 1
        }}
      >
        <FormLabel
          sx={{
            textAlign: "left",
            fontSize: "16px",
            color: "#333"
          }}
        >
          No. of Partners/Dir's <RequiredMark />
        </FormLabel>

        <TextField
          select
          value={numPartners || ""}
          onChange={(e) => setNumPartners(parseInt(e.target.value))}
          variant="outlined"
          size="small"
          sx={{ width: "100%" }}
          displayEmpty
        >
          <MenuItem value="" disabled>
            Select Number of Partners
          </MenuItem>
          {[1, 2, 3, 4, 5].map((num) => (
            <MenuItem key={num} value={num}>
              {num}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* Only render the form when numPartners is selected */}
      {numPartners && (
        <>
          <TabContext value={activeTab}>
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <TabList
                onChange={(e, newValue) => setActiveTab(newValue)}
                centered
              >
                {Array.from({ length: numPartners }).map((_, index) => (
                  <Tab
                    key={index}
                    label={`Partner ${index + 1}`}
                    value={(index + 1).toString()}
                  />
                ))}
              </TabList>
            </Box>

            {partners.map((partner, index) => (
              <TabPanel key={index} value={(index + 1).toString()}>
                <Box sx={{ mt: 2 }}>
                  {partner.file_name && (
                    <Box sx={{ mb: 2, p: 2, border: '1px dashed #ccc', borderRadius: 1, bgcolor: '#f5f5f5' }}>
                      <Typography variant="body2">
                        Existing file: <strong>{partner.file_name}</strong>
                      </Typography>
                    </Box>
                  )}
                  <Typography variant="body1" sx={{ mb: 1 }}>Name of person</Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>First Name <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.first_name}
                        onChange={(e) => handlePartnerChange(index, 'first_name', e.target.value)}
                        fullWidth
                        error={errors[index]?.first_name}
                        helperText={errors[index]?.first_name ? "First name is required" : ""}
                      />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>Middle Name </FormLabel>
                      <TextField
                        size="small"
                        value={partner.middle_name}
                        onChange={(e) => handlePartnerChange(index, 'middle_name', e.target.value)}
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>Last Name <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.last_name}
                        onChange={(e) => handlePartnerChange(index, 'last_name', e.target.value)}
                        fullWidth
                        error={errors[index]?.last_name}
                        helperText={errors[index]?.last_name ? "Last name is required" : ""}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body1" sx={{ mb: 1 }}>Father's Name <RequiredMark /></Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>First Name <RequiredMark /></FormLabel>
                        <TextField
                          value={partner.father_first_name}
                          size="small"
                          onChange={(e) => handlePartnerChange(index, 'father_first_name', e.target.value)}
                          fullWidth
                          error={errors[index]?.father_first_name}
                          helperText={errors[index]?.father_first_name ? " Father First name is required" : ""}
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Middle Name</FormLabel>
                        <TextField
                          size="small"
                          value={partner.father_middle_name}
                          onChange={(e) => handlePartnerChange(index, 'father_middle_name', e.target.value)}
                          fullWidth
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Last Name <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.father_last_name}
                          onChange={(e) => handlePartnerChange(index, 'father_last_name', e.target.value)}
                          fullWidth
                          error={errors[index]?.father_last_name}
                          helperText={errors[index]?.father_last_name ? " Father Last name is required" : ""}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Date of Birth <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          type="date"
                          value={partner.dob}
                          onChange={(e) => handlePartnerChange(index, 'dob', e.target.value)}
                          fullWidth
                          error={errors[index]?.dob}
                          helperText={errors[index]?.dob ? "Date of birth is required" : ""}
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Mobile Number <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.mobile}
                          onChange={(e) => handlePartnerChange(index, 'mobile', e.target.value)}
                          fullWidth
                          InputProps={{
                            startAdornment: <InputAdornment position="start">+91</InputAdornment>
                          }}
                          error={errors[index]?.mobile}
                          helperText={errors[index]?.mobile ? "Enter a valid 10-digit number" : ""}
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Email Address <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.email}
                          onChange={(e) => handlePartnerChange(index, 'email', e.target.value)}
                          fullWidth
                          error={errors[index]?.email}
                          helperText={errors[index]?.email ? "Invalid email format" : ""}
                        />
                      </Box>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: "100%" }}>
                        <FormControl component="fieldset" sx={{ mt: 1 }}>
                          <FormLabel >Gender <RequiredMark /></FormLabel>
                          <RadioGroup
                            row
                            value={partner.gender}
                            onChange={(e) => handlePartnerChange(index, 'gender', e.target.value)}
                          >
                            <FormControlLabel value="male" control={<Radio />} label="Male" />
                            <FormControlLabel value="female" control={<Radio />} label="Female" />
                          </RadioGroup>
                          {errors[index]?.gender && <Typography color="error" variant="caption">Gender is required</Typography>}
                        </FormControl>
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>Designation/status <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.designation}
                          onChange={(e) => handlePartnerChange(index, 'designation', e.target.value)}
                          fullWidth
                          error={errors[index]?.designation}
                          helperText={errors[index]?.designation ? " designation is required" : ""}
                        />
                      </Box>
                      <Box sx={{ width: "100%" }}>
                        <FormLabel>PAN <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.pan_number}
                          onChange={(e) => handlePartnerChange(index, 'pan_number', e.target.value)}
                          fullWidth
                          error={errors[index]?.pan_number}
                          helperText={errors[index]?.pan_number ? " pan is required" : ""}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="h6" sx={{ mt: 1 }}>Address<RequiredMark /></Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ mt: -2 }}>
                      <FormControl component="fieldset" sx={{ mt: 0 }}>
                        <FormLabel>Country<RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.country}
                          onChange={(e) => handlePartnerChange(index, 'country', e.target.value)}
                          fullWidth
                          error={errors[index]?.country}
                          helperText={errors[index]?.country ? " country is required" : ""}
                        />
                      </FormControl>
                    </Box>
                    <Box sx={{ mt: -2, width: 360 }}>
                      <FormLabel>Pin Code <RequiredMark /> </FormLabel>
                      <TextField
                        size="small"
                        value={partner.pincode}
                        onChange={(e) => handlePartnerChange(index, 'pincode', e.target.value)}
                        fullWidth
                        error={errors[index]?.pincode}
                        helperText={errors[index]?.pincode ? "pin code is required" : ""}
                        InputProps={{
                          endAdornment: isLoadingPincode ? (
                            <InputAdornment position="end"><CircularProgress size={20} /></InputAdornment>
                          ) : null
                        }}
                      />
                    </Box>
                    <Box sx={{ width: 340, mt: -2 }}>
                      <FormLabel>State <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.state}
                        onChange={(e) => handlePartnerChange(index, 'state', e.target.value)}
                        fullWidth
                        error={errors[index]?.state}
                        helperText={errors[index]?.state ? " state is required" : ""}
                        InputProps={{
                          readOnly: isLoadingPincode,
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>District <RequiredMark /></FormLabel>
                      <TextField
                        value={partner.district}
                        size="small"
                        onChange={(e) => handlePartnerChange(index, 'district', e.target.value)}
                        fullWidth
                        error={errors[index]?.district}
                        helperText={errors[index]?.district ? "district is required" : ""}
                        InputProps={{
                          readOnly: isLoadingPincode,
                        }}
                      />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>City/Town/Village <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.city}
                        onChange={(e) => handlePartnerChange(index, 'city', e.target.value)}
                        fullWidth
                        error={errors[index]?.city}
                        helperText={errors[index]?.city ? " city is required" : ""}
                        InputProps={{
                          readOnly: isLoadingPincode,
                        }}
                      />
                    </Box>
                    <Box sx={{ width: "100%" }}>
                      <FormLabel>Road/Street <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.street}
                        onChange={(e) => handlePartnerChange(index, 'street', e.target.value)}
                        fullWidth
                        error={errors[index]?.street}
                        helperText={errors[index]?.street ? " street is required" : ""}
                      />
                    </Box>
                  </Box>
                </Box>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: 450 }}>
                      <FormLabel>Name of Premises <RequiredMark /></FormLabel>
                      <TextField
                        size="small"
                        value={partner.name_of_premises}
                        onChange={(e) => handlePartnerChange(index, 'name_of_premises', e.target.value)}
                        fullWidth
                        error={errors[index]?.name_of_premises}
                        helperText={errors[index]?.name_of_premises ? "name of premises is required" : ""}
                      />
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                      <Box sx={{ width: 420, mt: 0 }}>
                        <FormLabel>Building No/Flat No <RequiredMark /></FormLabel>
                        <TextField
                          size="small"
                          value={partner.flat_no}
                          onChange={(e) => handlePartnerChange(index, 'flat_no', e.target.value)}
                          fullWidth
                          error={errors[index]?.flat_no}
                          helperText={errors[index]?.flat_no ? "flat no is required" : ""}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </TabPanel>
            ))}
          </TabContext>
          <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => router.push(`/gst/screen3?id=${id}`)}
            >
              Previous
            </Button>
            <Button variant="contained" color="primary" onClick={handleSaveAndContinue}>
              {"Save & Continue"}
            </Button>
          </Stack>
        </>
      )}
    </Box>
  );
}