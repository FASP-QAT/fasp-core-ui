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
      name: 'Realm Masters',
      icon: 'fa fa-list',
      children: [
        {
          name: 'Realm Country',
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
    }
  ]
};