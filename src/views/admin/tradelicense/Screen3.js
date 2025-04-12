"use client";

import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Stack,
    MenuItem,
    TextField,
    Typography,
    CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useSearchParams } from 'next/navigation'
import { useRouter } from 'next/navigation'
import axios from "axios";

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

const Screen3 = () => {
    const searchParams = useSearchParams()
    const id = searchParams.get("id");
    const router = useRouter()

    const [formData, setFormData] = useState({
        license: id || "",
        name_of_entity: "",
        trade_premises: "",
        trade_description: "",
        total_area: "",
        ownership_type: "",
        flatDoorNo: "",
        streetName: "",
        locality: "",
        colony: "",
        ward: "",
        zone: "",
        pinCode: "",
        state: "",
        district: "",
    });

    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [pincodeLoading, setPincodeLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);

    // Fetch existing data when component mounts if ID is present
    useEffect(() => {
        if (id) {
            fetchExistingData(id);
        }
    }, [id]);

    // Function to fetch existing data by ID
    const fetchExistingData = async (id) => {
        try {
            setLoading(true);
            const response = await axios.get(`http://192.168.1.20:8000/tradelicense/trade-entity/${id}/`);
            if (response.data) {
                const data = response.data;
                setIsEdit(true);
                setFormData({
                    license: id || "",
                    name_of_entity: data.name_of_entity || "",
                    trade_premises: data.trade_premises || "",
                    trade_description: data.trade_description || "",
                    total_area: data.total_area || "",
                    ownership_type: data.ownership_type || "",
                    flatDoorNo: data.address?.flatDoorNo || "",
                    streetName: data.address?.streetName || "",
                    locality: data.address?.locality || "",
                    colony: data.address?.colony || "",
                    ward: data.address?.ward || "",
                    zone: data.address?.zone || "",
                    pinCode: data.address?.pinCode || "",
                    state: data.address?.state || "",
                    district: data.address?.district || "",
                });
            }
        } catch (error) {
            console.error("Error fetching existing data:", error);
        } finally {
            setLoading(false);
        }
    };

    // Function to fetch address details by PIN code
    const fetchAddressByPincode = async (pincode) => {
        if (pincode.length === 6) {
            try {
                setPincodeLoading(true);
                const response = await axios.get(`https://api.postalpincode.in/pincode/${pincode}`);

                if (response.data && response.data[0].Status === "Success") {
                    const postOffice = response.data[0].PostOffice[0];
                    setFormData(prevData => ({
                        ...prevData,
                        state: postOffice.State,
                        district: postOffice.District,
                        locality: postOffice.Block,
                    }));
                }
            } catch (error) {
                console.error("Error fetching pincode data:", error);
            } finally {
                setPincodeLoading(false);
            }
        }
    };

    const requiredAsterisk = (
        <span style={{ color: "red", marginLeft: 2 }}>*</span>
    );

    const validateForm = () => {
        let newformErrors = {};

        const requiredFields = [
            "name_of_entity",
            "trade_premises",
            "trade_description",
            "total_area",
            "ownership_type",
            "flatDoorNo",
            "streetName",
            "pinCode",
            "state",
            "district",
        ];

        requiredFields.forEach((field) => {
            if (!formData[field]) {
                newformErrors[field] = "This field is required";
            }
        });

        // Validate PIN code format
        if (formData.pinCode && !/^\d{6}$/.test(formData.pinCode)) {
            newformErrors.pinCode = "PIN code must be 6 digits";
        }

        setFormErrors(newformErrors);
        return Object.keys(newformErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // If pincode field is changed, fetch address details
        if (name === "pinCode" && value.length === 6) {
            fetchAddressByPincode(value);
        }
    };

    const handlePrevious = () => {
        router.push(`/tradelicense/screen2?id=${id}`)
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                setSaveLoading(true);

                // Prepare data for API
                const apiData = {
                    license: id || "",
                    name_of_entity: formData.name_of_entity,
                    trade_premises: formData.trade_premises,
                    trade_description: formData.trade_description,
                    total_area: formData.total_area,
                    ownership_type: formData.ownership_type,
                    address: {
                        flatDoorNo: formData.flatDoorNo,
                        streetName: formData.streetName,
                        locality: formData.locality,
                        colony: formData.colony,
                        ward: formData.ward,
                        zone: formData.zone,
                        pinCode: formData.pinCode,
                        state: formData.state,
                        district: formData.district,
                    }
                };

                let response;

                if (isEdit && id) {
                    // If ID exists, update the existing record
                    response = await axios.put(`http://192.168.1.20:8000/tradelicense/trade-entity/${id}/`, apiData);
                } else {
                    // If no ID, create a new record
                    response = await axios.post(`http://192.168.1.20:8000/tradelicense/trade-entity/`, apiData);
                }

                // Get the ID from the response (either from update or create)
                const entityId = id || response.data.id;

                // Navigate to the next screen with the ID
                router.push(`/tradelicense/screen4?id=${id}`)
            } catch (error) {
                console.error("Error saving data:", error);
                alert("Error while saving data. Please try again.");
            } finally {
                setSaveLoading(false);
            }
        }
    };


    if (loading && !formData.name_of_entity) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
                <Typography variant="h6" ml={2}>Loading ...</Typography>
            </Box>
        );
    }

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
                width: '100%',
                maxWidth: 800,
                margin: "auto",
                padding: 3,
                border: 1,
                borderRadius: 5,
                mt: 2,
                mb: 2,
                borderColor: "grey.400",
            }}
        >
            <Typography variant="h4" align="center" gutterBottom sx={{ padding: 1 }}>
                Trade License Registration
            </Typography>

            <Stack spacing={2}>
                {/* Entity Details */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>Name of Entity{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="name_of_entity"
                            value={formData.name_of_entity}
                            onChange={handleChange}
                            error={!!formErrors.name_of_entity}
                            helperText={formErrors.name_of_entity}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Trade Premises{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            select
                            fullWidth
                            name="trade_premises"
                            value={formData.trade_premises}
                            onChange={handleChange}
                            error={!!formErrors.trade_premises}
                            helperText={formErrors.trade_premises}
                            required
                        >
                            <MenuItem value="commercial">Commercial</MenuItem>
                            <MenuItem value="residential">Residential</MenuItem>
                        </TextField>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Trade Description{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="trade_description"
                            value={formData.trade_description}
                            onChange={handleChange}
                            error={!!formErrors.trade_description}
                            helperText={formErrors.trade_description}
                            required
                        />
                    </FormControl>
                </Stack>

                {/* Additional Details */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>Total Area (Sq. mts/Sq. fts){requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            type="number"
                            name="total_area"
                            value={formData.total_area}
                            onChange={handleChange}
                            error={!!formErrors.total_area}
                            helperText={formErrors.total_area}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Ownership Type{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            select
                            fullWidth
                            name="ownership_type"
                            value={formData.ownership_type}
                            onChange={handleChange}
                            error={!!formErrors.ownership_type}
                            helperText={formErrors.ownership_type}
                            required
                        >
                            <MenuItem value="rental">Rental</MenuItem>
                            <MenuItem value="leased">Leased</MenuItem>
                            <MenuItem value="own">Own</MenuItem>
                        </TextField>
                    </FormControl>
                </Stack>

                {/* Address Section */}
                <Typography variant="subtitle1" gutterBottom>
                    Address of Unit/Establishment
                </Typography>

                {/* Address First Row */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>Flat/Door No{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="flatDoorNo"
                            value={formData.flatDoorNo}
                            onChange={handleChange}
                            error={!!formErrors.flatDoorNo}
                            helperText={formErrors.flatDoorNo}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Street Name{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="streetName"
                            value={formData.streetName}
                            onChange={handleChange}
                            error={!!formErrors.streetName}
                            helperText={formErrors.streetName}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Locality</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="locality"
                            value={formData.locality}
                            onChange={handleChange}
                        />
                    </FormControl>
                </Stack>

                {/* Address Second Row */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>Colony</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="colony"
                            value={formData.colony}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Ward</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="ward"
                            value={formData.ward}
                            onChange={handleChange}
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>Zone</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="zone"
                            value={formData.zone}
                            onChange={handleChange}
                        />
                    </FormControl>
                </Stack>

                {/* Address Final Row */}
                <Stack direction="row" spacing={2}>
                    <FormControl fullWidth>
                        <FormLabel>Pin Code{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            fullWidth
                            name="pinCode"
                            value={formData.pinCode}
                            onChange={handleChange}
                            error={!!formErrors.pinCode}
                            helperText={formErrors.pinCode}
                            InputProps={{
                                endAdornment: pincodeLoading ? <CircularProgress size={20} /> : null,
                            }}
                            required
                        />
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>State{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            select
                            fullWidth
                            name="state"
                            value={formData.state}
                            onChange={handleChange}
                            error={!!formErrors.state}
                            helperText={formErrors.state}
                            required
                        >
                            {Object.keys(states).map((state) => (
                                <MenuItem key={state} value={state}>
                                    {state}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>

                    <FormControl fullWidth>
                        <FormLabel>District{requiredAsterisk}</FormLabel>
                        <TextField
                            size="small"
                            select
                            fullWidth
                            name="district"
                            value={formData.district}
                            onChange={handleChange}
                            error={!!formErrors.district}
                            helperText={formErrors.district}
                            disabled={!formData.state}
                            required
                        >
                            {formData.state && states[formData.state]?.map((district) => (
                                <MenuItem key={district} value={district}>
                                    {district}
                                </MenuItem>
                            ))}
                        </TextField>
                    </FormControl>
                </Stack>

                {/* Navigation Buttons */}
                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button
                        variant="outlined"
                        color="primary"
                        onClick={handlePrevious}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                    >
                        Save & Next
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default Screen3;