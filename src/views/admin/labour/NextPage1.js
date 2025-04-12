"use client";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormLabel,
  Grid,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const API_BASE_URL = "http://192.168.1.20:8000";
const PINCODE_API_URL = "https://api.postalpincode.in/pincode/"; // Indian Postal PIN code API

const License = () => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [dataChanged, setDataChanged] = useState(false);
  const [establishmentId, setEstablishmentId] = useState(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [formData, setFormData] = useState({
    establishmentType: "",
    name_of_establishment: "",
    shopAddress: "",
    doorNo: "",
    locality: "",
    state: "",
    district: "",
    mandal: "",
    village: "",
    pinCode: "",
    classification: "",
    category: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Define the locations state
  const [locations, setLocations] = useState([
    { id: null, workplaceType: "", doorNo: "", locality: "" },
  ]);


  const fetchEstablishmentData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }

    try {

      const estResponse = await axios.get(`${API_BASE_URL}/labourlicense/establishments/${id}/`, {
      });

      if (estResponse.data) {
        const estData = estResponse.data;
        setEstablishmentId(estData.id);


        let address = {};
        try {
          if (typeof estData.address_of_establishment === 'string') {
            address = JSON.parse(estData.address_of_establishment);
          } else if (typeof estData.address_of_establishment === 'object') {
            address = estData.address_of_establishment;
          }
        } catch (e) {
          console.error("Error parsing address:", e);
        }

        setFormData({
          name_of_establishment: estData.name_of_establishment || "",
          classification: estData.classification || "",
          category: estData.category || "",
          state: address.state || "",
          district: address.district || "",
          mandal: address.mandal || "",
          village: address.village || "",
          pinCode: address.pincode || "",
          establishmentType: "",
          shopAddress: "",
          doorNo: "",
          locality: "",
        });
      }
    } catch (error) {
      console.error("Error fetching establishment data:", error);
    }
  };

  // Fetch existing data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch establishment data
        await fetchEstablishmentData();

        // Fetch work locations
        const locResponse = await axios.get(`${API_BASE_URL}/labourlicense/work-location/${id}/`);

        if (locResponse.data && locResponse.data.length > 0) {
          const workLocations = locResponse.data.map(loc => {
            let workLocation = {};
            try {
              if (typeof loc.work_location === 'string') {
                workLocation = JSON.parse(loc.work_location);
              } else if (typeof loc.work_location === 'object') {
                workLocation = loc.work_location;
              }
            } catch (e) {
              console.error("Error parsing work location:", e);
            }

            return {
              id: loc.id,
              workplaceType: workLocation.workplace || "",
              doorNo: workLocation.doorNo || "",
              locality: workLocation.locality || ""
            };
          });

          if (workLocations.length > 0) {
            setLocations(workLocations);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Function to fetch location details from PIN code - modified to not update village
  const fetchPincodeDetails = async (pincode) => {
    setPincodeLoading(true);
    try {
      const response = await axios.get(`${PINCODE_API_URL}${pincode}`);
      if (response.data && response.data[0].Status === "Success") {
        const postOfficeData = response.data[0].PostOffice[0];

        setFormData(prevData => ({
          ...prevData,
          state: postOfficeData.State || "",
          district: postOfficeData.District || "",
          mandal: postOfficeData.Block || "", // Using Block as mandal (some APIs use Taluk or Tehsil)
          // Removed the village assignment to prevent auto-filling
        }));
      } else {
        // Invalid PIN code
        setFormErrors(prevErrors => ({
          ...prevErrors,
          pinCode: "Invalid PIN Code or no data available"
        }));
      }
    } catch (error) {
      console.error("Error fetching PIN code data:", error);
      setFormErrors(prevErrors => ({
        ...prevErrors,
        pinCode: "Error fetching PIN code data"
      }));
    } finally {
      setPincodeLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    setDataChanged(true);

    // If pinCode is changed and it's valid length (6 digits in India), fetch details
    if (name === "pinCode" && value.length === 6) {
      fetchPincodeDetails(value);
    }
  };

  const handleLocationChange = (index, field, value) => {
    const updatedLocations = [...locations];
    updatedLocations[index][field] = value;
    setLocations(updatedLocations);
    setDataChanged(true);
  };

  const handleClearRow = (index) => {
    const updatedLocations = [...locations];
    // Preserve ID if it exists
    const locationId = updatedLocations[index].id;
    updatedLocations[index] = {
      id: locationId,
      workplaceType: "",
      doorNo: "",
      locality: ""
    };
    setLocations(updatedLocations);
    setDataChanged(true);
  };

  const handleDeleteRow = (index) => {
    if (index > 0) {
      const updatedLocations = [...locations];
      updatedLocations.splice(index, 1);
      setLocations(updatedLocations);
      setDataChanged(true);
    }
  };

  const handleAddRow = () => {
    setLocations([...locations, { id: null, workplaceType: "", doorNo: "", locality: "" }]);
  };

  const handleSave1 = async (index) => {
    const location = locations[index];
    const locationData = new FormData();
    locationData.append("license", id);
    locationData.append("work_location", JSON.stringify({
      "workplace": location.workplaceType,
      "doorNo": location.doorNo,
      "locality": location.locality
    }));

    try {
      // Check if location has an ID (existing) or not (new)
      if (location.id) {
        // Update existing location
        const response = await axios.put(
          `${API_BASE_URL}/labourlicense/work-location/${location.id}/`,
          locationData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 200) {
          alert("Location updated successfully!");
        }
      } else {
        // Create new location
        const response = await axios.post(
          `${API_BASE_URL}/labourlicense/work-location/`,
          locationData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 201) {
          alert("Location saved successfully!");
          // Update the location ID from response
          const updatedLocations = [...locations];
          updatedLocations[index].id = response.data.id;
          setLocations(updatedLocations);
        }
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location. Please try again.");
    }
  };

  const validateForm = () => {
    let errors = {};

    const requiredFields = [
      "name_of_establishment",
      "state",
      "district",
      "mandal",
      "village",
      "pinCode",
      "classification",
      "category",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        errors[field] = "This field is required";
      }
    });

    // PIN Code validation
    const pinCodeRegex = /^[1-9]{1}[0-9]{5}$/;
    if (formData.pinCode && !pinCodeRegex.test(formData.pinCode)) {
      errors.pinCode = "Invalid PIN Code";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Add new function to save establishment data without navigation
  const handleSaveEstablishment = async () => {
    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append("classification", formData.classification);
    data.append("category", formData.category);
    data.append("name_of_establishment", formData.name_of_establishment);
    data.append("license", id);
    data.append("address_of_establishment", JSON.stringify({
      "state": formData.state,
      "district": formData.district,
      "mandal": formData.mandal,
      "village": formData.village,
      "pincode": formData.pinCode,
    }));

    try {
      let response;
      if (establishmentId) {
        // If establishment exists, update it
        response = await axios.put(
          `${API_BASE_URL}/labourlicense/establishments/${establishmentId}/`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 200) {
          alert("Establishment data updated successfully!");
          setSavedSuccessfully(true);
          // Refresh establishment data to show updated values
          await fetchEstablishmentData();
        }
      } else {
        // If establishment doesn't exist, create it
        response = await axios.post(
          `${API_BASE_URL}/labourlicense/establishments/`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status === 201) {
          alert("Establishment data saved successfully!");
          setEstablishmentId(response.data.id);
          setSavedSuccessfully(true);
          // Refresh establishment data to show updated values
          await fetchEstablishmentData();
        }
      }
      setDataChanged(false);
    } catch (error) {
      console.error("Error saving establishment:", error);
      alert("Failed to save establishment data. Please try again.");
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const data = new FormData();
    data.append("classification", formData.classification);
    data.append("category", formData.category);
    data.append("name_of_establishment", formData.name_of_establishment);
    data.append("license", id);
    data.append("address_of_establishment", JSON.stringify({
      "state": formData.state,
      "district": formData.district,
      "mandal": formData.mandal,
      "village": formData.village,
      "pincode": formData.pinCode,
    }));

    try {
      let response;
      if (establishmentId) {
        // If establishment exists, update it
        response = await axios.put(
          `${API_BASE_URL}/labourlicense/establishments/${id}/`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status !== 200) {
          throw new Error("Failed to update data");
        }
        alert("Establishment data saved successfully!"); // Added success message
      } else {
        // If establishment doesn't exist, create it
        response = await axios.post(
          `${API_BASE_URL}/labourlicense/establishments/`,
          data,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
        if (response.status !== 201) {
          throw new Error("Failed to submit data");
        }
        alert("Establishment data saved successfully!"); // Added success message
      }


      router.push(`/labour/screen3?id=${id}`);
    } catch (error) {
      console.error("Error saving establishment:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  // Handle previous button click
  const handlePrevious = () => {
    // Navigate to the previous page, assuming it's the root form page
    router.push(`/labour/screen1?id=${id}`);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: 700,
        margin: "auto",
        padding: 3,
        border: 1,
        borderRadius: 5,
        borderColor: "grey.400",
        mt: 2,
      }}
      component="form"
      onSubmit={handleSave}
    >
      {Object.keys(formErrors).length > 0 && (
        <Alert severity="warning">Please fill in all required fields.</Alert>
      )}

      {savedSuccessfully && (
        <Alert severity="success" sx={{ mb: 2 }}>Establishment data saved successfully!</Alert>
      )}

      <Stack spacing={2}>
        {/* Classification of Establishment */}
        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel sx={{ marginBottom: 1 }}>Classification of Establishment <span style={{ color: 'red' }}>*</span></FormLabel>
            <Select
              fullWidth
              size="small"
              name="classification"
              value={formData.classification}
              onChange={handleChange}
              error={!!formErrors.classification}
            >
              <MenuItem value="proprietary_firm">Proprietary Firm</MenuItem>
              <MenuItem value="partnership_firm">Partnership Firm</MenuItem>
              <MenuItem value="private_limited_company">Private Limited Company</MenuItem>
              <MenuItem value="public_limited_company">Public Limited Company</MenuItem>
              <MenuItem value="limited_liability_partnership">Limited Liability Partnership (LLP)</MenuItem>
              <MenuItem value="one_person_company">One Person Company (OPC)</MenuItem>
              <MenuItem value="cooperative_society">Cooperative Society</MenuItem>
              <MenuItem value="trust">Trust</MenuItem>
              <MenuItem value="hindu_undivided_family">Hindu Undivided Family (HUF)</MenuItem>
              <MenuItem value="government_entity">Government Entity</MenuItem>
              <MenuItem value="non_government_organization">Non-Government Organization (NGO)</MenuItem>
              <MenuItem value="self_help_group">Self Help Group (SHG)</MenuItem>
              <MenuItem value="small_scale_industry">Small Scale Industry (SSI)</MenuItem>
              <MenuItem value="medium_scale_industry">Medium Scale Industry</MenuItem>
              <MenuItem value="large_scale_industry">Large Scale Industry</MenuItem>
              <MenuItem value="cottage_industry">Cottage Industry</MenuItem>
              <MenuItem value="manufacturing_unit">Manufacturing Unit</MenuItem>
              <MenuItem value="textile_mill">Textile Mill</MenuItem>
              <MenuItem value="chemical_plant">Chemical Plant</MenuItem>
              <MenuItem value="food_processing_unit">Food Processing Unit</MenuItem>
              <MenuItem value="agriculture_based_industry">Agriculture-based Industry</MenuItem>
              <MenuItem value="pharmaceutical_industry">Pharmaceutical Industry</MenuItem>
              <MenuItem value="automobile_industry">Automobile Industry</MenuItem>
              <MenuItem value="plastic_manufacturing">Plastic Manufacturing</MenuItem>
              <MenuItem value="electronic_goods_manufacturing">Electronic Goods Manufacturing</MenuItem>
              <MenuItem value="retail_store">Retail Store</MenuItem>
              <MenuItem value="wholesale_business">Wholesale Business</MenuItem>
              <MenuItem value="ecommerce_business">E-commerce Business</MenuItem>
              <MenuItem value="supermarket">Supermarket</MenuItem>
              <MenuItem value="restaurant">Restaurant</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="bank">Bank</MenuItem>
              <MenuItem value="insurance_company">Insurance Company</MenuItem>
              <MenuItem value="real_estate_firm">Real Estate Firm</MenuItem>
              <MenuItem value="travel_agency">Travel Agency</MenuItem>
              <MenuItem value="transportation_services">Transportation Services</MenuItem>
              <MenuItem value="logistics_company">Logistics Company</MenuItem>
              <MenuItem value="construction_company">Construction Company</MenuItem>
              <MenuItem value="hospital">Hospital</MenuItem>
              <MenuItem value="clinic">Clinic</MenuItem>
              <MenuItem value="diagnostic_center">Diagnostic Center</MenuItem>
              <MenuItem value="pharmacy">Pharmacy</MenuItem>
              <MenuItem value="medical_laboratory">Medical Laboratory</MenuItem>
              <MenuItem value="veterinary_clinic">Veterinary Clinic</MenuItem>
              <MenuItem value="nursing_home">Nursing Home</MenuItem>
              <MenuItem value="dental_clinic">Dental Clinic</MenuItem>
              <MenuItem value="physiotherapy_center">Physiotherapy Center</MenuItem>
              <MenuItem value="ayurvedic_clinic">Ayurvedic Clinic</MenuItem>
              <MenuItem value="homeopathy_clinic">Homeopathy Clinic</MenuItem>
              <MenuItem value="school">School</MenuItem>
              <MenuItem value="college">College</MenuItem>
              <MenuItem value="university">University</MenuItem>
              <MenuItem value="coaching_center">Coaching Center</MenuItem>
              <MenuItem value="vocational_training_center">Vocational Training Center</MenuItem>
              <MenuItem value="computer_training_institute">Computer Training Institute</MenuItem>
              <MenuItem value="language_institute">Language Institute</MenuItem>
              <MenuItem value="dance_school">Dance School</MenuItem>
              <MenuItem value="music_academy">Music Academy</MenuItem>
              <MenuItem value="driving_school">Driving School</MenuItem>
              <MenuItem value="technical_institute">Technical Institute</MenuItem>
              <MenuItem value="power_plant">Power Plant</MenuItem>
              <MenuItem value="water_supply_plant">Water Supply Plant</MenuItem>
              <MenuItem value="waste_management_plant">Waste Management Plant</MenuItem>
              <MenuItem value="sewage_treatment_plant">Sewage Treatment Plant</MenuItem>
              <MenuItem value="telecom_company">Telecom Company</MenuItem>
              <MenuItem value="gas_distribution_company">Gas Distribution Company</MenuItem>
              <MenuItem value="metro_station">Metro Station</MenuItem>
              <MenuItem value="railway_station">Railway Station</MenuItem>
              <MenuItem value="airport">Airport</MenuItem>
              <MenuItem value="bus_terminal">Bus Terminal</MenuItem>
              <MenuItem value="logistics_hub">Logistics Hub</MenuItem>
              <MenuItem value="court">Court</MenuItem>
              <MenuItem value="police_station">Police Station</MenuItem>
              <MenuItem value="fire_station">Fire Station</MenuItem>
              <MenuItem value="municipal_corporation">Municipal Corporation</MenuItem>
              <MenuItem value="government_office">Government Office</MenuItem>
              <MenuItem value="post_office">Post Office</MenuItem>
              <MenuItem value="passport_office">Passport Office</MenuItem>
              <MenuItem value="customs_office">Customs Office</MenuItem>
              <MenuItem value="tax_department">Tax Department</MenuItem>
              <MenuItem value="embassy">Embassy</MenuItem>
              <MenuItem value="notary_office">Notary Office</MenuItem>
              <MenuItem value="public_sector_unit">Public Sector Unit (PSU)</MenuItem>




            </Select>
            {formErrors.classification && (
              <Typography color="error">{formErrors.classification}</Typography>
            )}
          </Box>

          {/* Category of Establishment */}
          <Box flex={1}>
            <FormLabel sx={{ marginBottom: 1 }}>Category of Establishment <span style={{ color: 'red' }}>*</span></FormLabel>
            <Select
              size="small"
              fullWidth
              name="category"
              value={formData.category}
              onChange={handleChange}
              error={!!formErrors.category}
            >
              <MenuItem value="shop">Shop</MenuItem>
              <MenuItem value="commercial_establishment">Commercial Establishment</MenuItem>
              <MenuItem value="shopping_mall">Shopping Mall</MenuItem>
              <MenuItem value="supermarket">Supermarket</MenuItem>
              <MenuItem value="grocery_store">Grocery Store</MenuItem>
              <MenuItem value="department_store">Department Store</MenuItem>
              <MenuItem value="pharmacy">Pharmacy</MenuItem>
              <MenuItem value="bookstore">Bookstore</MenuItem>
              <MenuItem value="electronic_store">Electronics Store</MenuItem>
              <MenuItem value="clothing_store">Clothing Store</MenuItem>
              <MenuItem value="furniture_store">Furniture Store</MenuItem>
              <MenuItem value="jewelry_store">Jewelry Store</MenuItem>
              <MenuItem value="hardware_store">Hardware Store</MenuItem>
              <MenuItem value="hotel">Hotel</MenuItem>
              <MenuItem value="restaurant">Restaurant</MenuItem>
              <MenuItem value="resort">Resort</MenuItem>
              <MenuItem value="cafe">Cafe</MenuItem>
              <MenuItem value="bakery">Bakery</MenuItem>
              <MenuItem value="bar">Bar</MenuItem>
              <MenuItem value="catering_service">Catering Service</MenuItem>
              <MenuItem value="food_truck">Food Truck</MenuItem>
              <MenuItem value="hostel">Hostel</MenuItem>
              <MenuItem value="guest_house">Guest House</MenuItem>
              <MenuItem value="banquet_hall">Banquet Hall</MenuItem>
              <MenuItem value="cloud_kitchen">Cloud Kitchen</MenuItem>
              <MenuItem value="factory">Factory</MenuItem>
              <MenuItem value="workshop">Workshop</MenuItem>
              <MenuItem value="warehouse">Warehouse</MenuItem>
              <MenuItem value="power_plant">Power Plant</MenuItem>
              <MenuItem value="textile_mill">Textile Mill</MenuItem>
              <MenuItem value="steel_plant">Steel Plant</MenuItem>
              <MenuItem value="plastic_manufacturing">Plastic Manufacturing</MenuItem>
              <MenuItem value="pharmaceutical_unit">Pharmaceutical Unit</MenuItem>
              <MenuItem value="automobile_plant">Automobile Plant</MenuItem>
              <MenuItem value="printing_press">Printing Press</MenuItem>
              <MenuItem value="chemical_factory">Chemical Factory</MenuItem>
              <MenuItem value="corporate_office">Corporate Office</MenuItem>
              <MenuItem value="coworking_space">Coworking Space</MenuItem>
              <MenuItem value="software_company">Software Company</MenuItem>
              <MenuItem value="consulting_firm">Consulting Firm</MenuItem>
              <MenuItem value="call_center">Call Center</MenuItem>
              <MenuItem value="bank_branch">Bank Branch</MenuItem>
              <MenuItem value="insurance_office">Insurance Office</MenuItem>
              <MenuItem value="government_office">Government Office</MenuItem>
              <MenuItem value="post_office">Post Office</MenuItem>
              <MenuItem value="law_firm">Law Firm</MenuItem>
              <MenuItem value="accounting_firm">Accounting Firm</MenuItem>
              <MenuItem value="real_estate_agency">Real Estate Agency</MenuItem>
              <MenuItem value="cinema">Cinema</MenuItem>
              <MenuItem value="theater">Theater</MenuItem>
              <MenuItem value="amusement_park">Amusement Park</MenuItem>
              <MenuItem value="arcade">Arcade</MenuItem>
              <MenuItem value="sports_complex">Sports Complex</MenuItem>
              <MenuItem value="gym">Gym</MenuItem>
              <MenuItem value="spa">Spa</MenuItem>
              <MenuItem value="gaming_center">Gaming Center</MenuItem>
              <MenuItem value="yoga_studio">Yoga Studio</MenuItem>
              <MenuItem value="dance_studio">Dance Studio</MenuItem>
              <MenuItem value="music_school">Music School</MenuItem>
              <MenuItem value="dairy_farm">Dairy Farm</MenuItem>
              <MenuItem value="poultry_farm">Poultry Farm</MenuItem>
              <MenuItem value="greenhouse">Greenhouse</MenuItem>
              <MenuItem value="fisheries">Fisheries</MenuItem>
              <MenuItem value="tea_plantation">Tea Plantation</MenuItem>
              <MenuItem value="agro_processing_unit">Agro Processing Unit</MenuItem>
              <MenuItem value="cold_storage">Cold Storage</MenuItem>
              <MenuItem value="seed_and_fertilizer_store">Seed & Fertilizer Store</MenuItem>
              <MenuItem value="hospital">Hospital</MenuItem>
              <MenuItem value="clinic">Clinic</MenuItem>
              <MenuItem value="diagnostic_center">Diagnostic Center</MenuItem>
              <MenuItem value="dental_clinic">Dental Clinic</MenuItem>
              <MenuItem value="physiotherapy_center">Physiotherapy Center</MenuItem>
              <MenuItem value="ayurvedic_clinic">Ayurvedic Clinic</MenuItem>
              <MenuItem value="veterinary_clinic">Veterinary Clinic</MenuItem>
              <MenuItem value="blood_bank">Blood Bank</MenuItem>
              <MenuItem value="pharmacy">Pharmacy</MenuItem>
              <MenuItem value="school">School</MenuItem>
              <MenuItem value="college">College</MenuItem>
              <MenuItem value="university">University</MenuItem>
              <MenuItem value="coaching_center">Coaching Center</MenuItem>
              <MenuItem value="skill_training_institute">Skill Training Institute</MenuItem>
              <MenuItem value="music_school">Music School</MenuItem>
              <MenuItem value="art_institute">Art Institute</MenuItem>
              <MenuItem value="language_institute">Language Institute</MenuItem>
              <MenuItem value="computer_training_center">Computer Training Center</MenuItem>
              <MenuItem value="vocational_training_center">Vocational Training Center</MenuItem>
              <MenuItem value="transport_agency">Transport Agency</MenuItem>
              <MenuItem value="courier_service">Courier Service</MenuItem>
              <MenuItem value="bus_terminal">Bus Terminal</MenuItem>
              <MenuItem value="railway_station">Railway Station</MenuItem>
              <MenuItem value="airport">Airport</MenuItem>
              <MenuItem value="parking_lot">Parking Lot</MenuItem>
              <MenuItem value="taxi_service">Taxi Service</MenuItem>
              <MenuItem value="truck_terminal">Truck Terminal</MenuItem>
              <MenuItem value="court">Court</MenuItem>
              <MenuItem value="police_station">Police Station</MenuItem>
              <MenuItem value="fire_station">Fire Station</MenuItem>
              <MenuItem value="municipal_corporation">Municipal Corporation</MenuItem>
              <MenuItem value="customs_office">Customs Office</MenuItem>
              <MenuItem value="embassy">Embassy</MenuItem>
              <MenuItem value="notary_office">Notary Office</MenuItem>
              <MenuItem value="temple">Temple</MenuItem>
              <MenuItem value="church">Church</MenuItem>
              <MenuItem value="mosque">Mosque</MenuItem>
              <MenuItem value="gurdwara">Gurdwara</MenuItem>
              <MenuItem value="monastery">Monastery</MenuItem>
              <MenuItem value="ashram">Ashram</MenuItem>
              <MenuItem value="cultural_center">Cultural Center</MenuItem>
              <MenuItem value="tattoo_studio">Tattoo Studio</MenuItem>
              <MenuItem value="barbershop">Barbershop</MenuItem>
              <MenuItem value="car_wash">Car Wash</MenuItem>
              <MenuItem value="dry_cleaning">Dry Cleaning</MenuItem>
              <MenuItem value="pet_grooming">Pet Grooming</MenuItem>
              <MenuItem value="adventure_tour_agency">Adventure Tour Agency</MenuItem>
              <MenuItem value="funeral_home">Funeral Home</MenuItem>
              <MenuItem value="ngo">NGO</MenuItem>
              <MenuItem value="charity_office">Charity Office</MenuItem>
              <MenuItem value="media_house">Media House</MenuItem>



            </Select>
            {formErrors.category && (
              <Typography color="error">{formErrors.category}</Typography>
            )}
          </Box>
        </Stack>

        {/* Name and Address of the Shop/Establishment */}
        <Box>
          <Stack direction="row" spacing={2}>
            <Box flex={1}>
              <FormLabel>Name of the Shop/Establishment <span style={{ color: 'red' }}>*</span></FormLabel>
              <TextField
                size="small"
                fullWidth
                name="name_of_establishment"
                value={formData.name_of_establishment}
                onChange={handleChange}
                error={!!formErrors.name_of_establishment}
                helperText={formErrors.name_of_establishment}
              />
            </Box>
          </Stack>
        </Box>

        <FormLabel sx={{ textAlign: "left", fontFamily: "Archivo", color: "black", marginBottom: 2 }}>
          Address of the Shop/Establishment <span style={{ color: 'red' }}>*</span>
        </FormLabel>

        {/* State, District - Changed to TextFields */}
        <Stack direction="row" spacing={3}>
          <Box flex={1}>
            <FormLabel>Village <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              fullWidth
              name="village"
              value={formData.village}
              onChange={handleChange}
              error={!!formErrors.village}
              helperText={formErrors.village}
            // Not disabled during pincode loading - user can enter manually
            />
          </Box>
          <Box flex={1}>
            <FormLabel>PIN Code <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              name="pinCode"
              fullWidth
              value={formData.pinCode}
              onChange={handleChange}
              error={!!formErrors.pinCode}
              helperText={formErrors.pinCode}
              InputProps={{
                endAdornment: pincodeLoading && <CircularProgress size={20} />,
              }}
            />
          </Box>

          <Box flex={1}>
            <FormLabel>Mandal <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              fullWidth
              name="mandal"
              value={formData.mandal}
              onChange={handleChange}
              error={!!formErrors.mandal}
              helperText={formErrors.mandal}
              disabled={pincodeLoading}
            />
          </Box>
        </Stack>

        {/* PIN Code moved after Village */}

        <Stack direction="row" spacing={2}>
          <Box flex={1}>
            <FormLabel>State <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              fullWidth
              name="state"
              value={formData.state}
              onChange={handleChange}
              error={!!formErrors.state}
              helperText={formErrors.state}
              disabled={pincodeLoading}
            />
          </Box>

          <Box flex={1}>
            <FormLabel>District <span style={{ color: 'red' }}>*</span></FormLabel>
            <TextField
              size="small"
              fullWidth
              name="district"
              value={formData.district}
              onChange={handleChange}
              error={!!formErrors.district}
              helperText={formErrors.district}
              disabled={pincodeLoading}
            />
          </Box>
        </Stack>

        {/* Display current saved establishment data */}


        {/* Add Save Establishment button here */}


        <Box sx={{ border: "1px solid gray", p: 0, borderRadius: 2, mt: 2, width: "100%" }}>
          <Typography variant="h6" sx={{ ml: 2, mt: 1 }} gutterBottom>
            Location of Office/Godown/Workplace
          </Typography>

          <Grid container spacing={0} sx={{ fontWeight: "bold", textAlign: "center", mb: 2, ml: 1 }}>
            <Grid item xs={1}>S. No</Grid>
            <Grid item xs={3}>Workplace Type</Grid>
            <Grid item xs={3}>Door No</Grid>
            <Grid item xs={3}>Locality</Grid>
            <Grid item xs={2}></Grid>
          </Grid>

          <Box>
            {locations.map((location, index) => (
              <React.Fragment key={index}>

                {/* Inputs Row */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 2, ml: 1 }}>
                  <Grid item xs={1} sx={{ textAlign: "center" }}>
                    {index + 1}.
                  </Grid>
                  <Grid item xs={3}>
                    <FormControl fullWidth>
                      <Select
                        fullWidth
                        size="small"
                        variant="outlined"
                        value={location.workplaceType}
                        onChange={(e) => handleLocationChange(index, "workplaceType", e.target.value)}
                      >
                        <MenuItem value="Office">Office</MenuItem>
                        <MenuItem value="Godown">Godown</MenuItem>
                        <MenuItem value="Workplace">Workplace</MenuItem>
                        <MenuItem value="Factory">Factory</MenuItem>
                        <MenuItem value="Warehouse">Warehouse</MenuItem>
                        <MenuItem value="Retail Store">Retail Store</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      sx={{ fontSize: "16px", input: { padding: "8px" } }}
                      variant="outlined"
                      value={location.doorNo}
                      onChange={(e) => handleLocationChange(index, "doorNo", e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <TextField
                      fullWidth
                      sx={{ fontSize: "16px", input: { padding: "8px" } }}
                      variant="outlined"
                      value={location.locality}
                      onChange={(e) => handleLocationChange(index, "locality", e.target.value)}
                    />
                  </Grid>
                </Grid>

                {/* Buttons Row */}
                <Grid container spacing={2} alignItems="center" sx={{ mb: 3, ml: 19 }}>
                  <Grid item xs={7}>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      <Button variant="contained" color="primary" onClick={() => handleSave1(index)}>
                        Save
                      </Button>
                      <Button variant="contained" color="primary" onClick={() => handleClearRow(index)}>
                        Clear
                      </Button>
                      <Button variant="contained" color="primary" onClick={() => handleDeleteRow(index)}>
                        Delete
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </React.Fragment>
            ))}
          </Box>

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2, ml: 3, mb: 2 }}>
            <Button variant="contained" color="primary" onClick={handleAddRow}>
              + Add New Row
            </Button>
          </Box>
        </Box>

        {/* Previous and Next Buttons */}
        <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePrevious}
          >
            Previous
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
          >
            Save & Next
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default License;