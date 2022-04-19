const axios = require('axios');
const cheerio = require('cheerio')
const request = require('request');//也是请求网址模块，只不过下载图片的函数比较简单，所以用这个
const fs = require('fs')

// let api = "https://w.wallhaven.cc/full/" + "/wallhaven-" + ".jpg"
async function lcWait(milliSecondes) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve("成功执行延迟函数，延迟" + milliSecondes)
        }, milliSecondes)
    })
}//延时函数

async function getImgApiUrl(url) {
    let {data} = await axios.get(url);
    let $ = cheerio.load(data);
    let imageUrl = [];
    $("a.preview").each((i, element) => {
        let urlStr = $(element).attr('href');
        let imgNameStr = urlStr.match(/[^\/]*$/)[0]; //获取了图片的名字，类似BV号的那种加密 这里是匹配url最后一个斜杠后面的东西
        let twoStr = imgNameStr.substring(0, 2);//此处要获取图片前两个字符为了拼接图片的api然后下载
        let imgObj = {
            imgNameStr,
            twoStr
        }
        imageUrl.push(imgObj);
    })
    let imgApiUrl = []
    for (let imageUrlElement of imageUrl) {
        let imgObj = {
            urlJpg: "https://w.wallhaven.cc/full/" + imageUrlElement.twoStr + "/wallhaven-" + imageUrlElement.imgNameStr + ".jpg",
            urlPng: "https://w.wallhaven.cc/full/" + imageUrlElement.twoStr + "/wallhaven-" + imageUrlElement.imgNameStr + ".png",
            imgNameStr: imageUrlElement.imgNameStr,
        }
        imgApiUrl.push(imgObj)
    }
    return imgApiUrl;
}

async function download(url, fileDownloadPath, filename) {
    return new Promise((resolve, reject) => {
        request(url, (err, resp, body) => {
            if (!err && resp.statusCode == 200) {
                request(url).pipe(fs.createWriteStream(fileDownloadPath))
                resolve(filename + "下载成功")
            } else {
                // 失败
                reject("err")
            }
        });
    })
}

async function downOnePageImg() {
    let url = "https://wallhaven.cc/search?categories=111&purity=111&sorting=hot&order=desc&page=8"
    let imgApiUrl = await getImgApiUrl(url);
    for (let imgApiUrlElement of imgApiUrl) {
        // await lcWait(5000);//自己加延时 单页不加也可以
        let filename = 'wallhaven-' + imgApiUrlElement.imgNameStr + '.jpg',
            fileDownloadPath = './images/' + filename;//要改自己改，文件夹的名字
        // fileDownloadPath = './wallhaven_hot/' + filename,
        download(imgApiUrlElement.urlJpg, fileDownloadPath, filename)
            .then(req => {
                console.log(req);
            })
            .catch(reason => {
                if (reason == "err") {
                    filename = 'wallhaven-' + imgApiUrlElement.imgNameStr + '.png';
                    fileDownloadPath = './wallhaven_toplist/' + filename; //这里也要改
                    download(imgApiUrlElement.urlPng, fileDownloadPath, filename)
                        .then(req1 => {
                            console.log(req1)
                        })
                        .catch(reason1 => {
                            console.log(reason1 + "   png 下载失败")
                        })
                }
            });
    }
}

async function getImgUrl() {
    let urlStr = []
    for (let i = 1; i < 5; i++) { //page的页数  PS:自己换,URL自己换，文件夹名字自己改
        // urlStr.push("https://wallhaven.cc/hot?page=" + i);//hot热门
        // urlStr.push("https://wallhaven.cc/latest?page=" + i);//latest最新的
        urlStr.push("https://wallhaven.cc/toplist?page=" + i);//toplist排名前
        urlStr.push("https://wallhaven.cc/search?q=id%3A1722&categories=111&purity=" +
            "110&atleast=1920x1080&sorting=random&order=desc&seed=CuIOfR&page=" + i);
        urlStr.push("https://wallhaven.cc/search?q=id%3A1722&categories=111&purity=110&resolutions=2560x1080%2C3440x1440" +
            "%2C3840x1600%2C1920x1080%2C2560x1440%2C3840x2160&sorting=random&order=desc&seed=0OXjdo&page="+i)
        // urlStr.push("https://wallhaven.cc/search?q=id%3A90389" + "&page=" + i);//油画
    }
    return urlStr;
}

async function downAllImg() {
    let all = await getImgUrl();
    for (let allElement of all) {
        let imgApiUrl = await getImgApiUrl(allElement);
        for (let imgApiUrlElement of imgApiUrl) {
            await lcWait(1000);//自己加延时
            let filename = 'wallhaven-' + imgApiUrlElement.imgNameStr + '.jpg',
                // fileDownloadPath = './images/' + filename,//要改自己改，文件夹的名字
                // fileDownloadPath = './wallhaven_hot/' + filename;
                // fileDownloadPath = './wallhaven_latest/' + filename;
                fileDownloadPath = './wallhaven_plants/' + filename;
            download(imgApiUrlElement.urlJpg, fileDownloadPath, filename)
                .then(req => {
                    console.log(req);
                })
                .catch(reason => {
                    if (reason == "err") {
                        filename = 'wallhaven-' + imgApiUrlElement.imgNameStr + '.png';
                        fileDownloadPath = './wallhaven_plants/' + filename; //这里也要改
                        download(imgApiUrlElement.urlPng, fileDownloadPath, filename)
                            .then(req1 => {
                                console.log(req1)
                            })
                            .catch(reason1 => {
                                console.log(reason1 + "   png 下载失败")
                            })
                    }
                });
        }
    }
}

downAllImg();
// downOnePageImg();