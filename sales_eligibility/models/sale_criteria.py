# -*- coding: utf-8 -*-
from __future__ import division
from odoo import models, fields, api, _
from datetime import datetime,date
from odoo.exceptions import UserError


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

	date_start = fields.Date('Duration')
	date_end = fields.Date('End Date')
	report_type = fields.Selection([('daily','Daily'),('weekly','Weekly')], default='daily')
	competition_line_ids = fields.One2many('competition.lines', 'competition_id')

	def button_get_report(self):
		print('Enter')


class LinesCompetition(models.Model):
	_name = 'competition.lines'
	_description = 'Competition Lines'

	competition_id = fields.Many2one('sale.competition')
	salesperson = fields.Many2one('hr.employee',string='Staff')
	pool_id = fields.Many2one('sale.pool')
	no_of_wins = fields.Integer('# of win')