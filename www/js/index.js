/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

var start_touch_x = 0;
var start_touch_y = 0;
var panel_width = 0;

var STARDUST_SERVICE = "e623070c-efb6-4d49-93d8-a009210abd32";
var STARDUST_BRIGHTNESS = "297c070c-655d-43ca-ac7d-15d7d8f4455e";
var STARDUST_SCHEDULER = "8b02070c-1314-4488-a618-de21e9eea8d8";
var STARDUST_STARTTIME = "b518070c-7783-4a9e-8df8-ae84fc80a840";
var STARDUST_ENDTIME = "066c070c-cb23-42f6-8d86-74695036cd1d";


var brightnessCharacteristic = 0;
var schedulerCharacteristic = 0;
var starttimeCharacteristic = 0;
var endtimeCharacteristic = 0;
var stardust_device = 0;

function log(msg) {

    if (typeof msg === "object") {

        msg = JSON.stringify(msg, null, "  ");
    }

    console.log(msg);

    {

        var msgDiv = document.createElement("div");
        msgDiv.textContent = msg;

        msgDiv.style.padding = "5px 0";
        msgDiv.style.borderBottom = "rgb(192,192,192) solid 1px";
        document.getElementById("output").appendChild(msgDiv);
    }
}

function drawStar(canvas_id) {
    //adjust size
    var width = 32;
    var stroke_color = "#7E7E80";
    var star_color = "#F9F9F9";

    type = $("#"+canvas_id).data("type");
    if(type == "on") star_color = "#F9EDDF";
    $("#"+canvas_id).width(width);
    $("#"+canvas_id).height(width);

    var ctx = document.getElementById(canvas_id).getContext("2d");

    var spikes = 5;
    var outerRadius = width/2-4;
    var innerRadius = width/4-1;

    var cx = width/2;
    var cy = width/2;

    var rot=Math.PI/2*3;
    var x=cx;
    var y=cy;
    var step=Math.PI/spikes;

    ctx.beginPath();
    ctx.moveTo(cx,cy-outerRadius);
    for(i=0;i<spikes;i++){
        x=cx+Math.cos(rot)*outerRadius;
        y=cy+Math.sin(rot)*outerRadius;
        ctx.lineTo(x,y);
        rot+=step;

        x=cx+Math.cos(rot)*innerRadius;
        y=cy+Math.sin(rot)*innerRadius;
        ctx.lineTo(x,y);
        rot+=step;
    }
    ctx.lineTo(cx,cy-outerRadius);
    ctx.closePath();
    ctx.lineWidth=2;
    ctx.strokeStyle=stroke_color;
    ctx.stroke();
    ctx.fillStyle=star_color;
    ctx.fill();
}

function send_BLE_data(characteristic, value) {
    if(stardust_device!=0) {
        log("send_BLE_data: " + value);
        evothings.ble.writeCharacteristic(
            stardust_device,
            characteristic,
            new Uint8Array(value),
            //new Uint8Array([0x00,0xa1,0xc2,0xd3]), => 0xd3c2a100
            //value,
            function() {
                log('Send BLE data: ' + value);
            },
            function(error) {
                log("Error send BLE data: " + error);
            });
    }
}

function send_scheduler_data() {
    var d = new Date();
    //var send_data = d.getMinutes() | (d.getHours() << 8) | ((100-$('#time-brightness').val())<<16);
    //var send_data = (d.getMinutes()<<16 | (d.getHours() << 8) | ((100-$('#time-brightness').val())))<<8;
    var send_data = [d.getMinutes(), d.getHours(),(100-$('#time_brightness').val()), 0];

    log("Send data: " + send_data + " || which should contain: " + (100-$('#time_brightness').val()) + ":" + d.getHours() + ":" + d.getMinutes());
    //send_BLE_data(schedulerCharacteristic, send_data);
    send_BLE_data(schedulerCharacteristic, send_data);
}

function main()
{
    var menu_panel = new Panel("menu", 254, $(".panel-left"));
    var main_panel = new Panel("main", 1024, $("#main"));
    var log_panel = new Panel("log", 1024, $("#log"));
    var about_panel = new Panel("about", 1024, $("#about"));

    var panelsManager = new PanelsManager();

    panelsManager.add_panel({panel: menu_panel, slide: "none"});
    panelsManager.add_panel({panel: main_panel, slide: "none"});
    panelsManager.add_panel({panel: log_panel, slide: "right"});
    panelsManager.add_panel({panel: about_panel, slide: "right"});


    $(".panel-left-toggle").click(function(e) {
        console.log("Button click");
        panelsManager.call_menu();
    });

    $(".back-button").click(function(e) {
        e.stopPropagation();
        panelsManager.back_to("main");
    });

    $(window).on("touchstart", function(ev) {
        var e = ev.originalEvent;
        start_touch_x = e.touches[0].screenX;
        start_touch_y = e.touches[0].screenY;
        panel_width = menu_panel.get_width();

        //set panel transitions to 0 seconds to avoid inertia
        menu_panel.set_transition(0);
        main_panel.set_transition(0);
    });

    $(window).on("touchmove", function(ev) {
        var e = ev.originalEvent;

        //slide left panel
        if($(".panel-left").width()>0) {
            new_width = panel_width - (start_touch_x - e.touches[0].screenX);
            if(new_width > menu_panel.get_panel_width()) new_width = menu_panel.get_panel_width();
            if(new_width < 0)  new_width = 0;

            menu_panel.set_width(new_width);
            main_panel.set_left_margin(new_width);

            $(".panel-pos").text(width);
        }
    });

    $(window).on("touchend", function(ev) {
        //var e = ev.originalEvent;
        width = $(".panel-left").width();
        if(width >menu_panel.get_panel_width()/2) width = menu_panel.get_panel_width(); else width = 0;

        //set panel transitions to 0 seconds to avoid inertia
        menu_panel.set_transition(0.5);
        main_panel.set_transition(0.5);

        menu_panel.set_width(width);
        main_panel.set_left_margin(width);
    });

    //menu
    $("#show_log").click(function(e) {
        e.stopPropagation();
        panelsManager.close_menu();
        panelsManager.set_current("log");
    });

    $("#show_about").click(function(e) {
        e.stopPropagation();
        panelsManager.close_menu();
        panelsManager.set_current("about");
    });

    //adjust slider size
    $(".star-slider").width($(".time-scheduler").height());
    //$(".star-slider").css("top", $('.panel-footer').height() - $('.time-scheduler').height() + 40);


    $(function() {
        //get width
        main_width = $(".panel-main").height() - $(".panel-footer").height() - 100;
        console.log("width: " + main_width);

        $(".control").width(main_width);
        $(".dial").knob({
            width: main_width,
            height: main_width,
            val: 0,
            'release': function(value) {
                log("Set value: " + value);
                send_BLE_data(brightnessCharacteristic, [value]);
            }
        });
        $('.dial').val(0);//.trigger('change');
    });

    drawStar("star_canvas1");
    drawStar("star_canvas2");

    panelsManager.set_current("main");


    //start BLE
    function connectToDevice(device)
    {
        evothings.ble.connectToDevice(
            device,
            onConnected,
            onDisconnected,
            onConnectError);

        function onConnected(device)
        {
            log('Connected to device');
            var service = evothings.ble.getService(device, STARDUST_SERVICE);
            brightnessCharacteristic = evothings.ble.getCharacteristic(service, STARDUST_BRIGHTNESS);
            schedulerCharacteristic = evothings.ble.getCharacteristic(service, STARDUST_SCHEDULER);
            starttimeCharacteristic =  evothings.ble.getCharacteristic(service, STARDUST_STARTTIME);
            endtimeCharacteristic =  evothings.ble.getCharacteristic(service, STARDUST_ENDTIME);

            stardust_device = device;

            log('Update application variables');
            //update all UI control fields
            evothings.ble.readCharacteristic(device, brightnessCharacteristic,
                function(data) {
                    var brightness_data = new DataView(data).getUint16(0, true);
                    log("Get brightness data: " + brightness_data);
                    $('.dial').val(brightness_data);

                },
                function(errorCode) {
                    log('Error getting brightness data : ' + errorCode);
                });

            evothings.ble.readCharacteristic(device, schedulerCharacteristic,
                function(data) {
                    var scheduler_data = new DataView(data).getUint32(0, true);
                    log("Get scheduler data: " + scheduler_data);
                    if(scheduler_data!=0) {
                        $('#myonoffswitch').prop('checked', true);
                        $(".glass").hide();
                        log("==>Set scheduled brightness to: " + (100-((scheduler_data & 0xff0000) >> 16)));
                        $('#time-brightness').val(100-((scheduler_data & 0xff0000) >> 16));
                    }
                },
                function(errorCode) {
                    log('Error getting scheduler data : ' + errorCode);
                });

            evothings.ble.readCharacteristic(device, starttimeCharacteristic,
                function(data) {
                    var time_data = new DataView(data).getUint16(0, true);
                    log("Get start time data: " + time_data);
                    log("==>Start hour: " + ((time_data & 0xff00) >> 8));
                    log("==>Start min:  " + (time_data &0xff));
                    $("#start_time").val(((time_data & 0xff00) >> 8) + ":" + (time_data &0xff));
                },
                function(errorCode) {
                    log('Error getting start time data : ' + errorCode);
                });

            evothings.ble.readCharacteristic(device, endtimeCharacteristic,
                function(data) {
                    var time_data = new DataView(data).getUint16(0, true);
                    log("Get end time data: " + time_data);
                    log("==>End hour: " + ((time_data & 0xff00) >> 8));
                    log("==>End min:  " + (time_data &0xff));
                    $("#end_time").val(((time_data & 0xff00) >> 8) + ":" + (time_data &0xff));
                },
                function(errorCode) {
                    log('Error getting end time data : ' + errorCode);
                });

        }

        // Function called if the device disconnects.
        function onDisconnected(error)
        {
            log('Device disconnected');
        }

        // Function called when a connect error occurs.
        function onConnectError(error)
        {
            log('Connect error: ' + error);
        }
    }

    function findDevice() {
        log("Start scanning");
        evothings.ble.startScan(onDeviceFound, onScanError);

        function onDeviceFound(device)
        {
            console.log('Found device: ' + device.advertisementData.kCBAdvDataLocalName);

            if (device.advertisementData.kCBAdvDataLocalName == 'Stardust LED')
            {
                log('Found Stardust LED device');

                // Stop scanning.
                evothings.ble.stopScan();

                // Connect...
                connectToDevice(device);
            }
        }

        // Function called when a scan error occurs.
        function onScanError(error)
        {
            log('Scan error: ' + error)
        }
    }

    $("#myonoffswitch").click(function(e) {
        if($("#myonoffswitch").is(':checked')) {
            $(".glass").hide();
            //send scheduler data : brightness:hour:minutes
            //hour:minutes can allow to set the clock at the controller
            send_scheduler_data();
        } else {
            $(".glass").show();
            send_BLE_data(schedulerCharacteristic, [0,0,0,0]);
        }
    });

    $("#start_time").change(function() {
        log("Start time changed to: " + $("#start_time").val());
        time = $("#start_time").val().split(':');
        send_BLE_data(starttimeCharacteristic,[parseInt(time[1]), parseInt(time[0]),0 ,0]);
    });

    $("#end_time").change(function() {
        log("End time changed to: " + $("#end_time").val());
        time = $("#end_time").val().split(':');
        send_BLE_data(endtimeCharacteristic,[parseInt(time[1]), parseInt(time[0]),0 ,0]);
    });

    $("#time_brightness").mouseup(function() {
        send_scheduler_data();
    });

    $("#time_brightness").on("touchend", function(ev) {
        send_scheduler_data();
    });

    findDevice();
}


$(document).ready(function() {
        var app = {
            // Application Constructor
            initialize: function () {
                this.bindEvents();
            },
            // Bind Event Listeners
            //
            // Bind any events that are required on startup. Common events are:
            // 'load', 'deviceready', 'offline', and 'online'.
            bindEvents: function () {
                document.addEventListener('deviceready', this.onDeviceReady, false);
            },
            // deviceready Event Handler
            //
            // The scope of 'this' is the event. In order to call the 'receivedEvent'
            // function, we must explicitly call 'app.receivedEvent(...);'
            onDeviceReady: function () {
                app.receivedEvent('deviceready');
                main();
            },
            // Update DOM on a Received Event
            receivedEvent: function (id) {
                //var parentElement = document.getElementById(id);
                //var listeningElement = parentElement.querySelector('.listening');
                //var receivedElement = parentElement.querySelector('.received');

                //listeningElement.setAttribute('style', 'display:none;');
                //receivedElement.setAttribute('style', 'display:block;');

                //console.log('Received Event: ' + id);
            }
        };

        console.log("Initialize application");
        app.initialize();
});