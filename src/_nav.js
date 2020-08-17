
// import i18n from './i18n'
// export default {

//   items:
//     navigator.onLine ?
//       [
//         {
//           name: i18n.t('static.dashboard.applicationdashboard'),
//           url: '/ApplicationDashboard',
//           icon: 'cui-dashboard icons',
//         },
//         {
//           name: i18n.t('static.dashboard.realmdashboard'),
//           url: '/RealmDashboard',
//           icon: 'cui-dashboard icons',
//         },
//         {
//           name: i18n.t('static.dashboard.programdashboard'),
//           url: '/ProgramDashboard',
//           icon: 'cui-dashboard icons',
//         },

//         {
//           name: i18n.t('static.dashboard.applicationmaster'),
//           icon: 'fa fa-list',
//           children: [
//             {
//               name: i18n.t('static.dashboard.role'),
//               url: '/role/listRole',
//               icon: 'fa fa-list-alt'
//             },
//             {
//               name: i18n.t('static.dashboard.user'),
//               url: '/user/listUser',
//               icon: 'fa fa-user'
//             },
//             {
//               name: i18n.t('static.dashboard.language'),
//               url: '/language/listLanguage',
//               icon: 'fa fa-language'
//             },
//             {
//               name: i18n.t('static.dashboard.country'),
//               url: '/country/listCountry',
//               icon: 'fa fa-globe'
//             },
//             {
//               name: i18n.t('static.dashboard.datasourcetype'),
//               url: '/dataSourceType/listDataSourceType',
//               icon: 'fa fa-table'
//             },
//             {
//               name: i18n.t('static.dashboard.datasource'),
//               url: '/dataSource/listDataSource',
//               icon: 'fa fa-database'
//             },
//             {
//               name: i18n.t('static.dashboard.currency'),
//               url: '/currency/listCurrency',
//               icon: 'fa fa-money'
//             },
//             {
//               name: 'Dimension',
//               url: 'dimension/listDimension',
//               icon: 'fa fa-map'
//             }
//             ,
//             {
//               name: 'Realm',
//               url: 'realm/realmlist',
//               icon: 'fa fa-th-large'
//             },
//           ]
//         },
//         {
//           name: i18n.t('static.dashboard.realmmaster'),
//           icon: 'fa fa-list',
//           children: [

//             {
//               name: i18n.t('static.dashboard.fundingsource'),
//               icon: 'fa fa-bank',
//               url: '/fundingSource/listFundingSource'
//             },
//             {
//               name: i18n.t('static.dashboard.subfundingsource'),
//               url: '/subFundingSource/listSubFundingSource',
//               icon: 'fa fa-building-o'
//             },
//             {
//               name: i18n.t('static.dashboard.procurementagent'),
//               url: '/procurementAgent/listProcurementAgent',
//               icon: 'fa fa-link'
//             },
//             {
//               name: i18n.t('static.dashboard.budget'),
//               url: '/budget/listBudget',
//               icon: 'fa fa-line-chart'
//             },
//             {
//               name: i18n.t('static.dashboard.manufacturer'),
//               url: '/manufacturer/listManufacturer',
//               icon: 'fa fa-industry'
//             },
//             {
//               name: i18n.t('static.dashboard.region'),
//               url: '/region/listRegion',
//               icon: 'fa fa-pie-chart'
//             }
//           ]
//         },
//         {
//           name: i18n.t('static.dashboard.programmaster'),
//           url: '/program',
//           icon: 'fa fa-list',
//           children: [
//             {
//               name: i18n.t('static.dashboard.program'),
//               url: '/program',
//               icon: 'icon-graph',
//               children: [
//                 {
//                   name: i18n.t('static.dashboard.addprogram'),
//                   url: '/program/addProgram',
//                   icon: 'icon-pencil',
//                 },
//                 {
//                   name: i18n.t('static.dashboard.listprogram'),
//                   url: '/program/listProgram',
//                   icon: 'fa fa-object-group',
//                 },
//               ]
//             },
//             {
//               name: i18n.t('static.dashboard.product'),
//               url: '/product',
//               icon: 'icon-graph',
//               children: [
//                 {
//                   name: i18n.t('static.dashboard.addproduct'),
//                   url: '/product/addProduct',
//                   icon: 'icon-pencil',
//                 },
//                 {
//                   name: i18n.t('static.dashboard.listproduct'),
//                   url: '/product/listProduct',
//                   icon: 'fa fa-th-large',
//                 },
//               ]
//             },


//             {
//               name: i18n.t('static.dashboard.program'),
//               icon: 'fa fa-list',
//               children: [
//                 {
//                   name: i18n.t('static.dashboard.downloadprogram'),
//                   url: '/program/downloadProgram',
//                   icon: 'fa fa-download',
//                 },
//                 {
//                   name: i18n.t('static.dashboard.exportprogram'),
//                   url: '/program/exportProgram',
//                   icon: 'fa fa-upload',
//                 },
//                 {
//                   name: i18n.t('static.dashboard.importprogram'),
//                   url: '/program/importProgram',
//                   icon: 'fa fa-long-arrow-down',
//                 }
//               ]
//             },
//             {
//               name: i18n.t('static.dashboard.datasync'),
//               url: '/masterDataSync',
//               icon: 'fa fa-list',
//             },
//             {
//               name: i18n.t('static.dashboard.consumptiondetails'),
//               url: '/consumptionDetails',
//               icon: 'fa fa-list',
//             },
//           ]
//         }
//       ]
//       :
//       [
//         {
//           name: i18n.t('static.dashboard.program'),
//           icon: 'fa fa-list',
//           children: [
//             {
//               name: i18n.t('static.dashboard.downloadprogram'),
//               url: '/program/downloadProgram',
//               icon: 'fa fa-download',
//             },
//             {
//               name: i18n.t('static.dashboard.exportprogram'),
//               url: '/program/exportProgram',
//               icon: 'fa fa-upload',
//             },
//             {
//               name: i18n.t('static.dashboard.importprogram'),
//               url: '/program/importProgram',
//               icon: 'fa fa-long-arrow-down',
//             }
//           ]
//         }
//       ]
// }
