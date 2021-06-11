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


    var loadingFileName = 'js/'+document.URL.split('/').pop()+'.js';
    var callback;

    switch (document.URL) {
        case 'https://www.iplusonego.com/seller/sellerordersearch':
            callback = e => { sellerordersearch.landing() };    
            break;
        case 'https://www.iplusonego.com/seller/sellercontainer':
            callback = e => { sellercontainer.landing() };    
            break;
        case 'https://www.iplusonego.com/seller/mainorder':
            callback = e => { mainOrdercontainer.landing() };
            break;
        case 'https://www.iplusonego.com/seller/sellergroups':
                callback = e => { sellergroupscontainer.landing() };
                break;
        // case 'https://www.iplusonego.com/buyer/orders?seller=129712985182342':
        //     mainOrdercontainer.landing();
        //     break;
    }
    $.ajax({ url: document.rawUrl + loadingFileName, cache: false }).then( callback);
    window.addEventListener('load', function () {
        Notification.requestPermission(function (status) {
          // This allows to use Notification.permission with Chrome/Safari
          if (Notification.permission !== status) {
            Notification.permission = status;
          }
        });
      });

      var n = new Notification("Hi!");
n.onshow = function () {
  setTimeout(n.close, 5000);
}