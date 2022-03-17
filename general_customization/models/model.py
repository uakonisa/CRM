from odoo import models, fields, api, _
from datetime import date, datetime, time
from odoo.exceptions import ValidationError, UserError
from dateutil.relativedelta import relativedelta
import datetime
from datetime import timedelta


class InheritCRMStage(models.Model):
    _inherit = 'crm.stage'

    is_allocate = fields.Boolean(default=False)
    is_reviewed = fields.Boolean(default=False)
    is_rejected = fields.Boolean(default=False)
    is_accepted = fields.Boolean(default=False)


class InheritCRM(models.Model):
    _inherit = 'crm.lead'

    account_no = fields.Char(string='Account Number', store=True)
    applicant_name = fields.Char(string='Applicant Name',store=True)
    father_name = fields.Char(string='Father/Husband Name', store=True)
    passport_no = fields.Char('Present Passport Number')
    passport_expiry = fields.Date('Passport Expiry Date')
    address_in_home_country = fields.Char('Address in Home Country')
    profession_abroad = fields.Char('Profession Abroad')
    national_id = fields.Char('National ID')
    ec_attachments = fields.One2many('exchange.card.attaches', 'exchange_id', 'Attachments')
    loan_attachments = fields.One2many('consumer.loan.attaches', 'consumer_id', 'Attachments')
    vehical_attachments = fields.One2many('vehicle.attaches', 'vehicle_id', 'Attachments')
    insurance_attachments = fields.One2many('insurance.attaches', 'insurance_id', 'Attachments')
    user_id = fields.Many2one('res.users', string='Salesperson', index=True, tracking=True)
    email_con = fields.Char(string='Email', store=True)
    mobile_con = fields.Char(string='Mobile', store=True)
    age = fields.Float(string='Age', compute='get_age', store=True)
    emergency_contact = fields.Char(string='Alternative Contact', store=True)
    birthday = fields.Date('Date of Birth(Geogorian)', groups="hr.group_hr_user", required=False)
    place_of_birth = fields.Char('Place of Birth', groups="hr.group_hr_user", required=False)
    country_of_birth = fields.Many2one('res.country', string="Country of Birth", groups="hr.group_hr_user",
                                       required=False)
    nationality = fields.Many2one('res.country', 'Nationality')
    nationality_type = fields.Selection([('Native', 'Native'),('Non-native', 'Non-native')], 'Nationality type')
    identification_no = fields.Char('Identification No.', groups="hr.group_hr_user")
    gender = fields.Selection([
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other')
    ], groups="hr.group_hr_user", default="male", required=False)
    language = fields.Char(string="Language", groups="hr.group_hr_user")
    residential_address = fields.Char(string='Residential Address', groups="hr.group_hr_user")
    current_residential_address = fields.Char(string='Current Residential Address', groups="hr.group_hr_user",
                                              required=False)
    national_address = fields.Char(string='National Address', groups="hr.group_hr_user")
    street = fields.Char(string='Street#', groups="hr.group_hr_user", required=False)
    po_box = fields.Char(string='P.O Box', groups="hr.group_hr_user", required=False)
    zip_code = fields.Char(string='ZIP Code', groups="hr.group_hr_user", required=False)
    attachment_files = fields.Binary('Attachment')
    additional_service = fields.Selection([('yes','Yes'),('no','No')],default='no')
    exchange_card = fields.Boolean(default=False)
    consumer_loan = fields.Boolean(default=False)
    vehicle = fields.Boolean(default=False)
    insurance = fields.Boolean(default=False)
    loan_purpose = fields.Char('Purpose of loan')
    loan_amount = fields.Char('Loan amount')
    martial_status = fields.Selection([('single','Single'),('married','Married')],default='single', string='Martial Status')
    no_of_dependent = fields.Integer('No of Dependents')
    degree_level = fields.Selection([('matric','Matric'),('intermediate','Intermediate'),('bachelors','Bachelors'),('masters','Masters')],default='', string='Degree Level')
    employment_status = fields.Selection([('employed','Employed'),('unemployed','Unemployed')],default='', string='Employment Status')
    occupation = fields.Char(string='Occupation')
    organization_name = fields.Char(string='Organization')
    monthly_income = fields.Char('Monthly Income')
    service_duration = fields.Char('Service Duration')
    vehicle_type = fields.Char('Vehicle Type')
    have_license = fields.Boolean('Have license?')
    license_no = fields.Char('Vehicle No')
    license_expiry = fields.Date('License Expiry')
    is_reviewed = fields.Boolean(default=False)
    is_allocated = fields.Boolean(default=False)
    is_accepted = fields.Boolean(default=False)
    is_rejected = fields.Boolean(default=False)
    reject_reason = fields.Char('Reject Reason')
    operation_state = fields.Selection([('received','Received'),('reviewed','Reviewed'),('approved','Approved'),('rejected','Rejected')], default='received')

    def button_reviewed(self):
        return self.write({'operation_state':'reviewed'})

    def button_approved(self):
        return self.write({'operation_state':'approved'})

    @api.onchange('stage_id')
    def check_status(self):
        for rec in self:
            if rec.stage_id.is_reviewed == True:
                rec.is_reviewed = True
            if rec.stage_id.is_allocate == True:
                rec.is_allocated = True
                rec.operation_state = 'received'
            if rec.stage_id.is_accepted == True:
                rec.is_accepted = True

    @api.depends('birthday')
    def get_age(self):
        res = {}
        for rec in self:
            if rec.birthday:
                birthday = rec.birthday
                age_calc = (datetime.date.today() - birthday).days / 365
                age = str(age_calc)
                rec.age = age


class ExchangeCardAttaches(models.Model):
    _name = "exchange.card.attaches"
    _description = "Exchange Card Attaches"

    exchange_id = fields.Many2one('crm.lead', 'CRM Lead')
    file = fields.Binary('File')
    name = fields.Char('Document Name')


class ConsumerLoanAttaches(models.Model):
    _name = "consumer.loan.attaches"
    _description = "Consumer Loan Attaches"

    consumer_id = fields.Many2one('crm.lead', 'CRM Lead')
    file = fields.Binary('File')
    name = fields.Char('Document Name')


class VehicleAttaches(models.Model):
    _name = "vehicle.attaches"
    _description = "Vehicle Attaches"

    vehicle_id = fields.Many2one('crm.lead', 'CRM Lead')
    file = fields.Binary('File')
    name = fields.Char('Document Name')


class InsuranceAttaches(models.Model):
    _name = "insurance.attaches"
    _description = "Insurance Attaches"

    insurance_id = fields.Many2one('crm.lead', 'CRM Lead')
    file = fields.Binary('File')
    name = fields.Char('Document Name')


class RejectReason(models.TransientModel):
    _name = 'request.reject'
    reason_for_rejection = fields.Text(string='Reason')

    def submit_reason(self):
        rec = self.env['crm.lead'].search([('id', '=', self._context['active_id'])])
        rec.reject_reason = self.reason_for_rejection
        reject_state = self.env['crm.stage'].search([('is_rejected', '=', True)])
        if not reject_state:
            raise ValidationError(_('There is no stage found for Reject in the CRM pipeline.'))
        else:
            rec.stage_id = reject_state[0].id
            rec.is_rejected = True
            rec.is_allocated = False
            rec.operation_state = 'rejected'



