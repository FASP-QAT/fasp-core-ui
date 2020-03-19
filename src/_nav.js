export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    // {
    //   name: 'Health Area',
    //   url: '/healthArea',
    //   icon: 'fa fa-list',
    //   children: [
    //     {
    //       name: 'Add Health Area',
    //       url: '/healthArea/addHealthArea',
    //       icon: 'fa fa-code'
    //     }
    //   ]
    // },
    {
      name: 'Application Masters',
      icon: 'fa fa-list',
      children: [
        
        {
          name: 'Country',
          url: '/country/listCountry',
          icon: 'fa fa-circle'
        },
        {
          name: 'DataSource Type',
          url: '/dataSourceType/listDataSourceType',
          icon: 'fa fa-circle'
        },
        {
          name: 'DataSource',
          url: '/dataSource/listDataSource',
          icon: 'fa fa-circle'
        },
        {
          name: 'Currency',
          url: '/currency/listCurrency',
          icon: 'fa fa-circle'
        },
        {
          name: 'Dimension Type',
          url: 'diamension/diamensionlist',
          icon: 'fa fa-circle'
        }
        ,
        {
          name: 'Realm',
          url: 'realm/realmlist',
          icon: 'fa fa-circle'
        },
        
        {
          name: 'Language',
          url: 'language/languagelist',
          icon: 'fa fa-circle'
        }
      ]
    },
    {
      name: 'Realm Masters',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Realm-Country',
          icon: 'fa fa-circle',
          url: '/realmCountry/listRealmCountry'
        },
        {
          name: 'Funding Source',
          icon: 'fa fa-circle',
          url: '/fundingSource/listFundingSource'
        },
        {
          name: 'Sub Funding Source',
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-circle'
        },
        {
          name: 'Procurement Agent',
          url: '/procurementAgent/listProcurementAgent',
          icon: 'fa fa-circle'
        },
        {
          name: 'Budget',
          url: '/budget/listBudget',
          icon: 'fa fa-circle'
        },
        {
          name: 'Manufacturer',
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-circle'
        },
        {
          name: 'Region',
          url: '/region/listRegion',
          icon: 'fa fa-circle'
        }
      ]
    },
    {
      name: 'Program Masters',
      url: '/program',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Program',
          url: '/program',
          icon: 'icon-graph',
          children: [
           
            {
              name: ' Program',
              url: '/program/listProgram',
              icon: 'fa fa-circle',
            }
          ]
        },
        {
          name: 'Product',
          url: '/product',
          icon: 'fa fa-list',
          children: [
         
            {
              name: 'List Product',
              url: '/product/listProduct',
              icon: 'fa fa-circle',
            }
          ]
        },
        {
          name: 'Program Product',
          url: '/programProduct',
          icon: 'fa fa-list',
          children: [
        
            {
              name: 'List Program Product',
              url: '/programProduct/listProgramProduct',
              icon: 'fa fa-circle',
            }
          ]
        },
        {
          name: 'Product Category',
          url: '/productCategory',
          icon: 'fa fa-list',
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
      icon: 'fa fa-list',
    },
    {
      name: 'Consumption details',
      url: '/consumptionDetails',
      icon: 'fa fa-list',
    },
  ]
};