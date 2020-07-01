var Tags = document.querySelectorAll('.confirm');
var confirmIt = function (e) {
    if (!confirm('Are you sure?')) e.preventDefault();
};
for (var i = 0, l = Tags.length; i < l; i++) {
    Tags[i].addEventListener('click', confirmIt, false);
};

var downloadWindow = null;
function download_file(file) {
    if (downloadWindow === null || downloadWindow.closed) {
        downloadWindow = window.open("/stores/download?file=" + file,
                                "Downloads",
                                "width=600,height=840,resizeable=no,location=no");
    } else downloadWindow.focus();
};

function filter(selected, url) {
    var filters = [];
    if (selected) {
        selected.forEach(field => {
            var select = document.querySelector('#' + field);
            if (select.value != '') {
                filters.push(field + "=" + select.value);
            };
        });
    };
    window.location.replace(url + "?" + filters.join("&"));
};

function sortTable(n, tableName, dir = 'asc') {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementById(tableName);
    switching = true;
    while (switching) {
      switching = false;
      rows = table.rows;
      for (i = 0; i < (rows.length - 1); i++) {
        shouldSwitch = false;
        x = rows[i].getElementsByTagName("td")[n].dataset.sort || rows[i].getElementsByTagName("td")[n].innerText.toLowerCase();
        y = rows[i + 1].getElementsByTagName("td")[n].dataset.sort ||rows[i + 1].getElementsByTagName("td")[n].innerText.toLowerCase();
        if (dir == "asc") {
          if (x > y) {
            shouldSwitch = true;
            break;
          }
        } else if (dir == "desc") {
          if (x < y) {
            shouldSwitch = true;
            break;
          }
        }
      }
      if (shouldSwitch) {
        rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
        switching = true;
        switchcount ++;
      } else {
        if (switchcount == 0 && dir == "asc") {
          dir = "desc";
          switching = true;
        }
      }
    }
}
function searchTable(table, inputfield) {
  // Declare variables
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById(inputfield);
  filter = input.value.toUpperCase();
  table = document.getElementById(table);
  tr = table.getElementsByTagName("tr");

  // Loop through all table rows, and hide those who don't match the search query
  for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
          txtValue = td.textContent || td.innerText;
          if ((txtValue.toUpperCase().indexOf(filter) > -1) || filter === '') tr[i].style.display = "";
          else tr[i].style.display = "none";
      };
  };
}    
function showTab(_tab) {
  let tabHead = document.querySelector('#' + _tab + '-tab'),
      tabBody = document.querySelector('#' + _tab);
  if (tabHead) tabHead.classList.add('active');
  if (tabBody) tabBody.classList.add('active', 'show');
};

function add(table, options = {}) {
  let addWindow = null, height = 600, width = 600, queries = '';
  if (options.queries) queries = options.queries;
  if (options.height) height   = options.height;
  if (options.width) width     = options.width;
  addWindow = window.open('/stores/' + table + '/new?' + queries,
                          table + '_add',
                          'width=' + width + ',height=' + height + ',resizeable=no,location=no');
};
function edit(table, id, options = {}) {
  let editWindow = null, height = 600, width = 600, queries = '';
  if (options.queries) queries = options.queries;
  if (options.height) height   = options.height;
  if (options.width) width     = options.width;
  editWindow = window.open('/stores/' + table + '/' + id + '/edit?' + queries,
                          table + '_edit_' + id,
                          'width=' + width + ',height=' + height + ',resizeable=no,location=no');
};
function show(table, id, options = {}) {
  let showWindow = null, height = 600, width = 600, queries = '';
  if (options.queries) queries = options.queries;
  if (options.height) height   = options.height;
  if (options.width) width     = options.width;
  showWindow = window.open('/stores/' + table + '/' + id + '?' + queries,
                          table + '_show_' + id,
                          'width=' + width + ',height=' + height + ',resizeable=no,location=no');
};
sendData = (form, method, _location, options = {reload: false, reload_opener: true, _close: true}) => {
  const XHR = new XMLHttpRequest();
  const FD = new FormData(form);
  XHR.addEventListener("load", event => {
      let response = JSON.parse(event.target.responseText);
      if (response.result) {
          alert(response.message);
          if (!options.args) options.args = [];
          if (options.onComplete)    options.onComplete(...options.args);
          if (options.reload_opener) window.opener.location.reload();
          if (options.reload)        window.location.reload();
          else if (options._close)   close();
          else if (options.redirect) window.location.replace(options.redirect);
      } else alert('Error: ' + response.error);
  });
  XHR.addEventListener("error", event => alert('Oops! Something went wrong.'));
  XHR.open(method, _location);
  XHR.send(FD);
};
XHR_send = (XHR, table, location, method = 'GET') => {
    XHR.addEventListener("error", event => {
        alert('Oops! Something went wrong getting ' + table)
        hide_spinner(table);
    });
    XHR.open(method, location);
    XHR.send();
};
show_spinner = id => {
  let spn_results = document.querySelector('#spn_' + id);
  spn_results.style.display = 'block';
};
hide_spinner = id => {
  let spn_results = document.querySelector('#spn_' + id);
  spn_results.style.display = 'none';
};
function removeID(id) {
  if (typeof(id) === 'string') document.querySelector('#' + id).remove();
  else id.remove();
};
function addFormListener (form_id, method, location, options = {reload: false, reload_opener: true, _close: true}) {
  let form = document.querySelector("#" + form_id);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    sendData(form, method, location, options);
  });
};
alert = message => {
    if (window.opener) {
        window.opener.alert(message);
    } else {
        let notification = document.querySelector('#alert');
        if (notification) {
            notification.setAttribute('data-content', message);
            let _date = new Date();
            notification.setAttribute('data-original-title', _date.toLocaleDateString() + ' ' + _date.toLocaleTimeString());
            $('#alert').popover('show');
            setTimeout(() => {$('#alert').popover('hide')}, 5000);
        };
    };
};

let path = window.location.pathname.toString().split('/');