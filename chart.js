    function getDateString(date, type) {
        if (type == 'm') {
            return date.getFullYear().toString() + '-' + (date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1).toString();
        }
        return date.getFullYear().toString() + '-' + (date.getMonth() + 1).toString() + '-' + (date.getDate() > 9 ? '' : '0') + date.getDate().toString();
    }

    function toCurrency(num) {
        var parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }
    var rawUrl = 'https://raw.githubusercontent.com/pattykiang/fb_report/dev/';
    var ajaxObject = {
        thisMonthSale: null,
        traceLastMonth: null,
        traceHistory: null
    };
    var order_data = [];
    var sellerordersearch = function () {
        var _loadingScript = function () {
            $.getScript('https://code.highcharts.com/highcharts.js', function () {
                $.getScript('https://code.highcharts.com/modules/variable-pie.js', function () {
                    Highcharts.setOptions({
                        lang: {
                            thousandsSep: ','
                        }
                    });
                });
            });
        }();
        var _init = function (mode) {
            debugger
            console.log('_init call loading')
            if (ajaxObject[mode]) {
                order_data = ajaxObject[mode];
                data_process.init();
                data_process.initToUI();
                $('#landingPage').hide();
                return
            }
            $(document).on('ajaxSend', function (t, e, n) {
                e.done(function (t) {
                    if (order_data = order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                        $(document).off('ajaxSend');

                        //去除重複object
                        order_data = [...new Set(order_data.map(order => {
                            return JSON.stringify(order)
                        }))];
                        order_data = order_data.map(order => {
                            return JSON.parse(order)
                        });
                        //
                        ajaxObject[mode] = $.extend(true, [], order_data);
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
            order_data = []
            $("#searchDateE").trigger('changeDate');
            $("#searchDateS").trigger('changeDate');
            $("html, body").animate({
                scrollTop: 0
            }, 5);
            setTimeout(function () {
                $("html, body").animate({
                    scrollTop: $(document).height()
                }, 5);
            }, 3000)
        }
        var _init_trace = function (mode, startDate, endDate) {
            if (ajaxObject[mode]) {
                order_data = ajaxObject[mode];
                data_process.init_Trace(mode, startDate, endDate);
                $('#landingPage').hide();
                return;
            }
            $(document).on('ajaxSend', function (t, e, n) {
                e.done(function (t) {
                    if (order_data = order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                        $(document).off('ajaxSend');

                        //去除重複object
                        order_data = [...new Set(order_data.map(order => {
                            return JSON.stringify(order)
                        }))];
                        order_data = order_data.map(order => {
                            return JSON.parse(order)
                        });
                        //
                        ajaxObject[mode] = $.extend(true, [], order_data);

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
            order_data = [];
            $("#searchDateE").trigger('changeDate');
            $("#searchDateS").trigger('changeDate');
            $("html, body").animate({
                scrollTop: 0
            }, 5);
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
                order_data.forEach(order => {
                    var _date = new Date(order.order_checked_time + ' UTC');
                    forChartData.push({
                        date: _date,
                        hourString: _date.getHours(),
                        dateString: getDateString(_date),
                        monthString: getDateString(_date, 'm'),
                        storeOwner: order.order_product_items[0].product_title.substr(0, 1),
                        item: order.post_snapshot_title,
                        sum: order.order_total_price * 1,
                        user: order.user_fb_name
                    })

                })
                document.forChartData = forChartData;
            }
            var _showSingleDay = function (dataList, dateString, storeOwnerList) {
                var store_sale = new Array(storeOwnerList.length).fill(0);
                var store_order = new Array(storeOwnerList.length).fill(0);
                var store_uu = new Array(storeOwnerList.length).fill().map(u => ([]));

                dataList.filter(data => {
                    return data.dateString == dateString
                }).forEach(data => {
                    var _index = storeOwnerList.indexOf(data.storeOwner);
                    if (_index >= 0) {
                        store_sale[_index] += data.sum;
                        store_order[_index] += 1;
                        store_uu[_index].push(data.user);
                    }
                })
                store_uu = store_uu.map(data => {
                    return [...new Set(data)].length;
                })
                UIControl.changSelectDay(dateString, storeOwnerList, store_sale, store_order, store_uu);
            };
            var _showPerHour = function (dataList, dateString, storeOwnerList) {

                var store_sale = [];
                var store_order = [];
                storeOwnerList.forEach(owner => {
                    store_sale.push({
                        name: owner + '_銷量',
                        visible: (owner == 'P') ? true : false,
                        data: new Array(24).fill(0)
                    })
                    store_order.push({
                        name: owner + '_單數',
                        visible: (owner == 'P') ? true : false,
                        data: new Array(24).fill(0)
                    })
                })
                dataList.filter(data => {
                    return data.dateString == dateString
                }).forEach(data => {
                    var _index = storeOwnerList.indexOf(data.storeOwner);
                    if (_index >= 0) {
                        store_sale[_index].data[data.hourString] += data.sum;
                        store_order[_index].data[data.hourString] += 1;
                    }
                })
                UIControl.showSelectDayPerHour(dateString, store_sale.concat(store_order));
            };
            var _showPerDay = function (dataList, dayStringList, storeOwnerList) {
                var store_sale = [];
                storeOwnerList.forEach(owner => {
                    store_sale.push({
                        name: owner,
                        data: new Array(dayStringList.length).fill(0)
                    })
                })
                dataList.filter(data => {
                    return dayStringList.indexOf(data.dateString) >= 0
                }).forEach(data => {
                    var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                    var _dateIndex = dayStringList.indexOf(data.dateString);
                    if (_ownerIndex >= 0 && _dateIndex >= 0) {
                        store_sale[_ownerIndex].data[_dateIndex] += data.sum;
                    }
                })

                UIControl.showSelectPerDay(dayStringList, store_sale);
            };
            var _showPerMonth = function (dataList, monthStringList, storeOwnerList) {
                var store_sale = [];
                storeOwnerList.forEach(owner => {
                    store_sale.push({
                        name: owner,
                        data: new Array(monthStringList.length).fill(0)
                    })
                })
                dataList.filter(data => {
                    return monthStringList.indexOf(data.monthString) >= 0
                }).forEach(data => {
                    var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                    var _dateIndex = monthStringList.indexOf(data.monthString);
                    if (_ownerIndex >= 0 && _dateIndex >= 0) {
                        store_sale[_ownerIndex].data[_dateIndex] += data.sum;
                    }
                })
                UIControl.ShowSelectPerMonth(monthStringList, store_sale);
            };
            var _showHot = function (dataList, monthStringList, storeOwnerList) {
                //內容//總價//總數

                var store_sale = [];

                dataList
                    .filter(data => {
                        return monthStringList.indexOf(data.monthString) >= 0
                    })
                    .filter(data => {
                        return storeOwnerList.indexOf(data.storeOwner) >= 0
                    })
                    .map(data => {
                        var list = data.item.split('|')
                        var name = list[list.length - 1].trim();
                        data.itemCode = name.substr(0, 6);
                        data.itemLabel = name.slice(6);
                        return data;
                    }).forEach(data => {
                        var _itemIndex = store_sale.map(function (e) {
                            return e.code;
                        }).indexOf(data.itemCode);
                        if (_itemIndex >= 0) {
                            store_sale[_itemIndex].y += data.sum;
                            store_sale[_itemIndex].z += 1;
                        } else {
                            store_sale.push({
                                name: data.itemLabel,
                                code: data.itemCode,
                                y: data.sum,
                                z: 1
                            });
                        }
                    })
                store_sale.sort(function (a, b) {
                    return b.z - a.z
                });
                store_sale = store_sale.slice(0, 10);
                UIControl.ShowSelectHotItem(store_sale);
            };
            var _showReport = function (dataList, dateString, storeOwnerList) {

                var store_single = new Array(4).fill().map(o => ({
                    label: '',
                    sum: 0
                }));
                var store_month = new Array(5).fill().map(o => ({
                    label: '',
                    sum: 0
                }));

                store_single[0].label = "(" + dateString + ")";
                store_single[1].label = '媽媽裸績';
                store_single[2].label = '二店裸績';
                store_single[3].label = '小黑裸績';

                store_month[0].label = "(" + dateString.substr(0, dateString.length - 3) + "月累積)";
                store_month[1].label = '媽媽裸績';
                store_month[2].label = '二店裸績';
                store_month[3].label = '小黑裸績';
                store_month[4].label = '全部心血';

                dataList.filter(data => storeOwnerList.indexOf(data.storeOwner) >= 0).forEach(data => {
                    var _ownerIndex = -1;
                    switch (data.storeOwner) {
                        case 'V':
                        case 'C':
                        case 'L':
                            _ownerIndex = 1;
                            break;
                        case 'P':
                            _ownerIndex = 2;
                            break;
                        case 'H':
                            _ownerIndex = 3;
                            break;
                        case 'B':
                        case '特':
                            break;
                    }
                    if (_ownerIndex >= 0) {
                        //當日
                        if (data.dateString == dateString) {
                            store_single[_ownerIndex].sum += data.sum;
                        }
                        //累積當月至當日
                        if (data.dateString <= dateString) {
                            store_month[_ownerIndex].sum += data.sum;
                            store_month[4].sum += data.sum;
                        }
                    }
                });
                UIControl.ShowSelectReport(store_single, store_month);
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
                var selectOwner = $('input[name="owner"]:checked').map(function () {
                    return $(this).val()
                }).get();
                var selectTab = $('#adv li .active').attr('name');

                var selectedObj = {
                    Day: selectDay,
                    Owner: selectOwner,
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
                    traceOrder['order_all'] = createTraceOrder(periodOrder);

                    var periodOrderAllPrice = traceOrder['order_all'].sum;

                    var order_finish = periodOrder.filter(order => {
                        return (order.order_status == 'FINISH') ? true : false
                    });
                    traceOrder['order_finish'] = createTraceOrder(order_finish, periodOrderAllPrice);

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



                    var order_going_paid = order_unfinish.filter(order => {
                        return (order.order_status == 'CHECKED' && order.order_payment_status == 'PAID') ? true : false
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

                var data = getTraceOrderWithPeriod(order_data, startDate, endDate);
                document.orderTrace = data;
                UIControl.initTrace(mode, data);
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
                init_Trace: _init_trace
            }
        }();
        var UIControl = function () {
            var _init = function () {
                $.ajax({
                    url: rawUrl + '/ui/sale/index.html',
                    async: false
                }).then(function (data) {
                    $('body').append(data);
                    
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
                        }).on('changeDate', function () {
                            data_process.refreshUI($("#showSingle").val());
                        });
                    $('#adv a[data-toggle="pill"]').on('shown.bs.tab', function () {
                        data_process.refreshUI($("#showSingle").val());
                    })
                    $('#adv .btnBack').on('click', function () {
                        $('#adv').remove();
                        $('#landingPage').show();
                    });

                    $('input[name="owner"]').on('change', function () {
                        data_process.refreshUI($("#showSingle").val());
                    });
                    $('input[name="owner_all"]').on('change', function () {
                        if ($(this).prop('checked')) {
                            $('input[name="owner"]').prop('checked', true);
                        } else {
                            $('input[name="owner"]').prop('checked', false);
                            $('input[name="owner"]:lt(3)').prop('checked', true);
                        }
                        data_process.refreshUI($("#showSingle").val());
                    });
                });

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
            var _showReport = function (single_data, month_data) {

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

            }
            var _init_trace = function (mode, dataList) {
                $.ajax({
                    url: rawUrl + '/ui/trace/index.html',
                    async: false
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
                    $("body").append(htmlString);


                    $(".byStatus tr td:nth-child(2)").css({
                        'text-align': 'right',
                        'width': '100px'
                    });
                    $(".byStatus tr td:nth-child(3)").css({
                        'text-align': 'right',
                        'width': '100px'
                    });
                    $(".byStatus tr td:nth-child(4)").css({
                        'text-align': 'right',
                        'width': '100px'
                    });
                    $(".byStatus tr td:nth-child(5)").css({
                        'text-align': 'right',
                        'width': '100px'
                    });
                    $('tr').css('border-bottom', '1px solid black');
                    $('td a').css('cursor', 'pointer');
    
                    //Close
                    $('#adv .btnBack').on('click', function () {
                        $('#adv').remove();
                        $('#landingPage').show();
                    });
    
                    //確認清單-事件
                    $('.byStatus table a').on('click', function () {
                        $('.byPeople table tr:gt(1)').remove();
    
                        var func = $(this).attr('name');
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
    
                        $('td a').css('cursor', 'pointer');
                        $(".byPeople tr td:nth-child(1)").css({
                            'width': '150px'
                        });
                        $(".byPeople tr td:nth-child(2)").css({
                            'text-align': 'right',
                            'width': '100px'
                        });
                        $(".byPeople tr td:nth-child(3)").css({
                            'text-align': 'right',
                            'width': '100px'
                        });
                        $(".byPeople tr td:nth-child(4)").css({
                            'text-align': 'right',
                            'width': '100px'
                        });
                        $('.byPeople').css({
                            'visibility': ''
                        });
                    })
                    //訂單細節-另開事件
                    $(document).on('click', '.byPeople table a', function () {
                        var func = $(this).attr('func');
                        var fb_id = $(this).attr('name');
                        var htmlString = '';
                        dataList[func].data.filter(data => {
                            return (data.user_fb_profile_id == fb_id || fb_id == 'all') ? true : false
                        }).forEach(data => {
                            htmlString += `<tr>
                                <td>${data.order_id}</td>
                                <td><a href="https://www.facebook.com/${data.user_fb_profile_id}" target="_blank">${data.user_fb_name}</a></td>
                                <td>${data.post_snapshot_title}</td>
                                <td>${toCurrency(data.order_total_price)}</td>
                                <td>${new Date(data.order_checked_time+' UTC').toString()}</td>
                            </tr>`
                            // htmlString +=data.order_payment_status
                            // htmlString +=data.order_status
                        });
                        //${$(this).parent().parent().find('td:eq(0)').text()}
                        htmlString = `<html><head><title></title></head>
                        <body>
                        <table style='font-size:20px'>
                        <tr>
                            <td>訂單序號</td>
                            <td>會員名稱</td>
                            <td>團名</td>
                            <td>小計</td>
                            <td>確認時間</td>
                        </tr>
                        ${htmlString}
                        </table></body></html>`;
                        var wnd = window.open("about:blank", '', config = 'height=800px,width=1300px');
                        wnd.document.write(htmlString);
                    })
                });
            };
            return {
                init: _init,
                changSelectDay: _showSingleDay,
                showSelectDayPerHour: _showPerHour,
                showSelectPerDay: _showPerDay,
                ShowSelectPerMonth: _showPerMonth,
                ShowSelectHotItem: _showHot,
                ShowSelectReport: _showReport,
                initTrace: _init_trace
            }
        }();
        return {
            landing: function () {
                $('body').append(`<div id='landingPage' style='top: 250px;left: 50px;right: 50px;position: fixed;z-index: 99;background: #e2e2df;padding: 10px;overflow-y:auto;border: 10px solid rgba(0,0,0,0.5);border-radius: 10px;background-clip: padding-box;'>
                    <button class='btnClose' style='right: 80px;position: fixed'>關閉</button> 
                
                    <div class='day' style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>本日業績</div>
                    <div class='month'style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>本月業績</div>
                    <div class='traceLastMonth'style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>訂單追蹤(上月)</div>
                    <div class='traceHistory'style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>訂單追蹤(歷史)</div>
                </div>`);
                $('#landingPage .btnClose').on('click', function () {
                    $('#landingPage').show().hide();
                });
                $('#landingPage .day').on('click', function () {
                    $("#searchDateS").datepicker("update", new Date()).trigger('changeDate');
                    $("#searchDateE").datepicker("update", new Date()).trigger('changeDate');
                    _init('day');
                });
                $('#landingPage .month').on('click', function () {
                    $("#searchDateE").datepicker("update", new Date());
                    $("#searchDateS").datepicker("update", getDateString(new Date(), 'm') + '-01');
                    _init('thisMonthSale');
                });
                $('#landingPage .traceLastMonth').on('click', function () {
                    var lastMonthStartDate = new Date();
                    lastMonthStartDate.setDate(1);
                    lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);
                    var lastMonthEndDate = new Date(new Date().getFullYear(), new Date().getMonth(), 0);
                    $("#searchDateE").datepicker("update", getDateString(lastMonthEndDate));
                    $("#searchDateS").datepicker("update", getDateString(lastMonthStartDate));;
                    _init_trace('traceLastMonth', lastMonthStartDate, lastMonthEndDate);
                });
                $('#landingPage .traceHistory').on('click', function () {
                    var lastMonthStartDate = new Date();
                    lastMonthStartDate.setDate(1);
                    lastMonthStartDate.setMonth(lastMonthStartDate.getMonth() - 1);

                    $("#searchDateE").datepicker("update", getDateString(lastMonthStartDate));
                    $("#searchDateS").datepicker("update", getDateString(new Date('2020-7-09')));

                    _init_trace('traceHistory', new Date('2020-07-09'), lastMonthStartDate);
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
    var sellercontainer = function () {
        return {
            landing: function () {
                $('body').append(`<div id='landingPage' style='top: 130px;left: 50px;right: 50px;position: fixed;z-index: 99;background: #e2e2df;padding: 10px;overflow-y:auto;border: 10px solid rgba(0,0,0,0.5);border-radius: 10px;background-clip: padding-box;'>
                    <button class='btnClose' style='right:0px;margin-right: 10px;vertical-align:top'>關閉</button> 
                    <div class='download' style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>未出貨清單下載</div>
            
                </div>`);
                $('#landingPage .btnClose').on('click', function () {
                    $('#landingPage').hide();
                });
                $('#landingPage .download').on('click', function () {
                    var order_data = [];
                    $(document).ajaxSend(function (e, t, o) {
                        t.done(function (e) {
                            if (order_data = order_data.concat(t.responseJSON.data), !t.responseJSON.nextPage) {
                                var o = [
                                    ["姓名", "FB連結", "下單社團", "商品訂單", "付款狀態", "商品", "數量", "價格"]
                                ];
                                order_data.forEach(function (e, t) {
                                        var a = e.user_fb_name,
                                            r = "https://www.facebook.com/" + e.user_fb_profile_id;
                                        e.orders.forEach(function (e) {
                                            e.order_product_items.forEach(function (t) {
                                                var n = [];
                                                switch (n.push(a), n.push(r), n.push(e.post_snapshot_media_feed_title), n.push(e.post_snapshot_title), e.order_payment_status) {
                                                    case "PAYING":
                                                        n.push("付款中");
                                                        break;
                                                    case "PAID":
                                                        n.push("已付款");
                                                        break;
                                                    case "UNPAID":
                                                        n.push("未付款")
                                                }
                                                n.push(t.product_title), n.push(t.product_style_count), n.push(t.product_sale), o.push(n)
                                            })
                                        })
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
                                    }("未付款清單_" + (new Date).toLocaleDateString().replace(/\//g, "") + "_" + (new Date).toLocaleTimeString().slice(2, 7).replace(":", "") + ".csv", o)
                            }
                            $("html, body").animate({
                                scrollTop: $(document).height()
                            }, 10)
                        })
                    }), $("button.active").trigger("click");
                });
            }
        }
    }();
    switch (document.URL) {
        case 'https://www.iplusonego.com/seller/sellerordersearch':
            sellerordersearch.landing();
            break;
        case 'https://www.iplusonego.com/seller/sellercontainer':
            sellercontainer.landing();
            break;
    }