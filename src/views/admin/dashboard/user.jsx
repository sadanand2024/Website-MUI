'use client';
import Grid from '@mui/material/Grid2';

import Factory from '@/utils/Factory';
import { useState, useEffect } from 'react';

// @project
import OverviewCard from './user/OverviewCard';
import Services from './user/Services';
import { useSnackbar } from '@/components/CustomSnackbar';
import AnalyticsTopRef from './user/AnalyticsTopRef';
import MainCard from '@/components/MainCard';
import { Card, Typography } from '@mui/material';

/***************************  ANALYTICS - OVERVIEW  ***************************/

export default function AnalyticsOverview() {
  //   const { user } = useAuth();
  const chipDefaultProps = { color: 'black', variant: 'text', size: 'small' };
  const [clientListData, setClientListData] = useState({});
  const { showSnackbar } = useSnackbar();

  const getClientsData = async () => {
    const url = '/user_management/visa-clients/dashboard-status/';
    try {
      const { res, error } = await Factory('get', url, {});
      console.log(res.data);
      if (res.status_cd === 0) {
        setClientListData(res.data);
      }
    } catch (error) {
      // Catch any errors during the request
      console.error('Error:', error);
      showSnackbar(JSON.stringify(error), 'error');
    }
  };

  useEffect(() => {
    getClientsData(); // Load client list on component mount
  }, []);

  return (
    <Grid container spacing={{ xs: 2, md: 3 }}>
      <Grid container size={12}>
        <Grid container size={8}>
          <MainCard>
            <Grid size={7}>
              <Typography variant="h5">Hello Krishna Sai,</Typography>
              <Typography variant="h6">Welcom Back</Typography>
              <Typography sx={{ color: '#c9c9c9', mt: 2 }} variant="subtitle1">
                simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever
              </Typography>
            </Grid>
            <Grid size={5}></Grid>
          </MainCard>
        </Grid>
        <Grid size={4}>
          <MainCard></MainCard>
        </Grid>
      </Grid>
      <Grid size={12}>
        <OverviewCard clientListData={clientListData} />
      </Grid>
      {/* <Grid size={12}>
        <Services />
      </Grid> */}
      {/* <Grid size={12}>
        <AnalyticsTopRef />
      </Grid> */}
    </Grid>
  );
}
