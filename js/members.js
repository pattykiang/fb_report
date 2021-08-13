var memberscontainer = function () {
    var _loadingScript = function () {}();
    var _init = function (mode) {
        if (extendData.ajaxObject[mode] && !extendData.isForceReload) {
            extendData.order_data = extendData.ajaxObject[mode];
            $('#landingPage').hide();
            return
        }
        var allMember = [];

        $(document).on('ajaxSend', function (t, e, setting) {
            if (setting.url.search('member_count') == -1 && setting.url.search('https://www.iplusonego.com/api/index.php/members?') != -1) {
                e.done(function (t) {

                    var isPass = (!t.nextPage) ? true : false;
                    allMember = allMember.concat(t.data);
                    if (isPass) {
                        $(document).off('ajaxSend');
                        //整理下載資料
                        var count = allMember.filter(member => {
                            return (member.member_need_pay + member.member_spending > 0)
                        }).length;
                        var hasInfoList = allMember.filter(member => {

                            var keyObj = member.member_info
                            var KeyCount = Object.values(keyObj).filter(key => {
                                return key != ''
                            }).length;

                            return KeyCount != 0
                        }).map(member => {
                            return {
                                user_fb_name: member.user_fb_name,
                                member_birthday: member.member_info.member_birthday,
                                member_email: member.member_info.member_email,
                                member_line_id: member.member_info.member_line_id,
                                member_name: member.member_info.member_name,
                                member_phone: member.member_info.member_phone
                            }
                        })
                        console.log(hasInfoList);
                        console.log(JSON.stringify(hasInfoList));

                        alert("下單人數：" + count);;
                        $('#landingPage').hide();
                    } else {
                        $("html, body").animate({
                            scrollTop: $(document).height()
                        }, 1)
                    }
                })
            }
        });
    }
    var _initToUI = function (classifyProduct) {}
    return {
        landing: function () {
            _init();
        }
    }
}();