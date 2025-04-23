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
  Pagination,
  Box
} from '@mui/material';
import DesignationDialog from './DesignationDialog'; // Import the DepartmentDialog
import EmptyTable from '@/components/third-party/table/EmptyTable';
import HomeCard from '@/components/cards/HomeCard';
import Factory from '@/utils/Factory';
import { useSearchParams } from 'next/navigation';
import ActionCell from '@/utils/ActionCell';
import { useSnackbar } from '@/components/CustomSnackbar';
import { useRouter } from 'next/navigation';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MainCard from '@/components/MainCard';

function Designations() {
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const [designations, setDesignations] = useState([]); // State to store designations data
  const [payrollid, setPayrollId] = useState(null); // Payroll ID fetched from URL
  const [postType, setPostType] = useState(''); // Payroll ID fetched from URL
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { showSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const paginatedData = designations.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const router = useRouter();

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

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  // Example to simulate adding a designation
  const addDepartment = (newDepartment) => {
    setDesignations((prevDepartments) => [...prevDepartments, newDepartment]);
  };
  const fetchDesignations = async () => {
    if (!payrollid) return; // If there's no payroll id, exit early

    const url = `/payroll/designations/?payroll_id=${payrollid}`;
    const { res, error } = await Factory('get', url, {});

    if (res?.status_cd === 0 && Array.isArray(res?.data)) {
      setDesignations(res?.data); // Successfully set work locations
    } else {
      setDesignations([]);
    }
  };
  const handleEdit = (designation) => {
    setPostType('edit');
    setSelectedRecord(designation);
    handleOpenDialog();
  };
  const handleDelete = async (designation) => {
    console.log(designation);
    let url = `/payroll/designations/${designation.id}/`;
    const { res } = await Factory('delete', url, {});
    console.log(res);
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Record Deleted Successfully', 'success');
      fetchDesignations();
    }
  };
  // Fetch data when payrollid changes

  useEffect(() => {
    if (payrollid !== null) fetchDesignations();
  }, [payrollid]);
  return (
    <HomeCard
      title="Designation Details"
      tagline="Setup Designations for your organization"
      CustomElement={() => (
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setPostType('post');
              handleOpenDialog();
            }}
            sx={{ marginBottom: 2 }}
          >
            Add Designation
          </Button>
          {/* <Button variant="outlined" color="primary" sx={{ marginBottom: 2 }} disabled>
            Import
          </Button> */}
        </Stack>
      )}
    >
      <MainCard>
        <Grid2 container spacing={{ xs: 2, sm: 3 }}>
          <Grid2 size={12}>
            <DesignationDialog
              open={openDialog}
              handleClose={handleCloseDialog}
              handleOpenDialog={handleOpenDialog}
              selectedRecord={selectedRecord}
              type={postType}
              setType={setPostType}
              fetchDesignations={fetchDesignations}
            />
          </Grid2>

          <Grid2 size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>S No</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Designation Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>No of Employees</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ height: 300 }}>
                        <EmptyTable msg="No Designations available" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((designation, index) => (
                      <TableRow key={designation.id}>
                        <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{designation.designation_name}</TableCell>
                        <TableCell>{designation.numOfEmployees || 0}</TableCell>
                        <TableCell>
                          <ActionCell
                            row={designation} // Pass the customer row data
                            onEdit={() => handleEdit(designation)} // Edit handler
                            onDelete={() => handleDelete(designation)} // Delete handler
                            open={openDialog}
                            onClose={handleCloseDialog}
                            deleteDialogData={{
                              title: 'Delete Record',
                              heading: 'Are you sure you want to delete this Record?',
                              description: `This action will remove ${designation.designation_name} from the list.`,
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
            {designations.length > 0 && (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', px: { xs: 0.5, sm: 2.5 }, py: 1.5 }}>
                <Pagination count={Math.ceil(designations.length / rowsPerPage)} page={currentPage} onChange={handlePageChange} />
              </Stack>
            )}
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

export default Designations;
