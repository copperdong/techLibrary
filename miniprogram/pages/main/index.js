Page({

  data: {
    readerList:[],
    userList:[],
    skipNum:0,
  },
  onPullDownRefresh: function () {
    const that = this;
    const db = wx.cloud.database();
    let users = that.data.userList;
    let readers = that.data.readerList;
    db.collection('user_info').get({
      success(res) {
        var temData = res.data.filter(function (item) {
          return item.reading_status == 1;
        })
        that.setData({
          userList: res.data,
          readerList:temData,
          skipNum:0
        },function(){
          wx.stopPullDownRefresh();
        })
      }
    })
  },
  onReachBottom: function () {
    const that = this;
    let skipNum = that.data.skipNum + 20;
    that.setData({
      skipNum: skipNum,
    });
    that.getMainData(skipNum);
  },

  getMainData(skipNum){
    const that = this;
    const db = wx.cloud.database();
    let users = that.data.userList;
    let readers = that.data.readerList;
    skipNum = skipNum || 0;
    db.collection('user_info').limit(20).skip(skipNum).get({
      success(res) {
        var temData = res.data.filter(function(item){
          return item.reading_status == 1;
        })
        that.setData({
          userList: users.concat(res.data),
          readerList: readers.concat(temData)
        })
      }
    })
  },
  onLoad: function (options) {
    const that = this;
    this.setData({
      userList: [],
      skipNum: 0,
    }, function () {
      that.getMainData();
    });
  },
  onShareAppMessage: function (res) {
    return {
      title: '新氧图书馆'
    }
  }
})