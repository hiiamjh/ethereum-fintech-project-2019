App = {
  web3Provider: null,
  contracts: {},
	
  init: function() {
    $.getJSON('../open-market.json', function(data) {
      var list = $('#list'); //html의 id=list에 해당하는 부분을 변수 list에 저장
      var template = $('#template'); //html의 id=template에 해당하는 부분을 변수 list에 저장

      //html의 template 부분에 real-estate.json에 있는 상품 정보들을 저장
      for (i = 0; i < data.length; i++) {
        template.find('img').attr('src', data[i].picture);
        template.find('.id').text(data[i].id);
        template.find('.type').text(data[i].type);
        template.find('.area').text(data[i].area);
        template.find('.price').text(data[i].price);
        template.find('.deliveryprice').text(data[i].dprice);

        list.append(template.html());
      }
    })

    return App.initWeb3();
  },

  //web3 초기화
  initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      App.web3Provider = new web3.providers.HttpProvider('http://localhost:8545');
      web3 = new Web3(App.web3Provider);
    }

    return App.initContract();
  },

  //컨트랙트 초기화(인스턴스화)
  initContract: function() {
	  $.getJSON('OpenMarket.json', function(data) {
      App.contracts.OpenMarket = TruffleContract(data);
      App.contracts.OpenMarket.setProvider(App.web3Provider);
      App.listenToEvents();
    });
  },

  //상품구매
  buyProduct: function() {	
    //html의 각각의 필드에 있는 값들을 변수들에 저장
    var id = $('#id').val();
    var name = $('#name').val();
    var price = $('#price').val();
    var age = $('#age').val();
    var home = $('#home').val();
    var post = $('#post').val();
    var phone = $('#phone').val();


    //계정목록을 불러옴
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0]; //현재 선택된 계정

      //인스턴스화 시킨 컨트랙트의 함수를 이용
      App.contracts.OpenMarket.deployed().then(function(instance) {

        //string 인코딩
        var nameUtf8Encoded = utf8.encode(name);
        var homeUtf8Encoded = utf8.encode(home);
        
        //컨트랙트 내 buyProduct함수에 인자값 전달
        //from에서 함수를 불러오고, price값을 컨트랙트에서 지정해준 owner함수로 이더를 전송
        return instance.buyProduct(id, web3.toHex(nameUtf8Encoded), age, web3.toHex(homeUtf8Encoded), post, phone, { from: account, value: price });
      }).then(function() {
        //함수 실행이 끝나면, html의 modal 값을 비우고, buyModal을 감춤
        $('#name').val('');
        $('#age').val('');
        $('#home').val('');
        $('#post').val('');
        $('#phone').val('');
        $('#buyModal').modal('hide');  
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //상품 배송
  deliveryProduct: function() {	

    //html의 입력값들을 변수에 저장
    var id = $('#id').val();
    var name = $('#dname').val();
    var dprice = $('#dprice').val();
    var home = $('#dhome').val();
    var post = $('#dpost').val();
    var phone = $('#dphone').val();

    //계정주소를 받아옴
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];
      App.contracts.OpenMarket.deployed().then(function(instance) {
        var nameUtf8Encoded = utf8.encode(name);
        var homeUtf8Encoded = utf8.encode(home);
        //deliveryProduct 함수에 인자값 전달 후 실행
        return instance.deliveryProduct(id, web3.toHex(nameUtf8Encoded), web3.toHex(homeUtf8Encoded), post, phone,  { from: account, value: dprice });
      }).then(function() {
        //함수 실행 후, id=id+1, modal값을 비우고, 감춤
        id++;
        $('#dname').val('');
        $('#dhome').val('');
        $('#dpost').val('');
        $('#dphone').val('');
        $('#buyerInfoModal').modal('hide');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //구매확정
  decidePayProduct: function() {	
    var id = $('#id').val();
    var paydate = $('#paydate').val();
    var review = $('#review').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      //var secondAddress = 0xDc27C2b26EDbfb7Eb223589D4997dDA997DA8D1e;
      App.contracts.OpenMarket.deployed().then(function(instance) {
        var reviewUtf8Encoded = utf8.encode(review);
        return instance.decidePayProduct(id, paydate, web3.toHex(reviewUtf8Encoded));
      }).then(function() {
        id++;
        $('#paydate').val('');
        $('#review').val('');
        $('#decisionModal').modal('hide');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //구매취소
  decideCancelProduct: function() {	
    var id = $('#id').val();
    var canceldate = $('#canceldate').val();
    var reason = $('#reason').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      //var secondAddress = 0xDc27C2b26EDbfb7Eb223589D4997dDA997DA8D1e;
      App.contracts.OpenMarket.deployed().then(function(instance) {
        var reasonUtf8Encoded = utf8.encode(reason);
        return instance.decideCancelProduct(id, canceldate, web3.toHex(reasonUtf8Encoded));
      }).then(function() {
        id++;
        $('#canceldate').val('');
        $('#reason').val('');
        $('#decisionModal').modal('hide');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //금액정산
  doPayProduct: function() {	
    var id = $('#id').val();
    var price = $('#price').val();
    var pdate = $('#pdate').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      //var secondAddress = 0xDc27C2b26EDbfb7Eb223589D4997dDA997DA8D1e;
      App.contracts.OpenMarket.deployed().then(function(instance) {
        return instance.doPayProduct(id, pdate, {from: account, value: price});
      }).then(function() {
        id++;
        $('#doPayModal').modal('hide');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //금액환불
  doCancelProduct: function() {	
    var id = $('#id').val();
    var price = $('#price').val();
    var cdate = $('#cdate').val();

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }
      var account = accounts[0];
      //var secondAddress = 0xDc27C2b26EDbfb7Eb223589D4997dDA997DA8D1e;
      App.contracts.OpenMarket.deployed().then(function(instance) {
        return instance.doCancelProduct(id, cdate, {from: account, value: price});
      }).then(function() {
        id++;
        $('#doCancelModal').modal('hide');
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  },

  //구매 후, 해당 내역이 업데이트 된 상품목록을 로드시킴
  loadProducts: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAllBuyers.call();
    }).then(function(buyers) {
      for (i = 0; i < buyers.length; i++) {
        if (buyers[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.btn-buyerInfo').removeAttr('style');
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },

  //구매, 결제, 배송 시 html 상단에 이벤트 내용 츨력
  listenToEvents: function() {
	  App.contracts.OpenMarket.deployed().then(function(instance) {
      instance.LogBuyProduct({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
        if (!error) {
          $('#sellerevents').append('<p>' + event.args._buyer + ' 구매자가 ' + event.args._id + ' 번 상품을 구입했습니다.' + '</p>');
          $('#buyerevents').append('<p>' + event.args._id + ' 번 상품을 구입했습니다.' + '</p>');
          $('#managerevents').append('<p>' + event.args._id + ' 번 상품이 ' + event.args._buyer + ' 구매자로부터 구입되었습니다.' + '</p>');

        } else {
          console.error(error);
        }
        App.loadProducts();
      })
  }),

  App.contracts.OpenMarket.deployed().then(function(instance) {
    instance.LogDeliveryProduct({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
      if (!error) {
        $('#buyerevents').append('<p><span style="color:Blue">' + event.args._seller + ' 판매자가 ' + event.args._id + ' 번 상품을 배송했습니다.' + '</span></p>');
        $('#sellerevents').append('<p><span style="color:Blue">' + event.args._id + ' 번 상품을 배송했습니다.' + '</span></p>');
        $('#managerevents').append('<p>' + event.args._id + ' 번 상품이 ' + event.args._seller + ' 판매자로부터 배송되었습니다.' + '</p>');

      } else {
        console.error(error);
      }
      App.loadProducts2();
    })
  })

  App.contracts.OpenMarket.deployed().then(function(instance) {
    instance.LogDecidePayment({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
      if (!error) {
        $('#buyerevents').append('<p><span style="color:Gray">' + event.args._id + ' 번 상품의 구매를 확정하였습니다.' + '</span></p>');
        $('#sellerevents').append('<p><span style="color:Gray">' + event.args._buyer + ' 구매자가 ' + event.args._id + ' 번 상품의 구매를 확정하였습니다.' + '</span></p>');
        $('#managerevents').append('<p><span style="color:Gray">' + event.args._buyer + ' 구매자가 ' + event.args._id + ' 번 상품의 구매를 확정하였습니다.' + '</span></p>');
      } else {
        console.error(error);
      }
      App.loadProducts5();
    })
  })

  App.contracts.OpenMarket.deployed().then(function(instance) {
    instance.LogDecideCancel({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
      if (!error) {
        $('#buyerevents').append('<p><span style="color:Gray">' + event.args._id + ' 번 상품의 구매를 취소하였습니다.' + '</span></p>');
        $('#sellerevents').append('<p><span style="color:Gray">' + event.args._buyer + ' 구매자가 ' + event.args._id + ' 번 상품의 구매를 취소하였습니다.' + '</span></p>');
        $('#managerevents').append('<p><span style="color:Gray">' + event.args._buyer + ' 구매자가 ' + event.args._id + ' 번 상품의 구매를 취소하였습니다.' + '</span></p>');
      } else {
        console.error(error);
      }
      App.loadProducts6();
    })
  })

  App.contracts.OpenMarket.deployed().then(function(instance) {
    instance.LogPaymentProduct({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
      if (!error) {
        $('#buyerevents').append('<p><span style="color:Gray">' + ' 판매자에게 ' + event.args._id + ' 번 상품이 정산되었습니다.' + '</span></p>');
        $('#sellerevents').append('<p><span style="color:Gray">' + event.args._id + ' 번 상품금액이 정산되었습니다.' + '</span></p>');
        $('#managerevents').append('<p><span style="color:Gray">' + event.args._manager + ' 운영자가 ' + event.args._id + ' 번 상품을 정산하었습니다.' + '</span></p>');
      } else {
        console.error(error);
      }
      App.loadProducts3();
    })
  })

  App.contracts.OpenMarket.deployed().then(function(instance) {
    instance.LogCancelProduct({}, { fromBlock: 0, toBlock: 'latest' }).watch(function(error, event) {
      if (!error) {
        $('#buyerevents').append('<p><span style="color:Gray">' + event.args._id + ' 번 상품이 환불되었습니다.' + '</span></p>');
        $('#sellerevents').append('<p><span style="color:Gray">' + ' 구매자에게' + event.args._id + ' 번 상품금액이 환불되었습니다.' + '</span></p>');
        $('#managerevents').append('<p><span style="color:Gray">' + event.args._manager + ' 구매자가 ' + event.args._id + ' 번 상품을 환불하었습니다.' + '</span></p>');
      } else {
        console.error(error);
      }
      App.loadProducts4();
    })
  })
  },

  //배송 후, 해당 내역이 업데이트 된 상품목록을 로드시킴
  loadProducts2: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAllSellers.call();
    }).then(function(sellers) {
      for (i = 0; i < sellers.length; i++) {
        if (sellers[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.deliverymsg').removeAttr('style');
          $('.panel-realEstate').eq(i).find('.btn-delivery').removeAttr('style');
          $('.panel-realEstate').eq(i).find('.panel-heading').removeAttr('style'); 
          $('.panel-realEstate').eq(i).find('.panel-title').removeAttr('style'); 
          $('.panel-realEstate').eq(i).find('.panel-body').removeAttr('style');               
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },

  //정산 후, 해당 내역이 업데이트 된 상품목록을 로드시킴
  loadProducts3: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAlldoPayments.call();
    }).then(function(doPayments) {
      for (i = 0; i < doPayments.length; i++) {
        if (doPayments[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.btn-dopay').text('정산완료').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-docancel').text('환불불가').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-decidedPayInfo').removeAttr('style');
          $('.panel-realEstate').eq(i).find('.dopaymsg').removeAttr('style');           
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },

  //환불 후, 해당 내역이 업데이트 된 상품목록을 로드시킴
  loadProducts4: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAlldoCancels.call();
    }).then(function(doCancels) {
      for (i = 0; i < doCancels.length; i++) {
        if (doCancels[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.btn-docancel').text('환불완료').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-dopay').text('정산불가').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-decidedCancelInfo').removeAttr('style'); 
          $('.panel-realEstate').eq(i).find('.docancelmsg').removeAttr('style');            
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },

  loadProducts5: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAllPayments.call();
    }).then(function(decidePayments) {
      for (i = 0; i < decidePayments.length; i++) {
        if (decidePayments[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.btn-decision').text('구매확정완료').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-docancel').text('환불불가').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  },

  loadProducts6: function() {
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getAllCancels.call();
    }).then(function(decideCancels) {
      for (i = 0; i < decideCancels.length; i++) {
        if (decideCancels[i] !== '0x0000000000000000000000000000000000000000') {

          $('.panel-realEstate').eq(i).find('.btn-decision').text('구매취소완료').attr('disabled', true);
          $('.panel-realEstate').eq(i).find('.btn-dopay').text('정산불가').attr('disabled', true);          
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    })
  }
}
	
$(function() {
  $(window).load(function() {
    App.init();
  });

  //modal 함수
  $('#buyModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);
  });

  $('#buyerInfoModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var dprice = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.dprice').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#dprice').val(dprice);

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getBuyerInfo.call(id);
    }).then(function(buyerInfo) {
      $(e.currentTarget).find('#buyerAddress').text(buyerInfo[0]);
      $(e.currentTarget).find('#buyerName').text(web3.toUtf8(buyerInfo[1]));
      $(e.currentTarget).find('#buyerAge').text(buyerInfo[2]);
      $(e.currentTarget).find('#buyerHome').text(web3.toUtf8(buyerInfo[3]));
      $(e.currentTarget).find('#buyerPost').text(buyerInfo[4]);
      $(e.currentTarget).find('#buyerPhone').text(buyerInfo[5]);
    }).catch(function(err) {
      console.log(err.message);
    }),

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getPaymentInfo.call(id);
    }).then(function(decidePaymentInfo) {
      //$(e.currentTarget).find('#payAddress').text(paymentInfo[0]);
      $(e.currentTarget).find('#frompaybuyer').text(decidePaymentInfo[0]);
      $(e.currentTarget).find('#frompaydate').text(decidePaymentInfo[1]);
      $(e.currentTarget).find('#fromreview').text(web3.toUtf8(decidePaymentInfo[2]));
    }).catch(function(err) {
      console.log(err.message);
    })
  });

  $('#sellerInfoModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
   
    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getSellerInfo.call(id);
    }).then(function(sellerInfo) {
      $(e.currentTarget).find('#sellerAddress').text(sellerInfo[0]);
      $(e.currentTarget).find('#sellerName').text(web3.toUtf8(sellerInfo[1]));
      $(e.currentTarget).find('#sellerHome').text(web3.toUtf8(sellerInfo[2]));
      $(e.currentTarget).find('#sellerPost').text(sellerInfo[3]);
      $(e.currentTarget).find('#sellerPhone').text(sellerInfo[4]);
    }).catch(function(err) {
      console.log(err.message);
    }),

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getBuyerInfo.call(id);
    }).then(function(buyerInfo) {
      $(e.currentTarget).find('#buyerAddress').text(buyerInfo[0]);
      $(e.currentTarget).find('#buyerName').text(web3.toUtf8(buyerInfo[1]));
      $(e.currentTarget).find('#buyerAge').text(buyerInfo[2]);
      $(e.currentTarget).find('#buyerHome').text(web3.toUtf8(buyerInfo[3]));
      $(e.currentTarget).find('#buyerPost').text(buyerInfo[4]);
      $(e.currentTarget).find('#buyerPhone').text(buyerInfo[5]);
    }).catch(function(err) {
      console.log(err.message);
    })
  });

  $('#decisionModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);

  });

  $('#doPayModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getPaymentInfo.call(id);
    }).then(function(decidePaymentInfo) {
      //$(e.currentTarget).find('#payAddress').text(paymentInfo[0]);
      $(e.currentTarget).find('#frompaybuyer').text(decidePaymentInfo[0]);
      $(e.currentTarget).find('#frompaydate').text(decidePaymentInfo[1]);
      $(e.currentTarget).find('#fromreview').text(web3.toUtf8(decidePaymentInfo[2]));
    }).catch(function(err) {
      console.log(err.message);
    })
  });

  $('#decidedPayInfoModal').on('show.bs.modal', function(e) {

    var id = $(e.relatedTarget).parent().find('.id').text();

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getPaymentInfo.call(id);
    }).then(function(decidePaymentInfo) {
      //$(e.currentTarget).find('#payAddress').text(paymentInfo[0]);
      $(e.currentTarget).find('#frompaybuyer').text(decidePaymentInfo[0]);
      $(e.currentTarget).find('#frompaydate').text(decidePaymentInfo[1]);
      $(e.currentTarget).find('#fromreview').text(web3.toUtf8(decidePaymentInfo[2]));
    }).catch(function(err) {
      console.log(err.message);
    }),

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getdoPaymentInfo.call(id);
    }).then(function(doPaymentInfo) {
      $(e.currentTarget).find('#frommanager').text(doPaymentInfo[0]);
      $(e.currentTarget).find('#frompdate').text(doPaymentInfo[1]);
    })
  });
  });

  $('#doCancelModal').on('show.bs.modal', function(e) {
    var id = $(e.relatedTarget).parent().find('.id').text();
    var price = web3.toWei(parseFloat($(e.relatedTarget).parent().find('.price').text() || 0), "ether");

    $(e.currentTarget).find('#id').val(id);
    $(e.currentTarget).find('#price').val(price);

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getCancelInfo.call(id);
    }).then(function(decideCancelInfo) {
      //$(e.currentTarget).find('#payAddress').text(paymentInfo[0]);
      $(e.currentTarget).find('#frompaybuyer').text(decideCancelInfo[0]);
      $(e.currentTarget).find('#fromcanceldate').text(decideCancelInfo[1]);
      $(e.currentTarget).find('#fromreason').text(web3.toUtf8(decideCancelInfo[2]));
    }).catch(function(err) {
      console.log(err.message);
    })

  });

  $('#decidedCancelInfoModal').on('show.bs.modal', function(e) {

    var id = $(e.relatedTarget).parent().find('.id').text();

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getCancelInfo.call(id);
    }).then(function(decideCancelInfo) {
      //$(e.currentTarget).find('#payAddress').text(paymentInfo[0]);
      $(e.currentTarget).find('#fromcancelbuyer').text(decideCancelInfo[0]);
      $(e.currentTarget).find('#fromcanceldate').text(decideCancelInfo[1]);
      $(e.currentTarget).find('#fromreason').text(web3.toUtf8(decideCancelInfo[2]));
    }).catch(function(err) {
      console.log(err.message);
    }),

    App.contracts.OpenMarket.deployed().then(function(instance) {
      return instance.getdoCancelInfo.call(id);
    }).then(function(doCancelInfo) {
      $(e.currentTarget).find('#frommanager').text(doCancelInfo[0]);
      $(e.currentTarget).find('#fromcdate').text(doCancelInfo[1]);
    }).catch(function(err) {
    console.log(err.message);
  });

});