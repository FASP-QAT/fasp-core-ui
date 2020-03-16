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
      name: 'Program Level Masters',
      url: '/program',
      icon: 'icon-graph',
      children: [
        {
          name: 'Program Master',
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
          name: 'Program Product Master',
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
          name: 'Product Category Master',
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
      url: '/program',
      icon: 'icon-speedometer',
      children: [
        {
          name: 'Download Program',
          url: '/program/downloadProgram',
          icon: 'fa fa-code',
        }
      ]
    }
  ]
};