import i18n from '../../src/i18n';

export function jExcelLoadedFunction(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jexcel_pagination')[number];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jexcel_filter')[number];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[number]).childNodes[1];
    searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[number]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jexcel_search")[number].placeholder = i18n.t('static.jexcel.search');
    // searchContainer.classList.add('TableCust');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');

    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[number].value = "";
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

    var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    // document.getElementsByClassName('jexcel_pagination')[number].value = localStorage.getItem("sesRecordCount")
    // document.getElementsByClassName('jexcel_pagination')[number].value = 25
    var pageSelect = document.getElementsByClassName('jexcel_pagination_dropdown')[number];
    pageSelect.options[pageSelect.options.length] = new Option('All', 5000000);
    

    var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);





    // document.getElementById("clearBtnID").onclick= function(){alert("ok");}
}


export function jExcelLoadedFunctionPipeline(instance, number) {
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    var pagignation = document.getElementsByClassName('jexcel_pagination')[number];
    pagignation.classList.add('row');
    var searchContainer = document.getElementsByClassName('jexcel_filter')[number];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[number]).childNodes[1];
    searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[number]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jexcel_search")[number].placeholder = i18n.t('static.jexcel.search');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');

    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
    clearBtn.setAttribute("id", "clearBtnID");
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[number].value = "";
        elInstance.resetSearch();
    };
    clearBtn.appendChild(clarText);
    searchContainer.appendChild(clearBtn);

    var jexcel_pagination = document.getElementsByClassName('jexcel_pagination')[number];
    jexcel_pagination.lastChild.classList.add('order-3');
    jexcel_pagination.firstChild.classList.add('order-2');
    jexcel_pagination.firstChild.classList.add('mr-auto');
    jexcel_pagination.firstChild.classList.add('pl-0');
    var pageSelect = document.getElementsByClassName('jexcel_pagination_dropdown')[number];
    pageSelect.options[pageSelect.options.length] = new Option('All', 5000000);

    var jexcel_filterFirstdiv = document.getElementsByClassName('jexcel_filter')[number];
    var filter = jexcel_filterFirstdiv.firstChild;
    filter.classList.add('order-1');
    filter.classList.add('pr-1');
    filter.classList.add('ml-2');
    jexcel_pagination.appendChild(filter);

    // document.getElementById("clearBtnID").onclick= function(){alert("ok");}
}

// export function jExcelLoadedFunctionWithoutPagination(instance) {
export function jExcelLoadedFunctionWithoutPagination(instance, number) {
    if (number == undefined) {
        number = 0;
    }
    var obj = {};
    obj.options = {};
    var elInstance = instance.jexcel;
    elInstance.hideIndex(0);
    var searchContainer = document.getElementsByClassName('jexcel_filter')[number];
    var searchDiv = (document.getElementsByClassName('jexcel_filter')[number]).childNodes[1];
    searchDiv.removeChild(((document.getElementsByClassName('jexcel_filter')[number]).childNodes[1]).childNodes[0]);
    document.getElementsByClassName("jexcel_search")[number].placeholder = i18n.t('static.jexcel.search');
    // searchContainer.classList.add('TableCust');
    var clearBtn = document.createElement('button');
    clearBtn.type = "button";
    clearBtn.onclick = function () {
        document.getElementsByClassName("jexcel_search")[number].value = "";
        elInstance.resetSearch();
    };
    clearBtn.classList.add('btn-default');
    clearBtn.classList.add('btn');
    clearBtn.classList.add('jexcel_clear_btn');

    var clarText = document.createTextNode(i18n.t('static.jexcel.clear'));
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
        console.log("col", col);
        value = value.toString().replaceAll("\,", "");
        if (value == "") {
            elInstance.setStyle(col, "background-color", "transparent");
            elInstance.setStyle(col, "background-color", "yellow");
            elInstance.setComments(col, i18n.t('static.label.fieldRequired'));
            return false;
        } else {
            console.log("isNaN(Number.parseInt(value))", isNaN(Number.parseInt(value)));
            console.log("!(reg.test(value))", !(reg.test(value)));
            console.log("!(reg.test(value)) Value", value);
            if (isNaN(Number.parseInt(value)) || !(reg.test(value)) || (greaterThan0 == 1 && (equalTo0 == 1 ? value < 0 : value <= 0)) || (greaterThan0 == 0 && (equalTo0 == 1 ? value != 0 : value == 0))) {
                console.log("!(reg.test(value)) in if")
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

export function inValidWithColor(colName, rowNo, message, elInstance, color) {
    var col = (colName).concat(parseInt(rowNo) + 1);
    elInstance.setStyle(col, "background-color", "transparent");
    elInstance.setStyle(col, "background-color", color);
    elInstance.setComments(col, message);
}



