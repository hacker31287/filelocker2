FLFile = function() {
    var selectedFiles = [];
    var selectedFileRow = "";
    function init()
    {
        Share.hideMulti();
        $(".fileSelectBox").prop("checked", false);
        $(".systemFileSelectBox").prop("checked", false);
        $("input.dateFuture").datepicker({dateFormat: 'mm/dd/yy', showAnim: 'slideDown', minDate: 0});
        $("input.dateExpire").datepicker({dateFormat: 'mm/dd/yy', showAnim: 'slideDown', minDate: 0, maxDate: DEFAULT_EXPIRATION});
        $("input.datePast").datepicker({dateFormat: 'mm/dd/yy', showAnim: 'slideDown', maxDate: 0});
        $("#fileName").prop("checked", false);
        
        $("#uploadBox").dialog($.extend({}, {
            title: "<span class='upload'>Upload a File</span>"
        }, Defaults.smallDialog));
        $("#uploadRequestBox").dialog($.extend({}, {
            title: "<span class='document_alert'>Request Upload to Filelocker</span>"
        }, Defaults.smallDialog));
        $("#uploadRequestLinkBox").dialog($.extend({}, {
            title: "<span class='globe'>View Public URL for Upload Request</span>"
        }, Defaults.smallDialog));
        $("#publicShareLinkBox").dialog($.extend({}, {
            title: "<span class='globe'>View Public URL</span>"
        }, Defaults.smallDialog));
        $("#publicShareBox").dialog($.extend({}, {
            title: "<span class='globe'>Share a File Publicly</span>",
            close: function() { load(); }
        }, Defaults.smallDialog));
        $("#fileNotesBox").dialog($.extend({}, {
            title: "<span class='view'>View File Notes</span>"
        }, Defaults.smallDialog));
        if (GEOTAGGING)
        {
            $("#fileUploadLocationBox").dialog($.extend({}, {
                title: "<span class='map'>View File Upload Location</span>"
            }, Defaults.smallDialog));
        }
        $("#fileStatisticsBox").dialog($.extend({}, {
            title: "<span class='statistics'>View File Statistics</span>"
        }, Defaults.smallDialog));
        $("#shareMultiBox").dialog($.extend({}, {
            title: "<span class='share'>Share a File</span>",
            close: function() { load(); }
        }, Defaults.smallDialog));
        if ($("#filesTable tr").length>0)
        {
            $("#fileTableSorter").tablesorter({
                headers: {
                    0: {sorter: false},
                    1: {sorter: 'text'},
                    2: {sorter: 'fileSize'},
                    3: {sorter: 'shortDate'},
                    4: {sorter: false}
                },
                sortList: [[1,0]],
                textExtraction: 'complex'
            });
        }
        if($("#systemFilesTable tr").length>0)
        {
            $("#systemFileTableSorter").tablesorter({
                headers: {
                    0: {sorter: false},
                    1: {sorter: 'text'},
                    2: {sorter: 'fileSize'},
                    3: {sorter: 'shortDate'},
                    4: {sorter: false}
                },
                sortList: [[1,0]],
                textExtraction: 'complex'
            });
        }
        if($("#fileSharesTable tr").length>0)
        {
            $("#fileSharesTableSorter").tablesorter({
                headers: {
                    0: {sorter: false},
                    1: {sorter: 'text'},
                    2: {sorter: 'fileSize'},
                    3: {sorter: 'shortDate'},
                    4: {sorter: false}
                },
                sortList: [[1,0]]
            });
        }
        else
            $("#fileSharesTable").append("<tr class='oddRow'><td class='spacer'></td><td colspan='4'><i>There are no files shared with you.</i></td></tr>");
        if($("#fileAttributeSharesTable tr").length>0)
        {
            $("#fileAttributeSharesTableSorter").tablesorter({
                headers: {
                    0: {sorter: false},
                    1: {sorter: 'text'},
                    2: {sorter: 'fileSize'},
                    3: {sorter: 'shortDate'},
                    4: {sorter: false}
                },
                sortList: [[1,0]]
            });
        }
        if($("#uploadRequestsTable tr").length>0)
        {
            $("#uploadRequestsTableSorter").tablesorter({
                headers: {
                    0: {sorter: false},
                    1: {sorter: false},
                    2: {sorter: 'text'},
                    3: {sorter: 'text'},
                    4: {sorter: 'shortDate'},
                    5: {sorter: false}
                },
                sortList: [[4,0]]
            });
        }
        else
            $("#uploadRequestsTable").append("<tr class='oddRow'><td class='spacer'></td><td colspan='5'><i>There are no upload requests available.</i></td></tr>");
        $("#miscFilesSections .head").click(function() {
            if ($(this).hasClass("ui-state-default"))
            {
                $(this).removeClass("ui-state-default").addClass("ui-state-active");
                $(this).removeClass("ui-corner-all").addClass("ui-corner-top");
                $(this).attr("aria-expanded", "true");
            }
            else
            {
                $(this).removeClass("ui-state-active").addClass("ui-state-default");
                $(this).removeClass("ui-corner-top").addClass("ui-corner-all");
                $(this).attr("aria-expanded", "false");
            }
            $(this).next().toggle();
            return false;
        }).next().hide();
        $("#fileStatistics").tabs();
        $("#sharedFilesSection").show();
        updateQuota();
        if(selectedFileRow !== "")
            rowClick(selectedFileRow);
    }
    function load()
    {
        //TODO no .load
        $("#wrapper_2col").load(FILELOCKER_ROOT+"/files?format=text&ms=" + new Date().getTime(), {}, function (responseText, textStatus, xhr) {
            if (textStatus == "error")
                StatusResponse.create("loading files", "Error "+xhr.status+": "+xhr.textStatus, false);
            else
            {
                if ($("#sessionState").length >0 && $("#sessionState").val() == "expired")
                    Filelocker.login();
                else
                {
                    init();
                    if($("#adminBackLink"))
                        $("#adminBackLink").html("<div id='adminLink' class='settings'><a href='javascript:loadAdminInterface()' title='Launch the admin panel'>Admin</a></div>");
                    Utility.getRandomTip();
                    Utility.tipsyfy();
                }
            }
        });
    }
    function del(fileId)
    {
        Filelocker.request("/file/delete_files", "deleting files", {"fileIds": fileId}, true, function() {
            selectedFileRow = "";
            load();
        });
    }
    function deleteFiles()
    {
        var fileIds = "";
        selectedFiles = [];
        $("#filesTable .fileSelectBox:checked").each(function() {selectedFiles.push($(this).val());});
        if ($("#systemFilesTable").length >0)
        {
            $("#systemFilesTable .systemFileSelectBox:checked").each(function() {selectedFiles.push($(this).val());});
        }
        $.each(selectedFiles, function(index,value) {
            fileIds += value + ",";
        });
        if(fileIds !== "")
            del(fileIds);
        else
            StatusResponse.create("deleting files", "Select file(s) for deletion.", false);
    }
    function take(fileId)
    {
        $("#takeOwnership_"+fileId).removeClass("take_ownership");
        $("#takeOwnership_"+fileId).addClass("taking_ownership");
        Filelocker.request("/file/take_file", "taking ownership", {fileId: fileId}, true, function() {
            load();
        });
    }

    function prompt()
    {
        $("#uploadGeolocationOption").hide();
        $("#uploadFileNotes").val("");
        $("#uploadNotesInfo").html("");
        if(GEOTAGGING && geo_position_js.init())
        {
            $("#uploadGeolocation").prop("checked", false);
            $("#uploadGeolocationOption").show();
        }
        $("#uploadBox").dialog("open");
        if($("#uploadButton")[0])
        {
            uploader = new qq.FileUploader({
                element: $("#uploadButton")[0],
                listElement: $("#progressBarSection")[0],
                action: FILELOCKER_ROOT+'/file/upload?format=json',
                params: {},
                sizeLimit: 2147483647,
                onSubmit: function(id, fileName){
                    var systemUpload = "no";
                    if ($("#systemUpload").length >0)
                    {
                        if ($("#systemUpload").is(":checked"))
                            systemUpload = "yes";
                    }
                    uploader.setParams({
                        'scanFile': $("#uploadScanFile").is(":checked"),
                        'fileNotes': $("#uploadFileNotes").val(),
                        'expiration': $("#uploadExpiration").val(),
                        'uploadIndex': id,
                        'systemUpload': systemUpload,
                        'fileName': fileName
                    });
                    $("#uploadBox").dialog("close");
                    continuePolling = true;
                    if(pollerId === "")
                        pollerId = setInterval(function() { poll(); }, 1000);
                },
                onProgress: function(id, fileName, loaded, total){
                    //checkServerMessages("uploading file");
                },
                onComplete: function(id, fileName, response){
                    var serverMsg = checkServerMessages("uploading file");
                    if(!serverMsg)
                        StatusResponse.show(response, "uploading file");
                    load();
                },
                onCancel: function(id, fileName){
                    StatusResponse.create("cancelling upload", "File upload cancelled by user.", true);
                },
                messages: {
                    sizeError: "sizeError"
                },
                showMessage: function(message){
                    if(message === "sizeError")
                    {
                        var browserAndVersion = Utility.detectBrowserVersion();
                        StatusResponse.create("uploading large file", "Your browser ("+browserAndVersion[0]+" "+browserAndVersion[1]+") does not support large file uploads.  Click <span id='helpUploadLarge' class='helpLink'>here</span> for more information.", false);
                    }
                }
            });
        }
    }
    
    function setGeoData()
    {
        if($("#uploadGeolocation").is(":checked") && GEOTAGGING)
        {
            var geoData = "";
            geo_position_js.getCurrentPosition(
            function(position) {
                geoData = "[geo]" + position.coords.latitude + "," + position.coords.longitude + "[/geo]";
                if($("#uploadFileNotes").val() !== "")
                    geoData = "\n" + geoData;
                if($("#uploadFileNotes").val().indexOf("[geo]") == -1)
                    $("#uploadFileNotes").val($("#uploadFileNotes").val() + geoData);
            },
            function(error) {
                switch(error.code)
                {
                    case 1: // User denies permission.
                        if($("#uploadFileNotes").val().match(/\[geo\]-?\d+\.\d+,-?\d+\.\d+\[\/geo\]/g))
                            $("#uploadFileNotes").val($("#uploadFileNotes").val().replace(/\[geo\]-?\d+\.\d+,-?\d+\.\d+\[\/geo\]/g, ""));
                        $("#uploadGeolocation").prop("checked", false);
                        break;
                    case 2: // Unable to determine position.
                        StatusResponse.create("geotagging file upload", "Unable to determine your current location.", false);
                        break;
                    case 3: // Takes more than five seconds.
                        StatusResponse.create("geotagging file upload", "Request for current location has timed out.", false);
                        break;
                    default:
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                maximumAge:30000,
                timeout:5000
            });
        }
        else
        {
            if($("#uploadFileNotes").val().match(/\[geo\]-?\d+\.\d+,-?\d+\.\d+\[\/geo\]/g))
                $("#uploadFileNotes").val($("#uploadFileNotes").val().replace(/\[geo\]-?\d+\.\d+,-?\d+\.\d+\[\/geo\]/g, ""));
        }
    }
    function fileChecked()
    {
//         var selectedFilesCounter = 0;
//         $("#filesTable .fileSelectBox:checked").each(function() {
//             selectedFilesCounter ++;
//         });
//         if ($("#systemFilesTable").length >0)
//         {
//             $("#systemFilesTable .systemFileSelectBox:checked").each(function() {
//                 selectedFilesCounter++;
//             });
//         }
        
        var selectedFiles = $("#filesTable .fileSelectBox:checked").length + $("#systemFilesTable .systemFileSelectBox:checked").length;

        if (selectedFiles > 1)
            Share.showMulti();
        else
            Share.hideMulti();
    }
    function viewFileNotes(fileNotes)
    {
        $("#fileNotes").html(fileNotes);
        $("#fileNotesBox").dialog("open");
    }
    function viewDownloadStatistics(fileId)
    {
        $("#totalGraph").empty();
        statFile = fileId;
        var params = {};
        params.fileId = fileId;
        var startDate = $("#totalGraphStartDate").val();
        var endDate = $("#totalGraphEndDate").val();
        if (startDate !== undefined && startDate !== "")
            params.startDate = startDate;
        else
        {
            var d1 = new Date();
            d1.setDate(d1.getDate()-30);
            var dateString1 = ("0" + (d1.getMonth()+1)).slice(-2) + "/" + ("0" + (d1.getDate())).slice(-2) + "/" + d1.getFullYear();
            $("#totalGraphStartDate").val(dateString1);
        }
        if (endDate !== undefined && endDate !== "")
            params.endDate = endDate;
        else
        {
            var d2 = new Date();
            var dateString2 = ("0" + (d2.getMonth()+1)).slice(-2) + "/" + ("0" + (d2.getDate())).slice(-2) + "/" + d2.getFullYear();
            $("#totalGraphEndDate").val(dateString2);
        }

        $.post(FILELOCKER_ROOT+'/file/get_download_statistics?format=json&ms=' + new Date().getTime(), params, 
        function(returnData) {
            var totalTable = "<div class='fileStatisticsTableWrapper'><table id='"+fileId+"_totalDownloads' class='fileStatisticsTable'><colgroup><col class='colHead' /></colgroup><caption>Total Downloads by Day</caption><thead><tr><td class='rowHead'>Date</td>";
            var totalHeaders = "";
            var totalData = "";
            var hasData = false;
            $.each(returnData.data.total, function(key, value) {
                hasData = true;
                totalHeaders += "<th scope='col'>"+value[0]+"</th>";
                totalData += "<td scope='row'>"+value[1]+"</td>";
            });
            totalTable += totalHeaders + "</tr></thead><tbody><tr><th scope='row'  class='rowHead'>Total</th>" + totalData + "</tr></tbody></table></div>";
            if(hasData)
                $("#totalTable").html(totalTable);
            else
                $("#totalTable").html("<i>There are no downloads in the specified date range.</i>");
            
            var uniqueTable = "<div class='fileStatisticsTableWrapper'><table id='"+fileId+"_uniqueDownloads' class='fileStatisticsTable'><colgroup><col class='colHead' /></colgroup><caption>Unique Downloads by Day</caption><thead><tr><td class='rowHead'>Date</td>";
            var uniqueHeaders = "";
            var uniqueData = "";
            hasData = false;
            $.each(returnData.data.unique, function(key, value) {
                hasData = true;
                uniqueHeaders += "<th scope='col'>"+value[0]+"</th>";
                uniqueData += "<td scope='row'>"+value[1]+"</td>";
            });
            uniqueTable += uniqueHeaders + "</tr></thead><tbody><tr><th scope='row' class='rowHead'>Unique</th>" + uniqueData + "</tr></tbody></table></div>";
            if(hasData)
                $("#uniqueTable").html(uniqueTable);
            else
                $("#uniqueTable").html("<i>There are no downloads in the specified date range.</i>");
            
            if(hasData)
            {
                if(!!document.createElement('canvas').getContext)
                {
                    $("#"+fileId+"_totalDownloads").visualize({
                        type: 'line',
                        width: 500,
                        height: 200,
                        appendKey: false,
                        colors: ['#fee932','#000000'],
                        diagonalLabels: true,
                        dottedLast: true,
                        labelWidth: 60
                    }).appendTo("#totalGraph").trigger("visualizeRefresh");
                }
                else
                    $("#totalGraph").html("<i>Your browser does not support the canvas element of HTML5.</i>");
            }
            else
                $("#totalGraph").html("<i>There are no downloads in the specified date range.</i>");
            $("#fileStatisticsBox").dialog("open");
        }, 'json');
    }
    function rowClick(rowId)
    {
        selectedFileRow = rowId;
        if ($("#row_"+rowId).hasClass("rowSelected") === false) // Only go through this if it's not already selected
        {
            $(".menuFiles").each(function(index) { $(this).addClass("hidden");}); // Hide other menus
            if($("#row_"+rowId).hasClass("rowSelected"))
            {
                $(".fileRow").each(function(index) { $(this).removeClass("rowSelected");}); // Deselects other rows
                $("#row_"+rowId).removeClass("rowSelected");
                $("#fileName_row_"+rowId).removeClass("leftborder");
                $("#menu_row_"+rowId).addClass("hidden");
            }
            else
            {
                $(".fileRow").each(function(index) { $(this).removeClass("rowSelected");}); // Deselects other rows
                $("#row_"+rowId).addClass("rowSelected"); //Select the row of the file
                $("#fileName_row_"+rowId).addClass("leftborder");
                $("#menu_row_"+rowId).removeClass("hidden"); //Show the menu on the selected file
            }
        }
        else
        {
            $("#row_"+rowId).removeClass("rowSelected");
            $("#fileNameElement_"+rowId).removeClass("leftborder");
            $("#menu_row_"+rowId).addClass("hidden");
        }
    }

    //AJAX
    function toggleNotifyOnDownload(fileId, notifyAction)
    {
        var data = {
            "fileId": fileId,
            "notifyOnDownload": notifyAction == "yes"
        };
        Filelocker.request("/file/update_file", "updating notification settings", data, true);
    }
    
    function updateQuota()
    {
        Filelocker.request("/file/get_quota_usage", "updating quota usage", "{}", true, function(returnData)
        {
            if (returnData.data != null)
            {
                var percentFull = parseInt(parseFloat(returnData.data.quotaUsedMB) / parseFloat(returnData.data.quotaMB) * 100, 10);
                $("#quotaProgressBar").progressbar("value", percentFull);
                $("#quotaProgressBar").attr("title", returnData.data.quotaUsedMB + " MB used out of " + returnData.data.quotaMB + " MB");
            }
        });
    }
    
    return {
        init:init,
        del:del,
        updateQuota:updateQuota,
        prompt:prompt,
        rowClick:rowClick
    }
}();

UploadRequest = function() {
    function create()
    {
        if ($("#uploadRequestPassword").val() != $("#uploadRequestPasswordConfirm").val())
            StatusResponse.create("creating upload request", "Passwords must match for upload request.", false);
        else if (isNaN(parseInt($("#uploadRequestMaxSize").val())))
            StatusResponse.create("creating upload request", "Max upload size must be a number.", false);
        else if (parseInt($("#uploadRequestMaxSize").val() > USER_QUOTA))
            StatusResponse.create("creating upload request", "Max upload size must be lower than your user quota.", false);
        else if ($("#uploadRequestPassword").val() === "" && $("#uploadRequestShareType").is(":checked"))
            StatusResponse.create("creating upload request", "You must enter a password when creating a multi-use upload request.", false);
        else
        {
            var requestType = $("#uploadRequestShareType").is(":checked") ? "multi" : "single";
            var data = {
                password: $("#uploadRequestPassword").val(),
                maxFileSize: $("#uploadRequestMaxSize").val(),
                expiration: $("#uploadRequestExpiration").val(),
                scanFile: $("#uploadRequestScanFile").is(":checked"),
                emailAddresses: $("#uploadRequestEmail").val(),
                personalMessage: $("#uploadRequestMessage").val(),
                requestType: requestType
            };
            Filelocker.request("/file/generate_upload_ticket", "creating upload request", data, true, function() {
                $("#uploadRequestBox").dialog("close");
                load();
            });
        }
    }
    function del(ticketId)
    {
        Filelocker.request("/file/delete_upload_ticket", "deleting upload request", {ticketId: ticketId}, true, function() {
            load();
        });
    }
    function prompt()
    {
        $("#uploadRequestEmail").val("");
        $("#uploadRequestMessage").val("");
        $("#uploadRequestPassword").val("");
        $("#uploadRequestPasswordConfirm").val("");
        $("#uploadRequestNotesInfo").html("");
        $("#uploadRequestBox").dialog("open");
    }
    function promptView(requestId)
    {
        var linkText = FILELOCKER_ROOT+"/public_upload?ticketId="+requestId;
        $("#uploadRequestURL").html("<p><a href='"+linkText+"' target='_blank'>"+linkText+"</a></p>");
        $("#uploadRequestLinkBox").dialog("open");
    }
    function togglePassword()
    {
        if ($("#uploadRequestPasswordSelector").is(":checked"))
            $("#uploadRequestSelector").show();
        else
        {
            $("#uploadRequestSelector").hide();
            $("#uploadRequestPassword").val("");
            $("#uploadRequestPasswordConfirm").val("");
        }
    }
    function toggleType()
    {
        if ($("#uploadRequestShareType").is(":checked") && !$("#uploadRequestPasswordSelector").is(":checked"))
        {
            check("uploadRequestPasswordSelector");
            togglePassword();
        }
    }
    
    return {
        create:create,
        del:del,
        prompt:prompt,
        promptView:promptView,
        togglePassword:togglePassword,
        toggleType:toggleType,
    }
}();