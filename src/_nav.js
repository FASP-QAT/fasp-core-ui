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
          icon: 'fa fa-code',
        }
      ]
    },
    {
      name: 'Sub Funding Source',
      url: '/subFundingSource',
      icon: 'fa fa-money',
      children: [
        {
          name: 'Add Sub Funding Source',
          url: '/subFundingSource/addSubFundingSource',
          icon: 'fa fa-plus',
        },
        {
          name: 'Sub Funding Source List',
          url: '/subFundingSource/subFundingSourceList',
          icon: 'fa fa-plus',
        }
      ]
    },
    {
      name: 'Login',
      url: '/login',
      icon: 'fa fa-sign-in',
    }
  ]
};
