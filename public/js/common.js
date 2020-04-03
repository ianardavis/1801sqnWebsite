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

var noteWindow = null;
function addNote(table, id) {
    if (noteWindow === null || noteWindow.closed) {
        noteWindow = window.open("/stores/notes/new?table=" + table + '&id=' + id,
                                "Notes",
                                "width=600,height=840,resizeable=no,location=no");
    } else noteWindow.focus();
};
function viewNote(note_id) {
    if (noteWindow === null || noteWindow.closed) {
        noteWindow = window.open("/stores/notes/" + note_id,
                                "Notes",
                                "width=600,height=840,resizeable=no,location=no");
    } else noteWindow.focus();
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