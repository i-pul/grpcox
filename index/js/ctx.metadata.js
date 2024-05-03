// table input for context metadata
const ctxMetadataTable = $('#ctx-metadata-table');

// new row for each context being added
const newTr = `
    <tr>
        <td class="text-center">
          <span>
            <input class="ctx-metadata-input-field-active checkbox-xl" type="checkbox" #checked>
          </span>
        </td>
        <td class="ctx-metadata-input-field-key pt-3-half" contenteditable="true">#key</td>
        <td class="ctx-metadata-input-field-value pt-3-half" contenteditable="true">#val</td>
        <td class="text-center">
          <span class="table-remove">
              <a>&nbsp; <i class="fa fa-trash"></i> &nbsp;</a>
          </span>
        </td>
     </tr>`;

// helper variable to contains all of the context metadata input
let ctxArr = [];

// helper variable to contain the usage of metadata
let ctxUse = false;

// ctx metadata event listener
(function () {
    // add event listener on ctx metadata checkbox
    // todo: change how data stored
    // const ctxMetadataSwitch = document.getElementById("ctx-metadata-switch");
    $("#ctx-metadata-switch").change(function (event) {
        const { checked } = event.target;
        ctxUse = checked;
        toggleDisplayCtxMetadataTable(checked);
    })

    // remove for each row in ctx metadata table
    ctxMetadataTable.on('click', '.table-remove', function () {
        $(this).parents('tr').detach();
    });

    // add new row
    ctxMetadataTable.on('click', '.table-add', () => {
        addNewMetadataTableRow(true, "", "");
    });

    // only allow any paste action with plain text
    ctxMetadataTable.on('paste', '.ctx-metadata-input-field', function (e) {
        // cancel paste
        e.preventDefault();
        // get text representation of clipboard
        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
        // insert text manually
        document.execCommand("insertHTML", false, text);
    });

    ctxMetadataTable.focusout(function (){
        metadataTableToEditorFormat();
    });

}());

// toggle ctx metadata display
// will show the key-value pairs table input
function toggleDisplayCtxMetadataTable(show) {
    const style = show ? "display: block" : "display: none";

    const protoInput = document.getElementById("ctx-metadata-input");
    protoInput.removeAttribute("style");
    protoInput.style.cssText = style;
}

function addNewMetadataTableRow(isActive,key,val) {
    var newRow = newTr;
    newRow = newRow.replace("#checked", (isActive? "checked": ""));
    newRow = newRow.replace("#key", key);
    newRow = newRow.replace("#val", val);
    $('tbody').append(newRow);
}

function metadataTableToEditorFormat() {
    // translate table to editor
    var metadataArr = $('#ctx-metadata-table').find("tbody").find("tr").map(function() {
        var $row = $(this);
        var isActive = $row.find('.ctx-metadata-input-field-active').prop("checked") ? "": "//";
        var key = $row.find('.ctx-metadata-input-field-key').text().trim();
        var value = $row.find('.ctx-metadata-input-field-value').text().trim();
        if (key != "") {
            return isActive+key+":"+value;
        }
    }).get();

    metadataEditor = ace.edit("metadata-editor");
    metadataEditor.setValue(metadataArr.join("\n"));
}

function metadataEditortoTableFormat() {
    // translate table to editor
    metadataEditor = ace.edit("metadata-editor");
    metadataString = metadataEditor.getValue();

    $("#ctx-metadata-table").find("tbody").empty();

    metadataArr = metadataString.split("\n");
    metadataArr.forEach(function (item) {
        var arr = item.split(":").map(i => i.trim());

        var key = arr[0];
        var isActive = true;
        if ((/^\/\//).test(arr[0])) {
            isActive = false;
            key = key.replace(/^\/\//, "");
        }

        var value = arr.length > 1? arr[1] : "";
        if (key != "") {
            addNewMetadataTableRow(isActive, key, value);
        }
    })
}


$("#metadata-bulk-edit").click(function(){
    // translate table to editor
    metadataTableToEditorFormat();

    $("#ctx-metadata-editor").show();
    $("#ctx-metadata-table").hide();

});
$("#metadata-table-edit").click(function(){
    // translate editor to table
    metadataEditortoTableFormat();

    $("#ctx-metadata-editor").hide();
    $("#ctx-metadata-table").show();
});