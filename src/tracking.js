String.prototype.replaceAll = function(str1, str2, ignore) {
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

window.track = (function(){

    var settings = {
        "anonymizeip": false,
        "phsrid": null,
        "debug": false
    };

    var result = {};

    function log(string) {
        if(settings.debug) {
            console.log(string);
        }
    }

    function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');

            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    }

    function generateRandomNumber() {
        return 'R' + Math.floor((Math.random() * 1000) + 1);
    }

    function getCurrentTimestamp () {
        result['timestamp'] = new Date();
        checkForCompleteResult();
    }

    function getCurrentURL () {
        result['url'] = window.location.href;
        checkForCompleteResult();
    }

    function fetchCurrentUserID () {
        var userID = getUrlParameter('user') || generateRandomNumber();
        localStorage.setItem("userid", userID);
        result['userID'] = userID;
        checkForCompleteResult();
    }

    function getCurrentUserID () {
        var userid = getUrlParameter('user') || localStorage.getItem('userid');
        if(userid !== null) {
            result['userID'] = userid;
            checkForCompleteResult();
        } else {
            fetchCurrentUserID();
        }
    }

    function getCurrentUUID () {
        var uuid = getUrlParameter('uuid');
        if(uuid === null) {
            uuid = -1;
        }
        result['uuid'] = uuid;
        checkForCompleteResult();
    }

    function getGroupID () {
        var groupid = getUrlParameter('group');
        if(groupid === null) {
            groupid = -1;
        }
        result['groupID'] = groupid;
        checkForCompleteResult();
    }

    function getCurrentBrowser () {
        var ua= navigator.userAgent, tem,
            M= ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if(/trident/i.test(M[1])){
            tem=  /\brv[ :]+(\d+)/g.exec(ua) || [];
            return 'IE '+(tem[1] || '');
        }
        if(M[1]=== 'Chrome'){
            tem= ua.match(/\b(OPR|Edge)\/(\d+)/);
            if(tem!= null) return tem.slice(1).join(' ').replace('OPR', 'Opera');
        }
        M= M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
        if((tem= ua.match(/version\/(\d+)/i))!= null) M.splice(1, 1, tem[1]);
        result['browser'] =  M.join(' ');
        checkForCompleteResult();
    }

    function getCurrentOperatingSystem () {
        var OSName="Unknown OS";
        if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
        if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
        if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
        if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
        result['os'] =  OSName;
        checkForCompleteResult();
    }

    function getCurrentIpAddress () {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '//freegeoip.net/json/');
        xhr.onload = function() {
            if (xhr.status === 200) {
                result['ip'] =  JSON.parse(xhr.responseText).ip;
                checkForCompleteResult();
            }
            else {
                return 'not defined';
            }
        };
        xhr.send();
    }

    function prepareFormSubmit() {
        var allForms = document.querySelectorAll('[data-conversion]');

        allForms.forEach(function(el) {
            el.onsubmit = function(event) {
                event.preventDefault();
                var formResult = {
                    'mailingid' : result.mailingid,
                    'timestamp': result.timestamp,
                    'userID': result.userID,
                    'conversion': el.dataset.conversion,
                    'groupID': result.groupID,
                    'uuid': result.uuid
                };

                if(el.dataset.fields) {
                    var fieldData = {};
                    var fields = JSON.parse((el.dataset.fields).replaceAll("'", '"'));
                    Object.keys(fields).forEach(function(key) {
                        fieldData[key] = document.getElementById(fields[key]).value;
                    });
                    formResult["fieldData"] = JSON.stringify(fieldData);
                }

                var xhr = new XMLHttpRequest();
                xhr.open("POST", settings['phsrserver'] + '/tracking/webconversion');
                xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
                var that = this;
                xhr.onreadystatechange = function() {
                    that.submit();
                }
                xhr.send(JSON.stringify(formResult));
            }
        });
    }

    function generateDataReport() {
        getCurrentTimestamp();
        getCurrentURL();
        getCurrentBrowser();
        getCurrentOperatingSystem();
        getCurrentUserID();
        getGroupID();
        getCurrentUUID();

        if(!settings.anonymizeip) {
            getCurrentIpAddress();
        }
    }

    function checkForCompleteResult() {
        if((!!result['ip'] || settings.anonymizeip == true) && !!result['userID'] && !!result['timestamp'] && !!result['browser'] && !!result['os'] && !!result['phsrid'] && !!result['url'] && !!result['mailingid'] && !!result['groupID'] && !!result['uuid']) {

            log('firing request! Containing data:')
            log(result)
            //AJAX post here.
            var xhr = new XMLHttpRequest();
            xhr.open('POST', settings['phsrserver'] + '/tracking/webvisit');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function() {
                if (xhr.status === 200) {
                    log("success");
                }
                else if (xhr.status !== 200) {
                    log("fail");
                }
            };
            xhr.send(JSON.stringify(result));
        }
    }

    var track = {
        go: function (json) {
            for(var key in json) settings[key] = json[key];
            result['phsrid'] = settings['phsrid'];
            result['mailingid'] = settings['mailingid'];
            generateDataReport();
            prepareFormSubmit();
        }
    };

    return track;
}());

track.go(settings);
