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
          name: 'Budget Master',
          url: '/budget',
          icon: 'icon-graph',
          children: [
            {
              name: 'Add Budget',
              url: '/budget/addBudget',
              icon: 'icon-pencil',
            },
            {
              name: 'List Budgets',
              url: '/budget/listBudgets',
              icon: 'icon-list',
            }, {
              name: 'Test',
              url: '/budget/test',
              icon: 'icon-pencil'
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