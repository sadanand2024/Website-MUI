'use client';
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  Stack,
  Grid2,
  Typography,
  Box
} from '@mui/material';
import SalaryTemplate from './SalaryTemplate';
import EmptyTable from '@/components/third-party/table/EmptyTable';
import HomeCard from '@/components/cards/HomeCard';
import Factory from '@/utils/Factory';
import { useSearchParams } from 'next/navigation';
import ActionCell from '@/utils/ActionCell';
import { useSnackbar } from '@/components/CustomSnackbar';
import { usePathname, useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function SalaryTemplateList() {
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const [salary_teamplates_data, setSalary_teamplates_data] = useState([]); // State to store salary_teamplates_data data
  const [payrollid, setPayrollId] = useState(null); // Payroll ID fetched from URL
  const [postType, setPostType] = useState(''); // Payroll ID fetched from URL
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const pathname = usePathname();

  const searchParams = useSearchParams();

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

  const fetch_salary_templates = async () => {
    if (!payrollid) return; // If there's no payroll id, exit early

    const url = `/payroll/salary-templates?payroll_id=${payrollid}`;
    const { res, error } = await Factory('get', url, {});

    if (res?.status_cd === 0 && Array.isArray(res?.data)) {
      setSalary_teamplates_data(res?.data); // Successfully set work locations
    } else {
      setSalary_teamplates_data([]);
    }
  };
  const handleEdit = (item) => {
    setPostType('edit');
    router.push(`/payrollsetup/create-salary-template?template_id=${item.id}&payrollid=${payrollid}`);
  };
  const handleDelete = async (item) => {
    let url = `/payroll/salary-templates/${item.id}`;
    const { res } = await Factory('delete', url, {});
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Record Deleted Successfully', 'success');
      fetch_salary_templates();
    }
  };

  useEffect(() => {
    if (payrollid !== null) fetch_salary_templates();
  }, [payrollid]);
  return (
    <HomeCard
      title="Salary Template"
      tagline="Setup your organization before starting payroll"
      CustomElement={() => (
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => router.push(`/payrollsetup/create-salary-template?payrollid=${payrollid}`)}
            sx={{ marginBottom: 2 }}
          >
            Create New
          </Button>
        </Stack>
      )}
    >
      <MainCard>
        <Grid2 container spacing={{ xs: 2, sm: 3 }}>
          <Grid2 size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>S.No</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Template Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {salary_teamplates_data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ height: 300 }}>
                        <EmptyTable msg="No Designations available" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    salary_teamplates_data.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{item.template_name}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell>{item.template_name}</TableCell>

                        <TableCell>
                          <ActionCell
                            row={item} // Pass the customer row data
                            onEdit={() => handleEdit(item)} // Edit handler
                            onDelete={() => handleDelete(item)} // Delete handler
                            open={openDialog}
                            deleteDialogData={{
                              title: 'Delete Record',
                              heading: 'Are you sure you want to delete this Record?',
                              description: `This action will remove ${item.template_name} from the list.`,
                              successMessage: 'Record has been deleted.'
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid2>
        </Grid2>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              router.back();
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </MainCard>
    </HomeCard>
  );
}

export default SalaryTemplateList;
