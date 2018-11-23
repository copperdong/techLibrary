const app = getApp();
Page({
  data: {
    mode:'',
    isbn:'',
    bookInfo:{},
    shareLock:false,
  },

  onShareAppMessage: function (res) {
    const that = this;
    return {
      title: '喜欢的同学快来借阅吧！'
    }
  },
  onLoad: function (options) {
    const that = this;
    var isbn = options.isbn || '9787115326560';
    var mode = options.mode || 'share';
    const db = wx.cloud.database();

    that.setData({
      isbn:isbn,
      mode:mode
    });

    db.collection('book_info').where({
      isbn13: isbn
    }).get().then((res) => {
      if(res.data.length > 0){
        this.setData({
          bookInfo:res.data[0]
        })
      }else{
        wx.request({
          url: `https://douban.uieee.com/v2/book/isbn/${isbn}`,
          header: {
            'Content-Type': 'json'
          },
          megthod: "GET",
          success: function (res) {
            that.setData({
              bookInfo: res.data,
            })
          }
        })
      }
    });
  },

  borrowBook(){
    const that = this;
    var bookInfo = that.data.bookInfo;
    wx.cloud.callFunction({
      name: 'borrowBook',
      data: {
        bookInfo: bookInfo
      }
    }).then((res)=>{
      if (res.result == 1) {
        wx.navigateBack({
          delta: 1
        })
      } else {
        wx.showToast({
          title: res.result,
          icon: 'none'
        })
      }
    });
  },

  goBackBook() {
    const that = this;
    var isbn = that.data.isbn;
    wx.cloud.callFunction({
      name: 'backBook',
      data: {
        isbn: isbn
      }
    }).then((res)=>{
      if(res.result == 1){
        wx.navigateBack({
          delta:1
        })
      }else{
        wx.showToast({
          title: res.result,
          icon: 'none'
        })
      }
    });
  },

  uploadBookInfoToStore(){
    const that = this;
    let bookInfo = that.data.bookInfo;
    let userInfo = app.globalData.userInfo;
    const db = wx.cloud.database();
    let shareLock = that.data.shareLock;
    if(!shareLock){
      that.setData({
        shareLock:true,
      })
      bookInfo['sharer'] = userInfo.nickName;
      bookInfo['add_time'] = new Date().toLocaleDateString();
      bookInfo['status'] = 1;
      db.collection('book_info').where({
        isbn13: bookInfo.isbn13
      }).get().then((res) => {
        if (res.data.length > 0) {
          wx.showToast({
            title: '该图书已在库！',
            success() {
              wx.navigateBack({
                delta: 1
              })
            }
          })
          that.setData({
            shareLock: false,
          })
        } else {
          db.collection('book_info').add({
            data: bookInfo
          }).then((res) => {
            that.setData({
              shareLock: false,
            });
            wx.navigateBack({
              delta: 1
            })
          });
        }
      })
    }
  }
})