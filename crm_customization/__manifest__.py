# -*- coding: utf-8 -*-

{
    'name': "CRM module customizations.",
    'summary': """CRM module customizations""",
    'description': """ Module for the crm customizations """,
    'author': "SIT & Think Digital",
    'website': "",
    'category': 'CRM',
    'version': '0.1',
    'depends': ['base','hr','crm','mail','saudi_hr_employee','sale'],
    'data': ['security/ir.model.access.csv',
             'security/security.xml',
             'data/crm_mail_template.xml',
             'views/operation_view.xml',
             'views/views.xml',
             'views/service_report.xml'
    ],
    'demo': [],
    'application': True,
    'installable': True,
    'auto_install': False,
}
