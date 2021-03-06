frappe.ui.form.ControlDate = frappe.ui.form.ControlData.extend({
	make_input: function() {
		this._super();
		this.set_date_options();
		this.set_datepicker();
		this.set_t_for_today();
	},
	set_formatted_input: function(value) {
		this._super(value);
		if(!value) return;

		let should_refresh = this.last_value && this.last_value !== value;

		if (!should_refresh) {
			if(this.datepicker.selectedDates.length > 0) {
				// if date is selected but different from value, refresh
				const selected_date =
					moment(this.datepicker.selectedDates[0])
						.format(this.date_format);
				should_refresh = selected_date !== value;
			} else {
				// if datepicker has no selected date, refresh
				should_refresh = true;
			}
		}

		if(should_refresh) {
			this.datepicker.selectDate(frappe.datetime.str_to_obj(value));
		}
	},
	set_date_options: function() {
		var me = this;
		var lang = frappe.boot.user.language;
		if(!$.fn.datepicker.language[lang]) {
			lang = 'en';
		}
		this.today_text = __("Today");
		this.date_format = moment.defaultDateFormat;
		this.datepicker_options = {
			language: lang,
			autoClose: true,
			todayButton: frappe.datetime.now_date(true),
			dateFormat: (frappe.boot.sysdefaults.date_format || 'yyyy-mm-dd'),
			startDate: frappe.datetime.now_date(true),
			onSelect: () => {
				this.$input.trigger('change');
			},
			onShow: () => {
				this.datepicker.$datepicker
					.find('.datepicker--button:visible')
					.text(me.today_text);

				this.update_datepicker_position();
			}
		};
	},
	update_datepicker_position: function() {
		if(!this.frm) return;
		// show datepicker above or below the input
		// based on scroll position
		var window_height = $(window).height();
		var window_scroll_top = $(window).scrollTop();
		var el_offset_top = this.$input.offset().top + 280;
		var position = 'top left';
		if(window_height + window_scroll_top >= el_offset_top) {
			position = 'bottom left';
		}
		this.datepicker.update('position', position);
	},
	set_datepicker: function() {
		this.$input.datepicker(this.datepicker_options);
		this.datepicker = this.$input.data('datepicker');
	},
	set_t_for_today: function() {
		var me = this;
		this.$input.on("keydown", function(e) {
			if(e.which===84) { // 84 === t
				if(me.df.fieldtype=='Date') {
					me.set_value(frappe.datetime.nowdate());
				} if(me.df.fieldtype=='Datetime') {
					me.set_value(frappe.datetime.now_datetime());
				} if(me.df.fieldtype=='Time') {
					me.set_value(frappe.datetime.now_time());
				}
				return false;
			}
		});
	},
	parse: function(value) {
		if(value) {
			return frappe.datetime.user_to_str(value);
		}
	},
	format_for_input: function(value) {
		if(value) {
			return frappe.datetime.str_to_user(value);
		}
		return "";
	},
	validate: function(value) {
		if(value && !frappe.datetime.validate(value)) {
			frappe.msgprint(__("Date must be in format: {0}", [frappe.sys_defaults.date_format || "yyyy-mm-dd"]));
			return '';
		}
		return value;
	}
});
