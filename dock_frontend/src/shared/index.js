const data = [
  {
    'label': 'FET',
    'children': [
      {
        'label': 'FET-CSE',
        'children': [
          {
            'label': 'FET-CSE-SEM4',
            'children': [
              {
                'label': '4CSA'
              },
              {
                'label': '4CSB'
              },
              {
                'label': '4CSC'
              }
            ]
          },
          {
            'label': 'FET-CSE-SEM6',
            'children': [
              {
                'label': '6BAO'
              }
            ]
          },
        ]
      },
      {
        'label': 'FET-ECE',
        'children': [
          {
            'label': 'FET-ECE-SEM4'
          },
          {
            'label': 'FET-ECE-SEM6'
          }
        ]
      },
      {
        'label': 'FET-CIVIL',
        'children': [
          {
            'label': 'FET-CIVIL-SEM4'
          },
          {
            'label': 'FET-CIVIL-SEM6'
          }
        ]
      },
      
    ]
  }
];
export function Hierarchy() {
  return data;
}