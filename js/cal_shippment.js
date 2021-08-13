    var workerHTML = `var shippment=[[0.5,180],[1.5,210],[2.5,240],[3.5,290],[4.5,340],[5.5,390],[6.5,440],[7.5,490],[8.5,540],[9.5,590],[10.5,640],[11.5,720],[12.5,800],[13.5,880],[14.5,960],[15.5,1050],[16.5,1140],[17.5,1230],[18.5,1320],[19.5,1410],[20.5,1500],[21.5,1500],[22.5,1600],[23.5,1600],[24.5,1700],[25.5,1700],[26.5,1800],[27.5,1800],[28.5,1900],[29.5,1900],[30.5,2000],[31.5,2000]]；

    addEventListener('message', function (e) {    
        const thread = e.data.thread;
        const cargo_num = e.data.cargo_num;
        const product = e.data.product;
        const bio_list = e.data.bio_list;
     
        var miniumOne = {
            total_cost: 1000000000
        };

        bio_list.map(bio_list_item=>{

            tryArray = {
                bucket: Array.from({
                    length: cargo_num
                }, u => ([])),
                cal: Array.from({
                    length: cargo_num
                }, u => ({
                    weight: 0,
                    price: 0,
                    shipping: 0
                })),
                total_shipping: 0,
                discount: 0,
                total_cost: 0
            }      
        
            bio_list_item.map((item, index) => {
                tryArray.bucket[item].push(product[index]);
                tryArray.cal[item].weight += Number(product[index].weight) * Number(product[index].piece);
                tryArray.cal[item].price += Number(product[index].total_price);
            })
            //幾箱分開看
            tryArray.bucket.map((e, index) => {
                //計算discount
        
                if (tryArray.cal[index].price < 5000) {
                    tryArray.discount += 0;
                } else if (tryArray.cal[index].price >= 5000 && tryArray.cal[index].price < 10000) {
                    tryArray.discount += 100;
                } else if (tryArray.cal[index].price >= 10000 && tryArray.cal[index].price < 30000) {
                    tryArray.discount += 250;
                } else if (tryArray.cal[index].price >= 30000) {
                    tryArray.discount += 800;
                }
        
                //計算運費
                for (var j = 0; j < shippment.length - 1; j++) {
                    var weight = shippment[j][0];
                    var weight_next = shippment[j + 1][0];
                    var price = shippment[j][1];
        
                    if (tryArray.cal[index].weight == 0) {
                        return true;
                    }
                    //第一項
                    if (tryArray.cal[index].weight != 0 &&
                        tryArray.cal[index].weight / 1000 < weight &&
                        tryArray.cal[index].weight / 1000 < weight_next &&
                        j == 0) {
                        tryArray.cal[index].shipping = price;
                        tryArray.total_shipping += price;
        
                        return true;
                    }
                    //中間
                    if (tryArray.cal[index].weight / 1000 >= weight &&
                        tryArray.cal[index].weight / 1000 < weight_next
                    ) {
                        tryArray.cal[index].shipping = price;
                        tryArray.total_shipping += price;
                        return true;
                    }
                }
            })
            tryArray.total_cost = tryArray.total_shipping - tryArray.discount; 
            
            if (tryArray.total_cost < miniumOne.total_cost) {
                miniumOne = tryArray;
            }
        })
        miniumOne.thread = thread;
        postMessage(miniumOne);
    }, false);`

    var shippment = [
        [0.5, 180],
        [1.5, 210],
        [2.5, 240],
        [3.5, 290],
        [4.5, 340],
        [5.5, 390],
        [6.5, 440],
        [7.5, 490],
        [8.5, 540],
        [9.5, 590],
        [10.5, 640],
        [11.5, 720],
        [12.5, 800],
        [13.5, 880],
        [14.5, 960],
        [15.5, 1050],
        [16.5, 1140],
        [17.5, 1230],
        [18.5, 1320],
        [19.5, 1410],
        [20.5, 1500],
        [21.5, 1500],
        [22.5, 1600],
        [23.5, 1600],
        [24.5, 1700],
        [25.5, 1700],
        [26.5, 1800],
        [27.5, 1800],
        [28.5, 1900],
        [29.5, 1900],
        [30.5, 2000],
        [31.5, 2000],
        [32.5, 2150],
        [33.5, 2150],
        [34.5, 2300],
        [35.5, 2300],
        [36.5, 2450],
        [37.5, 2450],
        [38.5, 2600],
        [39.5, 2600],
        [40.5, 2750],
        [41.5, 2750],
        [42.5, 2900],
        [43.5, 2900],
        [44.5, 3050],
        [45.5, 3050],
        [46.5, 3200],
        [47.5, 3200],
        [48.5, 3350],
        [49.5, 3400],
        [50, 3400]
    ];

    var product = [];
    $('.product-name').each(function (index, value) {
        var _title = $(value).html();
        var _url = "https://tw.superdelivery.com" + $(value).attr('href');
        var _spec = $(value).parent().find('dl:eq(0)').find('dd').html();
        var _count = $(value).parent().parent().parent().find('td:nth-child(2)').find('select').val();
        var _weight = $(value).parent().find('dl:eq(2)').find('dd').html().replace('g', '').replace(',', '');
        var _price = $(value).parent().parent().parent().find('td:nth-child(3)').find('.total-amount').find('td').text().replace('NT$', '').replace(',', '');

        product.push({
            url: _url,
            title: _title,
            style: _spec,
            piece: _count,
            weight: _weight,
            total_price: _price
        })
    })


    var ori_shippment = {
        weight: 0,
        total_shipping: 0,
        discount: 0,
        price: 0,
        total_cost: 0
    }
    //原始運費
    product.map(item => {
        ori_shippment.weight += (item.weight * 1) * (item.piece * 1);
        ori_shippment.price += item.total_price * 1;
    })
    //計算discount

    if (ori_shippment.price < 5000) {
        ori_shippment.discount += 0;
    } else if (ori_shippment.price >= 5000 && ori_shippment.price < 10000) {
        ori_shippment.discount += 100;
    } else if (ori_shippment.price >= 10000 && ori_shippment.price < 30000) {
        ori_shippment.discount += 250;
    } else if (ori_shippment.price >= 30000) {
        ori_shippment.discount += 800;
    }

    //計算運費
    for (var j = 0; j < shippment.length - 1; j++) {
        var weight = shippment[j][0];
        var weight_next = shippment[j + 1][0];
        var price = shippment[j][1];

        //第一項
        if (ori_shippment.weight != 0 &&
            ori_shippment.weight / 1000 < weight &&
            ori_shippment.weight / 1000 < weight_next &&
            j == 0) {
            ori_shippment.total_shipping = price;

        }
        //中間
        if (ori_shippment.weight / 1000 >= weight &&
            ori_shippment.weight / 1000 < weight_next
        ) {
            ori_shippment.total_shipping = price;
        }
    }
    ori_shippment.total_cost = ori_shippment.total_shipping - ori_shippment.discount

    var miniumOne = {
        total_cost: 1000000000
    };

    var cargo_num = 2;
    const thread = 4;

    var nowTime = 0;
    var stepTime = 100000;



    var tryTime = Math.pow(cargo_num, product.length);
    var _countTryTime = Math.pow(cargo_num, product.length);
    var workList = [];
    //
    console.time();

    console.log('Build Worker')

    function padLeft(str, lenght) {
        if (str.length >= lenght)
            return str;
        else
            return padLeft("0" + str, lenght);
    }

    function postMessage(thread) {
        var worker = workList[thread];
        var bio_list = [];
        var maxTime = ((nowTime + stepTime) > tryTime) ? tryTime : (nowTime + stepTime);
        for (i = nowTime; i < maxTime; i++) {
            bio_list.push(padLeft((i).toString(cargo_num), product.length).split(''));
        }
        worker.postMessage({
            thread: thread,
            cargo_num: cargo_num,
            product: product,
            bio_list: bio_list
        });

        nowTime += stepTime;
    };

    for (let i = 0; i < thread; i++) {
        const blob = new Blob([workerHTML]); //document.querySelector('#worker').textContent]);
        const url = window.URL.createObjectURL(blob);
        const worker = new Worker(url);

        worker.onmessage = function (e) {
            _countTryTime -= stepTime;

            if (e.data.total_cost < miniumOne.total_cost) {
                miniumOne = e.data;
            }

            if (_countTryTime <= 0) {
                console.log('原始運費', ori_shippment)
                console.log('最佳分配', miniumOne)
                var htmlString = `總重量：${ori_shippment.weight}</br></br>`
                htmlString += `單一包裹=>原始運費：${ori_shippment.total_shipping},折扣：${ori_shippment.discount}</br></br>`;
                htmlString += `　　　　=>bucket 1：${product.length} 項商品,商品總價：${ori_shippment.price}</br></br><hr>`;
                htmlString += `最佳分配=>計算運費：${miniumOne.total_shipping},折扣：${miniumOne.discount}</br></br>`;
                htmlString += `分配方式=>bucket 1：${miniumOne.bucket[0].length} 項商品,商品總價：${miniumOne.cal[0].price},運費：${miniumOne.cal[0].shipping},重量：${miniumOne.cal[0].weight} </br></br>`;
                htmlString += `　　　　=>bucket 2：${miniumOne.bucket[1].length} 項商品,商品總價：${miniumOne.cal[1].price},運費：${miniumOne.cal[1].shipping},重量：${miniumOne.cal[1].weight} </br></br`;

                htmlString += `分配如下<br><br><hr>`;

                miniumOne.bucket.map((list, index) => {
                    htmlString += 'bucket_' + index + 1;
                    htmlString += '<hr>';
                    list.map(item => {
                        htmlString += `<a href='${item.url}'>${item.title}</a></br></br>`
                    })
                    htmlString += '<hr>';
                })
                $('body').html(htmlString);

                workList.map(item => {
                    item.terminate();
                })
                console.timeEnd();
            } else {
                postMessage(e.data.thread);
            }
        }
        workList.push(worker);
        postMessage(i);
    }