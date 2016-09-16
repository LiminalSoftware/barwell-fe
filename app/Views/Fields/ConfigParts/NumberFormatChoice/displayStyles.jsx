export default {
  'DECIMAL': {
    displayStyle: 'DECIMAL',
  	description: 'Decimal', 
  	icon: 'icon-dial', 
  	formatString: '0,0.00',
    example: '1.01'
  },
  'PERCENTAGE': {
    displayStyle: 'PERCENTAGE',
  	description: 'Percentage', 
  	icon: 'icon-percent-square',
  	formatString: '0%',
    example: '47%'
  },
  'CURRENCY': {
    displayStyle: 'CURRENCY',
    description: 'Currency', 
    icon: 'icon-coin-dollar',
    formatString: '$0,0.00',
    example: '1,234.01'
  },
  'ACCOUNTING': {
    displayStyle: 'ACCOUNTING',
    description: 'Accounting', 
    icon: 'icon-coin-dollar',
    formatString: '$(0,0.00)',
    example: '(1,234.01)'
  },
  'FINANCIAL': {
    displayStyle: 'FINANCIAL',
    description: 'Financial', 
    icon: 'icon-coin-dollar',
    formatString: '$(0,0.0a)',
    example: '(1,2k)'
  },
}