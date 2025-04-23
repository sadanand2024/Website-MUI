import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Snackbar,
  Grid2,
  Stack,
  Typography,
  Button,
  Box,
  Pagination
} from '@mui/material';
import { IconPlus } from '@tabler/icons-react';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CustomAutocomplete from '@/utils/CustomAutocomplete';
import HolidayManagementDialog from './HolidayManagementDialog';
import ActionCell from '@/utils/ActionCell';
import MainCard from '@/components/MainCard';
import { useSnackbar } from '@/components/CustomSnackbar';
import { useSearchParams } from 'next/navigation';
import Factory from '@/utils/Factory';
import EmptyTable from '@/components/third-party/table/EmptyTable';
import HomeCard from '@/components/cards/HomeCard';
import Loader from '@/components/PageLoader';
import { IconArrowUp, IconFilter, IconReload } from '@tabler/icons-react';
import FilterDialog from './FilterDialog';
function HolidayManagement() {
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [selectedWorkLoacation, setSelectedWorkLoacation] = useState('');
  const [holidayManagementData, setHolidayManagementData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [payrollId, setPayrollId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [workLocations, setWorkLocations] = useState([]); // Stores the list of work locations
  const [filterDialog, setFilterDialog] = useState(false);

  const [postType, setPostType] = useState('');
  const { showSnackbar } = useSnackbar();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('payrollid');
    if (id) setPayrollId(id);
  }, [searchParams]);

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };
  const paginatedData = holidayManagementData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const fetchHolidayManagementData = async () => {
    setLoading(true);
    const url = `/payroll/holiday-management?payroll_id=${payrollId}`;

    const { res, error } = await Factory('get', url, {});
    setLoading(false);

    if (res.status_cd === 0) {
      setHolidayManagementData(Array.isArray(res.data) ? res.data : []);
    } else {
      showSnackbar(JSON.stringify(res.data.data), 'error');
    }
  };
  const fetch_by_filter = async () => {
    setLoading(true);
    const url = `/payroll/holiday-management-filter?payroll_id=${payrollId}&financial_year=${financialYear}&applicable_for=${selectedWorkLoacation}`;

    const { res } = await Factory('get', url, {});
    setLoading(false);

    if (res.status_cd === 0) {
      setHolidayManagementData(Array.isArray(res.data) ? res.data : []);
      setFilterDialog(false);
    } else {
      showSnackbar(JSON.stringify(res.data.data), 'error');
    }
  };
  const handleEdit = (item) => {
    setPostType('edit');
    setSelectedRecord(item);
    handleOpenDialog();
  };
  const handleDelete = async (item) => {
    let url = `/payroll/holiday-management/${item.id}`;
    const { res } = await Factory('delete', url, {});
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Record Deleted Successfully', 'success');
      fetchHolidayManagementData();
    }
  };
  useEffect(() => {
    if (payrollId) fetchHolidayManagementData();
  }, [payrollId]);

  const fetchWorkLocations = async () => {
    setLoading(true);
    const url = `/payroll/work-locations/?payroll_id=${payrollId}`;
    const { res, error } = await Factory('get', url, {});
    setLoading(false);
    if (res?.status_cd === 0 && Array.isArray(res?.data)) {
      setWorkLocations(res?.data); // Successfully set work locations
    } else {
      setWorkLocations([]);
      showSnackbar(JSON.stringify(res?.data?.data || error), 'error');
    }
  };
  useEffect(() => {
    if (payrollId !== null) fetchWorkLocations();
  }, [payrollId]);
  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);
  return (
    <HomeCard
      title={
        <Stack direction="row" sx={{ gap: 2, flexWrap: 'wrap' }}>
          <Grid2 size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<IconFilter size={16} />}
              sx={{ minWidth: 78, mr: 1 }}
              onClick={() => {
                setFilterDialog(true);
              }}
            >
              Filter
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<IconReload size={16} />}
              sx={{ minWidth: 78, mr: 1 }}
              onClick={() => {
                fetchHolidayManagementData();
              }}
            >
              Reset
            </Button>
          </Grid2>
        </Stack>
      }
      CustomElement={() => (
        <Stack direction="row" sx={{ gap: 2 }}>
          <Button variant="contained" startIcon={<IconPlus size={16} />} onClick={handleOpenDialog}>
            Add Holiday
          </Button>
        </Stack>
      )}
    >
      <MainCard>
        <Stack spacing={3}>
          {loading ? (
            <Stack direction="row" justifyContent="center" alignItems="center" sx={{ height: 400 }}>
              <Loader />
            </Stack>
          ) : (
            <TableContainer component={Paper}>
              <Table size="large">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Holiday Name</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Date</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Description</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Locations</TableCell>
                    <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} sx={{ height: 300 }}>
                        <EmptyTable msg="No Data available" />
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.holiday_name}</TableCell>
                        <TableCell>{item.start_date + ' --- ' + item.end_date}</TableCell>
                        <TableCell>
                          {item.description.length > 30 ? `${item.description.substring(0, 30)}...` : item.description || 'N/A'}
                        </TableCell>
                        <TableCell>{item.applicable_for}</TableCell>
                        <TableCell>
                          <ActionCell
                            row={item} // Pass the customer row data
                            onEdit={() => handleEdit(item)} // Edit handler
                            onDelete={() => handleDelete(item)} // Delete handler
                            open={openDialog}
                            onClose={handleCloseDialog}
                            deleteDialogData={{
                              title: 'Delete Record',
                              heading: 'Are you sure you want to delete this Record?',
                              description: `This action will remove ${item.holiday_name} from the list.`,
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
          )}

          {holidayManagementData.length > 0 && (
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'center', px: { xs: 0.5, sm: 2.5 }, py: 1.5 }}>
              <Pagination count={Math.ceil(holidayManagementData.length / rowsPerPage)} page={currentPage} onChange={handlePageChange} />
            </Stack>
          )}
        </Stack>

        <HolidayManagementDialog
          open={openDialog}
          handleClose={handleCloseDialog}
          handleOpenDialog={handleOpenDialog}
          selectedRecord={selectedRecord}
          type={postType}
          setType={setPostType}
          fetchHolidayManagementData={fetchHolidayManagementData}
          workLocations={workLocations}
        />
        {filterDialog && (
          <FilterDialog
            financialYear={financialYear}
            setFinancialYear={setFinancialYear}
            filterDialog={filterDialog}
            setFilterDialog={setFilterDialog}
            workLocations={workLocations}
            setSelectedWorkLoacation={setSelectedWorkLoacation}
            fetch_by_filter={fetch_by_filter}
          />
        )}
      </MainCard>
    </HomeCard>
  );
}

export default HolidayManagement;
