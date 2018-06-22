$(function() {
  selectYourHaevichi();

  function selectYourHaevichi() {
    var $container = $('.select-your-heavichi');
    var $button = $container.find('.button');
    var $listWrap = $container.find('.list-wrap');
    $button.on('click', function() {
      $container.toggleClass('active');
      if (!$container.hasClass('active')) {
        TweenMax.to($listWrap, .5, {
          display: 'none',
          y: '-100%',
          ease: Cubic.easeOut
        });
      } else {
        TweenMax.to($listWrap, .5, {
          display: 'block',
          y: '0%',
          ease: Cubic.easeOut
        });
      }
    });
  };
  var $win = $(window);
  var ui = {
    scrollHeader: function() {},
    inint: function() {
      win.init();
      console.log('ui');
    }
  };
  var win = {
    scroll: function() {
      var sctop = $win.scrollTop();
      if (sctop >= 1070) {
        global.activeHeader(true);
      } else {
        global.activeHeader(false);
      }
    },
    init: function() {
      $win.on('scroll', win.scroll);
      // console.log('win');
    }
  };
  ui.inint();
});