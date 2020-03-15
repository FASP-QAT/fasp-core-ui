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
      name: 'Funding Source',
      url: '/fundingSource',
      icon: 'fa fa-money',
      children: [
        {
          name: 'Add Funding Source',
          url: '/fundingSource/addFundingSource',
          icon: 'fa fa-plus',
        },
        {
          name: 'Funding Source List',
          url: '/fundingSource/listFundingSource',
          icon: 'fa fa-list-alt',
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
          url: '/subFundingSource/listSubFundingSource',
          icon: 'fa fa-list-alt',
        }
      ]
    },
    {
      name: 'Manufacturer',
      url: '/manufacturer',
      icon: 'fa fa-money',
      children: [
        {
          name: 'Add Manufacturer',
          url: '/manufacturer/addManufacturer',
          icon: 'fa fa-plus',
        },
        {
          name: 'Manufacturer List',
          url: '/manufacturer/listManufacturer',
          icon: 'fa fa-list-alt',
        }
      ]
    },
    {
      name: 'Region',
      url: '/region',
      icon: 'fa fa-money',
      children: [
        {
          name: 'Add Region',
          url: '/region/addRegion',
          icon: 'fa fa-plus',
        },
        {
          name: 'Region List',
          url: '/region/listRegion',
          icon: 'fa fa-list-alt',
        }
      ]
    }

  ]
};
