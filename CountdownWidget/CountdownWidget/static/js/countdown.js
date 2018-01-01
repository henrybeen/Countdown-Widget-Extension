VSS.init({                        
    explicitNotifyLoaded: true,
    usePlatformStyles: true
});

VSS.require("TFS/Dashboards/WidgetHelpers", function (WidgetHelpers) {
    WidgetHelpers.IncludeWidgetStyles();
    VSS.register("Countdown", function () {
        return {
            getBackgroundWidth: function(backgroundWithName)
            {
                if (backgroundWithName == 'Thin')
                {
                    return 0.5;
                }
                if (backgroundWithName == 'Thick')
                {
                    return 1.5;
                }

                return 1.0;
            },
            getForgroundWidth: function(foregroundWidthName)
            {
                if (foregroundWidthName == 'Thin')
                {
                    return 0.02;
                }
                if (foregroundWidthName == 'Thick')
                {
                    return 0.08;
                }

                return 0.05;
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
                        secondsColor: 'rgb(255, 153, 153)'
                    };
                }

                return settings;
            },
            buildWidget: function(widgetSettings)
            {
                var me = this, 
                    webContext = VSS.getWebContext(),
                    settings = me.parseSettings(widgetSettings);

                var renderValues = {
                    name: widgetSettings.name,
                    daysColor: settings.daysColor,
                    hoursColor: settings.hoursColor,
                    minutesColor: settings.minutesColor,
                    secondsColor: settings.secondsColor,
                    foregroundWidth: me.getForgroundWidth(settings.foregroundWidth),
                    backgroundWidth: me.getBackgroundWidth(settings.backgroundWidth)
                };

                if (settings.countdownType == 'toCustomDateTime')
                {
                    renderValues.endDate = moment.tz(settings.countdownDate, "YYYY-MM-DD HH:mm", settings.timezone)
                    me.renderWidget(renderValues);
                }
                else
                {
                    require(["VSS/Service", "TFS/Work/RestClient", "VSS/WebApi/Constants", "TFS/Core/Contracts"], function(vssService, tfsWorkRestClient, vssWebApiContstants, tfsCoreContracts) {

                        var httpClient = vssService.VssConnection
                            .getConnection()
                            .getHttpClient(tfsWorkRestClient.WorkHttpClient, vssWebApiContstants.ServiceInstanceTypes.TFS);

                        var teamIterationsPromise = httpClient.getTeamIterations({
                            projectId: webContext.project.id,
                            teamId: webContext.team.id,
                        }, "current");

                        teamIterationsPromise.then(function(teamIterations) {
                            if (teamIterations && teamIterations[0]) {
                                renderValues.endDate = moment.utc(teamIterations[0].attributes.finishDate).hour(23).minute(59).second(59);
                            }

                            me.renderWidget(renderValues)
                        });
                    });
                }

                return WidgetHelpers.WidgetStatusHelper.Success();
            },
            renderWidget: function(renderValues)
            {
                var $title = $('h2.title');
                $title.text(renderValues.name);

                $("#dateCountdown").remove();
                $('h2.title').after('<div id="dateCountdown" data-date="' + renderValues.endDate.local().format('YYYY-MM-DD HH:mm:ss') + '" style="width: 95%;"></div>');

                $("#dateCountdown").TimeCircles({
                    "animation": "smooth",
                    "bg_width": renderValues.backgroundWidth,    
                    "fg_width": renderValues.foregroundWidth,
                    "circle_bg_color": "#60686F",
                    "time": {
                        "Days": {
                            "text": "Days",
                            "color": renderValues.daysColor,
                            "show": true
                        },
                        "Hours": {
                            "text": "Hours",
                            "color": renderValues.hoursColor,
                            "show": true
                        },
                        "Minutes": {
                            "text": "Minutes",
                            "color": renderValues.minutesColor,
                            "show": true
                        },
                        "Seconds": {
                            "text": "Seconds",
                            "color": renderValues.secondsColor,
                            "show": true
                        }
                    }
                });
            },
            load: function (widgetSettings) {
                return this.buildWidget(widgetSettings)
            },
            reload: function(widgetSettings) {
            	return this.buildWidget(widgetSettings);
            },
            disableWidgetForStakeholders: function() {
            	return false;
            }
        }
    });
    VSS.notifyLoadSucceeded();
});