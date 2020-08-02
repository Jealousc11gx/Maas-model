import { direction } from "../libs/dir.js";
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
function getRoutes(ret, mask) {
  if (ret.status !== 0) return undefined;
  const routes =  ret.result.routes.map(route => {
    // 公共交通
    if (route.mode === undefined) {
      return {
        score: 0
      };
    }
    // 驾车 
    else if (route.mode === 'DRIVING') {
      const pl = polyline(route.polyline);
      let fare = route.taxi_fare && route.taxi_fare.fare && 0;
      return {
        score: direction(pl, route.duration, 'driving', mask, fare),
        marks: [pl[0], pl[pl.length - 1]],
        polylines: [
          {
            points: pl,
            color: '#FF0000DD',
            width: 4
          }
        ],
        tags: route.tags,
        timespan: route.duration,
        distance: route.distance

      }
    }
    // 步行
    else if (route.mode === 'WALKING') {
      const pl = polyline(route.polyline);
      return {
        score: direction(pl, route.duration, 'walking', mask, 0),
        marks: [pl[0], pl[pl.length - 1]],
        polylines: [
          {
            points: pl,
            color: '#FFDD00DD',
            width: 4
          }
        ],
        tags: route.tags,
        timespan: route.duration,
        distance: route.distance
      };
    }
    // 骑行
    else if (route.mode === 'BICYCLING') {
      const pl = polyline(route.polyline);
      return {
        score: direction(pl, route.duration, 'bicycling', mask, 0),
        marks: [pl[0], pl[pl.length - 1]],
        polylines: [
          {
            points: pl,
            color: '#FFFF00DD',
            width: 4
          }
        ],
        tags: route.tags,
        timespan: route.duration,
        distance: route.distance
      };
    } else {
      return {
        score: 0
      };
    }
  }).sort((a, b) => a.score > b.score);
  if(routes[0].tags == undefined){
    routes[0].tags = [];
  }
  routes[0].tags.push('社交距离最远')
  return routes;
}
module.exports = {
  formatTime: formatTime,
  getRoutes: getRoutes
};