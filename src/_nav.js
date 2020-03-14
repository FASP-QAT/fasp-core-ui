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
          icon: 'fa fa-list-alt',
        }
      ]
    }
  ]
};
