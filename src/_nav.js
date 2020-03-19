import i18n from './i18n'
export default {
  items: [
    {
      name: i18n.t('static.common.dashboard'),
      url: '/dashboard',
      icon: 'icon-speedometer',
    },
    {
      name: i18n.t('static.dashboard.healtharea') ,
      url: '/healthArea',
      icon: 'icon-speedometer',
      children: [
        {
          name: i18n.t('static.dashboard.addhealtharea'),
          url: '/healthArea/addHealthArea',
          icon: 'fa fa-code'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.applicationmaster') ,
      icon: 'fa fa-list',
      children: [
        {
          name:  i18n.t('static.dashboard.language'),
          url: '/language/listLanguage',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.country'),
          url: '/country/listCountry',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.datasourcetype'),
          url: '/dataSourceType/listDataSourceType',
          icon: 'fa fa-list-alt'
        },
        {
          name: i18n.t('static.dashboard.datasource') ,
          url: '/dataSource/listDataSource',
          icon: 'fa fa-list-alt'
        },
        {
          name:  i18n.t('static.dashboard.currency'),
          url: '/currency/listCurrency',
          icon: 'fa fa-list-alt'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.realmmaster') ,
      icon: 'fa fa-list',
      children: [
        {
          name: i18n.t('static.dashboard.realmcountry') ,
          icon: 'fa fa-bank',
          url: '/realmCountry/listRealmCountry'
        },
        {
          name: i18n.t('static.dashboard.fundingsource'),
          icon: 'fa fa-bank',
          url: '/fundingSource/listFundingSource'
        },
        {
          name: i18n.t('static.dashboard.subfundingsource') ,
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-bank'
        },
        {
          name: i18n.t('static.dashboard.procurementagent') ,
          url: '/procurementAgent/listProcurementAgent',
          icon: 'fa fa-user'
        },
        {
          name:  i18n.t('static.dashboard.budget'),
          url: '/budget/listBudget',
          icon: 'fa fa-money'
        },
        {
          name: i18n.t('static.dashboard.manufacturer') ,
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-industry'
        },
        {
          name: i18n.t('static.dashboard.region'),
          url: '/region/listRegion',
          icon: 'fa fa-globe'
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.programmaster') ,
      url: '/program',
      icon: 'icon-graph',
      children: [
        {
          name:  i18n.t('static.dashboard.program'),
          url: '/program',
          icon: 'icon-graph',
          children: [
            {
              name: i18n.t('static.dashboard.addprogram') ,
              url: '/program/addProgram',
              icon: 'icon-pencil',
            },
            {
              name: i18n.t('static.dashboard.listprogram') ,
              url: '/program/listProgram',
              icon: 'icon-list',
            }
          ]
        },
        {
          name:  i18n.t('static.dashboard.product'),
          url: '/product',
          icon: 'icon-graph',
          children: [
            {
              name: i18n.t('static.dashboard.addproduct') ,
              url: '/product/addProduct',
              icon: 'icon-pencil',
            },
            {
              name: i18n.t('static.dashboard.listproduct') ,
              url: '/product/listProduct',
              icon: 'icon-list',
            }
          ]
        },
        {
          name: i18n.t('static.dashboard.programproduct'),
          url: '/programProduct',
          icon: 'icon-graph',
          children: [
            {
              name:  i18n.t('static.dashboard.addprogramproduct'),
              url: '/programProduct/addProgramProduct',
              icon: 'icon-pencil',
            },
            {
              name: i18n.t('static.dashboard.listprogramproduct'),
              url: '/programProduct/listProgramProduct',
              icon: 'icon-list',
            }
          ]
        },
        {
          name: i18n.t('static.dashboard.productcategory') ,
          url: '/productCategory',
          icon: 'icon-graph',
          children: [
            {
              name: i18n.t('static.dashboard.addproductcategory') ,
              url: '/productCategory/addProductCategory',
              icon: 'icon-pencil',
            }
          ]
        }
      ]
    },
    {
      name: i18n.t('static.dashboard.program') ,
      icon: 'fa fa-list',
      children: [
        {
          name: i18n.t('static.dashboard.downloadprogram') ,
          url: '/program/downloadProgram',
          icon: 'fa fa-code',
        },
        {
          name: i18n.t('static.dashboard.exportprogram') ,
          url: '/program/exportProgram',
          icon: 'fa fa-code',
        },
        {
          name: i18n.t('static.dashboard.importprogram'),
          url: '/program/importProgram',
          icon: 'fa fa-code',
        }
      ]
    },
    {
      name:  i18n.t('static.dashboard.datasync'),
      url: '/masterDataSync',
      icon: 'icon-speedometer',
    },
    {
      name: i18n.t('static.dashboard.consumptiondetails') ,
      url: '/consumptionDetails',
      icon: 'icon-speedometer',
    },
  ]
};