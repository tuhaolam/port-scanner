$( document ).ready(function() {
    SCANNER.initialize($("#port-scan-form"))
});

SCANNER =
{
    form:null,
    error_target:null,
    results_target:null,
    history_target:null,
    initialize:function(form)
    {
        SCANNER.form = form;
        SCANNER.error_target = $("#error-target");
        SCANNER.results_target = $("#results-target");
        SCANNER.history_target = $("#history-target");

        SCANNER.form.submit(SCANNER.submit);

        $body = jQuery("body");

        jQuery(document).on({
            ajaxStart: function() { $body.addClass("loading");    },
            ajaxStop: function() { $body.removeClass("loading"); }
        });

        SCANNER.log("port scanner is online");
    },
    submit:function(event)
    {
        event.preventDefault();

        SCANNER.error_target.html("");

        var text = $('textarea#hosts').val();

        if(text.length < 1)
        {
            alert("Please enter at least one hostname or IP to scan.");
        }
        else
        {
            var hosts = text.split(",");

            var error = [];
            var validHosts = [];

            $.each(hosts, function( index, value )
            {
                var host = $.trim(value);
                var valid = SCANNER.validate(host);

                if(valid)
                {
                    validHosts.push(host);
                }
                else
                {
                    error.push("<p class=\"error\">\"" + value +"\" is not a valid host or IP address</p>")
                }
            });

            if(error.length > 0)
            {
                SCANNER.error_target.html("<p>Please fix the following errors and try again:</p>\n" + error.join("\n"));
            }
            else
            {
                SCANNER.log(validHosts);
                SCANNER.scan(validHosts);
            }
        }
    },
    scan:function(hosts)
    {
        SCANNER.results_target.hide().html("");

        jQuery.ajax({
            type: "POST",
            url: SCANNER.form.attr("action"),
            data: JSON.stringify({hosts:hosts}),
            dataType: 'json',
            beforeSend: setHeader,
            success: SCANNER.onScanSuccess,
            error: SCANNER.onScanError
        });
    },
    onScanSuccess:function(data)
    {
        var html = [];
        html.push("<div id=\"accordion\">");

        $.each(data, function( index, value )
        {
            var tab = "<h3>" + value.hostname +"</h3><div>";

            tab += "<p><strong>Hostname: </strong>" + value.hostname +"</p>";
            tab += "<p><strong>IP address: </strong>" + value.ip +"</p>";
            tab += "<p><strong>First Scanned: </strong>" + value.created +"</p>";
            tab += "<p><strong>Most Recent Scan: </strong>" + value.lastScan +"</p>";
            tab += "<p><strong>Currently Active Ports: </strong><ul>";
            $.each(value.scans[0].ports, function( portIndex, portValue )
            {
                tab += "<li><strong>" + portValue.port + ":</strong> " + portValue.service + " (" + portValue.state + ")</li>";
            });
            tab += "</ul></p>";

            if(null == value.portsAdded || value.portsAdded.length < 1)
            {
                tab += "<p>No ports were added since the last scan.</p>";
            }
            else
            {
                tab += "<p><strong>Ports added since last scan: </strong>" + value.portsAdded.join(", ") +"</p>";
            }

            if(null == value.portsRemoved || value.portsRemoved.length < 1)
            {
                tab += "<p>No ports were removed since the last scan.</p>";
            }
            else
            {
                tab += "<p><strong>Ports removed since last scan: </strong>" + value.portsRemoved.join(", ") +"</p>";
            }

            tab += "<p><a href=\"/host/" + value.hostname +"\" ref=\"" + value.hostname +"\" class=\"history-link\">View history</a></p>";
            tab += "<p><a href=\"/host/" + value.hostname +"\" ref=\"" + value.hostname +"\" target=\"_blank\">View history as JSON</a></p>";
            tab += "</div>";

            html.push(tab);
        });

        html.push("</div>");

        SCANNER.results_target.html(html.join("\n"));

        $("#accordion").accordion({
            heightStyle: "content"
        });

        $(".history-link").click(SCANNER.showHistory);

        SCANNER.results_target.show("fast");
    },
    onScanError: function(XMLHttpRequest, textStatus, errorThrown)
    {
        SCANNER.error_target.html(XMLHttpRequest.responseText);
    },
    showHistory:function(event)
    {
        event.preventDefault();

        var host = $(this).attr("ref");

        jQuery.ajax({
            type: "GET",
            url: $(this).attr("href"),
            dataType: 'json',
            beforeSend: setHeader,
            success: function(data)
            {
                var html = [];
                html.push("<div id=\"history-accordion\">")
                $.each(data, function( index, value )
                {
                    tab = "<h3>Scan of " + host + " at " + value.created +"</h3><div>";

                    tab += "<p><strong>Active Ports: </strong><ul>";
                    $.each(value.ports, function( portIndex, portValue )
                    {
                        tab += "<li><strong>" + portValue.port + ":</strong> " + portValue.service + " (" + portValue.state + ")</li>";
                    });
                    tab += "</ul></p>";
                    tab += "</div>";

                    html.push(tab);
                });
                html.push("</div>");
                SCANNER.history_target.html(html.join("\n"));

                $("#history-accordion").accordion({
                    heightStyle: "content"
                });
            },
            error: function()
            {
                alert("there was a problem retrieving the history, please try again later")
            }
        });
    },
    validate:function(host)
    {
        if(true == validateIPaddress(host))
            return true;

        return validateHost(host);
    },
    log:function(message)
    {
        if (window.console) {
            console.log(message);
        }
    }
};

function setHeader(xhr) {
    xhr.setRequestHeader('Content-Type', 'application/json');
}

function validateHost(host)
{
    var pat = /(?:\w+\.)+\w+/gm;
    return (pat.test(host));
}

function validateIPaddress(ipaddress)
{
    if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress))
    {
        return (true)
    }
    return (false)
}
