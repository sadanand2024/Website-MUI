'use client';
import React from 'react';
import axios from 'axios';
// @mui
import { useTheme } from '@mui/material/styles';
import Grid from '@mui/material/Grid2';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import FilterDialog from './FilterDialog';

import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Snackbar, Pagination } from '@mui/material';
import ActionCell from '@/utils/ActionCell';
// import { ActionCell } from '@/sections/components/table';
import Factory from '@/utils/Factory';
import { useSnackbar } from '@/components/CustomSnackbar';

//react
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

// @project
import MainCard from '@/components/MainCard';
import { getRadiusStyles } from '@/utils/getRadiusStyles';
import AddInvoice from '../InvoicingComponent/AddInvoice';
// @assets
import { IconArrowUp, IconFilter, IconReload } from '@tabler/icons-react';
import { Autocomplete, Box, Button, FormHelperText, InputLabel, TextField, Avatar } from '@mui/material';
import DynamicIcon from '@/components/DynamicIcon';
import { BASE_URL } from 'constants';
import { indianCurrency } from '../../../../utils/CurrencyToggle'; /***************************  CARDS - BORDER WITH RADIUS  ***************************/

export function applyBorderWithRadius(radius, theme) {
  return {
    overflow: 'hidden',
    '--Grid-borderWidth': '1px',
    borderTop: 'var(--Grid-borderWidth) solid',
    borderLeft: 'var(--Grid-borderWidth) solid',
    borderColor: 'divider',
    '& > div': {
      overflow: 'hidden',
      borderRight: 'var(--Grid-borderWidth) solid',
      borderBottom: 'var(--Grid-borderWidth) solid',
      borderColor: 'divider',
      [theme.breakpoints.down('md')]: {
        '&:nth-of-type(1)': getRadiusStyles(radius, 'topLeft'),
        '&:nth-of-type(2)': getRadiusStyles(radius, 'topRight'),
        '&:nth-of-type(3)': getRadiusStyles(radius, 'bottomLeft'),
        '&:nth-of-type(4)': getRadiusStyles(radius, 'bottomRight')
      },
      [theme.breakpoints.up('md')]: {
        '&:first-of-type': getRadiusStyles(radius, 'topLeft', 'bottomLeft'),
        '&:last-of-type': getRadiusStyles(radius, 'topRight', 'bottomRight')
      }
    }
  };
}

const yearlyStats = [
  {
    id: 'total_revenue',
    title: 'Total Revenue',
    href: '',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'today_revenue',
    title: "Today's Revenue",
    href: 'pending',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'revenue_this_month',
    title: 'Revenue this month',
    href: 'in_progress',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'revenue_last_month',
    title: 'Revenue last month',
    href: 'in_progress',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'average_revenue_per_day',
    title: 'Average revenue per day',
    href: 'completed',
    value: '0',
    compare: 'Compare to last week'
  }
];

const overallStats = [
  {
    id: 'over_dues',
    title: 'Over due',
    value: '0',
    compare: 'Compare to last week',
    buttonLable: 'Create New'
  },
  {
    id: 'due_today',
    title: 'Due today',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'due_within_30_days',
    title: 'Due with in 30 days',
    value: '20',
    compare: 'Compare to last week'
  },
  {
    id: 'total_recievables',
    title: 'Total Receivable',
    value: '0',
    compare: 'Compare to last week'
  },
  {
    id: 'bad_debt',
    title: 'Bad Debt',
    value: '0',
    compare: 'Compare to last week'
  }
];

const titles = {
  total_revenue: 'Total Revenue',
  today_revenue: "Today's Revenue",
  revenue_this_month: 'Revenue this month',
  revenue_last_month: 'Revenue last month',
  average_revenue_per_day: 'Average revenue per day',
  over_dues: 'Over due',
  due_today: 'Due today',
  due_within_30_days: 'Due with in 30 days',
  total_recievables: 'Total Receivable',
  bad_debt: 'Bad Debt'
};

export default function OverviewCard({ businessId, open, onClose }) {
  const theme = useTheme();
  const router = useRouter();
  const chipDefaultProps = { color: 'success', variant: 'text', size: 'small' };
  const [title, setTitle] = useState('Over All Financial Year Invoices');
  const [invoices, setInvoices] = useState([]);
  const [financialYear, setFinancialYear] = useState('2024-25');
  const [filterDialog, setFilterDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [dashboardData, setDashboardData] = useState({});
  const { showSnackbar } = useSnackbar();
  const [invoicesList, setInvoicesList] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const totalPages = Math.ceil(invoices.length / rowsPerPage);
  const paginatedData = invoices.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };
  const getStatsData = async (type) => {
    if (businessId) {
      setTitle(titles[type]);
      let url = `/invoicing/detail-invoice?invoicing_profile_id=${businessId}&&filter_type=${type}&&financial_year=${financialYear}`;
      const { res } = await Factory('get', url, {});
      if (res.status_cd === 1) {
        if (res.status === 404) {
          showSnackbar('Data Not found', 'error');
        }
      } else {
        setInvoices(res.data);
      }
    } else {
      showSnackbar('Business data not found', 'error');
    }
  };

  const getDashboardData = async (id) => {
    let url = `/invoicing/invoice-stats?invoicing_profile_id=${id}&financial_year=${financialYear}`;
    const { res } = await Factory('get', url, {});
    if (res.status_cd === 1) {
      if (res.status === 404) {
        showSnackbar('Data Not found', 'error');
      }
    } else {
      setDashboardData(res.data);
    }
  };

  const getInvoices = async (id) => {
    let url = `/invoicing/invoice-retrieve?invoicing_profile_id=${id}&financial_year=${financialYear}`;
    const { res } = await Factory('get', url, {});
    if (res.status_cd === 1) {
      if (res.status === 404) {
        showSnackbar('Data Not found', 'error');
      }
    } else {
      setInvoices(res.data.invoices);
    }
  };
  const getInvoicesList = async (id) => {
    if (businessId) {
      let url = `/invoicing/invoice-retrieve/${id}`;
      const { res } = await Factory('get', url, {});
      if (res.status_cd === 0) {
        setInvoicesList(res.data.invoices);
      }
    }
  };
  useEffect(() => {
    getInvoicesList(businessId);
  }, []);
  // Handle delete action
  const handleDelete = async (id) => {
    let url = `/invoicing/invoice-delete/${id}/`;
    const { res } = await Factory('delete', url, {});
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Invoice Deleted Successfully', 'success');
      getInvoices(businessId);
    }
  };
  const handleWriteOff = async (id) => {
    let url = `/invoicing/invoice-wave-off/${id}`;
    const { res } = await Factory('put', url, {});
    if (res.status_cd === 1) {
      showSnackbar(JSON.stringify(res.data), 'error');
    } else {
      showSnackbar('Successfully wavedoff', 'success');
      getInvoices(businessId);
    }
  };

  const handleApprove = async (id) => {
    const postData = {
      invoice_status: 'Approved'
    };
    let url = `/invoicing/invoice-update/${id}/`;
    const { res } = await Factory('put', url, postData);
    if (res.status_cd === 0) {
      showSnackbar('Approved', 'success');
      getInvoices(businessId);
    }
  };

  useEffect(() => {
    if (businessId && financialYear) {
      getInvoices(businessId);
      getDashboardData(businessId);
    }
  }, [financialYear, businessId]);

  const handleChange = (val) => {
    router.replace(`/dashboard/user/${val}`);
  };

  const downloadInvoice = async (id) => {
    try {
      const tokens = JSON.parse(localStorage.getItem('auth-user'));
      const response = await axios.get(`${BASE_URL}/invoicing/create-pdf/${id}`, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: `Bearer ${tokens.access_token}`
        }
      });
      if (response.data.byteLength > 0) {
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
        setTimeout(() => {
          URL.revokeObjectURL(url);
        }, 10000);
      } else {
        showSnackbar('Invalid response from server', 'error');
      }
    } catch (error) {
      console.error('Error fetching PDF:', error);
      showSnackbar('Invalid response from server', 'error');
    }
  };
  return (
    <Box>
      <Grid container sx={{ borderRadius: 4, boxShadow: theme.customShadows.section, ...applyBorderWithRadius(16, theme), mb: 3 }}>
        {yearlyStats.map((item, index) => (
          <React.Fragment key={'fragment' + index}>
            {index === 0 && (
              <Grid key={'filter' + index} size={{ xs: 6, sm: 6, md: 2 }}>
                <MainCard
                  sx={{
                    border: 'none',
                    borderRadius: 0,
                    boxShadow: 'none'
                  }}
                >
                  <Stack sx={{ gap: 1.5 }}>
                    <Typography variant="h6">Financial Year</Typography>
                    <Autocomplete
                      options={['2021-22', '2022-23', '2023-24', '2024-25']}
                      value={financialYear}
                      onChange={(e, val) => {
                        setFinancialYear(val);
                      }}
                      disableClearable
                      renderOption={({ key: optionKey, ...optionProps }, option) => (
                        <li key={optionKey} {...optionProps}>
                          {option}
                        </li>
                      )}
                      renderInput={(params) => (
                        <TextField {...params} slotProps={{ htmlInput: { ...params.inputProps, 'aria-label': 'language' } }} />
                      )}
                      // sx={{ width: 250 }}
                    />
                    <Stack sx={{ gap: 0.5 }}>
                      <Typography variant="caption" color="grey.700">
                        Select financial year to get yearly stats
                      </Typography>
                      {/* <Typography variant="caption" color="grey.700">
                    Tagline para
                  </Typography> */}
                    </Stack>
                  </Stack>
                </MainCard>
              </Grid>
            )}
            <Grid key={index} size={{ xs: 6, sm: 6, md: 2 }}>
              <MainCard
                onClick={() => {
                  if (item.title === title) {
                    getInvoices(businessId);
                    setTitle('Over All Financial Year Invoices');
                  } else getStatsData(item.id);
                }}
                sx={{
                  border: 'none',
                  borderRadius: 0,
                  boxShadow: 'none',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease-in-out',
                  bgcolor: item.title === title && 'grey.300',
                  '&:hover': {
                    bgcolor: 'grey.300'
                  },
                  minHeight: '100%'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                  <Avatar variant="rounded" sx={{ bgcolor: 'grey.300', width: 38, height: 36 }}>
                    <DynamicIcon name={'IconBolt'} size={26} stroke={1} />
                  </Avatar>
                </div>
                <Stack sx={{ gap: 1.5 }}>
                  <Typography variant="subtitle1">{item.title}</Typography>
                  <Stack sx={{ gap: 0.5 }}>
                    <Typography variant="h3">
                      {indianCurrency}&nbsp;{dashboardData[item.id] || 0}
                    </Typography>
                    {/* <Typography variant="caption" color="grey.700">
                    Tagline para
                  </Typography> */}
                  </Stack>
                </Stack>
              </MainCard>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>
      <Grid container sx={{ borderRadius: 4, boxShadow: theme.customShadows.section, ...applyBorderWithRadius(16, theme), mb: 4 }}>
        {overallStats.map((item, index) => (
          <Grid key={index} size={{ xs: 6, sm: 6, md: 2.4 }}>
            <MainCard
              onClick={() => {
                if (item.title === title) {
                  getInvoices(businessId);
                  setTitle('Over All Financial Year Invoices');
                } else getStatsData(item.id);
              }}
              sx={{
                border: 'none',
                borderRadius: 0,
                boxShadow: 'none',
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: item.title === title && 'grey.300',
                transition: 'all 0.3s ease-in-out',
                '&:hover': {
                  bgcolor: 'grey.300'
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 5 }}>
                <Avatar variant="rounded" sx={{ bgcolor: 'grey.300', width: 38, height: 36 }}>
                  <DynamicIcon name={'IconBolt'} size={26} stroke={1} />
                </Avatar>
              </div>
              <Stack sx={{ gap: 1.5 }}>
                <Typography variant="subtitle1">{item.title}</Typography>
                <Stack sx={{ gap: 0.5 }}>
                  <Typography variant="h3">
                    {indianCurrency}&nbsp;
                    {dashboardData[item.id] || 0}
                  </Typography>
                  {/* <Typography variant="caption" color="grey.700">
                    Tagline
                  </Typography> */}
                </Stack>
              </Stack>
            </MainCard>
          </Grid>
        ))}
      </Grid>
      <Box sx={{ mb: 1 }}>
        <Grid container>
          <Grid size={{ xs: 6 }}>
            <Typography variant="h6">{title}</Typography>
            {!['Over due', 'Due today', 'Due with in 30 days', 'Total Receivable', 'Bad Debt'].includes(title) && (
              <Typography variant="caption" color="grey.700">
                FY: {financialYear}
              </Typography>
            )}
          </Grid>
          <Grid size={{ xs: 6 }} sx={{ textAlign: 'right' }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<IconReload size={16} />}
              sx={{ minWidth: 78, mr: 1 }}
              onClick={() => {
                getInvoices(businessId);
                setTitle('Over All Financial Year Invoices');
              }}
            >
              Reset
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={<IconFilter size={16} />}
              sx={{ minWidth: 78 }}
              onClick={() => {
                setFilterDialog(true);
              }}
            >
              Filter
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Grid>
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: '12px'
          }}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Invoice Number</TableCell>
                <TableCell>Customer</TableCell>
                <TableCell>Payment Status</TableCell>
                <TableCell>Invoice Status</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Balance Due</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((invoice, index) => (
                  <TableRow key={index}>
                    <TableCell>{invoice.invoice_date}</TableCell>
                    <TableCell>{invoice.invoice_number}</TableCell>
                    <TableCell>{invoice.customer}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={invoice.payment_status}
                        color={invoice.payment_status === 'Pending' || invoice.payment_status === 'Overdue' ? 'warning' : 'success'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={invoice.invoice_status}
                        color={invoice.invoice_status === 'Approved' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell>{invoice.due_date}</TableCell>
                    <TableCell>
                      {indianCurrency}&nbsp;{invoice.total_amount}
                    </TableCell>

                    <TableCell>
                      {indianCurrency}&nbsp;{invoice.balance_due}
                    </TableCell>
                    <TableCell>
                      <ActionCell
                        fromComponent="invoice"
                        row={invoice} // Pass the customer row data
                        onEdit={() => {
                          router.push(`/invoicing/editInvoice?id=${invoice.id}`);
                        }}
                        onDelete={() => {
                          handleDelete(invoice.id);
                        }}
                        onRecordPayment={() => {
                          router.push(`/invoicing/recordpayment?id=${invoice.id}`);
                        }}
                        onPaymentHistory={() => {
                          router.push(`/invoicing/paymenthistory?id=${invoice.id}`);
                        }}
                        open={open}
                        onClose={onClose}
                        onDownload={() => {
                          downloadInvoice(invoice.id);
                        }}
                        onApprove={() => {
                          handleApprove(invoice.id);
                        }}
                        onWriteOff={() => {
                          handleWriteOff(invoice.id);
                        }}
                        deleteDialogData={{
                          title: 'Delete record',
                          heading: 'Are you sure you want to delete this record?',
                          description: `This action will permanantely remove this record from the list.`,
                          successMessage: 'Record has been deleted.'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No invoices available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        {invoices.length > 0 && (
          <Stack direction="row" justifyContent="center" alignItems="center" sx={{ px: { xs: 0.5, sm: 2.5 }, py: 1.5 }}>
            <Pagination count={totalPages} page={currentPage} onChange={handlePageChange} color="primary" />
          </Stack>
        )}
      </Grid>
      <FilterDialog
        financialYear={financialYear}
        businessData={businessId}
        filterDialog={filterDialog}
        setFilterDialog={setFilterDialog}
        invoices={invoices}
        setInvoices={setInvoices}
        setTitle={setTitle}
      />
    </Box>
  );
}
// export { downloadInvoice };
