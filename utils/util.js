import { direction } from "../libs/dir.js";
function filter(array,cb, context){
  context = context || this;  //确定上下文，默认为this

  var len = array.length;  //数组的长度
  var r = [];  //最终将返回的结果数组
  for(var i = 0; i < len; i++){
    if(cb.call(context, array[i], i, array)){  //filter回调函数的三个参数：元素值，元素索引，原数组
      r.push(array[i]);
    }
  }
  return r;
};
const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

function polyline(coors) {
  const kr = 1000000;
  let pl = [];
  for (var i = 2; i < coors.length; i++) {
    coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
  }
  for (var i = 0; i < coors.length; i += 2) {
    pl.push({ latitude: coors[i], longitude: coors[i + 1] })
  }
  return pl;
}

function getRoutes(result, mask) {
  console.log(result);
  const routes =  result.map(route => {
    // 公共交通
    if (route.mode === undefined) {
      const step = filter(route.steps,step => step.mode === 'TRANSIT')[0];
      let score;
      let pl;
      let duration;
      let fare;
      let line =filter( step.lines,line => line.vehicle === 'BUS' ||  line.vehicle === 'SUBWAY')[0];
      pl = polyline(line.polyline);
      duration = line.duration;
      fare = line.price;
      let way;
      if(line.vehicle === 'BUS'){
        if(fare === -1) fare = 2;
        else fare/=100;
        score = direction(pl,line.duration,'bus',mask,fare);
        way = '公交车';
      }else if(line.vehicle === 'SUBWAY'){
        if(fare==-1) {
          console.log(2+Math.ceil((line.distance/1000-4)/4)*1);
          if(line.distance<4000) {fare = 2;}
          else if(line.distance<12000)  { fare = 2+Math.ceil((line.distance/1000-4)/4)*1;}
          else if(line.distance<24000) { fare = 4+Math.ceil((line.distance/1000-12)/6)*1;}
          else if(line.distance<40000) {fare = 6+Math.ceil((line.distance/1000-24)/8)*1;}
          else if(line.distance<50000) {fare = 8+Math.ceil((line.distance/1000-40)/10)*1;}
          else {9 + Math.round((line.distance/1000-50)/20)*1;}
        }else {
          fare /=100;
        }
        
        way = '地铁';
      }
      
      let type;let s;
      if(line.vehicle === 'BUS'){type='bus'; s= 0.4765;}
      else if(line.vehicle === 'SUBWAY'){type = 'subway'; s =0.9752;}
      return {
        score:0,
        marks:  [pl[0], pl[pl.length - 1]],
        type: type,
        polylines: [
          {
            points: pl,
            color: '#FF0000DD',
            width: 8
          }
        ],
        tags: [way,line.title,line.destination.title+'方向',line.geton.title+'站出发',line.getoff.title+'站下车'],
        timespan: duration,
        distance: line.distance,
        fare: fare,
        s: s
      };
    }
    // 驾车 
    else if (route.mode === 'DRIVING') {
      const pl = polyline(route.polyline);
      let fare = route.taxi_fare && route.taxi_fare.fare && 0;
      return {
        type: 'driving',
        score: 0,
        marks: [pl[0], pl[pl.length - 1]],
        polylines: [
          {
            points: pl,
            color: '#FF0000DD',
            width: 4
          }
        ],
        tags: ['驾车'],
        timespan: route.duration,
        distance: route.distance,
        fare: fare,
        s: 0.999
      }
    }
    // 步行 已修改
    else if (route.mode === 'WALKING') {
      const pl = polyline(route.polyline);
      let fare  = 0;
      return {
        type: 'walking',
        score: 0,
        marks: [pl[0], pl[pl.length - 1]],
        polylines: [
          {
            points: pl,
            color: '#FFDD00DD',
            width: 4
          }
        ],
        tags: ['步行'],
        timespan: route.duration,
        distance: route.distance,
        fare: 0,
        s: 6.41
      };
    }
    // 骑行 已修改
    else if (route.mode === 'BICYCLING') {
      const pl = polyline(route.polyline);
      let fare =Math.ceil((route.duration)/30)*1.5;
      return {
        type: 'bicycling',
        score: 0,
        marks: [pl[0], pl[pl.length - 1]],
        polylines:   [
          {
            points: pl,
            color: '#FFFF00DD',
            width: 4
          }
        ],
        tags: [ '骑车'],
        timespan: route.duration,
        distance: route.distance,
        fare : fare,
        s: 14.651
      };
    } else {
      return {
        score: 0
      };
    }
  });
  let _s = routes.reduce((a,b)=>a.s+b.s)/routes.length;
  let _t = routes.reduce((a,b)=>a.timespan+b.timespan)/routes.length;
  let _m = routes.reduce((a,b)=>a.fare+b.fare)/routes.length;
  return routes.map(route=>{
    route.score = direction(route.polyline,route.timespan,route.type,mask,route.fare,_s,_t,_m);
    route.tags.push('S='+route.score);
    return route;
  }).sort((a,b)=>a.score>b.score?-1:1);
  
}
async function getLines(qqmapsdk,start,dest,type) {
  return new Promise((resolve,reject)=> {
    qqmapsdk.direction({
      mode: type,
      from: start,
      to: dest,
      success: res => resolve(res),
      fail: err=>reject(err)
  });
  });
}
module.exports = {
  formatTime: formatTime,
  getRoutes: getRoutes,
  getLines: getLines
};