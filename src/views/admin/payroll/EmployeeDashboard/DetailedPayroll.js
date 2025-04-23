import React, { useState, useEffect } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Stack, Pagination, Button } from '@mui/material';
import EmptyTable from '@/components/third-party/table/EmptyTable';
import MainCard from '@/components/MainCard';
import Factory from '@/utils/Factory';
import { useSnackbar } from '@/components/CustomSnackbar';
import { BASE_URL } from 'constants';
import axios from 'axios';

const TABLE_HEADERS = [
  'Employee Id',
  'Name',
  'Department',
  'Designation',
  'Total Days',
  'LOP',
  'Paid Days',
  'CTC',
  'Actual Gross',
  'Earned Gross',
  'Basic',
  'HRA',
  'Special Allowances',
  'Bonus/Incentives',
  'Other Earnings',
  'Total Earnings',
  'Deductions',
  'PF',
  'ESI',
  'PT',
  'TDS',
  'Loans/Advances',
  'Other Deductions',
  'Total Decutions',
  'Net Pay',
  'Status'
];

export default function DetailedPayroll({ payrollId, month }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [detailedSummary, setDetailedSummary] = useState([]);
  const rowsPerPage = 5;
  const { showSnackbar } = useSnackbar();

  const totalPages = Math.ceil(detailedSummary.length / rowsPerPage);
  const paginatedData = detailedSummary.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const fetchDetailedSummary = async () => {
    const url = `/payroll/detail_employee_payroll_salary?payroll_id=${payrollId}&month=${month}&financial_year=2024-2025`;
    const { res } = await Factory('get', url, {});
    if (res.status_cd === 0) {
      setDetailedSummary(res.data || []);
    } else {
      showSnackbar(JSON.stringify(res.data.data), 'error');
    }
  };

  useEffect(() => {
    if (payrollId) fetchDetailedSummary();
  }, [payrollId]);
  console.log(paginatedData);
  return (
    <MainCard>
      <Stack direction="column" spacing={2}>
        <TableContainer component={Paper}>
          <Table size="large">
            <TableHead>
              <TableRow>
                {TABLE_HEADERS.map((header) => (
                  <TableCell key={header} sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>
                    {header}
                  </TableCell>
                ))}
                <TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEADERS.length} sx={{ height: 300 }}>
                    <EmptyTable msg="No work locations available" />
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData?.map((item, index) => (
                  <TableRow key={item.employee || index}>
                    <TableCell>{item.employee}</TableCell>
                    <TableCell>{item.employee_name}</TableCell>
                    <TableCell>{item.department}</TableCell>
                    <TableCell>{item.designation}</TableCell>
                    <TableCell>{item.total_days_of_month}</TableCell>
                    <TableCell>{item.lop}</TableCell>
                    <TableCell>{item.paid_days}</TableCell>
                    <TableCell>{item.ctc}</TableCell>
                    <TableCell>{item.gross_salary}</TableCell>
                    <TableCell>{item.earned_salary}</TableCell>
                    <TableCell>{item.basic_salary}</TableCell>
                    <TableCell>{item.hra}</TableCell>
                    <TableCell>{item.special_allowance}</TableCell>
                    <TableCell>{item.bonus}</TableCell>
                    <TableCell>{item.other_earnings}</TableCell>
                    <TableCell>{item.benefits_total}</TableCell>
                    <TableCell>{/* {item.deductions['Employee Deductions']} */}fd</TableCell>
                    <TableCell>{item.epf}</TableCell>
                    <TableCell>{item.esi}</TableCell>
                    <TableCell>{item.pt}</TableCell>
                    <TableCell>{item.tds}</TableCell>
                    <TableCell>{item.pt}</TableCell>
                    <TableCell>{item.pt}</TableCell>
                    <TableCell>{/* {item.deductions['Total']} */} h</TableCell>
                    <TableCell>{item.net_salary}</TableCell>
                    <TableCell>{item.status}</TableCell>
                    <TableCell
                      style={{ cursor: 'pointer', textDecoration: 'underline', color: '#007bff' }}
                      onClick={() => {
                        viewPayslip(item.employee_id, item.month, item.financial_year);
                      }}
                    >
                      View / Download
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {detailedSummary.length > 0 && (
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ px: { xs: 0.5, sm: 2.5 }, py: 1.5 }}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
          </Stack>
        )}
      </Stack>
    </MainCard>
  );
}
