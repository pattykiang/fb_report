var mainOrdercontainer = function () {
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
            // data_process.init();
            // data_process.initToUI();
            $('#landingPage').hide();
            return
        }
        $(document).on('ajaxSend', function (t, e, setting) {
            var isPass = (setting.url.indexOf('status=ALL&vendor=ALL') > -1) ? true : false;
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
                        range: 'SYNC_iplusonego!K2:O',
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

                    params.range = 'SYNC_iplusonego!P1:P1';
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
        // vue_progressbar.init($("#searchDateS").val() + ' 00:00:00', $("#searchDateE").val() + ' 23:59:59');

    }
    // $(document).on('ajaxSend', function (t, e, n) {
    //     e.done(function (t) {
    //         if (t) {
    //             allOrderData = t;
    //         }
    //     })
    // });
    var processData = function () {
        var filterData = [];
        var exportData = []
        document.allOrderData = allOrderData.data;
        var o = [
            '會員名稱',
            '訂單編號',
            '訂單狀態',
            '商品名稱',
            '規格',
            '商品編號',
            '數量',
            '單價/VIP價',
            '總價',
            '訂單備註',
            '訂單留言(若有)'
        ]
        document.exportData = exportData;
        exportData.push(o);
        allOrderData.data.filter(order => {
                var today = new Date();
                var from = new Date(getDateString(today) + ' ');
                from = new Date('2020-11-17 ');
                var to = new Date(from.getTime() + 86400000);
                to = new Date('2020-11-18 ');
                var date = new Date(order.order_checked_time + " UTC");
                return (date > from && date < to) ? true : false;
            }).forEach(order => {
                //未總計
                filterData.push(order)
                // var o = {
                //     '會員名稱': '',
                //     '訂單編號': '',
                //     '訂單狀態': order.order_product_items[0].order_payment_status,
                //     '商品名稱': order.order_product_items[0].product_title,
                //     '規格': order.order_product_items[0].product_style_title,
                //     '商品編號': '',
                //     '數量': order.order_product_items[0].product_style_total_coun,
                //     '單價/VIP價': order.order_product_items[0].product_sale,
                //     '總價': order.order_orig_subtotal_price,
                //     '訂單備註': '',
                //     '訂單留言(若有)': ''
                // }
                if (order.order_product_items.length == 1) {
                    var o = ['',
                        '',
                        order.order_payment_status,
                        order.order_product_items[0].product_title,
                        order.order_product_items[0].product_style_title,
                        '',
                        order.order_product_items[0].product_style_count,
                        order.order_product_items[0].product_sale,
                        order.order_orig_subtotal_price,
                        '',
                        ''
                    ]
                    exportData.push(o);
                } else {
                    order.order_product_items.forEach(e => {
                        var o = ['',
                            '',
                            order.order_payment_status,
                            e.product_title,
                            e.product_style_title,
                            '',
                            e.product_style_count,
                            e.product_sale,
                            e.product_sale,
                            '',
                            ''
                        ]
                        exportData.push(o);
                    });
                }
            }),
            function (e, t) {
                for (var o = function (e) {
                        for (var t = "", o = 0; o < e.length; o++) {
                            var a = null === e[o] ? "" : e[o].toString();
                            e[o] instanceof Date && (a = e[o].toLocaleString());
                            var r = a.replace(/"/g, '""');
                            r.search(/("|,|\n)/g) >= 0 && (r = '"' + r + '"'), o > 0 && (t += ","), t += r
                        }
                        return t + "\n"
                    }, a = "", r = 0; r < t.length; r++) a += o(t[r]);
                var n = new Blob(["\ufeff" + a], {
                    type: "text/csv;charset=utf-8"
                });
                if (navigator.msSaveBlob) navigator.msSaveBlob(n, e);
                else {
                    var s = document.createElement("a");
                    if (void 0 !== s.download) {
                        var c = URL.createObjectURL(n);
                        s.setAttribute("href", c), s.setAttribute("download", e), s.style.visibility = "hidden", document.body.appendChild(s), s.click(), document.body.removeChild(s)
                    }
                }
            }("今日訂購商品清單_" + (new Date).toLocaleDateString().replace(/\//g, "") + "_" + (new Date).toLocaleTimeString().slice(2, 7).replace(":", "") + ".csv", exportData)
        // console.log(exportData);
        document.filterData = filterData;
    }

    return {
        landing: function () {
            // main();
            _init();
            // setTimeout(processData, 1500);
        }
    }
}();