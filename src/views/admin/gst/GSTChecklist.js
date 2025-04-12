"use client";

import React from "react";
import {
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Button,
    Stack,
    Paper,
} from "@mui/material";
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
const GSTChecklist = () => {

    const router = useRouter()
    const searchParams = useSearchParams()
    const id = searchParams.get("id");
    const User_id = searchParams.get("User_id");

    const checklistItems = [
        "PAN Card (Company / Firm / Proprietorship)",
        "Aadhaar Card & PAN Card of directors/partners/individual",
        "Notarized Partnership Deed or NOC (in case of own premises)",
        "Certificate of Incorporation (in case of a Company)",
        "Electricity Bill of Business Premises or latest property tax receipt",
        "Authorized Signatory (Name of Partner or Directors)",
        "Photos of each Director / Partner / Individual",
        "MOA & AOA (in case of a Company)",
    ];

    return (
        <Box
            sx={{
                width: 620,
                margin: "auto",
                padding: 3,
                border: 1,
                borderRadius: 5,
                mt: 9,
                borderColor: "grey.400",
            }}
        >
            {/* Heading */}
            <Typography component="legend" variant="h4" sx={{ mb: 2, textAlign: "center" }}>
                GST Registration
            </Typography>

            <Stack spacing={3}>
                <Typography variant="body1">
                    Before proceeding further, make sure that following documents are ready (or) handy to upload the same during the process are :
                </Typography>

                <List sx={{ pl: 4 }}>
                    {checklistItems.map((item, index) => (
                        <ListItem key={index} sx={{ padding: "4px 0" }}>
                            <ListItemText primary={`• ${item}`} />
                        </ListItem>
                    ))}
                </List>

                {/* Buttons */}
                <Stack direction="row" justifyContent="center" spacing={2} mt={2}>
                    <Button
                        onClick={() => {
                            if (id) {
                                router.push(`/gst/screen2?id=${id}`);
                            } else {
                                router.push(`/gst/screen2`);
                            }
                        }}
                        variant="contained"
                        color="primary"
                    >
                        Proceed
                    </Button>
                </Stack>
            </Stack>
        </Box>
    );
};

export default GSTChecklist;