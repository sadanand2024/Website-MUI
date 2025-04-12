"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  TextField,
  Select,
  MenuItem,
  Stack,
  Radio,
  RadioGroup,
  FormControlLabel,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'

const states = {
  "Andhra Pradesh": ["Anantapur", "Chittoor", "East Godavari", "Guntur", "Kadapa", "Krishna", "Kurnool", "Nellore", "Prakasam", "Srikakulam", "Visakhapatnam", "Vizianagaram", "West Godavari"],
  "Arunachal Pradesh": ["Anjaw", "Changlang", "Dibang Valley", "East Kameng", "East Siang", "Kamle", "Kra Daadi", "Kurung Kumey", "Lepa Rada", "Lohit", "Longding", "Lower Dibang Valley", "Lower Siang", "Lower Subansiri", "Namsai", "Pakke-Kessang", "Papum Pare", "Shi Yomi", "Siang", "Tawang", "Tirap", "Upper Dibang Valley", "Upper Siang", "Upper Subansiri", "West Kameng", "West Siang"],
  "Assam": ["Baksa", "Barpeta", "Biswanath", "Bongaigaon", "Cachar", "Charaideo", "Chirang", "Darrang", "Dhemaji", "Dhubri", "Dibrugarh", "Dima Hasao", "Goalpara", "Golaghat", "Hailakandi", "Hojai", "Jorhat", "Kamrup", "Kamrup Metropolitan", "Karbi Anglong", "Karimganj", "Kokrajhar", "Lakhimpur", "Majuli", "Morigaon", "Nagaon", "Nalbari", "Sivasagar", "Sonitpur", "South Salmara-Mankachar", "Tinsukia", "Udalguri", "West Karbi Anglong"],
  "Bihar": ["Araria", "Arwal", "Aurangabad", "Banka", "Begusarai", "Bhagalpur", "Bhojpur", "Buxar", "Darbhanga", "East Champaran", "Gaya", "Gopalganj", "Jamui", "Jehanabad", "Kaimur", "Katihar", "Khagaria", "Kishanganj", "Lakhisarai", "Madhepura", "Madhubani", "Munger", "Muzaffarpur", "Nalanda", "Nawada", "Patna", "Purnia", "Rohtas", "Saharsa", "Samastipur", "Saran", "Sheikhpura", "Sheohar", "Sitamarhi", "Siwan", "Supaul", "Vaishali", "West Champaran"],
  "Chattisgarh": ["Balod", "Baloda Bazar", "Balrampur", "Bastar", "Bemetara", "Bijapur", "Bilaspur", "Dantewada", "Dhamtari", "Durg", "Gariaband", "Janjgir-Champa", "Jashpur", "Kabirdham", "Kanker", "Kondagaon", "Korba", "Koriya", "Mahasamund", "Mungeli", "Narayanpur", "Raigarh", "Raipur", "Rajnandgaon", "Sukma", "Surajpur", "Surguja"],
  "Delhi": ["Central Delhi", "East Delhi", "New Delhi", "North Delhi", "North East Delhi", "North West Delhi", "Shahdara", "South Delhi", "South East Delhi", "South West Delhi", "West Delhi"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Amreli", "Anand", "Aravalli", "Banaskantha", "Bharuch", "Bhavnagar", "Botad", "Chhota Udepur", "Dahod", "Dang", "Devbhoomi Dwarka", "Gandhinagar", "Gir Somnath", "Jamnagar", "Junagadh", "Kheda", "Kutch", "Mahisagar", "Mehsana", "Morbi", "Narmada", "Navsari", "Panchmahal", "Patan", "Porbandar", "Rajkot", "Sabarkantha", "Surat", "Surendranagar", "Tapi", "Vadodara", "Valsad"],
  "Haryana": ["Ambala", "Bhiwani", "Charkhi Dadri", "Faridabad", "Fatehabad", "Gurgaon", "Hisar", "Jhajjar", "Jind", "Kaithal", "Karnal", "Kurukshetra", "Mahendragarh", "Mewat", "Palwal", "Panchkula", "Panipat", "Rewari", "Rohtak", "Sirsa", "Sonipat", "Yamunanagar"],
  "Himachal Pradesh": ["Bilaspur", "Chamba", "Hamirpur", "Kangra", "Kinnaur", "Kullu", "Lahaul and Spiti", "Mandi", "Shimla", "Sirmaur", "Solan", "Una"],
  "Jharkhand": ["Bokaro", "Chatra", "Deoghar", "Dhanbad", "Dumka", "East Singhbhum", "Garhwa", "Giridih", "Godda", "Gumla", "Hazaribagh", "Jamtara", "Khunti", "Koderma", "Latehar", "Lohardaga", "Pakur", "Palamu", "Ramgarh", "Ranchi", "Sahibganj", "Seraikela Kharsawan", "Simdega", "West Singhbhum"],
  "Karnataka": ["Bagalkot", "Ballari", "Belagavi", "Bengaluru Rural", "Bengaluru Urban", "Bidar", "Chamarajanagar", "Chikkaballapur", "Chikkamagaluru", "Chitradurga", "Dakshina Kannada", "Davanagere", "Dharwad", "Gadag", "Hassan", "Haveri", "Kalaburagi", "Kodagu", "Kolar", "Koppal", "Mandya", "Mysuru", "Raichur", "Ramanagara", "Shivamogga", "Tumakuru", "Udupi", "Uttara Kannada", "Vijayanagara", "Vijayapura", "Yadgir"],
  "Kerala": ["Alappuzha", "Ernakulam", "Idukki", "Kannur", "Kasaragod", "Kollam", "Kottayam", "Kozhikode", "Malappuram", "Palakkad", "Pathanamthitta", "Thiruvananthapuram", "Thrissur", "Wayanad"],
  "Madhya Pradesh": ["Agar Malwa", "Alirajpur", "Anuppur", "Ashoknagar", "Balaghat", "Barwani", "Betul", "Bhind", "Bhopal", "Burhanpur", "Chhatarpur", "Chhindwara", "Damoh", "Datia", "Dewas", "Dhar", "Dindori", "Guna", "Gwalior", "Harda", "Hoshangabad", "Indore", "Jabalpur", "Jhabua", "Katni", "Khandwa", "Khargone", "Mandla", "Mandsaur", "Morena", "Narsinghpur", "Neemuch", "Panna", "Raisen", "Rajgarh", "Ratlam", "Rewa", "Sagar", "Satna", "Sehore", "Seoni", "Shahdol", "Shajapur", "Sheopur", "Shivpuri", "Sidhi", "Singrauli", "Tikamgarh", "Ujjain", "Umaria", "Vidisha"],
  "Maharashtra": ["Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara", "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli", "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban", "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar", "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg", "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"],
  "Manipur": ["Bishnupur", "Chandel", "Churachandpur", "Imphal East", "Imphal West", "Jiribam", "Kakching", "Kamjong", "Kangpokpi", "Noney", "Pherzawl", "Senapati", "Tamenglong", "Tengnoupal", "Thoubal", "Ukhrul"],
  "Meghalaya": ["East Garo Hills", "East Jaintia Hills", "East Khasi Hills", "North Garo Hills", "Ri Bhoi", "South Garo Hills", "South West Garo Hills", "South West Khasi Hills", "West Garo Hills", "West Jaintia Hills", "West Khasi Hills"],
  "Mizoram": ["Aizawl", "Champhai", "Hnahthial", "Khawzawl", "Kolasib", "Lawngtlai", "Lunglei", "Mamit", "Saiha", "Saitual", "Serchhip"],
  "Nagaland": ["Chumoukedima", "Dimapur", "Kiphire", "Kohima", "Longleng", "Mokokchung", "Mon", "Niuland", "Noklak", "Peren", "Phek", "Tseminyu", "Tuensang", "Wokha", "Zunheboto"],
  "Odisha": ["Angul", "Balangir", "Balasore", "Bargarh", "Bhadrak", "Boudh", "Cuttack", "Deogarh", "Dhenkanal", "Gajapati", "Ganjam", "Jagatsinghpur", "Jajpur", "Jharsuguda", "Kalahandi", "Kandhamal", "Kendrapara", "Kendujhar", "Khordha", "Koraput", "Malkangiri", "Mayurbhanj", "Nabarangpur", "Nayagarh", "Nuapada", "Puri", "Rayagada", "Sambalpur", "Subarnapur", "Sundargarh"],
  "Punjab": ["Amritsar", "Barnala", "Bathinda", "Faridkot", "Fatehgarh Sahib", "Fazilka", "Ferozepur", "Gurdaspur", "Hoshiarpur", "Jalandhar", "Kapurthala", "Ludhiana", "Malerkotla", "Mansa", "Moga", "Muktsar", "Nawanshahr (Shahid Bhagat Singh Nagar)", "Pathankot", "Patiala", "Rupnagar", "Sangrur", "Tarn Taran"],
  "Rajasthan": ["Ajmer", "Alwar", "Banswara", "Baran", "Barmer", "Bharatpur", "Bhilwara", "Bikaner", "Bundi", "Chittorgarh", "Churu", "Dausa", "Dholpur", "Dungarpur", "Hanumangarh", "Jaipur", "Jaisalmer", "Jalore", "Jhalawar", "Jhunjhunu", "Jodhpur", "Karauli", "Kota", "Nagaur", "Pali", "Pratapgarh", "Rajsamand", "Sawai Madhopur", "Sikar", "Sirohi", "Sri Ganganagar", "Tonk", "Udaipur"],
  "Sikkim": ["East Sikkim", "North Sikkim", "South Sikkim", "West Sikkim"],
  "Tamil Nadu": ["Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore", "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram", "Kanniyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai", "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai", "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi", "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli", "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur", "Vellore", "Viluppuram", "Virudhunagar"],
  "Telangana": ["Adilabad", "Bhadradri Kothagudem", "Hanamkonda", "Hyderabad", "Jagtial", "Jangaon", "Jayashankar Bhupalapally", "Jogulamba Gadwal", "Kamareddy", "Karimnagar", "Khammam", "Komaram Bheem Asifabad", "Mahabubabad", "Mahbubnagar", "Mancherial", "Medak", "Medchal-Malkajgiri", "Mulugu", "Nagarkurnool", "Nalgonda", "Narayanpet", "Nirmal", "Nizamabad", "Peddapalli", "Rajanna Sircilla", "Rangareddy", "Sangareddy", "Siddipet", "Suryapet", "Vikarabad", "Wanaparthy", "Warangal", "Yadadri Bhuvanagiri"],
  "Tripura": ["Dhalai", "Gomati", "Khowai", "North Tripura", "Sepahijala", "South Tripura", "Unakoti", "West Tripura"],
  "Uttar Pradesh": ["Agra", "Aligarh", "Ambedkar Nagar", "Amethi", "Amroha", "Auraiya", "Ayodhya", "Azamgarh", "Baghpat", "Bahraich", "Ballia", "Balrampur", "Banda", "Barabanki", "Bareilly", "Basti", "Bhadohi", "Bijnor", "Budaun", "Bulandshahr", "Chandauli", "Chitrakoot", "Deoria", "Etah", "Etawah", "Farrukhabad", "Fatehpur", "Firozabad", "Gautam Buddha Nagar", "Ghaziabad", "Ghazipur", "Gonda", "Gorakhpur", "Hamirpur", "Hapur", "Hardoi", "Hathras", "Jalaun", "Jaunpur", "Jhansi", "Kannauj", "Kanpur Dehat", "Kanpur Nagar", "Kasganj", "Kaushambi", "Kushinagar", "Lakhimpur Kheri", "Lalitpur", "Lucknow", "Maharajganj", "Mahoba", "Mainpuri", "Mathura", "Mau", "Meerut", "Mirzapur", "Moradabad", "Muzaffarnagar", "Pilibhit", "Pratapgarh", "Prayagraj", "Raebareli", "Rampur", "Saharanpur", "Sambhal", "Sant Kabir Nagar", "Shahjahanpur", "Shamli", "Shravasti", "Siddharthnagar", "Sitapur", "Sonbhadra", "Sultanpur", "Unnao", "Varanasi"],
  "Uttarakhand": ["Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital", "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi"],
  "West Bengal": ["Alipurduar", "Bankura", "Birbhum", "Cooch Behar", "Dakshin Dinajpur", "Darjeeling", "Hooghly", "Howrah", "Jalpaiguri", "Jhargram", "Kalimpong", "Kolkata", "Malda", "Murshidabad", "Nadia", "North 24 Parganas", "Paschim Bardhaman", "Paschim Medinipur", "Purba Bardhaman", "Purba Medinipur", "Purulia", "South 24 Parganas", "Uttar Dinajpur"]
};

const BusinessDetails = () => {
  const router = useRouter()

  const searchParams = useSearchParams()

  const id = searchParams.get("id");

  const [loading, setLoading] = useState(!!id); // Set loading to true if we have an ID
  const [formData, setFormData] = useState({
    legal_name: "",
    pan: "",
    trade_name: "",
    constitution: "",
    state: "",
    district: "",
    voluntary: "",
    casual: "",
    composition: "",
    commencement: "",
    gst_have: "",
    registration_number: "",
    date_of_registration: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [isUpdate, setIsUpdate] = useState(false);

  // PAN Validation Regex
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

  // Fetch data if ID exists
  useEffect(() => {
    const fetchData = async () => {
      if (id) {
        try {
          setLoading(true);
          const response = await axios.get(`http://192.168.1.20:8000/gst/business-detail/${id}/`);

          if (response.status === 200 && response.data) {
            const data = response.data;

            // Handle nested gst_details if it exists
            let updatedData = { ...data };

            // Remove gst_details from the form data object to avoid duplication
            if (updatedData.hasOwnProperty('gst_details')) {
              try {
                // Parse gst_details if it's a string, otherwise use as is
                const gstDetails = typeof data.gst_details === 'string'
                  ? JSON.parse(data.gst_details)
                  : data.gst_details;

                // Remove the gst_details property to avoid nesting issues
                delete updatedData.gst_details;

                // Flatten the structure by adding registration fields directly to form data
                updatedData = {
                  ...updatedData,
                  registration_number: gstDetails.registration_number || "",
                  date_of_registration: gstDetails.date_of_registration || "",
                  gst_have: gstDetails.registration_number ? "yes" : "no"
                };
              } catch (e) {
                console.error("Error parsing GST details:", e);
              }
            }

            setFormData(updatedData);
            setIsUpdate(true);
          }
        } catch (error) {
          console.error("Error fetching business details:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [id]);

  // Handle form value changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Form Validation
  const validateForm = () => {
    let newErrors = {};

    if (!formData.legal_name) newErrors.legal_name = "Legal Name is required";
    if (!formData.pan) {
      newErrors.pan = "PAN is required";
    } else if (!panRegex.test(formData.pan)) {
      newErrors.pan = "Invalid PAN format (ABCDE1234F)";
    }
    if (!formData.trade_name) newErrors.trade_name = "Trade Name is required";
    if (!formData.constitution)
      newErrors.constitution = "Constitution of Business is required";
    if (!formData.state) newErrors.state = "State is required";
    if (!formData.district) newErrors.district = "District is required";
    if (!formData.voluntary)
      newErrors.voluntary = "Voluntary Registration is required";
    if (!formData.casual)
      newErrors.casual = "Casual Taxable Person is required";
    if (!formData.composition)
      newErrors.composition = "Composition Scheme is required";
    if (!formData.commencement)
      newErrors.commencement = "Date of Commencement is required";
    if (
      formData.gst_have === "yes" &&
      !formData.registration_number.trim()
    ) {
      newErrors.registration_number = "Existing GST Number is required";
    }
    if (
      formData.gst_have === "yes" &&
      !formData.date_of_registration.trim()
    ) {
      newErrors.date_of_registration = "Date of Registration is required";
    }

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Create data object for submission - using an object instead of FormData
        // to better control what we're sending to the API
        const submitData = {};

        // Add all form fields except GST registration details
        Object.keys(formData).forEach((key) => {
          if (key !== 'registration_number' && key !== 'date_of_registration') {
            submitData[key] = formData[key];
          }
        });

        // Create a clean gst_details object
        const gstDetails = {
          registration_number: formData.registration_number || "",
          date_of_registration: formData.date_of_registration || "",
        };

        // Add the stringified gst_details object
        submitData.gst_details = JSON.stringify(gstDetails);

        // Add gst ID for new records
        if (!isUpdate) {
          submitData.gst = id;
        }

        let response;
        const config = {
          headers: { "Content-Type": "application/json" }
        };

        // Choose between PUT and POST based on isUpdate flag
        if (isUpdate) {
          response = await axios.put(
            `http://192.168.1.20:8000/gst/business-detail/${id}/`,
            submitData,
            config
          );
        } else {
          response = await axios.post(
            "http://192.168.1.20:8000/gst/business-detail/",
            submitData,
            config
          );
        }

        if ((response.status === 200 || response.status === 201) && response.data) {
          router.push(`/gst/screen4?id=${id}`)
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
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
    <Box
      sx={{
        width: 800,
        margin: "auto",
        padding: 3,
        border: 1,
        borderRadius: 5,
        borderColor: "grey.400",
        mt: 3,
      }}
      component="form"
      onSubmit={handleSubmit}
    >
      <Typography variant="h5" sx={{ mb: 2, textAlign: "center" }}>
        Business Details {isUpdate ? "(Edit Mode)" : ""}
      </Typography>

      <Stack spacing={2}>
        {/* Legal Name */}
        <Stack direction="row" spacing={2}>
          <FormControl fullWidth>
            <FormLabel>Legal Name of Business <span style={{ color: "red" }}>*</span> </FormLabel>
            <TextField
              size="small"
              name="legal_name"
              value={formData.legal_name}
              onChange={handleChange}
              error={!!formErrors.legal_name}
              helperText={formErrors.legal_name}
            />
          </FormControl>

          {/* PAN */}
          <FormControl fullWidth>
            <FormLabel>PAN <span style={{ color: "red" }}>*</span> </FormLabel>
            <TextField
              size="small"
              name="pan"
              value={formData.pan}
              onChange={handleChange}
              error={!!formErrors.pan}
              helperText={formErrors.pan}
            />
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>Trade Name <span style={{ color: "red" }}>*</span> </FormLabel>
            <TextField
              size="small"
              name="trade_name"
              value={formData.trade_name}
              onChange={handleChange}
              error={!!formErrors.trade_name}
              helperText={formErrors.trade_name}
            />
          </FormControl>
        </Stack>

        {/* State and District */}
        <Stack direction="row" spacing={2}>
          {/* Constitution of Business */}
          <FormControl fullWidth>
            <FormLabel>Constitution of Business <span style={{ color: "red" }}>*</span> </FormLabel>
            <Select
              size="small"
              name="constitution"
              value={formData.constitution || ""}
              onChange={handleChange}
              error={!!formErrors.constitution}
            >
              {[
                "Foreign Company",
                "LLP",
                "Private Company",
                "Public Limited Company",
                "Partnership Firm",
                "Proprietorship",
                "Society/Club/Trust/AOP",
                "Government Department",
                "Statutory Body",
                "Educational Institution",
                "Healthcare Organization",
                "Pharmaceutical Company",
                "Advertising Agency",
                "Technology Company",
                "Construction Company",
                "Renewable Energy Company",
                "Transportation Business",
                "Retail Chain",
                "Media Company",
                "Investment Fund",
                "Restaurant Chain",
                "Automobile Manufacturer",
                "Defense Contractor",
                "Bank",
                "Tourism Company",
                "NGO",
                "Cybersecurity Firm",
                "Digital Marketing Agency",
                "Political Party",
                "Consulting Firm",
                "Waste Management Firm"
              ].map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>State <span style={{ color: "red" }}>*</span> </FormLabel>
            <Select
              size="small"
              name="state"
              value={formData.state || ""}
              onChange={handleChange}
              error={!!formErrors.state}
            >
              {Object.keys(states).map((state) => (
                <MenuItem key={state} value={state}>
                  {state}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <FormLabel>District <span style={{ color: "red" }}>*</span> </FormLabel>
            <Select
              size="small"
              name="district"
              value={formData.district || ""}
              onChange={handleChange}
              error={!!formErrors.district}
              disabled={!formData.state}
            >
              {(states[formData.state] || []).map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Voluntary Registration */}
        <FormControl fullWidth>
          <FormLabel>Is it voluntary registration </FormLabel>
          <Select
            size="small"
            name="voluntary"
            value={formData.voluntary || ""}
            onChange={handleChange}
            error={!!formErrors.voluntary}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>

        {/* Casual Taxable Person */}
        <FormControl fullWidth>
          <FormLabel>Applying for Casual Taxable Person (Select yes if applicable)</FormLabel>
          <Select
            size="small"
            name="casual"
            value={formData.casual || ""}
            onChange={handleChange}
            error={!!formErrors.casual}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <FormLabel>Opting for Composition Scheme(Select Yes if applicable)</FormLabel>
          <Select
            size="small"
            name="composition"
            value={formData.composition || ""}
            onChange={handleChange}
            error={!!formErrors.composition}
          >
            <MenuItem value="yes">Yes</MenuItem>
            <MenuItem value="no">No</MenuItem>
          </Select>
        </FormControl>

        {/* Date of Commencement */}
        <FormControl fullWidth>
          <FormLabel>Date of Commencement <span style={{ color: "red" }}>*</span> </FormLabel>
          <TextField
            size="small"
            name="commencement"
            type="date"
            value={formData.commencement || ""}
            onChange={handleChange}
            InputLabelProps={{ shrink: true }}
            error={!!formErrors.commencement}
            helperText={formErrors.commencement}
          />
        </FormControl>

        {/* Existing GST Registration */}
        <FormControl component="fieldset">
          <FormLabel>Any Existing GST Registration-(If yes enter following) <span style={{ color: "red" }}>*</span> </FormLabel>
          <RadioGroup
            row
            name="gst_have"
            value={formData.gst_have || ""}
            onChange={handleChange}
          >
            <FormControlLabel value="yes" control={<Radio />} label="Yes" />
            <FormControlLabel value="no" control={<Radio />} label="No" />
          </RadioGroup>
        </FormControl>

        {/* GST Number & Date of Registration */}
        {formData.gst_have === "yes" && (
          <>
            {/* Existing GST Number */}
            <FormControl fullWidth>
              <FormLabel>Registration No. <span style={{ color: "red" }}>*</span> </FormLabel>
              <TextField
                size="small"
                name="registration_number"
                value={formData.registration_number || ""}
                onChange={handleChange}
                error={!!formErrors.registration_number}
                helperText={formErrors.registration_number}
              />
            </FormControl>

            {/* Date of Registration */}
            <FormControl fullWidth>
              <FormLabel>Date of Registration <span style={{ color: "red" }}>*</span> </FormLabel>
              <TextField
                size="small"
                name="date_of_registration"
                type="date"
                value={formData.date_of_registration || ""}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
                error={!!formErrors.date_of_registration}
                helperText={formErrors.date_of_registration}
              />
            </FormControl>
          </>
        )}
      </Stack>

      {/* Buttons */}
      <Stack direction="row" spacing={2} mt={3} justifyContent="center">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => router.push(`/gst/screen2?id=${id}`)}
        >
          Previous
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {isUpdate ? "Update & Continue" : "Save & Continue"}
        </Button>
      </Stack>
    </Box>
  );
};

export default BusinessDetails;