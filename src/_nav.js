export default {
  items: [
    {
      name: 'Dashboard',
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: 'Application Masters',
      icon: 'fa fa-list',
      children: [
        
        {
          name: 'Country',
          url: '/country/listCountry',
          icon: 'fa fa-globe'
        },
        {
          name: 'DataSource Type',
          url: '/dataSourceType/listDataSourceType',
          icon: 'fa fa-table'
        },
        {
          name: 'DataSource',
          url: '/dataSource/listDataSource',
          icon: 'fa fa-database'
        },
        {
          name: 'Currency',
          url: '/currency/listCurrency',
          icon: 'fa fa-usd'
        },
        {
          name: 'Dimension',
          url: 'diamension/diamensionlist',
          icon: 'fa fa-map'
        }
        ,
        {
          name: 'Realm',
          url: 'realm/realmlist',
          icon: 'fa fa-user'
        },
        
        {
          name: 'Language',
          url: 'language/languagelist',
          icon: 'fa fa-language'
        }
      ]
    },
    {
      name: 'Realm Masters',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Realm-Country',
          icon: 'fa fa-globe',
          url: '/realmCountry/listRealmCountry'
        },
        {
          name: 'Funding Source',
          icon: 'fa fa-university',
          url: '/fundingSource/listFundingSource'
        },
        {
          name: 'Sub Funding Source',
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-university'
        },
        {
          name: 'Procurement Agent',
          url: '/procurementAgent/listProcurementAgent',
          icon: 'fa fa-user'
        },
        {
          name: 'Budget',
          url: '/budget/listBudget',
          icon: 'fa fa-line-chart'
        },
        {
          name: 'Manufacturer',
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-industry'
        },
        {
          name: 'Region',
          url: '/region/listRegion',
          icon: 'fa fa-pie-chart'
        }
      ]
    },
    {
      name: 'Program Masters',
      url: '/program',
      icon: 'fa fa-list',
      children: [
        {
       
           
         
              name: ' Program',
              url: '/program/listProgram',
              icon: 'fa fa-object-group',
          
          
        },
        {
        
         
          
              name: ' Product',
              url: '/product/listProduct',
              icon: 'fa fa-th-large',
           
          
        },
        {  name: ' Program Product',
              url: '/programProduct/listProgramProduct',
              icon: 'fa fa-sitemap',
           
         
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
          icon: 'fa fa-download',
        },
        {
          name: 'Export Program',
          url: '/program/exportProgram',
          icon: 'fa fa-upload',
        },
        {
          name: 'Import Program',
          url: '/program/importProgram',
          icon: 'fa fa-long-arrow-up',
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