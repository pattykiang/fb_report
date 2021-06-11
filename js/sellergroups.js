var sellergroupscontainer = function () {
    var allOrderData;
    var _loadingScript = function () {
        $.getScript('https://apis.google.com/js/api.js', e => {

            gapi.load('client:auth2', initClient);

            function initClient() {
                gapi.client.init({
                    apiKey: 'AIzaSyD4hGbOoiXV2-cd-xeWxTQEXMTCx9TIQkU',
                    clientId: '115711815249-ajondlmmv7tge96vsittjgcllphlh898.apps.googleusercontent.com',
                    discoveryDocs: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
                    scope: "https://www.googleapis.com/auth/spreadsheets"
                }).then(function () {
                    // Listen for sign-in state changes.
                    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

                    // Handle the initial sign-in state.
                    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
                    $('#google_auth .auth').on('click', e => {
                        gapi.auth2.getAuthInstance().signIn();
                    });
                    // authorizeButton.onclick = handleAuthClick;
                    $('#google_auth .signout').on('click', e => {
                        gapi.auth2.getAuthInstance().signOut();
                    });
                    // signoutButton.onclick = handleSignoutClick;
                }, function (error) {
                    function appendPre(message) {
                        var pre = document.getElementById('content');
                        var textContent = document.createTextNode(message + '\n');
                        pre.appendChild(textContent);
                    }
                    appendPre(JSON.stringify(error, null, 2));
                });
            }

            /**
             *  Called when the signed in status changes, to update the UI
             *  appropriately. After a sign-in, the API is called.
             */

            function updateSigninStatus(isSignedIn) {
                if (isSignedIn) {
                    $('#google_auth .auth').css('display', 'none');
                    $('#google_auth .signout').css('display', 'block');
                    // authorizeButton.style.display = 'none';
                    // signoutButton.style.display = 'block';
                    //listMajors();
                } else {
                    $('#google_auth .auth').css('display', 'block');
                    $('#google_auth .signout').css('display', 'none');
                    // authorizeButton.style.display = 'block';
                    // signoutButton.style.display = 'none';
                }
            }


        });

    }();
    var _init = function (mode) {
        if (extendData.ajaxObject[mode] && !extendData.isForceReload) {
            extendData.order_data = extendData.ajaxObject[mode];
            $('#landingPage').hide();
            return
        }
        $(document).on('ajaxSend', function (t, e, setting) {
            
            returndebugger
            // var isPass = (setting.url.indexOf('status=ALL&vendor=ALL') > -1) ? true : false;
            e.done(function (t) {
                if (isPass) {
                    $(document).off('ajaxSend');

                    var googleSyncInfo = [];
                    t.data.map(e => {
                        e.styles.map(order => {
                            var _no = (order.style_no) ? order.style_no : e.product_no;

                            googleSyncInfo.push([order.title, order.style, _no, e.product_vendor, order.need_order]);

                            // googleSyncInfo.push([e.title, e.product_vendor, e.product_no,e.need_order]);
                        })
                    })


                    //更新資料
                    var params = {
                        spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                        range: 'iplusonego_sync!K2:O',
                        valueInputOption: 'RAW',
                    };

                    var valueRangeBody = {
                        "values": googleSyncInfo
                    };

                    var request = gapi.client.sheets.spreadsheets.values.update(params, valueRangeBody);
                    request.then(function (response) {
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });

                    params.range = 'iplusonego_sync!P1:P1';
                    var request2 = gapi.client.sheets.spreadsheets.values.update(params, {
                        "values": [
                            [(new Date).toLocaleDateString() + " " + (new Date).toLocaleTimeString()]
                        ]
                    });
                    request2.then(function (response) {
                        alert('已更新「訂貨管理表單」');
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });


                    // data_process.init();
                    // data_process.initToUI();
                    $('#landingPage').hide();
                }
            })
        });
    }

    var processData = function () {}
    return {
        landing: function () {
            _init();
        }
    }
}();