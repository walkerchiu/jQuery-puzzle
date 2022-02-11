/*
* Puzzle
*
* https://github.com/walkerchiu/jQuery-puzzle
*
*/

(function(factory){
    if (typeof define === 'function' && define.amd) {   /* RequireJS */
        define(['jquery'], factory);
    } else if (typeof exports === 'object') {           /* Backbone.js */
        factory(require('jquery'));
    } else {                                            /* Jquery plugin */
        factory(jQuery);
    }
}(function($){
    'use strict';

    var obj, settings, distance, url;
    var gametimer, counter, duration;
    var showTag = 0, showTip = 1, showPic = 0;
    var fromID = -1, toID = -1;
    var padding = 0;
    let scores = {
        reset: function () {
            this.step_total = 0;
            this.step_now = 0;
            this.success = 0;
        }
    };
    let DefaultSettings = {
        'outerWidth': $(window).outerWidth(),
        'outerHeight': $(window).outerHeight(),
        'width': 3,
        'height': 3,
        'distance': 100,
        'task': 'num',
        'duration': 300,
        'helpspace': 1
    };

    const Timer = function Timer(fn, t) {
        var timerObj = setInterval(fn, t);
        this.stop = function () {
            if (timerObj) {
                clearInterval(timerObj);
                timerObj = null;
            }
            return this;
        }
        this.start = function () {
            if (!timerObj) {
                this.stop();
                timerObj = setInterval(fn, t);
            }
            return this;
        }
        this.adjust = function (newT) {
            t = newT;
            return this.stop().start();
        }
        this.reset = function (d) {
            duration = d;
            return this.stop().start();
        }
    }
    const isEqual = function (value, other) {
        for (var i = 0; i < value.length; i++)
            if ((value[i] !== other[i])) return false;
        return true;
    };
    const delay = function (s) {
        return new Promise( function (resolve,reject) {
            setTimeout(resolve,s); 
        });
    };

    function countDown(type, timer) {
        let minutes, seconds, result;
        duration = settings.duration;

        function formater() {
            minutes = parseInt(duration / 60, 10)
            seconds = parseInt(duration % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;
            result = minutes + ":" + seconds;

            timer.html(result);

            if (result == "00:00") { counter.stop(); GameOver(); }
            duration = (--duration < 0) ? timer : duration;
        }
        formater();

        if (type) counter = new Timer(formater, 1000);
        else      counter.reset(duration);
    }
    function initPicSelector() {
        let selector_w = obj.find(".game-option .game-pic-w"),
            selector   = obj.find(".game-option .game-pic");
        selector_w.empty(); selector.empty();
        $.each(items.pic, function (index, value) {
            selector_w.append($("<option>", {'value': index, 'text':value[0][2]}));
        });
        $.each(items.pic[0], function (index, value) {
            selector.append($("<option>", {'value': value[1], 'text':value[0], 'data-width': value[2], 'data-height': value[3]}))
        });
        selector.find('option:eq(0)').prop('selected', true);
    }
    function initContainer() {
        distance = settings.distance;
        let w = settings.outerWidth,
            h = settings.outerHeight;
        if (settings.task == 'pic') {
            w -= 40;
            h -= 40;
        }
        do {
            if (distance*settings.width < w && distance*settings.height < h)
                break;
            else
                distance--;
        } while(1);
    }
    function initShow() {
        obj.find(".game-wrap").empty().css("width", settings.width * distance).css("height", settings.height * distance);
        obj.find(".game-step-total").html(scores.step_total);
        obj.find(".game-step-now").html(scores.step_now);
        obj.find(".game-score-success").html(scores.success);

        let size = settings.width * settings.height;
        let li;

        if (settings.task == 'pic') {
            if (showTip) padding = 20;
            obj.find(".game-wrap").css("background", "no-repeat url('"+url+"') 0px 0px");
            obj.find(".game-wrap").css("padding", padding)
                                  .css("width", (settings.width * distance)+(padding*2))
                                  .css("height", (settings.height * distance)+(padding*2));
            obj.find("item").css("box-shadow", "none");
        } else {
            padding = 0;
        }

        let i = 0;
        let bh = -padding;
        let bv = -padding;
        for (let y=0; y<settings.height; y++) {
            for (let x=0; x<settings.width; x++) {
                li = $("<li>", {'class': "item", 'data-id': i, 'data-pos': x+'_'+y}).append($("<span>", {'class': "item-tag", 'text': i+1}));
                if (settings.task == 'pic') {
                    li.append($("<div>", {'class': "item-data hidden", 'data-id': i, 'text': i+1}))
                      .css('background', "transparent no-repeat url('"+url+"') "+bh+"px "+bv+"px");
                }
                else if (settings.task == 'num') {
                    li.append($("<div>", {'class': "item-data", 'data-id': i, 'text': i+1}));
                }
                else if (settings.task == 'en') {
                    let tmp = (typeof items.en[i] === 'undefined') ? "" : items.en[i];
                    li.append($("<div>", {'class': "item-data", 'data-id': i, 'text': tmp}));
                }
                else if (settings.task == 'tw') {
                    let tmp = (typeof items.tw[i] === 'undefined') ? "" : items.tw[i];
                    li.append($("<div>", {'class': "item-data", 'data-id': i, 'text': tmp}));
                }
                obj.find(".game-wrap").append(li);
                bh-=100;
                i++;
            }
            bh = -padding;
            bv-=100;
        }
        obj.find("li").css("width", distance).css("height", distance);
        obj.find(".item-data").css("width", distance).css("height", distance).css("line-height", distance + 'px');

        disarray();
        counter.start();
        if (showTag) obj.find(".item-tag").show();
        if (showPic) obj.find(".item-data").removeClass("hidden");
        if (showTip) obj.find(".game-wrap li").addClass("item-tip");
    }
    function change(status, from, to) {
        let tmp = from.children(".item-data").clone();
        from.children(".item-data").replaceWith(to.children(".item-data").clone());
        to.children(".item-data").replaceWith(tmp);
    }
    function disarray() {
        let entropy = 1000;
        let size = settings.width * settings.height;
        let from, to;
        do {
            from = obj.find("li[data-id='"+Math.floor((Math.random() * size))+"']");
            to   = obj.find("li[data-id='"+Math.floor((Math.random() * size))+"']");
            change(0, from, to);
        } while (entropy-- > 0);
    }
    function clear() {
        counter.stop();
        if (settings.task == 'pic') {
            obj.find(".game-wrap li").addClass("item-success");
            obj.find(".game-wrap li.item-empty").css("background", obj.find(".game-wrap li.item-empty").data("background"))
                                                .removeClass("item-empty").addClass("item");
        }
        delay(1000).then( function () {
            let title = $("<div>", {'class': "lead", 'text': "Success!"}).css("line-height", distance*settings.height + 'px');
            obj.find(".game-wrap").css("padding", 0).html($("<li>", {'class': "game-success"}).append(title)
                                                                    .css("width", distance*settings.width+(padding*2)).css("height", distance*settings.height+(padding*2))
                                                                    .css("line-height", distance*settings.height + 'px'));
            return delay(300);
        }).then( function () {
            if (showTip) padding = 20;
            initShow();
        });
    }
    function GameOver() {
        let title = $("<div>", {'class': "lead", 'text': "~ Game Over ~"});
        let score = $("<p>").html("Success: "+scores.success);
        let moves = $("<p>").html("Total Moves: "+scores.step_total);
        let li = $("<li>", {'class': "game-over"}).append(title).append(score).append(moves)
                                                  .css("width", distance*settings.width+(padding*2))
                                                  .css("height", distance*settings.height+(padding*2));
        obj.find(".game-wrap").css("padding", 0).prepend(li).children("li.game-over").fadeIn();
    }

    $.fn.Puzzle_init = function (options) {
        settings = $.extend(DefaultSettings, options);
        gametimer = $(this).find(".game-timer");
        obj = $(this);
        scores.reset();
        initPicSelector();

        obj.find(".game-option .game-width").val(settings.width);
        obj.find(".game-option .game-height").val(settings.height);
        obj.find(".game-option .game-duration").val(settings.duration);

        $(this).on("click", ".item", function () {
            if (fromID >= 0) toID   = Number($(this).data("id"));
            else             fromID = Number($(this).data("id"));
            console.log(fromID);
            console.log(toID);
            if (fromID == toID) {
                fromID = -1; toID = -1;
            } else if (fromID != -1 && toID != -1) {
                change(1, obj.find("li[data-id='"+fromID+"']"),
                          obj.find("li[data-id='"+toID+"']"));
                fromID = -1; toID = -1;

                if (status) {
                    obj.find(".game-step-now").html(++scores.step_now);
                    obj.find(".game-step-total").html(++scores.step_total);
                }

                let flag = 1;
                obj.find(".puzzle-target li").each( function () {
                    if ($(this).data("id") !== $(this).children(".item-data").data("id")) {
                        flag = 0;
                        return false;
                    }
                });
                if (flag) clear();
            }
            if (fromID == -1 && fromID == toID)  obj.find(".item").children().removeClass("selected");
            else if (fromID == -1 || toID == -1) $(this).children().addClass("selected");
        });
        $(this).on("change", ".game-pic-w", function () {
            let selector   = obj.find(".game-option .game-pic");
            selector.empty();
            $.each(items.pic[$(this).val()], function (index, value) {
                selector.append($("<option>", {'value': value[1], 'text':value[0], 'data-width': value[2], 'data-height': value[3]}))
            });
            selector.find('option:eq(0)').prop('selected', true);
        });
        $(this).on("click", ".option-btn", function () {
            obj.find(".game-option").slideToggle();
            obj.find(".restart-btn").toggle(); $(this).toggle();
        });
        $(this).on("click", ".switchTag", function () {
            obj.find(".item-tag").toggle();
            showTag = !showTag;
        });
        $(this).on("click", ".switchTip", function () {
            padding = ($(this).is(":checked")) ? 20 : 0;
            if (padding == 20)
                obj.find(".game-wrap").css("background", "no-repeat url('"+url+"') 0px 0px");
            else
                obj.find(".game-wrap").css("background", "none");
            obj.find(".game-wrap li").toggleClass("item-tip");
            showTip = !showTip;
        });
        $(this).on("click", ".switchPic", function () {
            obj.find(".item-data").toggleClass("hidden");
            showPic = !showPic;
        });
        $(this).on("click", ".close-btn", function () {
            obj.find(".game-option").slideUp();
            obj.find(".option-btn").show();
            obj.find(".restart-btn").hide();
        });
        $(this).on("click", ".restart-btn", function () {
            settings.duration = obj.find(".game-option .game-duration").val();
            if (settings.task == 'pic') {
                settings.width  = obj.find(".game-option .game-pic option:selected").data('width');
                settings.height = obj.find(".game-option .game-pic option:selected").data('height');
                padding = 20;
            } else {
                settings.width  = obj.find(".game-option .game-width").val();
                settings.height = obj.find(".game-option .game-height").val();
            }
            url = obj.find(".game-option .game-pic option:selected").val();

            scores.reset();
            countDown(0, gametimer);
            initContainer();
            initShow();
            if (showTip)
                obj.find(".game-wrap li").addClass("item-tip");
            else
                obj.find(".game-wrap").css("background", "none");
            obj.find(".game-option").slideUp();
            obj.find(".option-btn").show(); $(this).hide();
        });

        if (settings.task == 'pic') {
            countDown(1, gametimer);
            $(".restart-btn").trigger("click");
        } else {
            initContainer();
            countDown(1, gametimer);
            initShow();
        }
    };

    const items = {'pic': [[['A','https://example.com/a.jpg',2,2]],
                           [['B','https://example.com/b.jpg',3,3]],
                           [['C','https://example.com/c.jpg',4,2],
                            ['D','https://example.com/d.jpg',4,5]]],
                   'en': ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'],
                   'tw': ['ㄅ','ㄆ','ㄇ','ㄈ','ㄉ','ㄊ','ㄋ','ㄌ','ㄍ','ㄎ','ㄏ','ㄐ','ㄑ','ㄒ','ㄓ','ㄔ','ㄕ','ㄖ','ㄗ','ㄘ','ㄙ','ㄧ','ㄨ','ㄩ','ㄚ','ㄛ','ㄜ','ㄝ','ㄞ','ㄟ','ㄠ','ㄡ','ㄢ','ㄣ','ㄤ','ㄥ','ㄦ'] };

}));
