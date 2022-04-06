# -*- coding: utf-8 -*-
from __future__ import division
from odoo import models, fields, api, _
from datetime import datetime,date
from odoo.exceptions import UserError
from datetime import date, datetime, timedelta


class PoolSale(models.Model):
	_name = 'sale.pool'

	name = fields.Char('Name')
	percentage_in = fields.Integer('Percentage')
	percentage_out = fields.Integer('To')


class EligibilityCriteria(models.Model):
	_name = 'sale.criteria'

	name = fields.Char('Name', store=True, required=True)
	start_date = fields.Date('Start Date', store=True, required=True)
	end_date = fields.Date('End Date', store=True, required=True)
	product_lines = fields.One2many('criteria.lines', 'line_ids')
	overall_percentage = fields.Integer('Overall Percentage', compute='_get_overall_percentage', store=True)
	pool_id = fields.Many2one('sale.pool', string='Pool')
	state = fields.Selection([('draft', 'Draft'),('active', 'Active'), ('close', 'Close'),('reset', 'Reset')], default='draft')

	def button_active(self):
		if self.overall_percentage:
			pool = self.env['sale.pool'].search([('percentage_in','>=',self.overall_percentage)], order='percentage_in asc')
			if len(pool) > 1:
				self.pool_id = pool[0].id
			else:
				self.pool_id = pool.id
		return self.write({'state':'active'})

	def button_close(self):
		return self.write({'state': 'close'})

	def button_reset(self):
		return self.write({'state': 'draft'})

	@api.depends('product_lines')
	def _get_overall_percentage(self):
		for rec in self:
			try:
				rec.overall_percentage = round(sum([line.sale_percentage for line in rec.product_lines])/len(rec.product_lines))
			except ZeroDivisionError:
				return rec.overall_percentage

	@api.depends('overall_percentage')
	def _get_pool(self):
		for rec in self:
			if rec.overall_percentage:
				rec.pool_id = self.env['sale.pool'].search([('percentage_in','>=',rec.overall_percentage),('percentage_out','<=',rec.overall_percentage)],limit=1).id


class LineCriteria(models.Model):
	_name = 'criteria.lines'
	_description = 'Criteria Lines'

	line_ids = fields.Many2one('sale.criteria', 'Product Lines')
	product_id = fields.Many2one('product.product')
	target_quantity = fields.Integer('Target Quantity')
	sale_percentage = fields.Integer('Percentage %')


class SaleCompetition(models.Model):
	_name = 'sale.competition'
	_description = 'Sales Competition'

	name = fields.Char(string='Order Reference', required=True, copy=False, readonly=True, index=True, default=lambda self: _('New'))
	date_start = fields.Date('Duration')
	date_end = fields.Date('End Date')
	report_type = fields.Selection([('daily','Daily'),('weekly','Weekly')], default='daily')
	competition_line_ids = fields.One2many('competition.lines', 'competition_id')

	@api.model
	def create(self, vals):
		if vals.get('name', _('New')) == _('New'):
			vals['name'] = self.env['ir.sequence'].next_by_code('competition.sequence') or _('New')
		result = super(SaleCompetition, self).create(vals)
		return result

	def button_get_report(self):
		self.competition_line_ids = False
		if self.report_type == 'daily':
			d1 = self.date_start
			d2 = self.date_end
			difference_days = (d2 - d1).days + 1
			count = -1
			for record in range(difference_days):
				count += 1
				sale_agents = []
				date = self.date_start + timedelta(days=count)
				lines = self.env['saletarget.saletarget'].search([('state','in',['draft','open']),('start_date','=',date)])
				if lines:
					for i in lines:
						if i.sales_person_id.id not in sale_agents:
							sale_agents.append(i.sales_person_id.id)
						for record in sale_agents:
							sp_lines = lines.filtered(lambda x:x.sales_person_id.id == record)
							so_lines = self.env['targetline.targetline'].search([('reverse_id','in',[rec.id for rec in sp_lines])])
							achieve_qty = 0
							pool = False
							line_count = 0
							for items in so_lines:
								line_count += 1
								achieve_qty += items.achieve_perc
								percent = achieve_qty / line_count
								pool = self.env['sale.pool'].search([('percentage_in', '<=', percent),('percentage_out', '>=', percent)])
						self.env['competition.lines'].create({
							'competition_id': self.id, 'date': date,
							'salesperson': self.env['hr.employee'].search([('id','=',record)]).id,
							'achieve_quantity': achieve_qty,
							'overall_percent': percent,
							'pool_id': pool[0].id if len(pool) > 1 else pool.id,
							'no_of_wins': 1 if pool else False})


class LinesCompetition(models.Model):
	_name = 'competition.lines'
	_description = 'Competition Lines'

	competition_id = fields.Many2one('sale.competition')
	date = fields.Date('Achievement Date')
	salesperson = fields.Many2one('hr.employee',string='Staff')
	staff_id = fields.Char(related='salesperson.employee_number')
	staff_job = fields.Many2one(related='salesperson.job_id')
	pool_id = fields.Many2one('sale.pool')
	overall_percent = fields.Integer('Overall %')
	achieve_quantity = fields.Integer('Achieve Quantity')
	target_quantity = fields.Integer('Target Quantity')
	no_of_wins = fields.Integer('No. of wins')