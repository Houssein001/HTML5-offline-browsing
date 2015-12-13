var ConnectionStatusModule = (function () {
    //check if there is an internet connection (wifi is on/off)
    function isOnline() {
        return navigator.onLine;            
    }

    window.addEventListener('online', function (e) {
       
    }, false);

    window.addEventListener('offline', function (e) {
       
    }, false);

    return {
        isOnline: isOnline
    }
})();
