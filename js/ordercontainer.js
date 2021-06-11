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