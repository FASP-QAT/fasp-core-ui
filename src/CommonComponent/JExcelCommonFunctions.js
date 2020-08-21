import i18n from '../../src/i18n';

export function jExcelLoadedFunction(instance) {
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    console.log("In loaded function hide method");
    var pagignation = document.getElementsByClassName('jexcel_pagination')[0];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jexcel_filter')[0];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[0]).childNodes[1];
    console.log("Search div", searchDiv);
    searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[0]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jexcel_search")[0].placeholder = "Search";
    // searchContainer.classList.add('TableCust');
    console.log('searchContainer', searchContainer);
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');

    var clarText = document.createTextNode('Clear');
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[0].value = "";
        elInstance.resetSearch();
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);

    // var paginationFirst=document.getElementsByClassName('jexcel_pagination')[0];
    // var paginationInfo = paginationFirst.createElement('span');
    // paginationInfo.classList.add('bottom_entries');
    // paginationInfo.classList.add('col-md-7');
    // paginationInfo.classList.add('order-2');
    // paginationInfo.classList.add('pl-lg-0');


    // var paginationPages = paginationFirst.createElement('div');
    // paginationPages.classList.add('col-md-4');
    // paginationPages.classList.add('order-3');
    // paginationPages.classList.add('f-End');

    // obj.pagination.appendChild(paginationInfo);
    // obj.pagination.appendChild(paginationPages);
    //  obj.pagination.appendChild(paginationUpdateContainer);

    var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[0];
    jexcel_pagination.lastChild.classList.add('order-3');
    console.log(obj.show, '....................in show');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jexcel_pagination_dropdown')[0];
    pageSelect.options[pageSelect.options.length] = new Option('All', 5000000);


    var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[0];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);





    // document.getElementById("clearBtnID").onclick= function(){alert("ok");}
}

export function jExcelLoadedFunctionWithoutPagination(instance) {
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    console.log("In loaded function hide method");
    var searchContainer = document.getElementsByClassName('jexcel_filter')[0];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[0]).childNodes[1];
    console.log("Search div", searchDiv);
    searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[0]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jexcel_search")[0].placeholder = "Search";
    // searchContainer.classList.add('TableCust');
    console.log('searchContainer', searchContainer);
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[0].value = "";
        elInstance.resetSearch();
    };
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');

    var clarText = document.createTextNode('Clear');
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);
}

export function jExcelLoadedFunctionOnlyHideRow(instance) {
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
}

export function checkValidtion(type, colName, rowNo, value, elInstance, reg, greaterThan0, equalTo0) {
    if (type == "text") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
        }
    } else if (type == "number") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        value = value.toString().replaceAll("\,", "");
        console.log("Value", value);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            if (isNaN(Number.parseInt(value)) || !(reg.test(value)) || (greaterThan0 == 1 && (equalTo0 == 1 ? value < 0 : value <= 0))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        }
    } else if (type == "date") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            // if (isNaN(Date.parse(value))) {
            //     elInstance.setStyle(col, "background-color", "transparent");
            //     elInstance.setStyle(col, "background-color", "yellow");
            //     elInstance.setComments(col, i18n.t('static.message.invaliddate'));
            // } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
            // }
        }
    } else if (type == "numberNotRequired") {
        var col = (colName).concat(parseInt(rowNo) + 1);
        value = value.toString().replaceAll("\,", "");
        console.log("Value", value);
        if (value != "") {
            if (isNaN(Number.parseInt(value)) || !(reg.test(value)) || (greaterThan0 == 1 && (equalTo0 == 1 ? value < 0 : value <= 0))) {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setStyle(col, "background-color", "yellow");
                elInstance.setComments(col, i18n.t('static.message.invalidnumber'));
                return false;
            } else {
                elInstance.setStyle(col, "background-color", "transparent");
                elInstance.setComments(col, "");
                return true;
            }
        } else {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setComments(col, "");
            return true;
        }
    }
}

export function positiveValidation(colName, rowNo, elInstance) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setComments(col, "");
}

export function inValid(colName, rowNo, message, elInstance) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setStyle(col, "background-color", "yellow");
    elInstance.setComments(col, message);
}



