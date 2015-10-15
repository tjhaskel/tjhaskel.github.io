(function ($) {
    $.fn.LabMap = function (options) {
        // since the user might be trying to get the existing LabMap instance, get what is already stored in the dom element
        var storedSettings = $(this).data('labMapSettings');

        // extend the defaults, storedSettings and new options
        var settings = $.extend({
            domain: 'https://online.labstats.com',
            mapId: 0,
            authId: '00000000-0000-0000-0000-000000000000',
            iconPath: '/Images/ComputerIcons/',
            appPathRoot: '/PublicFiles/File/',
            getPath: '/api/public/GetMap/',
            refreshRate: 30,
            drawn: false,
            offlineAsAvailable: false,
            update: true
        }, storedSettings, options);
        
        // set the appPath, don't allow the refresh below 30 seconds
        settings.appPath = settings.domain + settings.appPathRoot + settings.authId + "/";
        if (settings.refreshRate > 30) settings.refreshRate = 30;

        // store the settings... see if we can get away with one data-object

        // layer for the placed objects
        var $pieces;

        // basic map settings that need to be available
        var mapScale = 1;
        var mapLabel = 'none';
        var mapShowOS = true;
        var mapFontSize = 12;

        // set up $self for access in other methods
        var $self = $(this);

        // a flag indicating if the map is currently drawn or not
        var drawn = false;

        /* ==================== METHODS ==================== */
        // method do draw the custom files
        var drawFile = function (customFile) {
            var img = new Image();
            img.src = settings.appPath + customFile.CustomerFileId;
            img.onload = function () {
                imgWidth = this.width;
                imgHeight = this.height;
                var $div = $('<div>')
                            .attr('id', 'file_' + customFile.Id)
                            .addClass('custom-file')
                            .css('width', imgWidth)
                            .css('height', imgHeight)
                            .css('left', customFile.X - 10)
                            .css('top', customFile.Y - 10)
                            .css('background-image', "URL('" + $(this).attr("src") + "')")
                            .appendTo($pieces);
                if (customFile.Flip) $div.addClass('flip');
                customFile.Rotate > 0 ? $div.addClass('r' + customFile.Rotate) : $div.addClass('r0')
            }
        }

        // method to draw a station
        var drawStation = function (station) {
            if (station.Shape == "") station.Shape = "Default";
            if (station.status == "" || station.status == null) station.status = "Offline";
            var stationSize = 32 * mapScale;
            var osIconSize = 15 * mapScale;

            // alter the status if offline stations should be showing as available
            if (settings.offlineAsAvailable && station.Status == "Offline") {
                station.Status = "PoweredOn";
            }

            // Draw the Station
            var backgroundCss = "transparent URL('" + settings.domain + settings.iconPath + (station.Shape == "Default" ? station.Icon : station.Shape) + '-' + station.Status + '.png' + "') no-repeat 0 0 / " + stationSize + 'px ' + stationSize + 'px';
            var $station = $('<div>')
                .attr('id', 'sta_' + station.Id)
                .addClass('station')
                .addClass('r' + station.Rotate)
                .css('left', station.X)
                .css('top', station.Y)
                .css('width', stationSize)
                .css('height', stationSize)
                .css('background', backgroundCss)
                .appendTo($pieces);
            if (station.Flip) $station.addClass('flip');

            // Draw the Label
            if (mapLabel != 'none') {
                $label = $('<div>').addClass('station-label').css('font-size', mapFontSize);
                switch (mapLabel) {
                    case 'StationName':
                        $label.html(station.StationName == '' ? station.HostName : station.StationName);
                        break;
                    case 'HostName':
                        $label.html(station.HostName);
                        break;
                    case 'IpAddress':
                        $label.html(station.IpAddresses);
                        break;
                    default:
                        break;
                }
                var labelX = (station.X - 64) + (stationSize / 2);
                var labelY = (station.Y + stationSize);
                $label.css('left', labelX).css('top', labelY).insertAfter($station);
            }

            // Draw the OS
            if (mapShowOS) {
                var os = $("<img>");
                var osX = Math.round(station.X + (stationSize * .6)) + 'px';
                var osY = Math.round(station.Y - (stationSize * .1)) + 'px';
                $(os)
                    .attr('src', settings.domain + settings.iconPath + 'OsIcons/' + station.Os + '.png')
                    .addClass('os-image')
                    .css('height', osIconSize)
                    .css('width', osIconSize)
                    .css('position', 'absolute')
                    .css('left', osX)
                    .css('top', osY)
                    .insertAfter($station);
            }
        }

        // method to draw a map (from object)
        var drawMap = function (map) {
            // clear out any old map that might be there
            $self.children().remove();

            // add the pieces element
            $pieces = $('<div>').attr('id', 'the-pieces').css('width', map.Width).css('height', map.Height).appendTo($self);

            // set the properties
            $self.css('width', map.Width).css('height', map.Height).css('background-color', map.BackColor).css('color', map.ForeColor);

            // if there is a background image, set it
            if (map.CustomerFileId != null) {
                $self.css('background-image', "URL(" + settings.appPath + map.CustomerFileId + ")");
            }

            // set some of the map properties as values
            mapScale = map.Scale;
            mapLabel = map.Label;
            mapFontSize = map.FontSize;

            // draw the custom items first
            for (var i = 0; i < map.MapCustomItems.length; i++) {
                drawFile(map.MapCustomItems[i]);
            }

            // draw the stations next
            for (var i = 0; i < map.MapStations.length; i++) {
                drawStation(map.MapStations[i]);
            }

            // Set the Flag
            settings.drawn = true;
        }

        // Get the map
        var getMap = function () {
            $.ajax({
                url: settings.domain + settings.getPath + settings.mapId,
                headers: { "Authorization": settings.authId }
            }).done(function (map) {
                drawMap(map);
            }).fail(function () {
                console.log('failed to get the map'); // TODO: Replace this, shouldn't force a user interaction
            });
        }

        var saveState = function () {
            $self.data('labMapSettings', settings);
        }
        /* ==================== END METHODS ==================== */

        //if (!settings.drawn) {

        if (settings.update == true) {
            if (!settings.drawn) {
                getMap();
            }
            setInterval(function () {
                getMap();
            }, settings.refreshRate * 1000);
        } else {
            getMap();
        }
        //}

        saveState();

        
    }
})(jQuery);