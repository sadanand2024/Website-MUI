// @third-party
import { FormattedMessage } from 'react-intl';

// @project
import { AuthRole } from '@/enum';

// @types

/***************************  MENU ITEMS - APPLICATIONS  ***************************/

const manage = {
  id: 'group-manage',
  title: <FormattedMessage id="manage" />,
  icon: 'IconBrandAsana',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: <FormattedMessage id="dashboard" />,
      type: 'item',
      url: '/dashboard',
      icon: 'IconLayoutGrid'
    },
    {
      id: 'manageAccess',
      title: <FormattedMessage id="manageAccess" />,
      type: 'item',
      url: '/manage-access',
      icon: 'IconBrandAsana',
      roles: [AuthRole.SUPER_ADMIN]
    },
    {
      id: 'manageBusiness',
      title: <FormattedMessage id="manageBusiness" />,
      type: 'item',
      url: '/dashboard/user/business',
      icon: 'IconBuilding',
      roles: [AuthRole.INDIVIDUAL, AuthRole.CHARTED_ACCOUNTANT_FIRM, AuthRole.CORPORATE_ADMIN]
    },
    // {
    //   id: 'manageCAFirm',
    //   title: <FormattedMessage id="manageCAFirm" />,
    //   type: 'item',
    //   url: '/dashboard/user/ca-firms',
    //   icon: 'IconBuildingCottage',
    //   roles: [AuthRole.INDIVIDUAL, AuthRole.CHARTED_ACCOUNTANT_FIRM, AuthRole.CORPORATE_ADMIN]
    // },
    // {
    //   id: 'manageIndividuals',
    //   title: <FormattedMessage id="manageIndividuals" />,
    //   type: 'item',
    //   url: '/dashboard/user/individual',
    //   icon: 'IconUsers',
    //   roles: [AuthRole.CHARTED_ACCOUNTANT_FIRM]
    // },
    // {
    //   id: 'manageServiceProvider',
    //   title: <FormattedMessage id="manageServiceProvider" />,
    //   type: 'item',
    //   url: '/dashboard/user/service-providers',
    //   icon: 'IconPlaneInflight',
    //   roles: [AuthRole.INDIVIDUAL, AuthRole.CHARTED_ACCOUNTANT_FIRM, AuthRole.CORPORATE_ADMIN]
    // },
    // {
    //   id: 'manageTeam',
    //   title: <FormattedMessage id="manageTeam" />,
    //   type: 'item',
    //   url: '/dashboard/user/team',
    //   icon: 'IconChartHistogram',
    //   roles: [AuthRole.SUPER_ADMIN, AuthRole.CORPORATE_ADMIN, AuthRole.SERVICE_PROVIDER]
    // },
    // anand
    {
      id: 'invoicing',
      title: <FormattedMessage id="invoicing" />,
      type: 'item',
      url: '/invoicing',
      icon: 'IconFileInvoice',
      roles: [AuthRole.SUPER_ADMIN, AuthRole.CORPORATE_ADMIN]
    },
    // {
    //   id: 'VisaServices',
    //   title: <FormattedMessage id="visaServices" />,
    //   type: 'item',
    //   url: '/visa-services',
    //   icon: 'IconSubtask',
    //   roles: [AuthRole.SERVICE_PROVIDER]
    // },
    {
      id: 'payoll',
      title: <FormattedMessage id="payroll" />,
      type: 'item',
      url: '/payroll',
      icon: 'IconInvoice',
      //roles: [AuthRole.SUPER_ADMIN, AuthRole.CORPORATE_ADMIN, AuthRole.SERVICE_PROVIDER]
    },
    {
      id: 'gst',
      title: <FormattedMessage id="gst" />,
      type: 'item',
      url: '/gst/screen1',
      icon: 'IconFileCertificate',
    },
    {
      id: 'trade-license',
      title: <FormattedMessage id="trade-license" />,
      type: 'item',
      url: '/tradelicense/screen1',
      icon: 'IconBriefcase',
    },
    {
      id: 'company-incorporation',
      title: <FormattedMessage id="company-incorporation" />,
      type: 'item',
      url: '/companyincorporation/screen1',
      icon: 'IconBuildingSkyscraper',
    },
    {
      id: 'labour-license',
      title: <FormattedMessage id="labour-license" />,
      type: 'item',
      url: '/labour/screen1',
      icon: 'IconBuildingFactory',
    },
    {
      id: 'msme',
      title: <FormattedMessage id="msme" />,
      type: 'item',
      url: '/msme/screen1',
      icon: 'IconBuildingStore', // Best fit for MSME
    },

    //
    // {
    //   id: 'account',
    //   title: <FormattedMessage id="account" />,
    //   type: 'item',
    //   url: '/account',
    //   icon: 'IconUserCog',
    //   roles: [AuthRole.SUPER_ADMIN]
    // },
    // {
    //   id: 'user',
    //   title: <FormattedMessage id="user" />,
    //   type: 'item',
    //   url: '/user',
    //   icon: 'IconUsers'
    // },
    // {
    //   id: 'role-permission',
    //   title: <FormattedMessage id="roles-permissions" />,
    //   type: 'item',
    //   url: '/role-permission',
    //   icon: 'IconChartHistogram',
    //   roles: [AuthRole.SUPER_ADMIN]
    // },
    // {
    //   id: 'billing',
    //   title: <FormattedMessage id="billing" />,
    //   type: 'item',
    //   url: '/billing',
    //   icon: 'IconFileInvoice'
    // },
    // {
    //   id: 'blog',
    //   title: <FormattedMessage id="blog" />,
    //   type: 'item',
    //   url: '/blog',
    //   icon: 'IconBrandBlogger'
    // },
    // {
    //   id: 'setting',
    //   title: <FormattedMessage id="settings" />,
    //   type: 'item',
    //   url: '/setting',
    //   icon: 'IconSettings',
    //   roles: [AuthRole.SUPER_ADMIN, AuthRole.CORPORATE_ADMIN, AuthRole.SERVICE_PROVIDER, AuthRole.INDIVIDUAL]
    // }
  ]
};

export default manage;
