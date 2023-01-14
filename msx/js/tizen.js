/******************************************************************************/
//Tizen Player Plugin v0.0.7
//(c) 2022 Benjamin Zachey
/******************************************************************************/

/******************************************************************************/
//TizenPlayer
/******************************************************************************/
function TizenPlayer() {
    var DEFAULT_DISPLAY_AREA = "0,0,1,1";
    var DEFAULT_DISPLAY_MODE = "PLAYER_DISPLAY_MODE_LETTER_BOX";
    var DEFAULT_SUBTITLE_SILENT = false;
    var DEFAULT_SUBTITLE_HIDDEN = false;
    var DEFAULT_BUFFER_TIMEOUT = 20;//s
    var DEFAULT_BUFFER_SIZE = 10;//s

    var infoBaseData = null;
    var readyService = new TVXBusyService();
    var bufferSizesEnabled = false;

    var getDisplayAreaPreference = function() {
        return TVXServices.storage.getFullStr("tizen:display:area", DEFAULT_DISPLAY_AREA);
    };
    var getDisplayModePreference = function() {
        return TVXServices.storage.getFullStr("tizen:display:mode", DEFAULT_DISPLAY_MODE);
    };
    var getSubtitleSilentPreference = function() {
        return TVXServices.storage.getBool("tizen:subtitle:silent", DEFAULT_SUBTITLE_SILENT);
    };
    var getSubtitleHiddenPreference = function() {
        return TVXServices.storage.getBool("tizen:subtitle:hidden", DEFAULT_SUBTITLE_HIDDEN);
    };
    var getBufferTimeoutPreference = function() {
        return TVXServices.storage.getNum("tizen:buffer:timeout", DEFAULT_BUFFER_TIMEOUT);
    };
    var getBufferInitSizePreference = function() {
        return TVXServices.storage.getNum("tizen:buffer:size:init", DEFAULT_BUFFER_SIZE);
    };
    var getBufferResumeSizePreference = function() {
        return TVXServices.storage.getNum("tizen:buffer:size:resume", DEFAULT_BUFFER_SIZE);
    };
    var getPreferences = function(runtime) {
        var preferences = {};
        var displayArea = getDisplayAreaPreference();
        var displayMode = getDisplayModePreference();
        var subtitleSilent = getSubtitleSilentPreference();
        var subtitleHidden = getSubtitleHiddenPreference();
        var bufferTimeout = getBufferTimeoutPreference();
        if (displayArea != DEFAULT_DISPLAY_AREA) {
            //Set default display mode to use display area
            displayMode = DEFAULT_DISPLAY_MODE;
        } else if (displayMode != DEFAULT_DISPLAY_MODE) {
            //Set default display area to use display mode
            displayArea = DEFAULT_DISPLAY_AREA;
        }
        //Return only non-default preferences
        if (displayArea != DEFAULT_DISPLAY_AREA) {
            preferences["tizen:display:area"] = displayArea;
        }
        if (displayMode != DEFAULT_DISPLAY_MODE) {
            preferences["tizen:display:mode"] = displayMode;
        }
        if (subtitleSilent != DEFAULT_SUBTITLE_SILENT) {
            preferences["tizen:subtitle:silent"] = subtitleSilent;
        }
        if (subtitleHidden != DEFAULT_SUBTITLE_HIDDEN) {
            preferences["tizen:subtitle:hidden"] = subtitleHidden;
        }
        if (bufferTimeout != DEFAULT_BUFFER_TIMEOUT) {
            preferences["tizen:buffer:timeout"] = bufferTimeout;
        }
        if (runtime !== true) {
            var bufferInitSize = getBufferInitSizePreference();
            var bufferResumeSize = getBufferResumeSizePreference();
            if (bufferInitSize != DEFAULT_BUFFER_SIZE) {
                preferences["tizen:buffer:size:init"] = bufferInitSize;
            }
            if (bufferResumeSize != DEFAULT_BUFFER_SIZE) {
                preferences["tizen:buffer:size:resume"] = bufferResumeSize;
            }
        }
        return preferences;
    };
    var storeDisplayAreaPreference = function(infoData) {
        if (infoData != null && infoData.display != null && infoData.display.area != null) {
            TVXServices.storage.set("tizen:display:area", infoData.display.area);
        }
    };
    var storeDisplayModePreference = function(infoData) {
        if (infoData != null && infoData.display != null && infoData.display.mode != null) {
            TVXServices.storage.set("tizen:display:mode", infoData.display.mode);
        }
    };
    var storeSubtitleSilentPreference = function(infoData) {
        if (infoData != null && infoData.subtitle != null) {
            TVXServices.storage.set("tizen:subtitle:silent", infoData.subtitle.silent === true);
        }
    };
    var storeSubtitleHiddenPreference = function(infoData) {
        if (infoData != null && infoData.subtitle != null) {
            TVXServices.storage.set("tizen:subtitle:hidden", infoData.subtitle.hidden === true);
        }
    };
    var storeBufferTimeoutPreference = function(infoData) {
        if (infoData != null && infoData.buffer != null) {
            TVXServices.storage.set("tizen:buffer:timeout", TVXTools.strToNum(infoData.buffer.timeout, DEFAULT_BUFFER_TIMEOUT));
        }
    };
    var storeBufferInitSizePreference = function(infoData) {
        if (infoData != null && infoData.buffer != null && infoData.buffer.size != null) {
            TVXServices.storage.set("tizen:buffer:size:init", TVXTools.strToNum(infoData.buffer.size.init, DEFAULT_BUFFER_SIZE));
        }
    };
    var storeBufferResumeSizePreference = function(infoData) {
        if (infoData != null && infoData.buffer != null && infoData.buffer.size != null) {
            TVXServices.storage.set("tizen:buffer:size:resume", TVXTools.strToNum(infoData.buffer.size.resume, DEFAULT_BUFFER_SIZE));
        }
    };
    var storePreferences = function(infoData, runtime) {
        storeDisplayAreaPreference(infoData);
        storeDisplayModePreference(infoData);
        storeSubtitleSilentPreference(infoData);
        storeSubtitleHiddenPreference(infoData);
        storeBufferTimeoutPreference(infoData);
        if (runtime !== true) {
            storeBufferInitSizePreference(infoData);
            storeBufferResumeSizePreference(infoData);
        }
    };
    var applyPreferences = function(properties, runtime) {
        if (properties != null) {
            var preferences = getPreferences(runtime);
            for (var preference in preferences) {
                properties[preference] = preferences[preference];
            }
        }
    };
    var commitPreferences = function(runtime) {
        var preferences = getPreferences(runtime);
        for (var preference in preferences) {
            TVXInteractionPlugin.executeAction("player:commit:message:" + preference + ":" + preferences[preference]);
        }
    };
    var pushToArray = function(array, items) {
        if (array != null && items != null) {
            if (Array.isArray(items)) {
                for (var i = 0; i < items.length; i++) {
                    array.push(items[i]);
                }
            } else {
                array.push(items);
            }
        }
    };
    var getValueLabel = function(value) {
        if (typeof value == "string") {
            return TVXTools.strFullCheck(value, "-");
        }
        return value != null ? TVXTools.strValue(value) : "-";
    };
    var getPropertyLabel = function(value, unit) {
        if (TVXTools.isFullStr(value) && value.indexOf("|") >= 0) {
            return value.split("|")[0];
        }
        if (value != null) {
            if (unit != null) {
                return value + " " + unit;
            }
            return TVXTools.strValue(value);
        }
        return "Unknown";
    };
    var getPropertyValue = function(value) {
        if (TVXTools.isFullStr(value) && value.indexOf("|") >= 0) {
            value = value.split("|")[1];
        }
        if (TVXTools.isFullStr(value) && value.indexOf("num:") == 0) {
            return TVXTools.strToNum(value.substr(4));
        }
        return value;
    };
    var getTrackLabel = function(track) {
        if (track != null) {
            if (TVXTools.isFullStr(track.label)) {
                return track.label;
            } else {
                var prefix = "Track " + track.index;
                var suffix = track.info != null ? track.info.language : null;//Audio track
                if (suffix == null) {
                    suffix = track.info != null ? track.info.track_lang : null;//Text track
                }
                return TVXTools.isFullStr(suffix) ? prefix + " (" + suffix + ")" : prefix;
            }
        }
        return "None";
    };
    var createPropertyControls = function(y, propertyIcon, propertyLabel, propertyKey, propertyValue, propertyUnit, availableValues, nextButton, interaction, retune) {
        var panelItems = [];
        var selectedPropertyValue = getPropertyValue(propertyValue);
        var selectedPropertyLabel = getPropertyLabel(propertyValue, propertyUnit);
        var firstPropertyValue = null;
        var nextPropertyValue = null;
        var selectNext = false;
        var commitAction = "[invalidate:content|back|" + (interaction ? "interaction" : "player") + ":commit]";
        var completeAction = "[reload:content" + (retune ? "|player:auto:goto:current" : "") + "]";
        if (availableValues != null) {
            for (var i = 0; i < availableValues.length; i++) {
                var value = getPropertyValue(availableValues[i]);
                var label = getPropertyLabel(availableValues[i], propertyUnit);
                var selected = value === selectedPropertyValue;
                if (firstPropertyValue == null) {
                    firstPropertyValue = value;
                }
                if (selected) {
                    selectNext = true;
                    selectedPropertyLabel = label;
                } else if (selectNext) {
                    selectNext = false;
                    nextPropertyValue = value;
                }
                panelItems.push({
                    focus: selected,
                    extensionIcon: selected ? "check" : "blank",
                    label: label,
                    action: selected ? "back" : commitAction,
                    data: {
                        key: propertyKey,
                        value: value,
                        action: completeAction
                    }
                });
            }
        }
        if (nextPropertyValue == null) {
            nextPropertyValue = firstPropertyValue;
        }
        return [{
                enable: panelItems.length > 0,
                type: "control",
                layout: "0," + y + "," + (nextButton ? "7,1" : "8,1"),
                icon: propertyIcon,
                label: propertyLabel,
                extensionLabel: selectedPropertyLabel,
                action: "panel:data",
                data: {
                    headline: propertyLabel,
                    compress: panelItems.length > 6,
                    template: {
                        type: "control",
                        enumerate: false,
                        layout: panelItems.length > 8 ? "0,0,5,1" : panelItems.length > 6 ? "0,0,10,1" : "0,0,8,1"
                    },
                    items: panelItems
                }
            }, {
                display: nextButton,
                enable: nextPropertyValue != null,
                type: "button",
                icon: "navigate-next",
                iconSize: "small",
                layout: "7," + y + ",1,1",
                action: commitAction,
                data: {
                    key: propertyKey,
                    value: nextPropertyValue,
                    action: completeAction
                }
            }];
    };
    var createTrackControl = function(y, propertyIcon, propertyLabel, propertyKey, currentTrack, availableTracks, silentTrack) {
        var panelItems = [];
        var commitAction = "[invalidate:content|back|player:commit]";
        var completeAction = "reload:content";
        if (availableTracks != null && availableTracks.length > 0 && silentTrack != null) {
            if (silentTrack.selected) {
                currentTrack = silentTrack;
            }
            panelItems.push({
                focus: silentTrack.selected,
                extensionIcon: silentTrack.selected ? "check" : "blank",
                label: getTrackLabel(silentTrack),
                action: silentTrack.selected ? "back" : commitAction,
                data: {
                    key: silentTrack.key,
                    value: silentTrack.value,
                    action: completeAction
                }
            });
        }
        if (availableTracks != null) {
            for (var i = 0; i < availableTracks.length; i++) {
                var track = availableTracks[i];
                var selected = track.index === (currentTrack != null ? currentTrack.index : -1);
                panelItems.push({
                    focus: selected,
                    extensionIcon: selected ? "check" : "blank",
                    label: getTrackLabel(track),
                    action: selected ? "back" : commitAction,
                    data: {
                        key: propertyKey,
                        value: track.index,
                        action: completeAction
                    }
                });
            }
        }
        return {
            enable: panelItems.length > 0,
            type: "control",
            layout: "0," + y + ",8,1",
            icon: propertyIcon,
            label: propertyLabel,
            extensionLabel: getTrackLabel(currentTrack),
            action: "panel:data",
            data: {
                headline: propertyLabel,
                compress: panelItems.length > 6,
                template: {
                    type: "control",
                    enumerate: false,
                    layout: panelItems.length > 8 ? "0,0,5,1" : panelItems.length > 6 ? "0,0,10,1" : "0,0,8,1"
                },
                items: panelItems
            }
        };
    };
    var createControlItems = function(infoData) {
        var items = [];
        pushToArray(items, createPropertyControls(0, "featured-video", "Display Area", "tizen:display:area",
                infoData && infoData.display != null ? infoData.display.area : null, null, [
                    "21x9|0,0.119,1,0.762",
                    "16x9 (Default)|0,0,1,1",
                    "4x3|0.125,0,0.75,1"
                ], true, false, false));
        pushToArray(items, createPropertyControls(1, "aspect-ratio", "Display Mode", "tizen:display:mode",
                infoData != null && infoData.display != null ? infoData.display.mode : null, null, [
                    "Fit Screen (Default)|PLAYER_DISPLAY_MODE_LETTER_BOX",
                    "Fill Screen|PLAYER_DISPLAY_MODE_FULL_SCREEN",
                    "Auto Aspect Ratio|PLAYER_DISPLAY_MODE_AUTO_ASPECT_RATIO"
                ], true, false, false));
        pushToArray(items, createPropertyControls(2, "av-timer", "Buffer Timeout", "tizen:buffer:timeout",
                infoData != null && infoData.buffer != null ? infoData.buffer.timeout : null, "sec", [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, "20 sec (Default)|num:20", 25, 30, 40
                ], false, false, false));
        pushToArray(items, createPropertyControls(3, "timelapse", "Buffer Size (Init)", "tizen:buffer:size:init",
                bufferSizesEnabled ? getBufferInitSizePreference() :
                infoData != null && infoData.buffer != null && infoData.buffer.size != null ? infoData.buffer.size.init : null, "sec",
                bufferSizesEnabled ? [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10 sec (Default)|num:10", 15, 20, 25, 30, 40
                ] : null, false, bufferSizesEnabled, bufferSizesEnabled));
        pushToArray(items, createPropertyControls(4, "timelapse", "Buffer Size (Resume)", "tizen:buffer:size:resume",
                bufferSizesEnabled ? getBufferResumeSizePreference() :
                infoData != null && infoData.buffer != null && infoData.buffer.size != null ? infoData.buffer.size.resume : null, "sec",
                bufferSizesEnabled ? [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10 sec (Default)|num:10", 15, 20, 25, 30, 40
                ] : null, false, bufferSizesEnabled, bufferSizesEnabled));
        pushToArray(items, createTrackControl(5, "audiotrack", "Audio Track", "tizen:track:audio",
                infoData != null && infoData.stream != null ? infoData.stream.audio : null,
                infoData != null && infoData.tracks != null ? infoData.tracks.audio : null,
                null));
        pushToArray(items, createTrackControl(6, "subtitles", "Text Track", "tizen:track:text",
                infoData != null && infoData.stream != null ? infoData.stream.text : null,
                infoData != null && infoData.tracks != null ? infoData.tracks.text : null,
                {
                    index: -1,
                    selected: infoData != null && infoData.subtitle != null && infoData.subtitle.silent === true,
                    label: "None",
                    key: "tizen:subtitle:silent",
                    value: true
                }));
        return items;
    };
    var createInfoItems = function(infoData) {
        var infoKeys = "-";
        var infoValues = "-";
        if (infoData != null) {
            infoKeys = "Version:{br}State:{br}{br}";
            infoValues = getValueLabel(infoData.version) + "{br}" +
                    getValueLabel(infoData.state) + "{br}{br}";
            if (infoData.stream != null) {
                if (infoData.stream.video != null && infoData.stream.video.info != null) {
                    for (var key in infoData.stream.video.info) {
                        infoKeys += "Video [" + key + "]:{br}";
                        infoValues += getValueLabel(infoData.stream.video.info[key]) + "{br}";
                    }
                    infoKeys += "{br}";
                    infoValues += "{br}";
                }
                if (infoData.stream.audio != null && infoData.stream.audio.info != null) {
                    for (var key in infoData.stream.audio.info) {
                        infoKeys += "Audio [" + key + "]:{br}";
                        infoValues += getValueLabel(infoData.stream.audio.info[key]) + "{br}";
                    }
                    infoKeys += "{br}";
                    infoValues += "{br}";
                }
                if (infoData.stream.text != null && infoData.stream.text.info != null) {
                    for (var key in infoData.stream.text.info) {
                        infoKeys += "Text [" + key + "]:{br}";
                        infoValues += getValueLabel(infoData.stream.text.info[key]) + "{br}";
                    }
                }
            }
        }
        return [{
                type: "space",
                layout: "8,0,3,8",
                offset: "0.25,0,0,0",
                truncation: "text",
                text: infoKeys
            }, {
                type: "space",
                layout: "11,0,5,8",
                offset: "0.25,0,-0.25,0",
                truncation: "text",
                text: "{col:msx-white}" + infoValues,
                live: {
                    type: "airtime",
                    duration: 2000,
                    over: {
                        action: "reload:content"
                    }
                }
            }];
    };
    var createContentItems = function(infoData) {
        var items = [];
        pushToArray(items, createControlItems(infoData));
        pushToArray(items, createInfoItems(infoData));
        return items;
    };
    var createContent = function(infoData) {
        //Note: Only store runtime preferences
        storePreferences(infoData, true);
        return {
            cache: false,
            compress: true,
            type: "pages",
            headline: "Tizen Player",
            extension: TVXServices.urlParams.getNum("debug", 0) == 1 ? "{ico:msx-white:timer} " + TVXDateTools.getTimestamp() : null,
            pages: [{
                    items: createContentItems(infoData)
                }]
        };
    };
    var createWarningContent = function(playerInfo) {
        return {
            type: "pages",
            headline: "Tizen Player",
            pages: [{
                    items: [{
                            type: "default",
                            layout: "0,0,12,6",
                            color: "msx-glass",
                            headline: "{ico:msx-yellow:warning} Player Not Available",
                            text: "Tizen player is required for this plugin. Current player is: {txt:msx-white:" + TVXTools.strFullCheck(playerInfo, "unknown") + "}."
                        }]
                }]
        };
    };
    var createDummyData = function() {
        return {
            version: "1.0",
            state: "PLAYING",
            display: {
                area: "0,0,1,1",
                mode: "PLAYER_DISPLAY_MODE_LETTER_BOX"
            },
            buffer: {
                timeout: 20,
                size: {
                    init: 10,
                    resume: 10
                }
            },
            subtitle: {
                delay: 0,
                silent: false,
                hidden: false,
                type: "html",
                url: null
            },
            stream: {
                video: {
                    index: 0,
                    info: {
                        fourCC: "h264",
                        Width: 1280,
                        Height: 720,
                        Bit_rate: 128000
                    }
                }
            }
        };
    };
    var checkPlayer = function(playerInfo) {
        return TVXTools.isFullStr(playerInfo) && (playerInfo == "tizen" || playerInfo.indexOf("tizen/") == 0);
    };
    var handleMessage = function(playerInfo, message) {
        if (TVXTools.isFullStr(message)) {
            if (message == "preferences") {
                if (checkPlayer(playerInfo)) {
                    //Note: Only commit runtime preferences
                    commitPreferences(true);
                }
                return true;
            } else if (message.indexOf("tizen:buffer:size:init:") == 0) {
                storeBufferInitSizePreference({buffer: {size: {init: message.substr(23)}}});
                return true;
            } else if (message.indexOf("tizen:buffer:size:resume:") == 0) {
                storeBufferResumeSizePreference({buffer: {size: {resume: message.substr(25)}}});
                return true;
            }
        }
        return false;
    };
    var handleData = function(playerInfo, data) {
        if (data != null) {
            if (TVXTools.isFullStr(data.message)) {
                return handleMessage(playerInfo, data.message);
            } else if (data.data != null && TVXTools.isFullStr(data.data.key)) {
                if (data.data.key == "tizen:buffer:size:init") {
                    storeBufferInitSizePreference({buffer: {size: {init: data.data.value}}});
                    TVXInteractionPlugin.executeAction(data.data.action);
                    return true;
                } else if (data.data.key == "tizen:buffer:size:resume") {
                    storeBufferResumeSizePreference({buffer: {size: {resume: data.data.value}}});
                    TVXInteractionPlugin.executeAction(data.data.action);
                    return true;
                }
            }
        }
        return false;
    };
    var handleRequest = function(playerInfo, dataId, callback) {
        if (TVXTools.isFullStr(dataId)) {
            if (dataId == "init") {
                if (checkPlayer(playerInfo)) {
                    TVXInteractionPlugin.requestPlayerResponse("tizen:info", function(data) {
                        callback(createContent(data.response != null && data.response.tizen != null ? data.response.tizen.info : null));
                    });
                } else {
                    callback(createWarningContent(playerInfo));
                }
                return true;
            } else if (dataId == "dummy") {
                callback(createContent(createDummyData()));
                return true;
            }
        }
        return false;
    };
    this.enableBufferSizes = function() {
        bufferSizesEnabled = true;
    };
    this.disableBufferSizes = function() {
        bufferSizesEnabled = false;
    };
    this.areBufferSizesEnabled = function() {
        return bufferSizesEnabled;
    };
    this.checkPlayer = function(playerInfo) {
        return checkPlayer(playerInfo);
    };
    this.init = function() {
        if (infoBaseData == null && !readyService.isBusy()) {
            readyService.start();
            TVXInteractionPlugin.requestData("info:base", function(data) {
                infoBaseData = data.info;
                readyService.stop();
            });
        }
    };
    this.getPreferences = function(runtime) {
        return getPreferences(runtime);
    };
    this.applyPreferences = function(properties) {
        //Note: Only apply runtime preferences if buffer sizes are not enabled
        applyPreferences(properties, !bufferSizesEnabled);
    };
    this.handleMessage = function(playerInfo, message) {
        return handleMessage(playerInfo, message);
    };
    this.handleMessageFull = function(message) {
        this.init();
        readyService.onReady(function() {
            handleMessage(infoBaseData != null ? infoBaseData.player : null, message);
        });
    };
    this.handleData = function(playerInfo, data) {
        return handleData(playerInfo, data);
    };
    this.handleDataFull = function(data) {
        this.init();
        readyService.onReady(function() {
            handleData(infoBaseData != null ? infoBaseData.player : null, data);
        });
    };
    this.handleRequest = function(playerInfo, dataId, callback) {
        return handleRequest(playerInfo, dataId, callback);
    };
    this.handleRequestFull = function(dataId, callback) {
        this.init();
        readyService.onReady(function() {
            if (!handleRequest(infoBaseData != null ? infoBaseData.player : null, dataId, callback)) {
                callback();
            }
        });
    };
}
/******************************************************************************/