import React, { useState } from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Paper, Stack, Button, Select, MenuItem } from '@mui/material';
import dayjs from 'dayjs';
import EmptyTable from '@/components/third-party/table/EmptyTable';
import MainCard from '@/components/MainCard';
import CustomInput from '@/utils/CustomInput';
import CustomDatePicker from '@/utils/CustomDateInput';

const TABLE_HEADERS = ['Compliance Type', 'Due Date', 'Status', 'Filing Date', 'Reference Number'];

const MOCK_DATA = [
  {
    complianceType: 'EPF',
    dueDate: '25-04-2025',
    status: 'Filed',
    filingDate: '2025-04-10',
    referenceNumber: 'REF12345'
  },
  {
    complianceType: 'ESI',
    dueDate: '22-04-2025',
    status: 'Pending',
    filingDate: null,
    referenceNumber: null
  },
  {
    complianceType: 'PT',
    dueDate: '12-05-2025',
    status: 'Filed',
    filingDate: '2025-04-22',
    referenceNumber: 'REF67890'
  },
  {
    complianceType: 'TDS',
    dueDate: '15-05-2025',
    status: 'Pending',
    filingDate: null,
    referenceNumber: null
  }
];

export default function ComplianceSummary() {
  const [data, setData] = useState(MOCK_DATA);

  const handleInputChange = (index, field, value) => {
    const updatedData = [...data];
    updatedData[index][field] = value;
    setData(updatedData);
  };

  const isSaveDisabled = (item) => !item.filingDate || !item.referenceNumber;

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
              {data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={TABLE_HEADERS.length + 1} sx={{ height: 300 }}>
                    <EmptyTable msg="No compliance data available" />
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>{item.complianceType}</TableCell>
                    <TableCell>{item.dueDate}</TableCell>
                    <TableCell>
                      <Select
                        value={item.status || ''}
                        onChange={(e) => handleInputChange(index, 'status', e.target.value)}
                        displayEmpty
                        sx={{ minWidth: 120 }}
                      >
                        {['Overdue', 'Pending', 'Filed'].map((status) => (
                          <MenuItem key={status} value={status}>
                            <Chip
                              label={status}
                              color={status === 'Filed' ? 'success' : status === 'Pending' ? 'warning' : 'error'}
                              size="small"
                            />
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                    <TableCell>
                      <CustomDatePicker
                        views={['year', 'month', 'day']}
                        value={item.filingDate ? dayjs(item.filingDate) : null}
                        onChange={(date) => handleInputChange(index, 'filingDate', date?.format('YYYY-MM-DD'))}
                      />
                    </TableCell>
                    <TableCell>
                      <CustomInput
                        value={item.referenceNumber || ''}
                        onChange={(e) => handleInputChange(index, 'referenceNumber', e.target.value)}
                      />
                    </TableCell>
                    <TableCell>
                      <Button size="small" disabled={isSaveDisabled(item)}>
                        Save
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </MainCard>
  );
}
