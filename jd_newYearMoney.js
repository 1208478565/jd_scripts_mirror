/*
京东压岁钱
助力码会一直变，不影响助力
活动时间：2021-2-1至2021-2-11
活动入口：京东APP我的-压岁钱
活动地址：https://unearth.m.jd.com/babelDiy/Zeus/22uHDsyHntidZV9tpwov2hrUUvmb/index.html
已支持IOS双京东账号,Node.js支持N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
============Quantumultx===============
[task_local]
#京东压岁钱
20 8,12 * * * https://gitee.com/lxk0301/jd_scripts/raw/master/jd_newYearMoney.js, tag=京东压岁钱, img-url=https://raw.githubusercontent.com/Orz-3/task/master/jd.png, enabled=true

================Loon==============
[Script]
cron "20 8,12 * * *" script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_newYearMoney.js, tag=京东压岁钱

===============Surge=================
京东压岁钱 = type=cron,cronexp="20 8,12 * * *",wake-system=1,timeout=3600,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_newYearMoney.js

============小火箭=========
京东压岁钱 = type=cron,script-path=https://gitee.com/lxk0301/jd_scripts/raw/master/jd_newYearMoney.js, cronexpr="20 8,12 * * *", timeout=3600, enable=true
 */

const $ = new Env('京东压岁钱');

const notify = $.isNode() ? require('./sendNotify') : '';
//Node.js用户请在jdCookie.js处填写京东ck;
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
let jdNotify = true;//是否关闭通知，false打开通知推送，true关闭通知推送
const randomCount = $.isNode() ? 20 : 5;

//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message, sendAccount = [], receiveAccount = [], receiveCardList = [];
if ($.isNode()) {
  Object.keys(jdCookieNode).forEach((item) => {
    cookiesArr.push(jdCookieNode[item])
  })
  
} else {
  let cookiesData = $.getdata('CookiesJD') || "[]";
  cookiesData = jsonParse(cookiesData);
  cookiesArr = cookiesData.map(item => item.cookie);
  cookiesArr.reverse();
  cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
  cookiesArr.reverse();
  cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
const JD_API_HOST = 'https://api.m.jd.com/client.action';
const inviteCodes = [


  ``

];
!(async () => {
  await requireConfig();
  if (!cookiesArr[0]) {
    $.msg($.name, '【提示】请先获取京东账号一cookie\n直接使用NobyDa的京东签到获取', 'https://bean.m.jd.com/bean/signIndex.action', {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});
    return;
  }
  for (let i = 0; i < cookiesArr.length; i++) {
    if (cookiesArr[i]) {
      cookie = cookiesArr[i];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = i + 1;
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await shareCodesFormat();
      await jdNian()
      await showMsg()
    }
  }
  if(receiveAccount.length)
    console.log(`开始领卡`)
  for (let idx of receiveAccount) {
    if (cookiesArr[parseInt(idx) - 1]) {
      console.log(`账号${idx}领取赠卡`)
      cookie = cookiesArr[parseInt(idx) - 1];
      $.UserName = decodeURIComponent(cookie.match(/pt_pin=(.+?);/) && cookie.match(/pt_pin=(.+?);/)[1])
      $.index = parseInt(idx);
      $.isLogin = true;
      $.nickName = '';
      message = '';
      await TotalBean();
      console.log(`\n******开始【京东账号${$.index}】${$.nickName || $.UserName}*********\n`);
      if (!$.isLogin) {
        $.msg($.name, `【提示】cookie已失效`, `京东账号${$.index} ${$.nickName || $.UserName}\n请重新登录获取\nhttps://bean.m.jd.com/bean/signIndex.action`, {"open-url": "https://bean.m.jd.com/bean/signIndex.action"});

        if ($.isNode()) {
          await notify.sendNotify(`${$.name}cookie已失效 - ${$.UserName}`, `京东账号${$.index} ${$.UserName}\n请重新登录获取cookie`);
        }
        continue
      }
      await receiveCards()
    }
  }
})()
  .catch((e) => {
    $.log('', `❌ ${$.name}, 失败! 原因: ${e}!`, '')
  })
  .finally(() => {
    $.done();
  })

async function jdNian() {
  try {
    $.risk = false
    $.red = 0
    $.total = 0
    await getHomeData()
    await $.wait(2000)
    if ($.risk) return
    await getHomeData(true)
    await helpFriends()
  } catch (e) {
    $.logErr(e)
  }
}

async function receiveCards() {
  for (let token of receiveCardList) {
    await receiveCard(token)
  }
}

function showMsg() {
  return new Promise(resolve => {
    if (!$.risk) message += `本次运行获得${Math.round($.red * 100) / 100}红包，共计红包${$.total}`
    if (!jdNotify) {
      $.msg($.name, '', `${message}`);
    } else {
      $.log(`京东账号${$.index}${$.nickName}\n${message}`);
    }
    resolve()
  })
}

async function helpFriends() {
  $.canHelp = true
  for (let code of $.newShareCodes) {
    if (!code) continue
    await helpFriend(code)
    if (!$.canHelp) return
    await $.wait(4000)
  }
}

function getHomeData(info = false) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_home'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            const {inviteId, poolMoney} = data.data.result.userActBaseInfo
            $.cardList = data.data.result.cardInfos
            if (info) {
              $.total = poolMoney
              if (sendAccount.includes($.index.toString())) {
                let cardList = $.cardList.filter(vo => vo.cardType !== 7)
                if (cardList.length) {
                  console.log(`送出当前账号第一张卡（每天只能领取一个好友送的一张卡）`)
                  await sendCard(cardList[0].cardNo)
                }
              }
              return
            }
            console.log(`您的好友助力码为：${inviteId}`)
            await $.wait(2000)
            for (let i = 1; i <= 6; ++i) {
              let cards = data.data.result.cardInfos.filter(vo => vo.cardType === i)
              for (let j = 0; j < cards.length; j += 2) {
                if (j + 1 < cards.length) {
                  let cardA = cards[j], cardB = cards[j + 1]
                  console.log(`去合并${i}级卡片`)
                  await consumeCard(`${cardA.cardNo},${cardB.cardNo}`)
                  await $.wait(2000)
                }
              }
            }
          } else {
            $.risk = true
            console.log(`账号被风控，无法参与活动`)
            message += `账号被风控，无法参与活动\n`
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function lotteryHundredCard() {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_lotteryHundredCard'), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(JSON.stringify(data))
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function showHundredCardInfo(cardNo) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_showHundredCardInfo', {cardNo: cardNo}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          console.log(data)
          if (data && data.data['bizCode'] === 0) {
            console.log(JSON.stringify(data))
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function receiveHundredCard(cardNo) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_receiveHundredCard', {cardNo: cardNo}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          console.log(data)
          if (data && data.data['bizCode'] === 0) {
            console.log(JSON.stringify(data))
          } else {
            console.log(data.data.bizMsg)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function consumeCard(cardNo) {
  return new Promise((resolve) => {
    setTimeout(() => {
      $.post(taskPostUrl('newyearmoney_consumeCard',{"cardNo":cardNo}), async (err, resp, data) => {
        try {
          if (err) {
            console.log(`${JSON.stringify(err)}`)
            console.log(`${$.name} API请求失败，请检查网路重试`)
          } else {
            data = JSON.parse(data);
            if (data && data.data['bizCode'] === 0) {
              $.red += parseFloat(data.data.result.currentTimeMoney)
              console.log(`合成成功，获得${data.data.result.currentTimeMoney}红包`)
            } else {
              $.risk = true
              console.log(`账号被风控，无法参与活动`)
              message += `账号被风控，无法参与活动\n`
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve();
        }
      })
    }, 1000)
  })
}

function helpFriend(inviteId) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_assist', {inviteId: inviteId}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(data.data.result.msg)
          } else {
            console.log(`helpFriends ${data.data.bizMsg}`)
            if (data.data.bizCode === -523) {
              $.canHelp = false
            }
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function readShareCode() {
  console.log(`开始`)
  return new Promise(async resolve => {
    $.get({
      url: `https://code.chiang.fun/api/v1/jd/year/read/${randomCount}/`,
      'timeout': 10000
    }, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            console.log(`随机取${randomCount}个码放到您固定的互助码后面(不影响已有固定互助)`)
            data = JSON.parse(data);
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve(data);
      }
    })
    await $.wait(2000);
    resolve()
  })
}
function sendCard(cardNo) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_sendCard', {"cardNo": cardNo}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            receiveCardList.push(data.data.result.token)
            console.log(`送卡成功`)
          } else {
            console.log(`送卡失败，${data.data.bizMsg}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

function receiveCard(token) {
  return new Promise((resolve) => {
    $.post(taskPostUrl('newyearmoney_receiveCard', {"token": token}), async (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          data = JSON.parse(data);
          if (data && data.data['bizCode'] === 0) {
            console.log(`领卡成功`)
          } else {
            console.log(`领卡失败，${data.data.bizMsg}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    })
  })
}

//格式化助力码
function shareCodesFormat() {
  return new Promise(async resolve => {
    // console.log(`第${$.index}个京东账号的助力码:::${$.shareCodesArr[$.index - 1]}`)
    $.newShareCodes = [];
    if ($.shareCodesArr[$.index - 1]) {
      $.newShareCodes = $.shareCodesArr[$.index - 1].split('@');
    } else {
      console.log(`由于您第${$.index}个京东账号未提供shareCode,将采纳本脚本自带的助力码\n`)
      const tempIndex = $.index > inviteCodes.length ? (inviteCodes.length - 1) : ($.index - 1);
      $.newShareCodes = inviteCodes[tempIndex].split('@');
    }
    const readShareCodeRes = await readShareCode();
    if (readShareCodeRes && readShareCodeRes.code === 200) {
      $.newShareCodes = [...new Set([...$.newShareCodes, ...(readShareCodeRes.data || [])])];
    }
    console.log(`第${$.index}个京东账号将要助力的好友${JSON.stringify($.newShareCodes)}`)
    resolve();
  })
}

function requireConfig() {
  return new Promise(async resolve => {
    console.log(`开始获取${$.name}配置文件\n`);
    //Node.js用户请在jdCookie.js处填写京东ck;
    let shareCodes = []
    console.log(`共${cookiesArr.length}个京东账号\n`);
    if ($.isNode() && process.env.JDNY_SHARECODES) {
      if (process.env.JDNY_SHARECODES.indexOf('\n') > -1) {
        shareCodes = process.env.JDNY_SHARECODES.split('\n');
      } else {
        shareCodes = process.env.JDNY_SHARECODES.split('&');
      }
    }

    if ($.isNode() && process.env.JDNY_SENDACCOUNT) {
      if (process.env.JDNY_SENDACCOUNT.indexOf('\n') > -1) {
        sendAccount = process.env.JDNY_SENDACCOUNT.split('\n');
      } else {
        sendAccount = process.env.JDNY_SENDACCOUNT.split('&');
      }
    }

    if (sendAccount.length)
      console.log(`将要送出卡片的是账号第${sendAccount.join(',')}号账号`)

    if ($.isNode() && process.env.JDNY_RECEIVEACCOUNT) {
      if (process.env.JDNY_RECEIVEACCOUNT.indexOf('\n') > -1) {
        receiveAccount = process.env.JDNY_RECEIVEACCOUNT.split('\n');
      } else {
        receiveAccount = process.env.JDNY_RECEIVEACCOUNT.split('&');
      }
    }
    if (receiveAccount.length)
      console.log(`将要领取卡片的是账号第${receiveAccount.join(',')}号账号`)

    $.shareCodesArr = [];
    if ($.isNode()) {
      Object.keys(shareCodes).forEach((item) => {
        if (shareCodes[item]) {
          $.shareCodesArr.push(shareCodes[item])
        }
      })
    }
    console.log(`您提供了${$.shareCodesArr.length}个账号的${$.name}助力码\n`);
    resolve()
  })
}


function taskPostUrl(function_id, body = {}, function_id2) {
  let url = `${JD_API_HOST}`;
  return {
    url,
    body: `functionId=${function_id}&body=${escape(JSON.stringify(body))}&client=wh5&clientVersion=1.0.0`,
    headers: {
      "Cookie": cookie,
      "origin": "https://h5.m.jd.com",
      "referer": "https://h5.m.jd.com/",
      'Content-Type': 'application/x-www-form-urlencoded',
      "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
    }
  }
}


function TotalBean() {
  return new Promise(async resolve => {
    const options = {
      "url": `https://wq.jd.com/user/info/QueryJDUserInfo?sceneval=2`,
      "headers": {
        "Accept": "application/json,text/plain, */*",
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept-Language": "zh-cn",
        "Connection": "keep-alive",
        "Cookie": cookie,
        "Referer": "https://wqs.jd.com/my/jingdou/my.shtml?sceneval=2",
        "User-Agent": $.isNode() ? (process.env.JD_USER_AGENT ? process.env.JD_USER_AGENT : (require('./USER_AGENTS').USER_AGENT)) : ($.getdata('JDUA') ? $.getdata('JDUA') : "jdapp;iPhone;9.2.2;14.2;%E4%BA%AC%E4%B8%9C/9.2.2 CFNetwork/1206 Darwin/20.1.0")
      }
    }
    $.post(options, (err, resp, data) => {
      try {
        if (err) {
          console.log(`${JSON.stringify(err)}`)
          console.log(`${$.name} API请求失败，请检查网路重试`)
        } else {
          if (data) {
            data = JSON.parse(data);
            if (data['retcode'] === 13) {
              $.isLogin = false; //cookie过期
              return
            }
            $.nickName = data['base'].nickname;
          } else {
            console.log(`京东服务器返回空数据`)
          }
        }
      } catch (e) {
        $.logErr(e, resp)
      } finally {
        resolve();
      }
    })
  })
}

function safeGet(data) {
  try {
    if (typeof JSON.parse(data) == "object") {
      return true;
    }
  } catch (e) {
    console.log(e);
    console.log(`京东服务器访问数据为空，请检查自身设备网络情况`);
    return false;
  }
}

function jsonParse(str) {
  if (typeof str == "string") {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.log(e);
      $.msg($.name, '', '请勿随意在BoxJs输入框修改内容\n建议通过脚本去获取cookie')
      return [];
    }
  }
}
// prettier-ignore
function Env(t,s){return new class{constructor(t,s){this.name=t,this.data=null,this.dataFile="box.dat",this.logs=[],this.logSeparator="\n",this.startTime=(new Date).getTime(),Object.assign(this,s),this.log("",`\ud83d\udd14${this.name}, \u5f00\u59cb!`)}isNode(){return"undefined"!=typeof module&&!!module.exports}isQuanX(){return"undefined"!=typeof $task}isSurge(){return"undefined"!=typeof $httpClient&&"undefined"==typeof $loon}isLoon(){return"undefined"!=typeof $loon}getScript(t){return new Promise(s=>{$.get({url:t},(t,e,i)=>s(i))})}runScript(t,s){return new Promise(e=>{let i=this.getdata("@chavy_boxjs_userCfgs.httpapi");i=i?i.replace(/\n/g,"").trim():i;let o=this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");o=o?1*o:20,o=s&&s.timeout?s.timeout:o;const[h,a]=i.split("@"),r={url:`http://${a}/v1/scripting/evaluate`,body:{script_text:t,mock_type:"cron",timeout:o},headers:{"X-Key":h,Accept:"*/*"}};$.post(r,(t,s,i)=>e(i))}).catch(t=>this.logErr(t))}loaddata(){if(!this.isNode())return{};{this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s);if(!e&&!i)return{};{const i=e?t:s;try{return JSON.parse(this.fs.readFileSync(i))}catch(t){return{}}}}}writedata(){if(this.isNode()){this.fs=this.fs?this.fs:require("fs"),this.path=this.path?this.path:require("path");const t=this.path.resolve(this.dataFile),s=this.path.resolve(process.cwd(),this.dataFile),e=this.fs.existsSync(t),i=!e&&this.fs.existsSync(s),o=JSON.stringify(this.data);e?this.fs.writeFileSync(t,o):i?this.fs.writeFileSync(s,o):this.fs.writeFileSync(t,o)}}lodash_get(t,s,e){const i=s.replace(/\[(\d+)\]/g,".$1").split(".");let o=t;for(const t of i)if(o=Object(o)[t],void 0===o)return e;return o}lodash_set(t,s,e){return Object(t)!==t?t:(Array.isArray(s)||(s=s.toString().match(/[^.[\]]+/g)||[]),s.slice(0,-1).reduce((t,e,i)=>Object(t[e])===t[e]?t[e]:t[e]=Math.abs(s[i+1])>>0==+s[i+1]?[]:{},t)[s[s.length-1]]=e,t)}getdata(t){let s=this.getval(t);if(/^@/.test(t)){const[,e,i]=/^@(.*?)\.(.*?)$/.exec(t),o=e?this.getval(e):"";if(o)try{const t=JSON.parse(o);s=t?this.lodash_get(t,i,""):s}catch(t){s=""}}return s}setdata(t,s){let e=!1;if(/^@/.test(s)){const[,i,o]=/^@(.*?)\.(.*?)$/.exec(s),h=this.getval(i),a=i?"null"===h?null:h||"{}":"{}";try{const s=JSON.parse(a);this.lodash_set(s,o,t),e=this.setval(JSON.stringify(s),i)}catch(s){const h={};this.lodash_set(h,o,t),e=this.setval(JSON.stringify(h),i)}}else e=$.setval(t,s);return e}getval(t){return this.isSurge()||this.isLoon()?$persistentStore.read(t):this.isQuanX()?$prefs.valueForKey(t):this.isNode()?(this.data=this.loaddata(),this.data[t]):this.data&&this.data[t]||null}setval(t,s){return this.isSurge()||this.isLoon()?$persistentStore.write(t,s):this.isQuanX()?$prefs.setValueForKey(t,s):this.isNode()?(this.data=this.loaddata(),this.data[s]=t,this.writedata(),!0):this.data&&this.data[s]||null}initGotEnv(t){this.got=this.got?this.got:require("got"),this.cktough=this.cktough?this.cktough:require("tough-cookie"),this.ckjar=this.ckjar?this.ckjar:new this.cktough.CookieJar,t&&(t.headers=t.headers?t.headers:{},void 0===t.headers.Cookie&&void 0===t.cookieJar&&(t.cookieJar=this.ckjar))}get(t,s=(()=>{})){t.headers&&(delete t.headers["Content-Type"],delete t.headers["Content-Length"]),this.isSurge()||this.isLoon()?$httpClient.get(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)}):this.isQuanX()?$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)):this.isNode()&&(this.initGotEnv(t),this.got(t).on("redirect",(t,s)=>{try{const e=t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();this.ckjar.setCookieSync(e,null),s.cookieJar=this.ckjar}catch(t){this.logErr(t)}}).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t)))}post(t,s=(()=>{})){if(t.body&&t.headers&&!t.headers["Content-Type"]&&(t.headers["Content-Type"]="application/x-www-form-urlencoded"),delete t.headers["Content-Length"],this.isSurge()||this.isLoon())$httpClient.post(t,(t,e,i)=>{!t&&e&&(e.body=i,e.statusCode=e.status),s(t,e,i)});else if(this.isQuanX())t.method="POST",$task.fetch(t).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t));else if(this.isNode()){this.initGotEnv(t);const{url:e,...i}=t;this.got.post(e,i).then(t=>{const{statusCode:e,statusCode:i,headers:o,body:h}=t;s(null,{status:e,statusCode:i,headers:o,body:h},h)},t=>s(t))}}time(t){let s={"M+":(new Date).getMonth()+1,"d+":(new Date).getDate(),"H+":(new Date).getHours(),"m+":(new Date).getMinutes(),"s+":(new Date).getSeconds(),"q+":Math.floor(((new Date).getMonth()+3)/3),S:(new Date).getMilliseconds()};/(y+)/.test(t)&&(t=t.replace(RegExp.$1,((new Date).getFullYear()+"").substr(4-RegExp.$1.length)));for(let e in s)new RegExp("("+e+")").test(t)&&(t=t.replace(RegExp.$1,1==RegExp.$1.length?s[e]:("00"+s[e]).substr((""+s[e]).length)));return t}msg(s=t,e="",i="",o){const h=t=>!t||!this.isLoon()&&this.isSurge()?t:"string"==typeof t?this.isLoon()?t:this.isQuanX()?{"open-url":t}:void 0:"object"==typeof t&&(t["open-url"]||t["media-url"])?this.isLoon()?t["open-url"]:this.isQuanX()?t:void 0:void 0;this.isSurge()||this.isLoon()?$notification.post(s,e,i,h(o)):this.isQuanX()&&$notify(s,e,i,h(o)),this.logs.push("","==============\ud83d\udce3\u7cfb\u7edf\u901a\u77e5\ud83d\udce3=============="),this.logs.push(s),e&&this.logs.push(e),i&&this.logs.push(i)}log(...t){t.length>0?this.logs=[...this.logs,...t]:console.log(this.logs.join(this.logSeparator))}logErr(t,s){const e=!this.isSurge()&&!this.isQuanX()&&!this.isLoon();e?$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t.stack):$.log("",`\u2757\ufe0f${this.name}, \u9519\u8bef!`,t)}wait(t){return new Promise(s=>setTimeout(s,t))}done(t={}){const s=(new Date).getTime(),e=(s-this.startTime)/1e3;this.log("",`\ud83d\udd14${this.name}, \u7ed3\u675f! \ud83d\udd5b ${e} \u79d2`),this.log(),(this.isSurge()||this.isQuanX()||this.isLoon())&&$done(t)}}(t,s)}
