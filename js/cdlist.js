(function() {
  var trString = '',
    defaultPath = '',
    projectName = '',
    count = 1,
    depth = 1,
    readFileQueue = [],
    fileExtension = document.location.pathname.slice((document.location.pathname.lastIndexOf(".") - 1 >>> 0) + 2);
    console.log(fileExtension)

  function loadMenuJSON(callback) {
    var xobj;
    if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
      xobj = new XMLHttpRequest();
    } else if (window.ActiveXObject) { // IE
      try {
        xobj = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          xobj = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
      }
    }
    if (xobj.overrideMimeType) {
      xobj.overrideMimeType("application/json");
    }
    if(fileExtension==="html") {
      xobj.open('GET', '/menu.json', true);
    } else {
      //jsp 경로일경우 절대경로로..
      xobj.open('GET', '/menu.json', true);
    }
    xobj.onreadystatechange = function() {
      if (xobj.readyState === 4 && xobj.status === 200) {
        callback(xobj);
      }
    };
    xobj.send(null);
  }
  /**
   * JSON 로딩
   */
  loadMenuJSON(function(response) {
    var menuJSON = JSON.parse(response.response);
    var header = document.querySelector('.header');
    var title = document.getElementsByTagName('title')[0];
    title.innerHTML = menuJSON.header.name;
    header.innerHTML = '<h1>' + menuJSON.header.name + '</h1>';
    drawTable(menuJSON);
    setStatus();
    listCounting();
  });

  function drawTable(menuJSON) {
    defaultPath = menuJSON.pathInfo.production;
    if (fileExtension === 'html') {
      defaultPath = menuJSON.pathInfo.dev;
    }
    projectName = menuJSON.header.name;
    var site = menuJSON.siteInfo,
      tbody = document.querySelector('#tbody');
    drawTR(tbody, 1, site, "root", "");
  }

  function drawTR(tbody, mydepth, children, momKey, momname, momlink) {
    for (var p in children) {
      var obj = children[p];
      var key = new Date().getTime() + "_" + Math.random() * 99999;
      obj.key = momKey;
      obj.momName = momname;
      obj.momLink = momlink;
      if (obj.file == undefined) {
        insertRow(tbody, mydepth, '-', obj, key);
      } else {
        insertRow(tbody, mydepth, '-', obj, key);
        //count++;
      }
      for (var pp in obj) {
        if (pp === 'children') {
          depth++;
          drawTR(tbody, (mydepth + 1), obj[pp], key, obj.name, obj.file);
        }
      }
    }
  }

  function readTextFile(file, callback) {
    var org = file;
    if (!!file) {
      file = file.getAttribute('data-read');
      var rawFile;
      if (window.XMLHttpRequest) { // 모질라, 사파리등 그외 브라우저, ...
        rawFile = new XMLHttpRequest();
      } else if (window.ActiveXObject) { // IE 8 이상
        rawFile = new ActiveXObject("Microsoft.XMLHTTP");
      }
      rawFile.sync = true;
      rawFile.open("GET", file + '?' + new Date()
        .getTime(), true);
      rawFile.onreadystatechange = function() {
        console.log(rawFile.status)
        if (rawFile.readyState === 4) {
          if (rawFile.status === 200 || rawFile.status == 0) {
            var allText = rawFile.responseText;
            //개발 내부적으로 없는 페이지는 loading 시 404 에러가 떨어지지 않아서 이렇게 처리
            if(allText.indexOf("HTTP Error 404") > -1 ) {
              callback.apply(null, [org, rawFile.statusText, true]);
            } else {
              callback.apply(null, [org, allText], false);
            }
          } else {
            callback.apply(null, [org, rawFile.statusText, true]);
          }
        }
      }
      rawFile.send(null);
    }
  }
  var isDepth2First = true;
  var isDepth3First = true;

  function insertRow(tbody, depth, count, data, key, momname) {
    var row;
    var insertDatas = [];
    //3뎁스니까.......
    if (depth == 1) {
      row = tbody.insertRow(-1);
      isDepth2First = true;
      insertDatas = ['', count, '' + data.name, '', '', getHref(data.file), '', ''];
    } else if (depth == 2) {
      //나의 부모에 링크가 없다면, 올려서 그린다.
      if (data.momLink === undefined) {
        isDepth3First = true;
        //2뎁스부터는 내 부모의 키 값을 가져온다. 그걸로 부모의 tr을 알아낸다.
        var r = document.querySelector('[data-key="' + data.key + '"]');
        // 첫번째 tr만 1뎁스와 겹쳐야 하니까.. 2뎁스 붙일때 첫번째만 아래 예외 코드를 실행한다.
        if (isDepth2First === true) {
          isDepth2First = false;
          //내 부모의 row (tr) 을 가져온다.( 부모의 tr로 몇번째 row 인지 알아내 해당 tr을 가져온다 )
          row = document.getElementById("tbody").rows[r.sectionRowIndex];
          // row의 cell 을 다시 그려야 하니까.. 기존의 cell을 지운다.
          while (row.cells.length > 3) {
            row.deleteCell(-1);
          }
          // 1뎁스와 2뎁스 정보를 함께 그린다.
          insertDatas = [ /*'', count, data.momName, */ data.name, '', getHref(data.file), '', ''];
        } else {
          row = tbody.insertRow(-1);
          //여긴 기존 루틴..
          insertDatas = ['', count, '', data.name, '', getHref(data.file), '', ''];
        }
      } else {
        row = tbody.insertRow(-1);
        //여긴 기존 루틴..
        insertDatas = ['', count, '', data.name, '', getHref(data.file), '', ''];
      }
    } else if (depth == 3) {
      //나의 부모에 링크가 없다면, 올려서 그린다.
      if (data.momLink === undefined) {
        var r = document.querySelector('[data-key="' + data.key + '"]');
        if (isDepth3First === true) {
          isDepth3First = false;
          row = document.getElementById("tbody").rows[r.sectionRowIndex];
          while (row.cells.length > 4) {
            row.deleteCell(-1);
          }
          insertDatas = [data.name, getHref(data.file), '', ''];
        } else {
          row = tbody.insertRow(-1);
          insertDatas = ['', count, '', '', data.name, getHref(data.file), '', ''];
        }
      } else {
        row = tbody.insertRow(-1);
        insertDatas = ['', count, '', '', data.name, getHref(data.file), '', ''];
      }
    }
    for (var i = 0; i < insertDatas.length; i++) {
      var cell = row.insertCell(-1);
      cell.innerHTML = insertDatas[i];
    }
    if (getHref(data.file) !== undefined) {
      var s = getHref(data.file);
      row.setAttribute('data-read', defaultPath + String(data.file).replace('.jsp', '.' + fileExtension));
    }
    row.setAttribute('data-key', key);
  }

  function getCheck(b) {
    if (b === true) {
      return '&#9989;';
    } else {
      return '';
    }
  }

  function getHref(filename) {
    if (filename == undefined) {
      return '';
    }
    filename = String(filename).replace('.jsp', '.' + fileExtension);
    return '<a href="' + defaultPath + filename + '" target="_blank">' + filename + '</a>'
  }

  function setStatus() {
    var readcount = 0,
      readList = document.querySelectorAll('[data-read]');
    readTextFile(readList[readcount], complete);

    function complete(tar, data, isError) {
      
      readcount++;
      if (isError === true) {
        tar.firstChild.innerHTML = '&#9940;';
      } else {
        tar.firstChild.innerHTML = '&#9889;';
        var stateObj = getFileState(data);
        
        if(stateObj.status.indexOf('complete')>-1) {
          tar.setAttribute('data-status', 'complete');
        } else if(stateObj.status.indexOf('ing')>-1) {
          tar.setAttribute('data-status', 'ing');
        } else {
          tar.setAttribute('data-status', 'blank');
        }
        tar.cells[6].innerHTML = stateObj.author;
        tar.cells[7].innerHTML = stateObj.date;
        if (readcount >= readList) {
          return;
        }
      }
      readTextFile(readList[readcount], complete);
    }
  }

  function getFileState(data) {
    var totalidx = data.length,
      statusIdx = data.indexOf('@status'),
      dateIdx = data.indexOf('@date'),
      authorIdx = data.indexOf('@author');
    var status = data.substring(statusIdx, totalidx);
    status = status.substring(0, status.indexOf("\n"));
    status = status.replace('@status:', '');
    if (statusIdx === -1) {
      status = "blank";
    }
    var date = data.substring(dateIdx, totalidx);
    date = date.substring(0, date.indexOf("\n"));
    date = date.replace('@date:', '');
    if (dateIdx === -1) {
      date = "-";
    }
    var author = data.substring(authorIdx, totalidx);
    author = author.substring(0, author.indexOf("\n"));
    author = author.replace('@author:', '');
    if (authorIdx === -1) {
      author = "-";
    }
    return {
      status: status,
      date: date,
      author: author
    };
  }

  function listCounting() {
    var rows = document.getElementById("tbody").rows;
    for (var i = 0; i < rows.length; i++) {
      rows[i].cells[1].innerHTML = i + 1;
    }
  }
}());