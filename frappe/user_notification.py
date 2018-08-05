# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and Contributors
# MIT License. See license.txt

from __future__ import unicode_literals
import frappe
from frappe import _
import frappe.model
import frappe.utils
import json, os

from six import iteritems, string_types, integer_types

@frappe.whitelist()
def close_notification(name):
	notification_doc = frappe.get_doc('User Notification',name)
	notification_doc.status = "Disabled"
	notification_doc.flags.ignore_permissions = True
	notification_doc.save()
	
@frappe.whitelist()
def get_notification(doctype, name=None, filters=None):
	'''Returns a document by name or filters

	:param doctype: DocType of the document to be returned
	:param name: return document of this `name`
	:param filters: If name is not set, filter by these values and return the first match'''
	if filters and not name:
		name = frappe.db.get_value(doctype, json.loads(filters))
		if not name:
			frappe.throw(_("No document found for given filters"))
	doc_notification = frappe.get_list('User Notification', filters={'target_doctype': doctype , "target_docname":name,"status":"Active",
		"user":frappe.session.user}, fields=['name'])
	if doc_notification :		
		notification_doc = frappe.get_doc('User Notification',doc_notification[0]["name"])
		if not notification_doc.has_permission("read"):
			raise frappe.PermissionError

		return notification_doc.as_dict()
	else :
		return None
