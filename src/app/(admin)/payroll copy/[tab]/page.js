import PropTypes from 'prop-types';
// @next
import dynamic from 'next/dynamic';

// @project
const PayrollDashboard = dynamic(() => import('@/views/admin/payroll/PayrollDashboard'));

const EmployeeDashboard = dynamic(() => import('@/views/admin/payroll/EmployeeDashboard'));
const PayrollWorkflows = dynamic(() => import('@/views/admin/payroll/PayrollDashboard/PayrollWorkflows'));

export default async function Dashboard({ params }) {
  const { tab } = await params;

  return (
    <>
      {['employee-dashboard'].includes(tab) ? (
        <EmployeeDashboard tab={tab} />
      ) : ['payroll-workflows'].includes(tab) ? (
        <PayrollWorkflows tab={tab} />
      ) : (
        <PayrollDashboard tab={tab} />
      )}
    </>
  );
}

export async function generateStaticParams() {
  const response = ['employee-dashboard', 'payroll-workflows'];

  return response.map((tab) => ({
    tab: tab
  }));
}

Dashboard.propTypes = { params: PropTypes.object };
