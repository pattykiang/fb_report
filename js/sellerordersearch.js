var sellerordersearch = function () {
    var vue_progressbar;
    document.vue_progressbar = vue_progressbar;
    var _loadingScript = function () {
        $.getScript('https://code.highcharts.com/highcharts.js', e => {
            $.getScript('https://code.highcharts.com/modules/variable-pie.js', e => {
                Highcharts.setOptions({
                    lang: {
                        thousandsSep: ','
                    }
                });
            });
        });
        $.getScript('https://vuejs.org/js/vue.min.js', e => {
            $.getScript('https://unpkg.com/vue-simple-progress@1.1.1/dist/vue-simple-progress.min.js', e => {
                vue_progressbar = new Vue({
                    el: '#vue_progressbar',
                    data: {
                        percentValue: 0,
                        isShow: false,
                        allTime: null,
                        endTime: null
                    },
                    methods: {
                        init: function (startTimeString, endTimeString) {
                            this.endTime = new Date(endTimeString);
                            this.allTime = this.endTime - new Date(startTimeString);
                            this.isShow = true;
                            this.setPercent(0);
                        },
                        setNowTime: function (nowTimeString) {
                            var nowTime = this.endTime - new Date(nowTimeString);
                            this.setPercent(nowTime * 100 / this.allTime);
                        },
                        setPercent: function (percent) {
                            if (percent != 100) {
                                this.isShow = true;
                            } else {
                                this.isShow = false;
                            }
                            this.percentValue = percent;
                        }
                    },
                    beforeUpdate: function () {
                        this.percentValue = Math.floor(this.percentValue);
                    }
                })
            });
        });
        $.getScript('https://apis.google.com/js/api.js', e => {
            // var CLIENT_ID = '115711815249-ajondlmmv7tge96vsittjgcllphlh898.apps.googleusercontent.com';
            // var API_KEY = 'z1aoFhzW0rBMt1KgwiSFdOLe';

            // Array of API discovery doc URLs for APIs used by the quickstart
            var DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];

            // Authorization scopes required by the API; multiple scopes can be
            // included, separated by spaces.
            var SCOPES = "https://www.googleapis.com/auth/spreadsheets";

            // var authorizeButton = document.getElementById('authorize_button');
            // var signoutButton = document.getElementById('signout_button');
            /**
             *  On load, called to load the auth2 library and API client library.
             */
            // function handleClientLoad() {
            gapi.load('client:auth2', initClient);
            // }

            /**
             *  Initializes the API client library and sets up sign-in state
             *  listeners.
             */
            function initClient() {
                gapi.client.init({
                    apiKey: 'AIzaSyD4hGbOoiXV2-cd-xeWxTQEXMTCx9TIQkU',
                    clientId: '115711815249-ajondlmmv7tge96vsittjgcllphlh898.apps.googleusercontent.com',
                    discoveryDocs: DISCOVERY_DOCS,
                    scope: SCOPES
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
            data_process.init();
            data_process.initToUI();
            $('#landingPage').hide();
            return
        }
        $(document).on('ajaxSend', function (t, e, n) {
            e.done(function (t) {
                //document.vue_progressbar.$data.percentValue = nowTime*100/allTime;
                //vue_progressbar.setPercent(nowTime*100/allTime);
                vue_progressbar.setNowTime(e.responseJSON.data[e.responseJSON.data.length - 1].order_checked_time + ' UTC')

                if (extendData.order_data = extendData.order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                    $(document).off('ajaxSend');
                    vue_progressbar.setPercent(100);

                    //去除重複object
                    extendData.order_data = [...new Set(extendData.order_data.map(order => {
                        return JSON.stringify(order)
                    }))];
                    extendData.order_data = extendData.order_data.map(order => {
                        return JSON.parse(order)
                    });
                    //
                    extendData.ajaxObject[mode] = $.extend(true, [], extendData.order_data);
                    console.log('init call')

                    data_process.init();
                    data_process.initToUI();
                    $('#landingPage').hide();
                }
                if ($('table tr').length > 200) {
                    $('table tr:gt(0):lt(100)').remove();
                }
                $("html, body").animate({
                    scrollTop: $(document).height()
                }, 1)
            })
        });
        extendData.order_data = []
        vue_progressbar.init($("#searchDateS").val() + ' 00:00:00', $("#searchDateE").val() + ' 23:59:59');

        $("html, body").animate({
            scrollTop: 0
        }, 1);

        $("#searchDateE").trigger('changeDate');
        $("#searchDateS").trigger('changeDate');



        setTimeout(function () {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, 5);
        }, 3000)
    }
    var _init_trace = function (mode, startDate, endDate) {
        if (extendData.ajaxObject[mode] && !extendData.isForceReload) {
            extendData.order_data = extendData.ajaxObject[mode];
            data_process.init_Trace(mode, startDate, endDate);
            $('#landingPage').hide();
            return;
        }
        $(document).on('ajaxSend', function (t, e, n) {
            e.done(function (t) {
                vue_progressbar.setNowTime(e.responseJSON.data[e.responseJSON.data.length - 1].order_checked_time + ' UTC');

                if (extendData.order_data = extendData.order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                    $(document).off('ajaxSend');
                    vue_progressbar.setPercent(100);

                    //去除重複object
                    extendData.order_data = [...new Set(extendData.order_data.map(order => {
                        return JSON.stringify(order)
                    }))];
                    extendData.order_data = extendData.order_data.map(order => {
                        return JSON.parse(order)
                    });
                    //
                    extendData.ajaxObject[mode] = $.extend(true, [], extendData.order_data);

                    data_process.init_Trace(mode, startDate, endDate);
                    // data_process.initToUI();
                    $('#landingPage').hide();

                }
                if ($('table tr').length > 200) {
                    $('table tr:gt(0):lt(100)').remove();
                }
                $("html, body").animate({
                    scrollTop: $(document).height()
                }, 5)
            })
        });
        extendData.order_data = [];
        vue_progressbar.init($("#searchDateS").val() + ' 00:00:00', $("#searchDateE").val() + ' 23:59:59');

        $("html, body").animate({
            scrollTop: 0
        }, 1);
        $("#searchDateE").trigger('changeDate');
        $("#searchDateS").trigger('changeDate');
        setTimeout(function () {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, 5);
        }, 3000)
    };
    var _init_stock = function (mode, startDate, endDate) {
        if (extendData.ajaxObject[mode] && !extendData.isForceReload) {
            extendData.order_data = extendData.ajaxObject[mode];
            data_process.init_Stock(mode, startDate, endDate);
            $('#landingPage').hide();
            return;
        }
        $(document).on('ajaxSend', function (t, e, n) {
            e.done(function (t) {
                vue_progressbar.setNowTime(e.responseJSON.data[e.responseJSON.data.length - 1].order_checked_time + ' UTC');

                if (extendData.order_data = extendData.order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                    $(document).off('ajaxSend');
                    vue_progressbar.setPercent(100);

                    //去除重複object
                    extendData.order_data = [...new Set(extendData.order_data.map(order => {
                        return JSON.stringify(order)
                    }))];
                    extendData.order_data = extendData.order_data.map(order => {
                        return JSON.parse(order)
                    });
                    //
                    extendData.ajaxObject[mode] = $.extend(true, [], extendData.order_data);

                    data_process.init_Stock(mode, startDate, endDate);
                    // data_process.initToUI();
                    $('#landingPage').hide();

                }
                if ($('table tr').length > 200) {
                    $('table tr:gt(0):lt(100)').remove();
                }
                $("html, body").animate({
                    scrollTop: $(document).height()
                }, 5)
            })
        });
        extendData.order_data = [];
        vue_progressbar.init($("#searchDateS").val() + ' 00:00:00', $("#searchDateE").val() + ' 23:59:59');

        $("html, body").animate({
            scrollTop: 0
        }, 1);
        $("#searchDateE").trigger('changeDate');
        $("#searchDateS").trigger('changeDate');
        setTimeout(function () {
            $("html, body").animate({
                scrollTop: $(document).height()
            }, 5);
        }, 3000)
    };
    var data_process = function () {
        var n = [],
            forChartData = []
        var _init = function () {
            forChartData = [];
            extendData.order_data.forEach(order => {
                var _date = new Date(order.order_checked_time + ' UTC');
                var personal_group = '';
                var orderProfit;
                switch (order.member_level) {
                    case "2":
                        personal_group = '一般';
                        orderProfit = order.order_total_price * 1 * 0.2;
                        break;
                    case "3":
                        personal_group = 'VIP';
                        orderProfit = order.order_total_price * 1 / 9;
                        break;
                    case "4":
                        personal_group = 'VVIP';
                        orderProfit = 0;
                        break;
                    default:
                        personal_group = '未分類??';
                        orderProfit = order.order_total_price * 1 * 0.2;
                        break;
                }
                forChartData.push({
                    date: _date,
                    hourString: _date.getHours(),
                    dateString: getDateString(_date),
                    monthString: getDateString(_date, 'm'),
                    storeOwner: order.order_product_items[0].product_title.substr(0, 1),
                    item: order.post_snapshot_title,
                    sum: order.order_total_price * 1,
                    userLevel: order.member_level,
                    userGroup: personal_group,
                    profit: orderProfit,
                    count: order.order_product_items.reduce(function (acc, obj) {
                        return acc + obj.product_style_count;
                    }, 0),
                    user: order.user_fb_name
                })

            })
            document.forChartData = forChartData;
        }
        var _showSingleDay = function (dataList, dateString, storeOwnerList = []) {
            var store_sale = [0]; //new Array(storeOwnerList.length).fill(0);
            var store_order = [0]; //new Array(storeOwnerList.length).fill(0);
            var store_uu = [
                []
            ]; //new Array(storeOwnerList.length).fill().map(u => ([]));
            dataList.filter(data => {
                return data.dateString == dateString
            }).forEach(data => {
                var _index = 0; //storeOwnerList.indexOf(data.storeOwner);
                // if (_index >= 0) {
                store_sale[_index] += data.sum;
                store_order[_index] += 1;
                store_uu[_index].push(data.user);
                // }
            })
            store_uu = store_uu.map(data => {
                return [...new Set(data)].length;
            })
            UIControl.changSelectDay(dateString, storeOwnerList, store_sale, store_order, store_uu);
        };
        var _showPerHour = function (dataList, dateString, storeOwnerList = []) {
            var store_sale = [];
            var store_order = [];
            // storeOwnerList.forEach(owner => {
            store_sale.push({
                name: '有家日常_銷量',
                visible: true,
                data: new Array(24).fill(0)
            })
            store_order.push({
                name: '有家日常_單數',
                visible: true,
                data: new Array(24).fill(0)
            })
            // })
            dataList.filter(data => {
                return data.dateString == dateString
            }).forEach(data => {
                var _index = 0; //storeOwnerList.indexOf(data.storeOwner);
                // if (_index >= 0) {
                store_sale[_index].data[data.hourString] += data.sum;
                store_order[_index].data[data.hourString] += 1;
                // }
            })
            UIControl.showSelectDayPerHour(dateString, store_sale.concat(store_order));
        };
        var _showPerDay = function (dataList, dayStringList, storeOwnerList = []) {
            var store_sale = [];
            // storeOwnerList.forEach(owner => {
            store_sale.push({
                name: '有家日常',
                data: new Array(dayStringList.length).fill(0)
            })
            // })
            dataList.filter(data => {
                return dayStringList.indexOf(data.dateString) >= 0
            }).forEach(data => {
                // var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                var _dateIndex = dayStringList.indexOf(data.dateString);
                if (_dateIndex >= 0) {
                    store_sale[0].data[_dateIndex] += data.sum;
                }
            })

            UIControl.showSelectPerDay(dayStringList, store_sale);
        };
        var _showPerMonth = function (dataList, monthStringList, storeOwnerList = []) {
            var store_sale = [];
            // storeOwnerList.forEach(owner => {
            store_sale.push({
                name: '有家日常',
                data: new Array(monthStringList.length).fill(0)
            })
            // })
            dataList.filter(data => {
                return monthStringList.indexOf(data.monthString) >= 0
            }).forEach(data => {
                // var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                var _dateIndex = monthStringList.indexOf(data.monthString);
                if (_dateIndex >= 0) {
                    store_sale[0].data[_dateIndex] += data.sum;
                }
            })
            UIControl.ShowSelectPerMonth(monthStringList, store_sale);
        };
        var _showHot = function (dataList, monthStringList, storeOwnerList = []) {
            //內容//總價//總數
            var store_sale = [];
            var dataList_nor = dataList
                .filter(data => {
                    return monthStringList.indexOf(data.monthString) >= 0
                })
                .map(data => {
                    var obj = {};
                    var list = data.item.split('|')
                    var name = list[list.length - 1].trim();
                    obj.item = data.item;
                    obj.name = name;
                    obj.count = data.count;
                    obj.sum = data.sum;
                    var matchResult = data.item.match(/\d{5}/);
                    if (matchResult) {
                        obj.itemCode = matchResult[0]; //name.substr(0, 6);
                        obj.itemLabel = name.slice(5);
                    }
                    return obj;
                });
            dataList_nor.forEach(data => {

                var _itemIndex = store_sale.map(function (e) {
                    return e.code;
                }).indexOf(data.itemCode);

                if (_itemIndex >= 0) {
                    store_sale[_itemIndex].y += data.sum;
                    store_sale[_itemIndex].z += data.count;
                    // store_sale[_itemIndex].z += 1; 幾單
                } else {
                    store_sale.push({
                        name: data.itemLabel,
                        code: data.itemCode,
                        y: data.sum,
                        z: data.count
                        // z: 1
                    });
                }
            })
            store_sale.sort(function (a, b) {
                return b.z - a.z
            });
            // document.a = store_sale;
            // store_sale.map(e=>{
            //     console.log(e.name+','+e.y+','+e.z)
            // })
            //console.log(store_sale);
            store_sale = store_sale.slice(0, 10);
            UIControl.ShowSelectHotItem(store_sale);
        };
        var _showReport = function (dataList, dateString, storeOwnerList = []) {

            var store_single = new Array(2).fill().map(o => ({
                label: '',
                sum: 0
            }));
            var store_month = new Array(2).fill().map(o => ({
                label: '',
                sum: 0
            }));

            store_single[0].label = "(" + dateString + ")";
            store_single[1].label = '有家日常裸績';

            store_month[0].label = "(" + dateString.substr(0, dateString.length - 3) + "月累積)";
            store_month[1].label = '有家日常裸績';


            var sale_profile = {
                total_sale: 0,
                total_profit: 0,
                total_sale_novvip: 0,
                total_profit_novvip: 0,
                total_cost_admin: 0,
                total_order_count: 0
            }


            dataList.forEach(data => {

                //當日營業額
                if (data.dateString == dateString) {
                    store_single[1].sum += data.sum;
                }
                //累積當月至當日 營業額
                if (data.dateString <= dateString) {
                    sale_profile.total_order_count += 1;
                    store_month[1].sum += data.sum;
                    // store_month[4].sum += data.sum;

                    //累積所有Profit
                    //sale_profile.total_profit += data.profit;

                    //累積所有營業額/Profit (非VVIP)
                    if (data.userLevel != 4) {
                        sale_profile.total_sale_novvip += data.sum;
                        sale_profile.total_profit_novvip += data.profit;
                    } else {
                        if (data.user == '黃祐祥' || data.user == '黃榮曜' || data.user == 'Eva Jiang') {
                            sale_profile.total_cost_admin += data.sum;
                        }
                    }
                }



            });
            sale_profile.total_sale = store_month[1].sum;

            UIControl.ShowSelectReport(store_single, store_month, sale_profile);
        };
        var _initToUI = function () {
            UIControl.init();
            var selectedObj = _getSelectObj();
            _refreshUI(selectedObj);
        };
        var _getSelectObj = function () {
            var selectDaysList = [];
            var selectMonthsList = [];
            var startDay = new Date($('#searchDateS').val());
            var diffDay = Math.abs(new Date($('#searchDateE').val()) - startDay) / (1000 * 60 * 60 * 24) + 1;
            for (var i = 0; i < diffDay; i++) {
                var newDate = new Date(startDay);
                newDate.setDate(newDate.getDate() + i)
                selectDaysList.push(getDateString(newDate));
                selectMonthsList.push(getDateString(newDate, 'm'));
            }
            selectMonthsList = [...new Set(selectMonthsList)];

            var endDay = new Date($('#searchDateE').val());
            var selectDay = getDateString(endDay);
            // var selectOwner = $('input[name="owner"]:checked').map(function () {
            //     return $(this).val()
            // }).get();
            var selectTab = $('#adv li .active').attr('name');

            var selectedObj = {
                Day: selectDay,
                Owner: [],
                DayList: selectDaysList,
                MonthList: selectMonthsList,
                Mode: selectTab
            }
            return selectedObj;
        }
        var _refreshUI = function (selectedObj) {
            switch (selectedObj.Mode) {
                case '_showSingleDay':
                    //單日  
                    _showSingleDay(forChartData, selectedObj.Day, selectedObj.Owner);
                    break;
                case '_showPerHour':
                    //逐時(單日)   
                    _showPerHour(forChartData, selectedObj.Day, selectedObj.Owner);
                    break;
                case '_showPerDay':
                    //逐日(單月) 
                    _showPerDay(forChartData, selectedObj.DayList, selectedObj.Owner);
                    break;
                case '_showPerMonth':
                    //逐月
                    _showPerMonth(forChartData, selectedObj.MonthList, selectedObj.Owner);
                    break;
                case '_showHotItem':
                    _showHot(forChartData, selectedObj.MonthList, selectedObj.Owner);
                    break;
                case '_showReport':
                    _showReport(forChartData, selectedObj.Day, selectedObj.Owner);
                case '':
                    break;
            }



        }
        var _init_trace = function (mode, startDate, endDate) {
            function createTraceOrder(data, periodOrderAllPrice, addClassifyByPeople) {
                function getAllPrice(arr) {
                    return (arr.length > 0) ? arr.map(order => order.order_total_price * 1).reduce((a, b) => a + b) : 0;
                }

                function getClassifyByPeople(arr) {
                    var store_sale = [];
                    arr
                        .forEach(data => {
                            var _itemIndex = store_sale.map(function (e) {
                                return e.user_fb_profile_id;
                            }).indexOf(data.user_fb_profile_id);
                            if (_itemIndex >= 0) {
                                store_sale[_itemIndex].sum += data.order_total_price * 1;
                                store_sale[_itemIndex].count += 1;
                            } else {
                                store_sale.push({
                                    user_fb_name: data.user_fb_name,
                                    user_fb_profile_id: data.user_fb_profile_id,
                                    sum: data.order_total_price * 1,
                                    count: 1
                                });
                            }
                        });
                    store_sale.sort(function (a, b) {
                        return b.sum - a.sum
                    });

                    return store_sale;
                }
                var returnObj = {
                    data: data,
                    count: data.length,
                    sum: getAllPrice(data)
                };
                if (periodOrderAllPrice) {
                    returnObj['per'] = (100 * returnObj.sum / periodOrderAllPrice).toFixed(1)
                }
                if (addClassifyByPeople) {
                    returnObj['data_people'] = getClassifyByPeople(data);
                }
                return returnObj;
            }

            function getTraceOrderWithPeriod(data, start, end) {
                var traceOrder = {};
                var periodOrder = data; //.filter(order=>{return order.order_checked_time.indexOf(getDateString(start)) && new Date(order.order_checked_time) <end)?true:false}//);

                traceOrder['order_all'] = createTraceOrder(periodOrder, undefined, 'addPeople');

                var periodOrderAllPrice = traceOrder['order_all'].sum;

                var order_finish = periodOrder.filter(order => {
                    return (order.order_status == 'FINISH') ? true : false
                });
                traceOrder['order_finish'] = createTraceOrder(order_finish, periodOrderAllPrice, 'addPeople');

                var order_unfinish = periodOrder.filter(order => {
                    return (order.order_status == 'FINISH') ? false : true
                });
                traceOrder['order_unfinish'] = createTraceOrder(order_unfinish, periodOrderAllPrice);

                var order_paid = order_unfinish.filter(order => {
                    return (order.order_payment_status == 'PAID') ? true : false
                });
                traceOrder['order_paid'] = createTraceOrder(order_paid, periodOrderAllPrice);

                var order_unpaid = order_unfinish.filter(order => {
                    return (order.order_payment_status == 'PAID') ? false : true
                });
                traceOrder['order_unpaid'] = createTraceOrder(order_unpaid, periodOrderAllPrice, 'addPeople');

                var order_container_paid = order_unfinish.filter(order => {
                    return (order.order_status == 'CONTAINER' && order.order_payment_status == 'PAID') ? true : false
                });
                traceOrder['order_container_paid'] = createTraceOrder(order_container_paid, periodOrderAllPrice, 'addPeople');

                var order_container_paying = order_unfinish.filter(order => {
                    return (order.order_status == 'CONTAINER' && order.order_payment_status == 'PAYING') ? true : false
                });
                traceOrder['order_container_paying'] = createTraceOrder(order_container_paying, periodOrderAllPrice, 'addPeople');

                var order_container_unpaid = order_unfinish.filter(order => {
                    return (order.order_status == 'CONTAINER' && order.order_payment_status == 'UNPAID') ? true : false
                });
                traceOrder['order_container_unpaid'] = createTraceOrder(order_container_unpaid, periodOrderAllPrice, 'addPeople');



                var order_going = order_unfinish.filter(order => {
                    return (order.order_status == 'CHECKED') ? true : false
                });
                traceOrder['order_going'] = createTraceOrder(order_going, periodOrderAllPrice, 'addPeople');


                var order_going_paid = order_unfinish.filter(order => {
                    return (order.order_status == 'CHECKED' && order.order_bpayment_status == 'PAID') ? true : false
                });
                traceOrder['order_going_paid'] = createTraceOrder(order_going_paid, periodOrderAllPrice, 'addPeople');

                var order_going_paying = order_unfinish.filter(order => {
                    return (order.order_status == 'CHECKED' && order.order_payment_status == 'PAYING') ? true : false
                })
                traceOrder['order_going_paying'] = createTraceOrder(order_going_paying, periodOrderAllPrice, 'addPeople');

                var order_going_unpaid = order_unfinish.filter(order => {
                    return (order.order_status == 'CHECKED' && order.order_payment_status == 'UNPAID') ? true : false
                });
                traceOrder['order_going_unpaid'] = createTraceOrder(order_going_unpaid, periodOrderAllPrice, 'addPeople');

                return traceOrder;
            }

            var data = getTraceOrderWithPeriod(extendData.order_data, startDate, endDate);
            extendData.orderTrace = data;
            UIControl.initTrace(mode, data);
        }
        var _init_stock = function (mode, startDate, endDate) {
            function createTraceOrder(data) {

                function getClassifyByItem(arr) {
                    var store_sale = [];

                    //每張訂單
                    arr.forEach(data => {
                        //每樣商品
                        data.order_product_items.forEach(order => {
                            //商品+規格才是唯一
                            var _itemIndex = store_sale.map(function (e) {
                                return e.product_title + '-' + e.product_style_title;
                            }).indexOf(order.product_title + '-' + order.product_style_title);


                            if (_itemIndex >= 0) {
                                //跑所有order_product_items
                                store_sale[_itemIndex].order_product_items =
                                    store_sale[_itemIndex].order_product_items.concat(order);
                                store_sale[_itemIndex].product_style_count += order.product_style_count;
                                store_sale[_itemIndex].product_style_filled += order.product_style_filled;
                                store_sale[_itemIndex].product_style_shipout += order.product_style_shipout;
                                store_sale[_itemIndex].product_style_out += order.product_style_out;

                                // store_sale[_itemIndex].sum += data.order_total_price * 1;
                                // store_sale[_itemIndex].count += 1;
                            } else {
                                store_sale.push({
                                    product_title: order.product_title,
                                    product_style_title: order.product_style_title,
                                    post_snapshot_id: data.post_snapshot_id,
                                    order_product_items: [].concat(order),
                                    product_style_count: order.product_style_count,
                                    product_style_filled: order.product_style_filled,
                                    product_style_shipout: order.product_style_shipout,
                                    product_style_out: order.product_style_out
                                });
                            }
                        })
                    });

                    return store_sale;
                }
                var returnObj = {
                    data: data,
                    count: data.length
                };
                returnObj['data_item'] = getClassifyByItem(data);
                return returnObj;
            }

            var data = createTraceOrder(extendData.order_data, startDate, endDate, 'addItem');

            function makeApiCall(data, groupInfoList) {

                var googleSyncData = [];

                //抓商品資料
                var ipusone_production_item = {};
                gapi.client.sheets.spreadsheets.values.get({
                    spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                    range: 'SYNC_iplusonego!K2:O',
                }).then(function (response) {
                    var range = response.result;
                    if (range.values.length > 0) {
                        for (i = 0; i < range.values.length; i++) {
                            var _row = range.values[i];

                            var _style = (_row[1]) ? _row[1] : '';
                            var _vendor = (_row[3]) ? _row[3] : '';
                            var _no = (_row[2]) ? _row[2] : '';
                            var _need_order = (_row[4]) ? _row[4] : '';

                            ipusone_production_item[_row[0] + '-' + _style] = {
                                order: _row[0],
                                product_style: _style,
                                product_vendor: _vendor,
                                product_no: _no,
                                need_order: _need_order
                            };
                        }
                    }
                    //比對vendoer/no
                    data
                        .sort((a, b) => (a.post_snapshot_id > b.post_snapshot_id) ? -1 : ((b.post_snapshot_id > a.post_snapshot_id) ? 1 : 0))
                        .map(e => {
                            var _style = '';
                            var item = ipusone_production_item[e.product_title + '-' + e.product_style_title];
                            _product_vendor = (item) ? item.product_vendor : '';;
                            _product_no = (item) ? item.product_no : '';
                            _need_order = (item) ? item.need_order : '';

                            googleSyncData.push([
                                e.product_title,
                                e.product_style_title,
                                e.product_style_count,
                                _need_order,
                                e.product_style_filled,
                                e.product_style_shipout,
                                _product_vendor,
                                _product_no

                            ]);
                        })
                    //分類各Group 採購數量
                    // var googleSyncData_Group = [];
                    // data.map(e => {

                    //     var _countVIP = e.order_product_items.filter(e => {
                    //         return e.product_is_vip == 1
                    //     }).reduce(function (acc, obj) {
                    //         return acc + obj.product_style_count;
                    //     }, 0);
                    //     var _countVVIP = e.order_product_items.filter(e => {
                    //         return e.product_is_vvip == 1
                    //     }).reduce(function (acc, obj) {
                    //         return acc + obj.product_style_count;
                    //     }, 0);
                    //     var _count = e.order_product_items.filter(e => {
                    //         return (e.product_is_vvip == 0 && e.product_is_vip == 0)
                    //     }).reduce(function (acc, obj) {
                    //         return acc + obj.product_style_count;
                    //     }, 0);

                    //     googleSyncData_Group.push([
                    //         e.product_title,
                    //         e.product_style_title,
                    //         _countVVIP,
                    //         _countVIP,
                    //         _count,
                    //         (e.product_style_count - _countVVIP)
                    //     ]);
                    // })

                    //更新資料 sync_iplusonego
                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                        range: 'SYNC_iplusonego!A2:H',
                        valueInputOption: 'RAW',
                    }, {
                        "values": googleSyncData
                    }).then(function (response) {
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });

                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                        valueInputOption: 'RAW',
                        range: 'SYNC_iplusonego!I1:I1'
                    }, {
                        "values": [
                            [(new Date).toLocaleDateString() + " " + (new Date).toLocaleTimeString()]
                        ]
                    }).then(function (response) {
                        //alert('已更新「訂貨管理表單：iplusonego_sync」')
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });

                    //更新資料 商品購買分組統計
                    // gapi.client.sheets.spreadsheets.values.update(params = {
                    //     spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                    //     valueInputOption: 'RAW',
                    //     range: 'SYNC_商品購買分組統計!A2:F',
                    // }, {
                    //     "values": googleSyncData_Group
                    // }).then(function (response) {
                    //     console.log(response.result);
                    // }, function (reason) {
                    //     console.error('error: ' + reason.result.error.message);
                    // });

                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                        valueInputOption: 'RAW',
                        range: 'SYNC_商品購買分組統計!I1:I1'
                    }, {
                        "values": [
                            [(new Date).toLocaleDateString() + " " + (new Date).toLocaleTimeString()]
                        ]
                    }).then(function (response) {
                        //alert('已更新「訂貨管理表單：商品購買分組統計」')
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });


                    var his_order = [];
                    extendData.ajaxObject.stockAnytime.map(order => {

                        order.order_product_items.map(item => {
                            var _group = '';
                            if (item.product_is_vvip == 0 && item.product_is_vip == 0) {
                                _group = 'Normal';
                            } else if (item.product_is_vip == 1) {
                                _group = 'VIP';
                            } else if (item.product_is_vvip == 1) {
                                _group = "VVIP";
                            }
                            var _month = '';

                            var orderDate = new Date(order.order_checked_time + ' UTC');
                            groupInfoList.map(item => {
                                var startDate = new Date(item[0]);
                                var endDate = new Date(item[1]);

                                if (orderDate > startDate && orderDate <= endDate) {
                                    _month = item[2];
                                }
                            })
                            var _day = orderDate.getDay();
                            if (_day == 0) {
                                _day = 7
                            };
                            var _vendor = googleSyncData.filter(vendor => {
                                var _returnValue = '';
                                if (vendor[0] == item.product_title && vendor[1] == item.product_style_title) {
                                    _returnValue = vendor;
                                }
                                return _returnValue
                            });
                            if(_vendor.length==1){
                                _vendor = _vendor[0];
                            }
                            his_order.push([
                                order.order_id,
                                order.user_fb_name,
                                item.product_title,
                                item.product_style_title,
                                item.product_style_count,
                                item.product_sale,
                                item.product_style_count * item.product_sale,
                                _group,
                                _month,
                                orderDate.toLocaleDateString(),
                                _day,
                                orderDate.toLocaleString(),
                                orderDate.getHours(),
                                _vendor[6]
                            ])
                        })
                    })
                    //更新資料 sync_iplusonego
                    gapi.client.sheets.spreadsheets.values.update({
                        spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                        range: 'SYNC_歷史訂單!A2:N',
                        valueInputOption: 'USER_ENTERED',
                    }, {
                        "values": his_order
                    }).then(function (response) {
                        alert('已更新「歷史訂單」')
                        console.log(response.result);
                    }, function (reason) {
                        console.error('error: ' + reason.result.error.message);
                    });
                });


            };
            //抓開團資訊
            gapi.client.sheets.spreadsheets.values.get({
                spreadsheetId: '1d9MaRQAtqZvSYDaDgD9ct99Ij7GLtUwF2aY3ncOFtO4',
                range: '營運狀況!A3:C100',
            }).then(function (response) {
                var groupInfoList = response.result.values.filter(item => {
                    return item[0]
                });
                makeApiCall(data.data_item, groupInfoList);
            });

        }
        return {
            init: _init,
            initToUI: _initToUI,
            showSingleDay: _showSingleDay,
            showPerHour: _showPerHour,
            showPerDay: _showPerDay,
            showPerMonth: _showPerMonth,
            refreshUI: function (selectedDay) {
                var selectedObj = _getSelectObj();
                selectedObj.Day = selectedDay;
                _refreshUI(selectedObj);
            },
            init_Trace: _init_trace,
            init_Stock: _init_stock
        }
    }();
    var UIControl = function () {
        var _init = function () {
            $.ajax({
                url: extendData.rawUrl + '/ui/sellordersearch/sale/index.html',
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

                $("#showSingle").val($('#searchDateE').val());
                $
                    ("#showSingle").datepicker({
                        format: 'yyyy-mm-dd',
                    }).on('changeDate', e => {
                        data_process.refreshUI($("#showSingle").val());
                    });
                $('#adv a[data-toggle="pill"]').on('shown.bs.tab', e => {
                    data_process.refreshUI($("#showSingle").val());
                })
                $('#adv .btnBack').on('click', e => {
                    $('#adv').remove();
                    $('#landingPage').show();
                });

                // $('input[name="owner"]').on('change', e => {
                //     data_process.refreshUI($("#showSingle").val());
                // });
                // $('input[name="owner_all"]').on('change', e => {
                //     if ($(this).prop('checked')) {
                //         $('input[name="owner"]').prop('checked', true);
                //     } else {
                //         $('input[name="owner"]').prop('checked', false);
                //         $('input[name="owner"]:lt(3)').prop('checked', true);
                //     }
                //     data_process.refreshUI($("#showSingle").val());
                // });
            });

        };
        var _init_trace = function (mode, dataList) {
            var viewList = ['index_v2.html', 'index.html'];
            var switchView = function (view) {
                $.ajax({
                    url: extendData.rawUrl + '/ui/sellordersearch/trace/' + view,
                    async: false,
                    cache: false
                }).then(function (data) {
                    var htmlString = data;
                    var keys = Object.keys(dataList);
                    keys.forEach(key => {
                        dataList[key].sum = (dataList[key].sum > 0) ? dataList[key].sum : '-';
                        dataList[key].count = (dataList[key].count > 0) ? dataList[key].count : '-';

                        htmlString = htmlString
                            .replace('@' + key + '.sum', toCurrency(dataList[key].sum))
                            .replace('@' + key + '.per', dataList[key].per + '%')
                            .replace('@' + key + '.count', toCurrency(dataList[key].count));
                    });
                    $("#adv").remove();
                    $("body").append(htmlString);
                }).then(function () {
                    $(".byStatus tr td:nth-child(2)").css({
                        'text-align': 'right',
                        'width': '80px'
                    });
                    $(".byStatus tr td:nth-child(3)").css({
                        'text-align': 'right',
                        'width': '90px'
                    });
                    $(".byStatus tr td:nth-child(4)").css({
                        'text-align': 'right',
                        'width': '80px'
                    });
                    $(".byStatus tr td:nth-child(5)").css({
                        'text-align': 'right',
                        'width': '80px'
                    });
                    $('tr').css('border-bottom', '1px solid black');
                    $('td a').css('cursor', 'pointer');

                    //Close
                    $('#adv .btnBack').on('click', e => {
                        $('#adv').remove();
                        $('#landingPage').show();
                    });

                    //切換簡易/完整
                    $('#adv .btnSwitchView').on('click', e => {
                        switchView(viewList.reverse()[0]);
                    });
                    //確認清單-事件
                    $(document).on('click', '.byStatus table a', e => {
                        $('.byPeople table tr:gt(1)').remove();

                        var func = e.currentTarget.name;
                        $('.byPeople table a').attr('func', func);
                        var htmlString = '';
                        dataList[func].data_people.forEach(data => {
                            htmlString += `<tr>
                                <td><a href="https://www.facebook.com/${data.user_fb_profile_id}" target="_blank">${data.user_fb_name}</a></td>
                                <td>${data.count}</td>
                                <td>${toCurrency(data.sum)}</td>
                                <td><a func=${func} name=${data.user_fb_profile_id}>另開</a></td>
                            </tr>`
                        });
                        $('.byPeople table').append(htmlString);

                        $(".byPeople tr:eq(1) td:eq(0)").text('共' + dataList[func].data_people.length + '人');

                        $('td a').css('cursor', 'pointer');
                        $(".byPeople tr td:nth-child(1)").css({
                            'width': '120px'
                        });
                        $(".byPeople tr td:nth-child(2)").css({
                            'text-align': 'right',
                            'width': '80px'
                        });
                        $(".byPeople tr td:nth-child(3)").css({
                            'text-align': 'right',
                            'width': '80px'
                        });
                        $(".byPeople tr td:nth-child(4)").css({
                            'text-align': 'right',
                            'width': '80px'
                        });
                        $('.byPeople').css({
                            'visibility': ''
                        });
                    })
                    //訂單細節-另開事件
                    $(document).off('click', '.byPeople table a').on('click', '.byPeople table a', e => {
                        var func = $(e.currentTarget).attr('func');
                        var fb_id = e.currentTarget.name;
                        var htmlString = '';
                        var htmlPersonal = '';
                        var whichClub = '';

                        dataList[func].data.filter(data => {
                            return data.user_fb_profile_id == fb_id || fb_id == 'all'
                        }).forEach(data => {

                            whichClub = data.order_product_items[0].product_title[0];
                            var personal_html = `<a href="https://www.facebook.com/ursmalltwo/inbox/?mailbox_id=102856077945544&selected_item_id=${data.user_fb_profile_id}" target="_blank">${data.user_fb_name}</a>`;
                            var comment_html = (data.order_comments.length > 0) ? `<a href="https://www.facebook.com/${data.order_comments[0].comment_id}?ipo_no_ext=1" target="_blank">${data.post_snapshot_title}</a>` : data.post_snapshot_title;

                            var personal_group = '';


                            var comment_style = ''
                            var orderCount = '--';
                            var orderCount_fill = '--'

                            var orderProfit = '';
                            data.order_product_items.map(function (e) {

                                orderCount = e.product_style_count;
                                orderCount_fill = e.product_style_filled;
                                comment_style = e.product_style_title;


                                switch (data.member_level) {
                                    case "2":
                                        personal_group = '一般';
                                        orderProfit = e.product_sale * orderCount * 0.2;
                                        break;
                                    case "3":
                                        personal_group = 'VIP';
                                        orderProfit = e.product_sale * orderCount / 9;
                                        break;
                                    case "4":
                                        personal_group = 'VVIP';
                                        orderProfit = 0;
                                        break;
                                    default:
                                        personal_group = '未分類??';
                                        orderProfit = e.product_sale * orderCount * 0.2;
                                        break;
                                }

                                htmlString += `<tr>
                                        <td>${whichClub}</td>
                                        <td>${personal_html}</td>
                                        <td>${comment_html}</td>
                                        <td>${comment_style}</td>
                                        <td>${orderCount}</td>
                                        <td>${orderCount_fill}</td>
                                        <td>${toCurrency(e.product_sale*orderCount)}</td>
                                        <td>${personal_group}</td>
                                        <td>${orderProfit.toFixed(0)}</td>
                                        <td>${new Date(data.order_checked_time+' UTC').toLocaleString()}</td>
                                    </tr>`;
                            })

                        });
                        if (fb_id != 'all') {
                            htmlPersonal = `<h3>該成員社團為：${whichClub}</h3>
                                <a href="https://www.facebook.com/${fb_id}" target="_blank">個人臉書</a>
                                <a href="https://www.facebook.com/ursmalltwo/inbox/?mailbox_id=102856077945544&selected_item_id=${fb_id}" target="_blank">曉貳訊息</a>
                                <hr/>`
                        }

                        htmlString = `<html><head><title></title></head>
                            <body>
                            ${htmlPersonal}
                            <table style='font-size:20px;border-spacing:10px;'>
                            <tr>
                                <td>社團</td>
                                <td>會員名稱</td>
                                <td>團名</td>
                                <td>規格</td>
                                <td>訂購量</td>
                                <td>已配貨</td>
                                <td>小計</td>
                                <td>身份</td>
                                <td>利潤粗估</td>
                                <td>確認時間</td>
                            </tr>
                            ${htmlString}
                            </table></body></html>`;

                        var wnd = window.open("about:blank", '', config = 'height=500px,width=1200px');
                        wnd.document.write(htmlString);
                    })
                });
            };
            switchView(viewList[0]);
        };
        var _showSingleDay = function (dateString, storeOwnerList, store_sale, store_order, store_uu) {
            Highcharts.chart('day_container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: dateString + '_單日狀況'
                },
                xAxis: {
                    categories: storeOwnerList
                },
                yAxis: {
                    min: 0
                },
                legend: {

                    align: 'right',
                    x: -5,
                    verticalAlign: 'top',
                    y: 5,
                    floating: true,
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: '銷售額',
                    data: store_sale
                }, {
                    name: '單數',
                    data: store_order
                }, {
                    name: '不重複來客數',
                    data: store_uu
                }]
            });
        };
        var _showPerHour = function (dateString, data) {
            Highcharts.chart('per_hour_container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: dateString + '_逐時狀況'
                },
                xAxis: {
                    categories: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23]
                },
                yAxis: {
                    min: 0
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    x: -5,
                    verticalAlign: 'top',
                    y: 5,
                    floating: true,
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: data
            });
        };
        var _showPerDay = function (dayStringList, data) {
            Highcharts.chart('per_day_container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: '逐日'
                },
                xAxis: {
                    categories: dayStringList
                },
                yAxis: {
                    min: 0,
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: ( // theme                       
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'right',
                    x: -5,
                    verticalAlign: 'top',
                    y: 5,
                    floating: true,
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: data
            });
        };
        var _showPerMonth = function (monthStringList, data) {
            Highcharts.chart('per_month_container', {
                chart: {
                    type: 'column'
                },
                title: {
                    text: '逐月總計'
                },
                xAxis: {
                    categories: monthStringList
                },
                yAxis: {
                    min: 0,
                    stackLabels: {
                        enabled: true,
                        style: {
                            fontWeight: 'bold',
                            color: ( // theme                          
                                Highcharts.defaultOptions.title.style &&
                                Highcharts.defaultOptions.title.style.color
                            ) || 'gray'
                        }
                    }
                },
                legend: {
                    align: 'right',
                    x: -5,
                    verticalAlign: 'top',
                    y: 5,
                    floating: true,
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || 'white',
                    borderColor: '#CCC',
                    borderWidth: 1,
                    shadow: false
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    headerFormat: '<b>{point.x}</b><br/>',
                    pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
                },
                plotOptions: {
                    column: {
                        stacking: 'normal',
                        dataLabels: {
                            enabled: true
                        }
                    }
                },
                series: data
            });
        };
        var _showHot = function (data) {
            Highcharts.chart('hot_item_container', {
                chart: {
                    type: 'variablepie'
                },
                title: {
                    text: '每月熱門商品'
                },
                subtitle: {
                    text: '圖高-銷售數量；圖寬及%-銷售總額'
                },
                tooltip: {
                    headerFormat: '',
                    pointFormat: '<span style="color:{point.color}">\u25CF</span> <b> {point.name}</b><br/>' +
                        '總銷售額: <b>{point.y}</b><br/>' +
                        '總數: <b>{point.z}</b><br/>'
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    variablepie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: true,
                            format: '<b>{point.name}</b>: {point.percentage:.1f} %'
                        }
                    }
                },
                series: [{
                    minPointSize: 10,
                    innerSize: '20%',
                    zMin: 0,
                    name: 'countries',
                    data: data
                }]
            });
        }
        var _showReport = function (single_data, month_data, profile) {
            var htmlString = single_data[0].label + ' \n';
            single_data.forEach((data, index) => {
                if (index != 0) {
                    htmlString += data.label + toCurrency(data.sum).padStart(14, ' ') + ' \n';
                }
            })
            htmlString += '\n' + month_data[0].label + '\n';
            month_data.forEach((data, index) => {
                if (index != 0) {
                    htmlString += data.label + toCurrency(data.sum).padStart(14, ' ') + ' \n';
                }
            })
            $('#reportDiv').html(htmlString);

            $('#ProfileTable .total_sale').html(toCurrency(profile.total_sale.toFixed(0)));
            // $('#ProfileTable .total_profit').html(profile.total_profit.toFixed(0));
            $('#ProfileTable .total_sale_novvip').html(toCurrency(profile.total_sale_novvip.toFixed(0)));
            $('#ProfileTable .total_profit_novvip').html(toCurrency(profile.total_profit_novvip.toFixed(0)));
            $('#ProfileTable .total_cost_admin').html(toCurrency(profile.total_cost_admin.toFixed(0)));
            $('#ProfileTable .total_order_count').html(toCurrency(profile.total_order_count.toFixed(0)));


            $('#ProfileTable td').css('padding', '10px');
            $('#ProfileTable td:eq(0)').css('width', '160px')
            $('#ProfileTable td:eq(2)').css('width', '160px')
        }

        return {
            init: _init,
            initTrace: _init_trace,
            changSelectDay: _showSingleDay,
            showSelectDayPerHour: _showPerHour,
            showSelectPerDay: _showPerDay,
            ShowSelectPerMonth: _showPerMonth,
            ShowSelectHotItem: _showHot,
            ShowSelectReport: _showReport
        }
    }();
    return {
        landing: function () {
            $.ajax({
                url: extendData.rawUrl + 'ui/sellordersearch/landing.html',
                async: false,
                cache: false
            }).then(function (data) {
                $('body').append(data);
            }).then(function () {
                $('#landingPage .forceReload').on('click', e => {
                    if ($('#landingPage .forceReload').is(':checked')) {
                        extendData.isForceReload = true;
                    } else {
                        extendData.isForceReload = false;
                    }
                })
                $('#landingPage .btnClose').on('click', e => {
                    $('#landingPage').show().hide();
                });
                $('#landingPage .day').on('click', e => {
                    $("#searchDateE").datepicker("update", new Date());
                    $("#searchDateS").datepicker("update", new Date());
                    _init('day');
                });
                $('#landingPage .month').on('click', e => {
                    $("#searchDateE").datepicker("update", new Date());
                    $("#searchDateS").datepicker("update", getDateString(new Date(), 'm') + '-01');
                    _init('thisMonthSale');
                });
                $('#landingPage .any').on('click', e => {
                    _init('any');
                });
                $('#landingPage .traceThisMonth').on('click', e => {
                    var thisMonthStartDate = new Date();
                    thisMonthStartDate.setDate(1);
                    var thisMonthEndDate = new Date();
                    $("#searchDateE").datepicker("update", new Date());
                    $("#searchDateS").datepicker("update", getDateString(new Date(), 'm') + '-01');
                    _init_trace('traceThisMonth', thisMonthStartDate, thisMonthEndDate);
                });
                $('#landingPage .traceLastMonth').on('click', e => {
                    var lastMonthStartDate = new Date();
                    lastMonthStartDate.setDate(1);
                    lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
                    var lastMonthEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);

                    $("#searchDateE").datepicker("update", getDateString(lastMonthEndDate));
                    $("#searchDateS").datepicker("update", getDateString(lastMonthStartDate));;
                    _init_trace('traceLastMonth', lastMonthStartDate, lastMonthEndDate);
                });
                $('#landingPage .traceHistory').on('click', e => {
                    var _endDate = new Date();
                    _endDate.setMonth(_endDate.getMonth() - 1);
                    _endDate.setDate(0);
                    $("#searchDateE").datepicker("update", getDateString(_endDate));
                    // var _date = new Date('2020-8-28');

                    var _date = new Date('2020-7-09');
                    $("#searchDateS").datepicker("update", getDateString(_date));
                    _init_trace('traceHistory', _date, _endDate);
                });
                $('#landingPage .traceAny').on('click', e => {
                    _init_trace('traceHistory', $('#searchDateS').val(), $('#searchDateE').val());
                });
                $('#landingPage .stockCheck').on('click', e => {
                    _init_stock('stockAnytime', $('#searchDateS').val(), $('#searchDateE').val());
                });

            });

        },
        getDataProcess: function () {
            return data_process;
        },
        getUIControl: function () {
            return UIControl;
        }
    }
}();