var _progressBar = {
    new: function (options) {
        var defaultOptions = {
            defaultUpdateSpeed: 500,
            height: '20px',
            width: '100%',
            backgroundColor: '#333333',
            barColor: '#AAAAAA',
            maxValue: 100,
            minValue: 0,
            value: 100,
            textPosition: PROGRESS_BAR_TEXT_POSITION.NO_TEXT,
            invertedDirection: false
        };

        var settings = defaultOptions;
        if (options != undefined) {
            if (options.size != undefined) {
                var barOptions = {
                    small: {
                        height: '10px'
                    },
                    medium: {
                        height: '20px'
                    },
                    large: {
                        height: '30px'
                    }
                };
                switch (options.type) {
                    case PROGRESS_BAR_SIZE.SMALL:
                        $.extend(settings, barOptions.small); break;
                    case PROGRESS_BAR_SIZE.MEDIUM:
                        $.extend(settings, barOptions.medium); break;
                    case PROGRESS_BAR_SIZE.LARGE:
                        $.extend(settings, barOptions.large); break;
                    default: break;
                }
            }

            if (options.type != undefined) {
                var barOptions = {
                    hpBarOptions: {
                        backgroundColor: '#333333',
                        barColor: '#FF3300'
                    },
                    mpBarOptions: {
                        backgroundColor: '#333333',
                        barColor: '#3300FF'
                    }
                };
                switch (options.type) {
                    case PROGRESS_BAR_TYPE.HP:
                        $.extend(settings, barOptions.hpBarOptions); break;
                    case PROGRESS_BAR_TYPE.MP:
                        $.extend(settings, barOptions.mpBarOptions); break;
                    default: break;
                }
            }
            $.extend(settings, options);
        }

        var jqElement = $('<div class="progress-bar-container">');
        var jqText = $('<div class="progress-bar-text">');
        var jqBackground = $('<div class="progress-bar-background">');
        var jqBar = $('<div class="progress-bar">');

        jqElement.css('width', settings.width);

        jqText.append(settings.value + '/' + settings.maxValue);

        jqBackground.css('background-color', settings.backgroundColor);
        jqBackground.css('width', settings.width);
        jqBackground.css('height', settings.height);

        jqBar.css('background-color', settings.barColor);
        jqBar.css('height', settings.height);
        jqBackground.append(jqBar);

        if (settings.textPosition == PROGRESS_BAR_TEXT_POSITION.UNDER_LEFT) {
            jqElement.append(jqBackground);
            jqElement.append(jqText);
        } else if (settings.textPosition == PROGRESS_BAR_TEXT_POSITION.NO_TEXT) {
            jqElement.append(jqBackground);
        }

        var progressBar = {
            settings: settings,
            jqElement: jqElement
        };

        _progressBar.refresh(progressBar);

        return progressBar;
    },
    newHPBar: function (options) {
        if (options === undefined) {
            options = {};
        }
        options.type = PROGRESS_BAR_TYPE.HP;
        return _progressBar.new(options);
    },
    newMPBar: function (options) {
        if (options === undefined) {
            options = {};
        }
        options.type = PROGRESS_BAR_TYPE.MP;
        return _progressBar.new(options);
    },
    setValue: function (progressBar, newValue, time) {
        if (time === undefined) {
            time = progressBar.settings.defaultUpdateSpeed;
        }
        if (time == 0) {
            progressBar.settings.value = newValue;
            _progressBar.refresh(progressBar);
        } else {
            progressBar.settings.value = Math.round(progressBar.settings.value + ((newValue - progressBar.settings.value) / (time / 10)));
            _progressBar.refresh(progressBar);
            if (time > 10) {
                setTimeout(function () { _progressBar.setValue(progressBar, newValue, time - 10); }, 10);
            } else {
                setTimeout(function () { _progressBar.setValue(progressBar, newValue, 0); }, 10);
            }
        }
    },
    refresh: function (progressBar) {
        var min = progressBar.settings.minValue;
        var max = progressBar.settings.maxValue;
        var value = progressBar.settings.value;
        var percent = (100 * (value - min)) / (max - min);
        if (progressBar.settings.textPosition != PROGRESS_BAR_TEXT_POSITION.NO_TEXT) {
            progressBar.jqElement.find('.progress-bar-text').html(value + '/' + max);
        }
        progressBar.jqElement.find('.progress-bar').css('width', percent + '%');
    }
};