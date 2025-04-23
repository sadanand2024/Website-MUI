'use client';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSnackbar } from '@/components/CustomSnackbar';
import { useAuth } from '@/contexts/AuthContext';
import useCurrentUser from '@/hooks/useCurrentUser';
import Factory from '@/utils/Factory';
import HomeCard from '@/components/cards/HomeCard';
import MainCard from '@/components/MainCard';
import MonthWiseDashboard from './MonthWiseDashboard';
import PayrollSummary from './PayrollSummary';
import DetailedPayroll from './DetailedPayroll';
import Grid2 from '@mui/material/Grid2';
import { Box, Typography, Paper, Divider, alpha, Tabs, Tab } from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import UpdateIcon from '@mui/icons-material/Update';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { months } from '@/utils/MonthsList';
import PayrollMonthwise from '../PayrollDashboard/PayrollMonthwise';
import ComplianceSummary from './ComplianceSummary';
const PRODUCTS_DATA = [
  { title: 'New Joiners', href: '/payroll-workflows', icon: <PersonAddIcon />, color: '#4CAF50' },
  { title: 'Exits', href: '/payroll-workflows', icon: <ExitToAppIcon />, color: '#F44336' },
  { title: 'Attendance', href: '/payroll-workflows', icon: <EventNoteIcon />, color: '#2196F3' },
  { title: 'Loans & Advances', href: '/payroll-workflows', icon: <AccountBalanceWalletIcon />, color: '#FF9800' },
  { title: 'Bonus & Incentives', href: '/payroll-workflows', icon: <EmojiEventsIcon />, color: '#9C27B0' },
  { title: 'Salary Revisions', href: '/payroll-workflows', icon: <UpdateIcon />, color: '#009688' },
  { title: 'Other Deductions', href: '/payroll-workflows', icon: <ReceiptIcon />, color: '#673AB7' }
];
const TabPanel = ({ children, value, index }) => (
  <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
    {value === index && <Box sx={{ pt: 2.5 }}>{children}</Box>}
  </div>
);

TabPanel.propTypes = {
  children: PropTypes.node,
  value: PropTypes.number.isRequired,
  index: PropTypes.number.isRequired
};
export default function Index() {
  const { showSnackbar } = useSnackbar();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [payrollId, setPayrollId] = useState(null);
  const [month, setMonth] = useState(null);
  const [financialYear, setFinancialYear] = useState(null);
  const [payrollSummaryData, setPayrollSummaryData] = useState([]);
  const [activeTab, setActiveTab] = useState(0); // State to manage active tab

  // Function to handle tab changes
  const handleTabChange = (_event, newTabIndex) => setActiveTab(newTabIndex);

  // Accessibility props for tabs
  const a11yProps = (index) => ({
    value: index,
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  });

  // Tab labels
  const tabLabels = ['Payroll Summary', 'Detailed Payroll', 'Compliance Summary'];
  const handleNext = () => {
    setActiveTab((prev) => (prev < 3 ? prev + 1 : prev));
  };
  const handleBack = () => {
    setActiveTab((prev) => (prev < 3 ? prev - 1 : prev));
  };
  // Sync payrollId from search params
  useEffect(() => {
    const id = searchParams.get('payrollid');
    if (id) setPayrollId(id);
  }, [searchParams]);

  // Sync month from search params
  useEffect(() => {
    const monthNumber = searchParams.get('month');
    if (monthNumber) setMonth(monthNumber);
  }, [searchParams]);
  useEffect(() => {
    const financialYear = searchParams.get('financialYear');
    if (financialYear) setFinancialYear(financialYear);
  }, [searchParams]);

  // Fetch payroll summary data
  const fetchPayrollSummary = async () => {
    const url = `/payroll/calculate-employee-monthly-salary?payroll_id=${payrollId}&month=${month}&financial_year=${financialYear}`;
    const { res } = await Factory('get', url, {});
    if (res.status_cd === 0) {
      setPayrollSummaryData(res.data || []);
    } else {
      showSnackbar(JSON.stringify(res.data.data), 'error');
    }
  };

  useEffect(() => {
    if (payrollId) fetchPayrollSummary();
  }, [payrollId]);

  const handleCardClick = (href, index) => {
    router.push(`/payroll${href}?payrollid=${payrollId}&tabValue=${index}&month=${month}&financial_year=2024-2025`);
  };
  return (
    <HomeCard title={`Monthly Payroll Dashboard ${months[month - 1]}`} tagline="Explore your monthly payroll details">
      {' '}
      <Box sx={{ pb: 3 }}>
        <Grid2 container spacing={{ xs: 2, md: 3 }}>
          <Grid2 size={12}>
            {/* <MonthWiseDashboard /> */}
            <PayrollMonthwise payrollId={payrollId} financialYear={financialYear} />
          </Grid2>
          <Grid2 size={12}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              Payroll Workflows
            </Typography>
            <MainCard>
              <Grid2 container spacing={2}>
                {PRODUCTS_DATA.map((item, index) => (
                  <Grid2 key={index} size={{ xs: 12, sm: 6, md: 3 }}>
                    <Paper
                      elevation={0}
                      sx={{
                        height: '100%',
                        borderRadius: 2,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        border: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                          borderColor: 'primary.main',
                          cursor: 'pointer'
                        }
                      }}
                      onClick={() => handleCardClick(item.href, index)}
                    >
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          height: '100%',
                          p: 2,
                          position: 'relative',
                          overflow: 'hidden'
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '100px',
                            height: '100px',
                            opacity: 0.1,
                            transform: 'translate(30%, -30%) rotate(30deg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}
                        >
                          {item.icon}
                        </Box>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1.5
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: 40,
                              height: 40,
                              borderRadius: '50%',
                              bgcolor: alpha(item.color, 0.1),
                              color: item.color,
                              mr: 1.5
                            }}
                          >
                            {item.icon}
                          </Box>
                          <Typography
                            variant="subtitle1"
                            fontWeight="600"
                            sx={{
                              color: 'text.primary',
                              fontSize: '0.95rem'
                            }}
                          >
                            {item.title}
                          </Typography>
                        </Box>
                        <Divider sx={{ my: 1.5 }} />
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            fontSize: '0.8rem',
                            lineHeight: 1.4
                          }}
                        >
                          Manage {item.title.toLowerCase()} related payroll processes and workflows
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid2>
                ))}
              </Grid2>
            </MainCard>
          </Grid2>
          <Grid2 size={12}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', mb: 0 }}>
              <Tabs value={activeTab} onChange={handleTabChange} aria-label="Statutory Components Tabs">
                {tabLabels.map((label, index) => (
                  <Tab key={index} label={label} {...a11yProps(index)} />
                ))}
              </Tabs>
            </Box>
          </Grid2>
          <Grid2 size={12}>
            <TabPanel value={activeTab} index={0}>
              <PayrollSummary payrollSummaryData={payrollSummaryData} />
            </TabPanel>
            <TabPanel value={activeTab} index={1}>
              <DetailedPayroll payrollId={payrollId} month={month} />
            </TabPanel>
            <TabPanel value={activeTab} index={2}>
              <ComplianceSummary payrollId={payrollId} month={month} />
            </TabPanel>
          </Grid2>
        </Grid2>
      </Box>
    </HomeCard>
  );
}
