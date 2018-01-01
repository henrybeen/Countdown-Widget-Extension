VSS.init({
	explicitNotifyLoaded: true,
	setupModuleLoader: true,
	usePlatformScripts: true,
	usePlatformStyles: true
});

VSS.require("TFS/Dashboards/WidgetHelpers", function (WidgetHelpers) {
	WidgetHelpers.IncludeWidgetConfigurationStyles();

	VSS.register("CountdownConfiguration", function () {   
		return {
			notifyChanges: function(widgetConfigurationContext)
			{
				var customSettings = this.getSettingsFormControls();

				widgetConfigurationContext.notify(
					WidgetHelpers.WidgetEvent.ConfigurationChange, 
					WidgetHelpers.WidgetEvent.Args(customSettings));
			},
			getSettingsFormControls: function() {
				var customSettings = {
					data: JSON.stringify({
						countdownType: $('input[name=countdownType]:checked').val(),
						countdownDate: moment(this.dateTimeCombo.getInputText()).format("YYYY-MM-DD HH:mm"),
						timezone: $('#timezone').prop('value'),
						foregroundWidth: this.foregroundWidthCombo.getValue(),
						backgroundWidth: this.backgroundWidthCombo.getValue(),
						daysColor: $('#days-colorpicker').spectrum("get").toRgbString(),
						hoursColor: $('#hours-colorpicker').spectrum("get").toRgbString(),
						minutesColor: $('#minutes-colorpicker').spectrum("get").toRgbString(),
						secondsColor: $('#seconds-colorpicker').spectrum("get").toRgbString()
					})
				}

				return customSettings;
			},
			updateControlsVisibility: function() {
				if ($('input[name=countdownType]:checked').val() == 'toCustomDateTime')
				{
					$('#datepicker-container, #timezonepicker-container').show();
				}
				else
				{
					$('#datepicker-container, #timezonepicker-container').hide();
				}
			},
            palette: ["black", "white", "tan", "turquoise", "pink", "red", "yellow", "green", "blue", "violet"],
            createWidthPicker: function(controls, combos, jqueryIdentifier, selectedValue, notifyChanges)
            {
				return controls.create(combos.Combo, $(jqueryIdentifier), {
					change: notifyChanges,
					mode: 'drop',
					source: ['Thin', 'Normal', 'Thick'],
					value: selectedValue
				});
            },
            createColorPicker: function(jqueryIdentifier, initialColor)
            {
            	$(jqueryIdentifier).spectrum({
					color: initialColor,
					hideAfterPaletteSelect: true,
					palette: this.palette,
					showPalette: true,
					showPaletteOnly: false,
				});
            },
            parseSettings: function(widgetSettings)
            {
				var settings = JSON.parse(widgetSettings.customSettings.data);

				if (!settings)
				{
					return {
                        countdownType: 'toEndOfSprint',
                        foregroundWidth: 'Normal',
                        backgroundWidth: 'Normal',
                        daysColor: 'rgb(255, 204, 102)',
                        hoursColor: 'rgb(153, 204, 255)',
                        minutesColor: 'rgb(187, 255, 187)',
                        secondsColor: 'rgb(255, 153, 153)',
                        timezone: moment.tz.guess()
                    };
				}

				return settings;
            },
			load: function (widgetSettings, widgetConfigurationContext) {
				var me = this, 
					notifyChanges = function() { me.notifyChanges(widgetConfigurationContext); },
					settings = me.parseSettings(widgetSettings);


				require(["VSS/Controls", "VSS/Controls/Combos"], function(controls, combos) {
					$('input[value=' + settings.countdownType + ']').prop('checked', 'checked');

					me.dateTimeCombo = controls.create(combos.Combo, $("#datetime"),  {
						change: notifyChanges,
						dateTimeFormat: "F",
						type: "date-time",	
						value: settings.countdownDate
					});

					var timezones = moment.tz.names();
					for (var i=0; i<timezones.length; i++)
					{
						$("#timezone")
							.append($("<option></option>")
		                    .attr("value", timezones[i])
		                    .text(timezones[i])); 
					}

					$("#timezone").val(settings.timezone);

					me.foregroundWidthCombo = me.createWidthPicker(controls, combos, "#fgWidth", settings.foregroundWidth, notifyChanges);
					me.backgroundWidthCombo = me.createWidthPicker(controls, combos, "#bgWidth", settings.backgroundWidth, notifyChanges);

					me.createColorPicker("#days-colorpicker", settings.daysColor);
					me.createColorPicker("#hours-colorpicker", settings.hoursColor);
					me.createColorPicker("#minutes-colorpicker", settings.minutesColor);
					me.createColorPicker("#seconds-colorpicker", settings.secondsColor);

					$('.colorpicker-input, #timezone, input').on("change", notifyChanges);
					$('input[name=countdownType]').on("change", function() {
						me.dateTimeCombo.setText(moment().format("LLLL"));
						me.updateControlsVisibility();
					});

					me.updateControlsVisibility();
				});

				return WidgetHelpers.WidgetStatusHelper.Success();
			},
			onSave: function() {
				var customSettings = this.getSettingsFormControls();

				return WidgetHelpers.WidgetConfigurationSave.Valid(customSettings); 
			}
		};
	});

	VSS.notifyLoadSucceeded();
});