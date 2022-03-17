# -*- coding: utf-8 -*-

{
    'name': "General Customizations.",
    'summary': """ General """,
    'description': """ Module for the general customizations """,
    'author': "SIT & Think Digital",
    'website': "",
    'category': 'Product',
    'version': '0.1',
    'depends': ['base','crm'],
    'data': [
		    'security/ir.model.access.csv',
            
            'views/views.xml',
    ],
    'demo': [],
	'application': True,
    'installable': True,
    'auto_install': False,
}
