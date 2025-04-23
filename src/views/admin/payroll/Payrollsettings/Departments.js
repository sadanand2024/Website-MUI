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
import DepartmentDialog from './DepartmentDialog'; // Import the DepartmentDialog
import EmptyTable from '@/components/third-party/table/EmptyTable';
import HomeCard from '@/components/cards/HomeCard';
import Factory from '@/utils/Factory';
import { useSearchParams } from 'next/navigation';
import ActionCell from '@/utils/ActionCell';
import { useSnackbar } from '@/components/CustomSnackbar';
import { useRouter } from 'next/navigation';
import MainCard from '@/components/MainCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function Departments() {
  const [openDialog, setOpenDialog] = useState(false); // State to manage dialog visibility
  const [departments, setDepartments] = useState([]); // State to store departments data
  const [payrollid, setPayrollId] = useState(null); // Payroll ID fetched from URL
  const [postType, setPostType] = useState(''); // Payroll ID fetched from URL
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { showSnackbar } = useSnackbar();
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const paginatedData = departments.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const router = useRouter();

  const searchParams = useSearchParams();

  // Update payroll ID from search params
  useEffect(() => {
    const id = searchParams.get('payrollid');
    if (id) {
      setPayrollId(id);
    }
  }, [searchParams]);

  // Open dialog
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  // Close dialog
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const fetchDepartments = async () => {
    if (!payrollid) return; // If there's no payroll id, exit early

    const url = `/payroll/departments/?payroll_id=${payrollid}`;
    const { res, error } = await Factory('get', url, {});

    if (res?.status_cd === 0 && Array.isArray(res?.data)) {
      setDepartments(res?.data); // Successfully set work locations
    } else {
      setDepartments([]);
    }
  };
  const handleEdit = (department) => {
    setPostType('edit');
    setSelectedRecord(department);
    handleOpenDialog();
  };
  const handleDelete = async (department) => {
    console.log(department);
    let url = `/payroll/departments/${department.id}/`;
    const { res } = await Factory('delete', url, {});
    console.log(res);
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Record Deleted Successfully', 'success');
      fetchDepartments();
    }
  };
  useEffect(() => {
    fetchDepartments();
  }, [payrollid]);
  return (
    <HomeCard
      title="Departments Details"
      tagline="Create and manage different departments of Your organization."
      CustomElement={() => (
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setPostType('post');
              handleOpenDialog();
            }}
          >
            Add Department
          </Button>
          {/* <Button variant="outlined" color="primary" disabled>
            Import
          </Button> */}
        </Stack>
      )}
    >
      <MainCard>
        <Grid2 container spacing={{ xs: 2, sm: 3 }}>
          <Grid2 size={12}>
            <DepartmentDialog
              open={openDialog}
              handleClose={handleCloseDialog}
              handleOpenDialog={handleOpenDialog}
              selectedRecord={selectedRecord}
              type={postType}
              setType={setPostType}
              fetchDepartments={fetchDepartments}
            />
          </Grid2>

          <Grid2 size={12}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>S No</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Department Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Department Code</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>No of Employees</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} sx={{ height: 300 }}>
                        <EmptyTable msg="No departments available" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((department, index) => (
                      <TableRow key={department.id}>
                        <TableCell>{(currentPage - 1) * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{department.dept_name}</TableCell>
                        <TableCell>{department.dept_code}</TableCell>
                        <TableCell>
                          {`${department.description}`?.length > 30
                            ? `${department.description?.substring(0, 20)}...`
                            : `${department.description}` || 'N/A'}
                        </TableCell>
                        <TableCell>{department.numOfEmployees || 0}</TableCell>
                        <TableCell>
                          <ActionCell
                            row={department} // Pass the customer row data
                            onEdit={() => handleEdit(department)} // Edit handler
                            onDelete={() => handleDelete(department)} // Delete handler
                            open={openDialog}
                            onClose={handleCloseDialog}
                            deleteDialogData={{
                              title: 'Delete Record',
                              heading: 'Are you sure you want to delete this Record?',
                              description: `This action will remove ${department.dept_name} from the list.`,
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
            {departments.length > 0 && (
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', px: { xs: 0.5, sm: 2.5 }, py: 1.5 }}>
                <Pagination count={Math.ceil(departments.length / rowsPerPage)} page={currentPage} onChange={handlePageChange} />
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

export default Departments;
