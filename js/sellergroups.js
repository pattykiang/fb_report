var sellergroupscontainer = function () {
    var gapiIsLoading = false;
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
                    gapiIsLoading = true;
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
    var _init = function (preload, mode) {
        // if (extendData.ajaxObject[mode] && !extendData.isForceReload) {
        //     extendData.order_data = extendData.ajaxObject[mode];
        //     $('#landingPage').hide();
        //     return
        // }
        var allProduct = preload;
        var checkFunction = function () {
            var allProductInPlus = {};

            $(document).off('ajaxSend');
            //整理下載資料
            allProduct.map(e => {
                $.ajax({
                    type: "GET",
                    url: 'https://www.iplusonego.com/api/index.php/post_snapshots/post_snapshot_product_inventory/' + e.post_snapshot_id,
                    cache: false,
                    async: false,
                    headers: {
                        'X-SESSION': 'jsRHe/QDnSTVIg0+SjcPIcKjWq+/KrHW5MEMTZreo3fohTGB0Bj7cXdj2PpOfp6YOKTts+iv7QTOyMGCeXrKZkfNlWIaXefqT1kykS/Uw9niedjzky5Gme5ewwkoXgBmpC8TOsm01GbI919fHxownHS4vXq4uh7JNUocAtHv8h0kKAHhqvDgqqb5IRXi1MI37V7mL5b024CVJ2huRyJ7pNPIfQ5nxlxCClkoAVa1xnxoDHD/H1Gs/DL7k00/VH35cZ5zye5akar27w4+eNnhqHAiXo09WQ4FacsIJsQmcY096J3ew0DL9cQ6sMexnyf00d6LyWvjSfgOefSlnWHNGtZzJ+mgwFbOtoTaSoqEHmJ0k3LxdTdGUZlT/Yc49E9CBArozTJbr+5ohheBaCst+lDhHSu9xB+R7l/Hr8VgIDDPyACKsE/Txan1Sd/LE/ON9TkuBsOzoqsNYHMzoUzRhc57OtJnh8qG4vbVb48sOYDm9TSe00ZB4tMIooLSjvYQhio8WsUrAJCEy2vx7xMftQVGzGD1dfPbytwwC13JvxmgjEKu16wktR76SjAGCs2A5iMJKK3Vu+LSG7/0ZSeFQWB3cFKa1L47TlN7XgH3hEl79V3m+5gCnXk6RRolnlmF/j2o6/jjFBxxddjXOaz6zyueDT6dqJeIZG/85YvwImM='
                    },
                }).then(function (t) {
                    t.data[0].product_styles.map(s => {
                        var obj = {
                            link: 'https://www.iplusonego.com/seller/sellerorders?post_snapshot_id=' + e.post_snapshot_id,
                            product_title: t.data[0].product_title,
                            product_stlye: s.style,
                            price_vvip: s.vvip,
                            price_vip: s.vip,
                            price_sale: s.sale,
                            price_orig: s.orig
                        };
                        allProductInPlus[t.data[0].product_title + '-' + s.style] = obj;
                    })
                });
            });
            //下載資料
            var allProductInSheet = [];

            function getSheetData() {
                gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                    range: '報表_商品成本!A2:F',
                }).then(function (response) {
                    var range = response.result;
                    if (range.values.length > 0) {
                        for (i = 0; i < range.values.length; i++) {
                            var _row = range.values[i];
                            var _title = (_row[0]) ? _row[0] : '';
                            var _style = (_row[1]) ? _row[1] : '';
                            var _price_orig = (_row[2]) ? Number(_row[2]) : '';
                            var _price_vvip = (_row[3]) ? Number(_row[3]) : '';
                            var _price_vip = (_row[4]) ? Number(_row[4]) : '';
                            var _price_sale = (_row[5]) ? Number(_row[5]) : '';

                            var obj = {
                                product_title: _title,
                                product_stlye: _style,
                                price_vvip: _price_vvip,
                                price_vip: _price_vip,
                                price_sale: _price_sale,
                                price_orig: _price_orig
                            };

                            allProductInSheet.push(obj);
                        }
                    }
                    //比對資料
                    // console.log('allProductInIPlus', allProductInPlus);
                    // console.log('allProductInSheet', allProductInSheet);
                    var classifyProduct = {
                        diffPriceProduct: [],
                        oldProduct: [],
                        sameProduct: [],
                        updateProduct: [],
                        updateProductLastRow: 0
                    };
                    classifyProduct.updateProductLastRow = range.values.length + 2;

                    allProductInSheet.map(e => {
                        //找與系統差異動，顯示。待更新系統
                        //allProductInIPlus.map(systemItem => {
                        var product_key = e.product_title + '-' + e.product_stlye;
                        var objProductInPlus = allProductInPlus[product_key];
                        if (objProductInPlus) {

                            if (e.price_orig == objProductInPlus.price_orig &&
                                e.price_sale == objProductInPlus.price_sale &&
                                e.price_vip == objProductInPlus.price_vip &&
                                e.price_vvip == objProductInPlus.price_vvip) {
                                //完全一致
                                classifyProduct.sameProduct.push(objProductInPlus);
                            } else {
                                //商品價格不一致
                                objProductInPlus['sheet_price_orig'] = e.price_orig;
                                objProductInPlus['sheet_price_sale'] = e.price_sale;
                                objProductInPlus['sheet_price_vip'] = e.price_vip;
                                objProductInPlus['sheet_price_vvip'] = e.price_vvip;
                                classifyProduct.diffPriceProduct.push(objProductInPlus);
                            }
                        } else {
                            //舊商品
                            classifyProduct.oldProduct.push(product_key);
                        }
                        //分類完就刪除
                        delete allProductInPlus[product_key];
                    })
                    //剩餘的就是要插入的
                    var keys = Object.keys(allProductInPlus);
                    keys.map(key => {
                        classifyProduct.updateProduct.push(allProductInPlus[key]);
                    })
                    classifyProduct.updateProduct.reverse();
                    //顯示差異資料，手動更新
                    _initToUI(classifyProduct);
                });

                $('#landingPage').hide();
            }
            if (gapiIsLoading) {
                getSheetData();
            } else {
                setTimeout(getSheetData, 1500)
            }
        }
        $(document).on('ajaxSend', function (t, e, setting) {

            if (setting.url.search('https://www.iplusonego.com/api/index.php/post_snapshots/groupbuies') != -1) {
                e.done(function (t) {

                    var isPass = (!t.nextPage) ? true : false;

                    allProduct = allProduct.concat(t.data);

                    if (isPass) {
                        checkFunction();
                    } else {
                        $("html, body").animate({
                            scrollTop: $(document).height()
                        }, 1)
                    }
                })
            }
        });
        if ($(document).height() < 2000) {
            checkFunction();
        } else {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, 1)
        }
    }
    var _initToUI = function (classifyProduct) {
        $.ajax({
            url: extendData.rawUrl + '/ui/sellergroups/price_list.html',
            async: false,
            cache: false
        }).then(function (data) {
            if ($('#adv').length == 0) {
                $('body').append(data);
            }

            $('#adv input').css({
                'margin-left': '5px'
            });
            $('.tab-pane div').css({
                'left': '50px',
                'right': '50px'
            });

            $('#adv .btnBack').on('click', e => {
                $('#adv').remove();
                $('#landingPage').show();
            });
            //新增商品
            var htmlString = `<tr>
                <td style='width:400px'>商品</td>
                <td style='width:150px'>樣式</td>
                <td style='width:50px;'>成本</td>
                <td style='width:50px;'>VVIP</td>
                <td style='width:50px;'>VIP</td>
                <td style='width:50px;'>特價</td>
                </tr>`;
            classifyProduct.updateProduct.map(product => {
                htmlString += `<tr>
                                    <td><a href="${product.link}" target="_blank">${product.product_title}</td>
                                    <td>${product.product_stlye}</td>
                                    <td>${product.price_orig}</td>
                                    <td>${product.price_vvip}</td>
                                    <td>${product.price_vip}</td>
                                    <td>${product.price_sale}</td>
                               </tr>`;
            })
            $('#div_additem table').html(htmlString);

            //匯入Sheet
            
            var post_data = [];
            classifyProduct.updateProduct.map(product => {
                // <td><a href="${product.link}" target="_blank">${product.product_title}</td>

                post_data.push([
                    product.product_title,
                    product.product_stlye,
                    product.price_orig,
                    product.price_vvip,
                    product.price_vip,
                    product.price_sale
                ])
            });

            gapi.client.sheets.spreadsheets.values.update({
                spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                range: '報表_商品成本!A' + classifyProduct.updateProductLastRow + ':F',
                valueInputOption: 'USER_ENTERED',
            }, {
                "values": post_data
            }).then(function (response) {
                alert('已更新「商品成本」')
                console.log(response.result);
            }, function (reason) {
                console.error('error: ' + reason.result.error.message);
            });
            //匯入資料

            //價格差異
            htmlString = `<tr>
                <td style='width:100px'>位置</td>
                <td style='width:400px'>商品</td>
                <td style='width:150px'>樣式</td>
                <td style='width:50px;'>成本</td>
                <td style='width:50px;'>VVIP</td>
                <td style='width:50px;'>VIP</td>
                <td style='width:50px;'>特價</td>
            </tr>`;
            classifyProduct.diffPriceProduct.map(product => {
                htmlString += `<tr>
                                    <td>愛+1系統</td>
                                    <td><a href="${product.link}" target="_blank">${product.product_title}</td>
                                    <td>${product.product_stlye}</td>
                                    <td>${product.price_orig}</td>
                                    <td>${product.price_vvip}</td>
                                    <td>${product.price_vip}</td>
                                    <td>${product.price_sale}</td>
                               </tr>`;
                htmlString += `<tr>
                               <td>Google表單</td>
                               <td></td>
                               <td></td>
                               <td>${product.sheet_price_orig}</td>
                               <td>${product.sheet_price_vvip}</td>
                               <td>${product.sheet_price_vip}</td>
                               <td>${product.sheet_price_sale}</td>
                          </tr>`;
                htmlString += `<tr style='height:15px'>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                          <td> </td>
                     </tr>`;
            })
            $('#div_updateprice table').html(htmlString);

            $('#adv td').css('border', 'solid 1px');


        });

    }
    return {
        landing: function () {

            //首頁清單(預抓)
            var firstProduct = [];
            $(document).on('ajaxSend', function (t, e, setting) {
                if (setting.url.search('https://www.iplusonego.com/api/index.php/post_snapshots/groupbuies') != -1) {
                    e.done(function (t) {
                        firstProduct = firstProduct.concat(t.data);
                        $(document).off('ajaxSend');
                    })
                }
            });
            $.ajax({
                url: extendData.rawUrl + 'ui/sellergroups/landing.html',
                async: false,
                cache: false
            }).then(function (data) {
                $('body').append(data);
            }).then(function () {
                $('#landingPage .btnClose').on('click', e => {
                    $('#landingPage').show().hide();
                });

                $('#landingPage .syncItemList').on('click', e => {
                    _init(firstProduct);
                });
                //
            });

        }
    }
}();