// 引入SDK核心类
import QQMapWX from '../../libs/qqmap-wx-jssdk.js';
import {getRoutes} from '../../utils/util';
const chooseLocation = requirePlugin('chooseLocation');
const key = 'GRZBZ-YUWCX-USU42-TGULS-N54HF-GBBBO'; //使用在腾讯位置服务申请的key
const referer = 'Maas-model'; //调用插件的app的名称
const category = '生活服务,娱乐休闲';
// 实例化API核心类
var qqmapsdk = new QQMapWX({
    key: key // 必填
});
let isStartLocation = true;
let type = '';
let mask = 'mask';
function naviagteToSelection(location) {
    wx.navigateTo({
        url: 'plugin://chooseLocation/index?key=' + key + '&referer=' + referer + '&location=' + location + '&category=' + category
    });
}
//在Page({})中使用下列代码
//触发表单提交事件，调用接口
Page({

    /**
     * 页面的初始数据
     */
    data: {

    },
    selectStart: function (e) {
        console.log("开始位置");
        isStartLocation = true;
        const location = {
            latitude: this.data.location.latitude,
            longitude: this.data.location.longitude
        };
        naviagteToSelection(JSON.stringify(location));
    },
    selectDest: function (e) {
        console.log("结束位置");
        isStartLocation = false;
        const location = {
            latitude: this.data.location.latitude,
            longitude: this.data.location.longitude
        };
        naviagteToSelection(JSON.stringify(location));
    },
    selectType: function(e){
        type = e.detail.value;
    },
    selectMask: function(e){
        mask = e.detail.value;
    },
    formSubmit: function (e) {
        const _this = this;
        qqmapsdk.direction({
            mode: type,
            from: e.detail.value.start,
            to: e.detail.value.dest,
            success: function(res){
                console.log(res);
                const routes = getRoutes(res, mask === 'mask');
                wx.navigateTo({
                  url: '../direction/direction',
                  success: function(res){
                    res.eventChannel.emit('acceptRoutes',routes);
                  },
                  fail: function(e){
                      console.log(e);
                  }
                })
            }
        });
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        wx.getLocation({
            type: 'gcj02',
            success: res => {
                qqmapsdk.reverseGeocoder({
                    location: {
                        latitude: res.latitude,
                        longitude: res.longitude
                    },
                    success: (data) => {
                        const locationDetail = data.result.formatted_addresses.recommend;
                        this.setData({
                            location: res,
                            locationDetail: locationDetail
                        });
                    }
                });

            }
        });


    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        const location = chooseLocation.getLocation();
        console.log(location);
        let selected = {};
        Object.assign(selected, this.data.selected);
        if (isStartLocation) {
            selected.start = location;
        } else {
            selected.dest = location;
        }
        this.setData({
            selected: selected
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})