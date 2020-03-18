export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
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
          url: '/program',
          icon: 'icon-graph',
          children: [
            {
              name: 'Add Program',
              url: '/program/addProgram',
              icon: 'icon-pencil',
            },
            {
              name: 'List Program',
              url: '/program/listProgram',
              icon: 'icon-list',
            }
          ]
        },
        {
          name: 'Product',
          url: '/product',
          icon: 'icon-graph',
          children: [
            {
              name: 'Add Product',
              url: '/product/addProduct',
              icon: 'icon-pencil',
            },
            {
              name: 'List Product',
              url: '/product/listProduct',
              icon: 'icon-list',
            }
          ]
        },
        {
          name: 'Program Product',
          url: '/programProduct',
          icon: 'icon-graph',
          children: [
            {
              name: 'Add Program Prodcut',
              url: '/programProduct/addProgramProduct',
              icon: 'icon-pencil',
            },
            {
              name: 'List Program Product',
              url: '/programProduct/listProgramProduct',
              icon: 'icon-list',
            }
          ]
        },
        {
          name: 'Product Category',
          url: '/productCategory',
          icon: 'icon-graph',
          children: [
            {
              name: 'Add Prodcut Category',
              url: '/productCategory/addProductCategory',
              icon: 'icon-pencil',
            }
          ]
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