var slaskIT = angular.module("slaskIT", []);

slaskIT.constant("SPREADSHEET_URL", "https://spreadsheets.google.com/feeds/list/1p1ETuEGcyLpj_kvv7LUroEgTL8ZC7h3XI9_Tx1awBaU/o65ytag/public/values?alt=json-in-script&callback=JSON_CALLBACK");

slaskIT.filter("googleMapsUrl", function () {
    return function (event) {
        var place = [event.gsx$adres.$t, event.gsx$miasto.$t].join(", ");

        return "https://www.google.pl/maps/place/" + encodeURIComponent(place);
    };
});

slaskIT.filter("googleCalendarUrl", function () {
    return function (event) {
        var start,
            location = [event.gsx$adres.$t, event.gsx$miasto.$t].join(", ");

        // YYYY-MM-DD HH:MM:SS format is not supported natively e.g. by Firefox
        start = moment(event.gsx$data.$t).toISOString().replace(/[-:]/g, "").replace(/.\d\d\dZ/, "Z");

        return ""
            + "https://www.google.com/calendar/render?action=TEMPLATE"
            + "&text=" + encodeURIComponent(event.gsx$nazwa.$t)
            + "&dates=" + encodeURIComponent(start) + "/" + encodeURIComponent(start)
            + "&details=" + encodeURIComponent("Szczegóły wydarzenia: " + event.gsx$linkdostrony.$t)
            + "&location=" + encodeURIComponent(location)
            + "&sf=true&output=xml";
    };
});

slaskIT.controller("EventsController", function ($scope, $http, SPREADSHEET_URL) {
    $scope.fetch = function () {
        $http.jsonp(SPREADSHEET_URL).then(function (response) {
            $scope.days = {};
            $scope.loaded = true;

            response.data.feed.entry
            .filter(function (event) {
                return moment(event.gsx$data.$t).isAfter(moment()) && event.gsx$zatwierdzono.$t === "tak";
            })
            .sort(function (a, b) {
                return moment(a.gsx$data.$t).diff(moment(b.gsx$data.$t));
            })
            .forEach(function (event) {
                var day = event.gsx$data.$t.substr(0, 10);
                var days = $scope.days[day] || ($scope.days[day] = []);

                days.push(event);
                event.date = event.gsx$data.$t.replace(" ", "T");
            });
        });
    };

    $scope.fetch();
});
