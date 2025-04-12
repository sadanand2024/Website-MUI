// @next
import dynamic from 'next/dynamic';

// @project
const PayrollDashboard = dynamic(() => import('@/views/admin/payroll/PayrollDashboard'));

/***************************  ACCOUNT  ***************************/

export default function Invoicings() {
  return <PayrollDashboard />;
}
