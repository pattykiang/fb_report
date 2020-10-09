    var order_data = [];
    var getDateString = function(date,type){
        if(type=='m'){
            return date.getFullYear().toString()+'-'+(date.getMonth()>8 ? '' : '0') +(date.getMonth()+1).toString();
        }
        return date.getFullYear().toString()+'-'+(date.getMonth()+1).toString()+'-'+ (date.getDate()>9 ? '' : '0') + date.getDate().toString();
    }

    var process = function () {
        
        var n=[],forChartData=[]
        var _init = function(){
            $("#orderSearchTableNodata").remove();
            n = [
                ["訂單序號", "會員名稱", "FB連結", "團名", "訂單名稱", "小計", "確認時間", "分類"]
            ];
            $("table tr:not(.hidden)").each(function (t) {
                if (0 != t) {
                    var e = [];
                    e.push($(this).find("td:eq(0)").text()), e.push($(this).find("td:eq(1) a").text()), e.push($(this).find("td:eq(1) a").attr("href")), e.push($(this).find("td:eq(2) div.inline-block").text()), e.push($(this).next().find('td div span[render-text="text"]').map(function () {
                        return $(this).text()
                    }).get().join("\n")), e.push($(this).find("td:eq(3)").text()), e.push($(this).find("td:eq(5)").text()), e.push($(this).next().find('td div span[render-text="text"]').map(function () {
                        return $(this).text().substr(0, 1)
                    }).get().join("").substr(0, 1)), n.push(e)
                }
            });
            forChartData = [];
            n.slice(1).forEach(order => {
                var _date = new Date(order[6]);
                forChartData.push({
                    date:_date,
                    hourString: _date.getHours(),
                    dateString:getDateString(_date),
                    monthString:getDateString(_date,'m'),
                    storeOwner:order[7],
                    item:order[3],
                    sum: order[5].replace(',', '') * 1,
                    user:order[1]
                })
            });
        }
        var _showSingleDay = function(dataList,dateString,storeOwnerList){
            var store_sale = new Array(storeOwnerList.length).fill(0);
            var store_order = new Array(storeOwnerList.length).fill(0);
            var store_uu = new Array(storeOwnerList.length).fill().map(u=>([]));

            dataList.filter(data=>{return data.dateString == dateString}).forEach(data=>{
                var _index = storeOwnerList.indexOf(data.storeOwner);
                if(_index>=0){
                    store_sale[_index] += data.sum;
                    store_order[_index] += 1;
                    store_uu[_index].push(data.user);
                }
            })
            store_uu = store_uu.map(data=>{
                return [...new Set(data)].length;
            })
            UIControl.changSelectDay(dateString,storeOwnerList,store_sale,store_order,store_uu);
        };
        var _showPerHour = function (dataList,dateString,storeOwnerList) {
            
            var store_sale = [];
            var store_order = [];
            storeOwnerList.forEach(owner=>{
                store_sale.push({
                    name:owner + '_銷量',
                    visible:(owner == 'P') ? true : false,
                    data:new Array(24).fill(0)
                })
                store_order.push({
                    name:owner + '_單數',
                    visible:(owner == 'P') ? true : false,
                    data:new Array(24).fill(0)
                })
            })
            dataList.filter(data=>{return data.dateString == dateString}).forEach(data=>{
                var _index = storeOwnerList.indexOf(data.storeOwner);
                if(_index>=0){
                    store_sale[_index].data[data.hourString-1] += data.sum;
                    store_order[_index].data[data.hourString-1] += 1;
                }
            })
            UIControl.showSelectDayPerHour(dateString,store_sale.concat(store_order));
        };
        var _showPerDay = function(dataList,dayStringList,storeOwnerList){
            var store_sale = [];
            storeOwnerList.forEach(owner=>{
                store_sale.push({
                    name:owner,
                    data:new Array(dayStringList.length).fill(0)
                })
            })
            dataList.filter(data=>{return dayStringList.indexOf(data.dateString)>=0}).forEach(data=>{
                var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                var _dateIndex = dayStringList.indexOf(data.dateString);
                if(_ownerIndex>=0 && _dateIndex>=0){
                    store_sale[_ownerIndex].data[_dateIndex] += data.sum;
                }
            })

            UIControl.showSelectPerDay(dayStringList,store_sale);
        };
        var _showPerMonth = function(dataList,monthStringList,storeOwnerList){
            var store_sale = [];
            storeOwnerList.forEach(owner=>{
                store_sale.push({
                    name:owner,
                    data:new Array(monthStringList.length).fill(0)
                })
            })
            dataList.filter(data=>{return monthStringList.indexOf(data.monthString)>=0}).forEach(data=>{
                var _ownerIndex = storeOwnerList.indexOf(data.storeOwner);
                var _dateIndex = monthStringList.indexOf(data.monthString);
                if(_ownerIndex>=0 && _dateIndex>=0){
                    store_sale[_ownerIndex].data[_dateIndex] += data.sum;
                }
            })
            UIControl.ShowSelectPerMonth(monthStringList,store_sale);
        };
        var _showHot = function(dataList,monthStringList,storeOwnerList){
            //內容//總價//總數
            
            var store_sale = [];

            dataList
            .filter(data=>{return monthStringList.indexOf(data.monthString)>=0})
            .filter(data=>{return storeOwnerList.indexOf(data.storeOwner)>=0})
            .map(data=>{
                var list = data.item.split('|')
                var name = list[list.length-1].trim();
                data.itemCode = name.substr(0,6);
                data.itemLabel = name.slice(6);
                return data;
            }).forEach(data=>{
                var _itemIndex = store_sale.map(function(e) { return e.code; }).indexOf(data.itemCode);
                if(_itemIndex>=0){
                    store_sale[_itemIndex].y+=data.sum;
                    store_sale[_itemIndex].z+=1;
                }
                else{
                    store_sale.push( {name: data.itemLabel,code:data.itemCode,y: data.sum, z: 1}); 
                }
            })
            store_sale.sort(function (a, b) {
                return b.z - a.z
              });
            store_sale = store_sale.slice(0,10); 
            UIControl.ShowSelectHotItem(store_sale);
        }
        var _initToUI = function(){
            UIControl.init();
            var selectedObj = _getSelectObj();
            _refreshUI(selectedObj);
        };
        var _getSelectObj = function(){
            var selectDaysList = [];
            var selectMonthsList = [];
            var startDay = new Date($('#searchDateS').val());
            var diffDay = Math.abs(new Date($('#searchDateE').val()) - startDay) / (1000 * 60 * 60 * 24) + 1;
            for(var i=0;i<diffDay;i++){
                var newDate = new Date(startDay);
                newDate.setDate(newDate.getDate()+i)
                selectDaysList.push(getDateString(newDate));
                selectMonthsList.push(getDateString(newDate,'m'));
            }
            selectMonthsList = [...new Set(selectMonthsList)];

            var endDay = new Date($('#searchDateE').val());
            var selectDay = getDateString(endDay);
            var selectOwner = $('input[name="owner"]:checked').map(function(){return $(this).val()}).get();
            var selectTab = $('#adv li .active').attr('name');

            var selectedObj = {
                Day:selectDay,
                Owner:selectOwner,
                DayList:selectDaysList,
                MonthList:selectMonthsList,
                Mode:selectTab
            }
            return selectedObj;
        }
        var _refreshUI = function(selectedObj){
            switch(selectedObj.Mode){
                case '_showSingleDay':
                    //單日  
                    _showSingleDay(forChartData,selectedObj.Day,selectedObj.Owner);
                    break;
                case '_showPerHour':
                    //逐時(單日)   
                    _showPerHour(forChartData,selectedObj.Day,selectedObj.Owner);
                    break;
                case '_showPerDay':
                    //逐日(單月) 
                    _showPerDay(forChartData,selectedObj.DayList,selectedObj.Owner);
                    break;
                case '_showPerMonth':
                    //逐月
                    _showPerMonth(forChartData,selectedObj.MonthList,selectedObj.Owner);
                    break;
                case '_showHotItem':
                    _showHot(forChartData,selectedObj.MonthList,selectedObj.Owner);
                    break;
                case '':
                    break;
            }
            
            
            
        }
        return {
            init:_init,
            initToUI:_initToUI,
            showSingleDay:_showSingleDay,
            showPerHour:_showPerHour,
            showPerDay:_showPerDay,
            showPerMonth:_showPerMonth,
            refreshUI:function(selectedDay){
                var selectedObj = _getSelectObj();
                selectedObj.Day = selectedDay;
                _refreshUI(selectedObj);
            }
        }
    }();
    var UIControl = function(){
        var _isInit = false;
        var _init = function(){
            if(_isInit){
                $("#adv").show();
                return
            };
        
            $("body").append(`<div id='adv' style='top: 130px;left: 50px;height: 500px;right: 50px;position: fixed;z-index: 99;background: #e2e2df;padding: 10px;overflow-y:auto;border: 10px solid rgba(0,0,0,0.5);border-radius: 10px;background-clip: padding-box;'>
            <ul class="nav">
                <li style='vertical-align: middle;line-height: 30px;'>
                    <button id='btnClose' style='right:0px;margin-right: 10px;'>關閉</button> 選擇其他天：<input id='showSingle' type='text' style='width:90px' ></input>
                </li>
                <li>
                    <div>
                        <input name='owner' type="checkbox" value="P" checked>P
                        <input name='owner' type="checkbox" value="H" checked>H
                        <input name='owner' type="checkbox" value="C" checked>C
                        <input name='owner' type="checkbox" value="L">L
                        <input name='owner' type="checkbox" value="V">V
                    </div>
                    <div>
                    <input name='owner' type="checkbox" value="特">特
                    <input name='owner' type="checkbox" value="B">B
                    <input name='owner_all' type="checkbox" value="all">全部
                    </div>
                </li>
                <li class="nav-item">
                    <a class="nav-link active" name='_showSingleDay' data-toggle="pill" href="#pills-singleDay" role="tab">單日狀況</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" name='_showPerHour' data-toggle="pill" href="#pills-hour" role="tab">逐時狀況</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" name='_showPerDay' data-toggle="pill" href="#pills-day" role="tab">逐日狀況</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" name='_showPerMonth' data-toggle="pill" href="#pills-month" role="tab">逐月狀況</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" name='_showHotItem' data-toggle="pill" href="#pills-hot" role="tab">當月熱門</a>
                </li>
            </ul>
            <div class="tab-content" style='margin-top:10px;'>
                <div class="tab-pane  show active" id="pills-singleDay"  role="tabpanel" >
                    <div id='day_container'></div>
                </div>
                <div class="tab-pane" id="pills-hour" role="tabpanel" >
                    <div id='per_hour_container'></div>
                </div>
                <div class="tab-pane" id="pills-day" role="tabpanel">
                    <div id='per_day_container'></div>
                </div>
                <div class="tab-pane" id="pills-month" role="tabpanel">
                    <div id='per_month_container'></div>
                </div>
                <div class="tab-pane" id="pills-hot" role="tabpanel">
                    <div id='hot_item_container'></div>
                </div>
            </div>
            </div>`)
            $('#adv input').css({'margin-left':'5px'});
            $('.tab-pane div').css({'left':'50px','right':'50px'});
            
            $("#showSingle").val($('#searchDateE').val());
            $
            ("#showSingle").datepicker({
                format:'yyyy-mm-dd',
            }).on('changeDate',function(){
                process.refreshUI($("#showSingle").val());
            });
            $('#adv a[data-toggle="pill"]').on('shown.bs.tab',function(){
                process.refreshUI($("#showSingle").val());
            })
            $('#btnClose').on('click',function(){
                $("#adv").hide()
            });

            $('input[name="owner"]').on('change',function(){
                process.refreshUI($("#showSingle").val());
            });
            $('input[name="owner_all"]').on('change',function(){
                if($(this).prop('checked')){
                    $('input[name="owner"]').prop('checked',true);
                }
                else{
                    $('input[name="owner"]').prop('checked',false);
                    $('input[name="owner"]:lt(3)').prop('checked',true);
                }
                process.refreshUI($("#showSingle").val());
            });
            
            _isInit = true;
        };
        var _showSingleDay = function(dateString,storeOwnerList,store_sale,store_order,store_uu){
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
        var _showPerHour = function(dateString,data){
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
        var _showPerDay = function(dayStringList,data){
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
        var _showPerMonth = function(monthStringList,data){
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
        var _showHot = function(data){
            Highcharts.chart('hot_item_container', {
                chart: {
                    type: 'variablepie'
                },
                title:{
                    text:'每月熱門商品'
                },
                subtitle:{
                    text:'圖高-銷售數量；圖寬及%-銷售總額'
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
        return {
            init:_init,
            changSelectDay:_showSingleDay,
            showSelectDayPerHour:_showPerHour,
            showSelectPerDay:_showPerDay,
            ShowSelectPerMonth:_showPerMonth,
            ShowSelectHotItem:_showHot
        }
    }();
    var sellerordersearch = function(){
        var _init = function(){
            $.getScript('https://code.highcharts.com/highcharts.js',function(){
                $.getScript('https://code.highcharts.com/modules/variable-pie.js',function(){
                    Highcharts.setOptions({
                        lang: {
                        thousandsSep: ','
                    }
                    })
                    $(document).ajaxSend(function (t, e, n) {
                        e.done(function (t) {
                            if (order_data = order_data.concat(e.responseJSON.data), !e.responseJSON.nextPage) {
                                //$('table tr:gt(0):lt(100)').hide();
                                process.init();
                                process.initToUI();
                                $('#landingPage').hide();
                            }
                            //$('table tr:gt(0):lt(100)').hide();
                            $("html, body").animate({
                                scrollTop: $(document).height()
                            },1)
                        })
                    });
                    $("html, body").animate({
                        scrollTop: $(document).height()
                    }, 1);
                });
            });
        }
        return {
            landing:function(){
                $('body').append(`<div id='landingPage' style='top: 130px;left: 50px;right: 50px;position: fixed;z-index: 99;background: #e2e2df;padding: 10px;overflow-y:auto;border: 10px solid rgba(0,0,0,0.5);border-radius: 10px;background-clip: padding-box;'>
                    <button class='btnClose' style='right:0px;margin-right: 10px;vertical-align:top'>關閉</button> 
                    <div class='day' style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>本日業積</div>
                    <div class='month'style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>本月業積</div>
                </div>`);
                $('#landingPage .btnClose').on('click',function(){
                    $('#landingPage').hide();
                });
                $('#landingPage .day').on('click',function(){
                    $("#searchDateS").datepicker("update", new Date()).trigger('changeDate');
                    setTimeout(_init,50);
                });
                $('#landingPage .month').on('click',function(){
                    //$("#searchDateE").datepicker("update", new Date()).trigger('changeDate');
                    $("#searchDateS").datepicker("update", getDateString(new Date(),'m')+'-01').trigger('changeDate');
                    setTimeout(_init,50);
                });
            }
        }
    }();
    var sellercontainer = function(){
        return {
            landing:function(){
            $('body').append(`<div id='landingPage' style='top: 130px;left: 50px;right: 50px;position: fixed;z-index: 99;background: #e2e2df;padding: 10px;overflow-y:auto;border: 10px solid rgba(0,0,0,0.5);border-radius: 10px;background-clip: padding-box;'>
                <button class='btnClose' style='right:0px;margin-right: 10px;vertical-align:top'>關閉</button> 
                <div class='download' style='width: 150px;height: 150px;display: inline-block;text-align: center;line-height: 150px;font-size: 20px;cursor: pointer;margin-left: 50px;vertical-align: middle;border: 1px solid rgb(0,0,0);'>未出貨清單下載</div>
           
            </div>`);
            $('#landingPage .btnClose').on('click',function(){
                $('#landingPage').hide();
            });
            $('#landingPage .download').on('click',function(){
                var order_data=[];$(document).ajaxSend(function(e,t,o){t.done(function(e){if(order_data=order_data.concat(t.responseJSON.data),!t.responseJSON.nextPage){console.log(t.responseJSON);var o=[["姓名","FB連結","下單社團","商品訂單","付款狀態","商品","數量","價格"]];order_data.forEach(function(e,t){var a=e.user_fb_name,r="https://www.facebook.com/"+e.user_fb_profile_id;e.orders.forEach(function(e){e.order_product_items.forEach(function(t){var n=[];switch(n.push(a),n.push(r),n.push(e.post_snapshot_media_feed_title),n.push(e.post_snapshot_title),e.order_payment_status){case"PAYING":n.push("付款中");break;case"PAID":n.push("已付款");break;case"UNPAID":n.push("未付款")}n.push(t.product_title),n.push(t.product_style_count),n.push(t.product_sale),o.push(n)})})}),function(e,t){for(var o=function(e){for(var t="",o=0;o<e.length;o++){var a=null===e[o]?"":e[o].toString();e[o]instanceof Date&&(a=e[o].toLocaleString());var r=a.replace(/"/g,'""');r.search(/("|,|\n)/g)>=0&&(r='"'+r+'"'),o>0&&(t+=","),t+=r}return t+"\n"},a="",r=0;r<t.length;r++)a+=o(t[r]);var n=new Blob(["\ufeff"+a],{type:"text/csv;charset=utf-8"});if(navigator.msSaveBlob)navigator.msSaveBlob(n,e);else{var s=document.createElement("a");if(void 0!==s.download){var c=URL.createObjectURL(n);s.setAttribute("href",c),s.setAttribute("download",e),s.style.visibility="hidden",document.body.appendChild(s),s.click(),document.body.removeChild(s)}}}("未付款清單_"+(new Date).toLocaleDateString().replace(/\//g,"")+"_"+(new Date).toLocaleTimeString().slice(2,7).replace(":","")+".csv",o)}$("html, body").animate({scrollTop:$(document).height()},10)})}),$("button.active").trigger("click");
            });
        }
    }();
    switch(document.URL){
        case 'https://www.iplusonego.com/seller/sellerordersearch':
            sellerordersearch.landing();
        break;
        case 'https://www.iplusonego.com/seller/sellercontainer':
            sellercontainer.landing();
            break;
    }