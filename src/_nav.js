export default {
  items: [
    {
      name: 'Application Dashboard  ',
      url: '/ApplicationDashboard',
      icon: 'cui-dashboard icons',
    },
    {
      name: 'Realm Dashboard',
      url: '/RealmDashboard',
      icon: 'cui-dashboard icons',
    },
    {
      name: 'Program Dashboard',
      url: '/ProgramDashboard',
      icon: 'cui-dashboard icons',
    },
    {
      name: 'Health Area',
      url: '/healthArea',
      icon: 'icon-speedometer',
      children: [
        {
          name: 'Add Health Area',
          url: '/healthArea/addHealthArea',
          icon: 'fa fa-code'
        }
      ]
    },
    {
      name: 'Application Masters',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Role',
          url: '/role/listRole',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'User',
          url: '/user/listUser',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'Language',
          url: '/language/listLanguage',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'Country',
          url: '/country/listCountry',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'DataSource Type',
          url: '/dataSourceType/listDataSourceType',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'DataSource',
          url: '/dataSource/listDataSource',
          icon: 'fa fa-list-alt'
        },
        {
          name: 'Currency',
          url: '/currency/listCurrency',
          icon: 'fa fa-list-alt'
        }
      ]
    },
    {
      name: 'Realm Masters',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Realm-Country',
          icon: 'fa fa-bank',
          url: '/realmCountry/listRealmCountry'
        },
        {
          name: 'Funding Source',
          icon: 'fa fa-bank',
          url: '/fundingSource/listFundingSource'
        },
        {
          name: 'Sub Funding Source',
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-bank'
        },
        {
          name: 'Procurement Agent',
          url: '/procurementAgent/listProcurementAgent',
          icon: 'fa fa-user'
        },
        {
          name: 'Budget',
          url: '/budget/listBudget',
          icon: 'fa fa-money'
        },
        {
          name: 'Manufacturer',
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-industry'
        },
        {
          name: 'Region',
          url: '/region/listRegion',
          icon: 'fa fa-globe'
        }
      ]
    },
    {
      name: 'Program Masters',
      url: '/program',
      icon: 'icon-graph',
      children: [
        {
          name: 'Program',
          url: '/program/listProgram',
          icon: 'icon-list'
        },
        {

          name: 'Product',
          url: '/product/listProduct',
          icon: 'icon-list'

        }
      ]
    },
    {
      name: 'Program',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Download Program',
          url: '/program/downloadProgram',
          icon: 'fa fa-code',
        },
        {
          name: 'Export Program',
          url: '/program/exportProgram',
          icon: 'fa fa-code',
        },
        {
          name: 'Import Program',
          url: '/program/importProgram',
          icon: 'fa fa-code',
        }
      ]
    },
    {
      name: 'Master Data sync',
      url: '/masterDataSync',
      icon: 'icon-speedometer',
    },
    {
      name: 'Consumption details',
      url: '/consumptionDetails',
      icon: 'icon-speedometer',
    },
  ]
};