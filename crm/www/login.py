# Citron CRM login page — shadows the Frappe framework's /login with the
# Citron Identity experience (see https://github.com/Inkblot-Studio/citron-identity).
# Authentication itself still goes through Frappe's standard /api/method/login,
# so sessions, rate limiting, and password policies are untouched.

import frappe
from frappe.utils import sanitize_html

no_cache = 1


def get_context(context):
	if frappe.session.user != "Guest":
		frappe.local.flags.redirect_location = _safe_redirect_target()
		raise frappe.Redirect

	context.no_cache = 1
	context.redirect_to = _safe_redirect_target()
	return context


def _safe_redirect_target() -> str:
	"""Only allow same-origin absolute paths; anything else lands on /crm."""
	target = frappe.local.request.args.get("redirect-to") or "/crm"
	target = sanitize_html(target)
	if not target.startswith("/") or target.startswith("//"):
		return "/crm"
	return target
