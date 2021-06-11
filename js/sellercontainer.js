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
