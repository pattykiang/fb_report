    function getDateString(date, type) {
        if (type == 'm') {
            return date.getFullYear().toString() + '-' + (date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1).toString();
        }
        return date.getFullYear().toString() + '-' + (date.getMonth() > 8 ? '' : '0') + (date.getMonth() + 1).toString() + '-' + (date.getDate() > 9 ? '' : '0') + date.getDate().toString();
    }

    function toCurrency(num) {
        var parts = num.toString().split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }


    var extendData = {
        rawUrl: (document.rawUrl) ? document.rawUrl : 'https://raw.githubusercontent.com/pattykiang/fb_report/main/',
        ajaxObject: {
            thisMonthSale: null,
            traceLastMonth: null,
            traceHistory: null
        },
        isForceReload: false,
        order_data: []
    }
    document.extendData = extendData;

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
        var data_process = function () {
            var n = [],
                forChartData = []
            var _init = function () {
                forChartData = [];
                extendData.order_data.forEach(order => {
                    var _date = new Date(order.order_checked_time + ' UTC');
                    forChartData.push({
                        date: _date,
                        hourString: _date.getHours(),
                        dateString: getDateString(_date),
                        monthString: getDateString(_date, 'm'),
                        storeOwner: order.order_product_items[0].product_title.substr(0, 1),
                        item: order.post_snapshot_title,
                        sum: order.order_total_price * 1,
                        count: order.order_product_items.reduce(function (acc, obj) {
                            return acc + obj.product_style_count;
                        }, 0),
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

                var dataList_nor = dataList
                    .filter(data => {
                        return monthStringList.indexOf(data.monthString) >= 0
                    })
                    .filter(data => {
                        return storeOwnerList.indexOf(data.storeOwner) >= 0
                    })
                    .map(data => {
                        var obj = {};
                        var list = data.item.split('|')
                        var name = list[list.length - 1].trim();
                        obj.item = data.item;
                        obj.name = name;
                        obj.count = data.count;
                        obj.sum = data.sum;
                        var matchResult = data.item.match(/\d{6}/);
                        if (matchResult) {
                            obj.itemCode = matchResult[0]; //name.substr(0, 6);
                            obj.itemLabel = name.slice(6);
                        }
                        // var list = data.item.split('|')
                        // var name = list[list.length - 1].trim();
                        // data.itemCode = data.item.match(/\d{6}/)[0];//name.substr(0, 6);
                        // data.itemLabel = name.slice(6);
                        // return data;
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

                    $('input[name="owner"]').on('change', e => {
                        data_process.refreshUI($("#showSingle").val());
                    });
                    $('input[name="owner_all"]').on('change', e => {
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
                                    var comment_html = (data.order_comments.length > 0) ? `<a href="https://www.facebook.com/${data.order_comments[0].comment_id}?ipo_no_ext=1" target="_blank">${data.post_snapshot_title}</a>` : data.post_snapshot_title;

                                    var comment_style = ''
                                    var orderCount = '--';
                                    var orderCount_fill = '--'

                                    data.order_product_items.map(function(e){
                                     
                                        orderCount = e.product_style_count;
                                        orderCount_fill = e.product_style_filled;
                                        comment_style = e.product_style_title;

                                        htmlString += `<tr>
                                            <td>${data.user_fb_name}</td>
                                            <td>${comment_html}</td>
                                            <td>${comment_style}</td>
                                            <td>${orderCount}</td>
                                            <td>${orderCount_fill}</td>
                                            <td>${toCurrency(e.product_sale*orderCount)}</td>
                                            <td>${new Date(data.order_checked_time+' UTC').toLocaleString()}</td>
                                        </tr>`;
                                    })

                                });
                                if (fb_id != 'all') {
                                    htmlPersonal  = `<h3>該成員社團為：${whichClub}</h3>
                                    <a href="https://www.facebook.com/${fb_id}" target="_blank">個人臉書</a>
                                    <a href="https://www.facebook.com/ursmalltwo/inbox/?mailbox_id=102856077945544&selected_item_id=${fb_id}" target="_blank">曉貳訊息</a>
                                    <hr/>`
                                }

                                htmlString = `<html><head><title></title></head>
                                <body>
                                ${htmlPersonal}
                                <table style='font-size:20px;border-spacing:10px;'>
                                <tr>
                                    <td>會員名稱</td>
                                    <td>團名</td>
                                    <td>規格</td>
                                    <td>訂購量</td>
                                    <td>已配貨</td>
                                    <td>小計</td>
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
                $('#landingPage .btnClose').on('click', e => {
                    $('#landingPage').hide();
                });
                $('#landingPage .download').on('click', e => {
                    extendData.order_data = [];
                    $(document).ajaxSend(function (e, t, o) {
                        t.done(function (e) {
                            if (extendData.order_data = extendData.order_data.concat(t.responseJSON.data), !t.responseJSON.nextPage) {
                                var o = [
                                    ["姓名", "FB連結", "下單社團", "商品訂單", "付款狀態", "商品", "數量", "價格"]
                                ];
                                extendData.order_data.forEach(function (e, t) {
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

    var ordercontainer = function () {

        var mainOrderSouce = '';
        var secondOrderSouce = '';

        var wb; //讀取完成的資料
        var rABS = false; //是否將檔案讀取為二進位制字串
        function importf(obj, callback) { //匯入
            if (!obj.files) {
                return;
            }
            var f = obj.files[0];
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                if (rABS) {
                    wb = XLSX.read(btoa(fixdata(data)), { //手動轉化
                        type: 'base64'
                    });
                } else {
                    wb = XLSX.read(data, {
                        type: 'binary'
                    });
                }
                //wb.SheetNames[0]是獲取Sheets中第一個Sheet的名字
                //wb.Sheets[Sheet名]獲取第一個Sheet的資料
                callback(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]))
            };
            if (rABS) {
                reader.readAsArrayBuffer(f);
            } else {
                reader.readAsBinaryString(f);
            }
        }

        function fixdata(data) { //檔案流轉BinaryString
            var o = "",
                l = 0,
                w = 10240;
            for (; l < data.byteLength / w; ++l) o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w, l * w + w)));
            o += String.fromCharCode.apply(null, new Uint8Array(data.slice(l * w)));
            return o;
        }
        var _loadingScript = function () {
            $.getScript('https://unpkg.com/string-similarity/umd/string-similarity.min.js', e => {});
            $.getScript('https://unpkg.com/xlsx/dist/xlsx.full.min.js', e => {});
        }();
        var UIControl = function () {
            var _init = function () {

            };

            return {
                init: _init,
            }
        }();
        return {
            landing: function () {
                $.ajax({
                    url: extendData.rawUrl + 'ui/orderCompare/landing.html',
                    async: false,
                    cache: false
                }).then(function (data) {
                    $('body').append(data);
                }).then(function () {
                    $('.upload_main input').on('change', function () {
                        importf(this, function (source) {
                            mainOrderSouce = source;
                            $('.upload_main div').html('已上傳');
                        })
                    });
                    $('.upload_second input').on('change', function () {
                        importf(this, function (source) {
                            secondOrderSouce = source;
                            $('.upload_second div').html('已上傳');
                        })
                    });
                    $('#landingPage .btnClose').on('click', e => {
                        $('#landingPage').hide();
                    });

                    $('#compare').on('click', function () {
                        //data preprocess
                        var mainOrderObect = {};
                        mainOrderSouce.forEach(o => {
                            var plusSubname = (o['規格']) ? o['規格'] : '';
                            compareName = (o['商品名稱'] + plusSubname).replace('黑名單｜分店資料', '')
                            compareName = (compareName.length > 6) ? compareName.substr(6).trim() : compareName;

                            if (Object.keys(mainOrderObect).indexOf(compareName) == -1) {
                                mainOrderObect[compareName] = {
                                    count: o.數量,
                                    raw: [o]
                                };
                            } else {
                                mainOrderObect[compareName].count += o.數量;
                                mainOrderObect[compareName].raw.push(o)
                            }
                        });
                        var secondOrderObect = {};
                        secondOrderSouce.forEach(o => {
                            var plusSubname = (o['款式']) ? o['款式'] : '';
                            compareName = (o['商品名稱'] + plusSubname);
                            compareName = (compareName.length > 7) ? compareName.substr(7).trim() : compareName;
                            if (Object.keys(secondOrderObect).indexOf(compareName) == -1) {
                                secondOrderObect[compareName] = {
                                    count: o.數量,
                                    raw: [o]
                                };
                            } else {
                                secondOrderObect[compareName].count += o.數量;
                                secondOrderObect[compareName].raw.push(o)
                            }
                        });
                        var compareResult = [];
                        var restOftarget = JSON.parse(JSON.stringify(secondOrderObect));
                        Object.keys(mainOrderObect).forEach(o => {
                            var matches = stringSimilarity.findBestMatch(o, Object.keys(secondOrderObect));

                            compareResult.push([o, matches.bestMatch, mainOrderObect[o].count, secondOrderObect[matches.bestMatch.target].count]);
                            delete restOftarget[matches.bestMatch.target];
                            // restOftarget[matches.bestMatchIndex] = '';
                            // restOftarget.splice(o.bestMatchIndex,1)
                        })

                        $.ajax({
                            url: extendData.rawUrl + '/ui/orderCompare/table.html',
                            async: false,
                            cache: false
                        }).then(function (data) {
                            var htmlString = data;
                            var htmlString2 = '';

                            compareResult.sort(function (a, b) {
                                return b[2] - a[2]
                            }).sort(function (a, b) {
                                return b[1].rating - a[1].rating
                            }).forEach(o => {
                                var selectedItem = o[1].target;
                                var selectedItemCount = o[3];
                                var nameLabel = 'normal';
                                var noLikeItem = '';
                                var isSameCount = '';

                                if (o[2] != o[3]) {
                                    isSameCount = '數量不一致';
                                    nameLabel = 'warning';
                                }

                                if (o[1].rating == 0) {
                                    nameLabel = 'warning';
                                    noLikeItem = '無對應商品';
                                    selectedItem = '';
                                    selectedItemCount = '';
                                    isSameCount = '';
                                } else if (o[1].rating < 0.8) {
                                    noLikeItem = '需確認';
                                    nameLabel = 'warning';
                                } else {
                                    noLikeItem = '';
                                }

                                htmlString2 += `<tr name="${nameLabel}">
                                                <td>${o[0]}</td>
                                                <td>${selectedItem}</td>
                                                <td>${(o[1].rating*100).toFixed()+'%'}</td>
                                                <td>${o[2]}</td>
                                                <td>${selectedItemCount}</td>
                                                <td>${noLikeItem}</td>
                                                <td>${isSameCount}</td>
                                              </tr>`

                            });
                            Object.keys(restOftarget).forEach(o => {

                                htmlString2 += `<tr name="warning">
                                <td></td>
                                <td>${o}</td>
                                <td></td>
                                <td></td>
                                <td>${restOftarget[o].count}</td>
                                <td>找不到對應</td>
                                <td></td>
                              </tr>`

                            });


                            htmlString = htmlString.replace('@htmlString2', htmlString2);
                            $('.compareResult').html(htmlString);
                        });

                    });

                    var isHide = false;
                    $('#btnFilter').on('click', function () {
                        if (isHide) {
                            $('table tr[name="normal"]').show();
                            isHide = false;
                        } else {
                            $('table tr[name="normal"]').hide();
                            isHide = true;
                        }
                    })
                });
            }
        }
    }();
    var mainOrdercontainer = function () {
        var allOrderData;
        $(document).on('ajaxSend', function (t, e, n) {
            e.done(function (t) {
                if (t) {
                    allOrderData = t;
                }
            })
        });
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
                    //     '數量': order.order_product_items[0].product_style_total_count,
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
                main();
                setTimeout(processData, 15000);
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
        case 'https://www.iplusonego.com/seller/mainorder':
            ordercontainer.landing();
            break;
        case 'https://www.iplusonego.com/buyer/orders?seller=129712985182342':
            mainOrdercontainer.landing();
            break;
    }