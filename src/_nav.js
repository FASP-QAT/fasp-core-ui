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
            },{
              name:'Test',
              url:'/budget/test',
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
    }
  ]
};
