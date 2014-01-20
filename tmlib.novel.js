/*
 * tmlib.novel.js 0.1.0
 * http://github.com/phi-jp/tmlib.novel.js
 * MIT Licensed
 * 
 * Copyright (C) 2010 phi, http://tmlife.net
 */
/*
 * 
 */


// kirikiri script
tm.asset.Loader.register("ks", function(path) {
    var asset = tm.novel.Script(path);
    return asset;
});


/**
 * 
 */
tm.define("tm.novel.Script", {
    
    superClass: "tm.event.EventDispatcher",
    
    loaded: false,
    
    init: function(path) {
        this.superInit();
        
        this.tasks = [];
        
        if (path) {
            this.load(path);
        }
    },
    
    load: function(path) {
        tm.util.Ajax.load({
            url: path,
            dataType: "text",
            success: function(d) {
                this.parse(d);
                this.loaded = true;
                
                this.fire(tm.event.Event("load"));
            }.bind(this),
        });
    },
    
    parse: function(text) {
        var self = this;
        var tasks = this.tasks;
        var lines = text.split("\n");
        
        lines.each(function(line) {
            var first_char = line[0];
            if (first_char == "*") {
                
            }
            else {
                var tag_flag = false;
                var tag_str = "";
                var text = "";
                
                for (var i=0; i<line.length; ++i) {
                    var ch = line[i];
                    if (tag_flag == true) {
                        if (ch == "]") {
                            tasks.push(self._makeTag(tag_str));
                            tag_str = "";
                            tag_flag = false;
                        }
                        else {
                            tag_str += ch;
                        }
                    }
                    else if (tag_flag == false && ch == "[") {
                        if (text != "") {
                            tasks.push({
                                type: "text",
                                value: text
                            });
                            text = "";
                        }
                        tag_flag = true;
                    }
                    else {
                        text+=ch;
                    }
                }
                
                if (text != "") {
                    tasks.push({
                        type: "text",
                        value: text
                    });
                }
            }
        });
        
        console.log(tasks);
        
        return this;
    },
    
    _makeTag: function(value) {
        var paramsStr = value.split(' ');
        var func = paramsStr.shift();
        var params = {};
        
        paramsStr.each(function(elm, index) {
            var values = elm.split('=');
            var key = values[0];
            var value = values[1];
            
            if (!value.match(/[^0-9]+/)) {
                value = Number(value);
            }
            
            return params[key] = value;
        });
        
        var tag = {
            type: "tag",
            func: func,
            params: params,
        };
        
        return tag;
    },

});


/*
 * 
 */

tm.novel.TAG_MAP = {
    "l": function(app) {
        if (app.pointing.getPointingStart()) {
            this.nextTask();
        }
    },
    "r": function(app) {
        this.label.text += '\n';
        this.nextTask();
    },
    "cm": function(app) {
        this.label.text = '';
        this.nextTask();
    },
    "wait": function(app) {
        if (this.waitFlag == false) {
            this.waitFlag = true;
            this.waitTime = 0;
        }
        else {
            this.waitTime += (1000/app.fps);
            
            if (this.activeTask.params.time <= this.waitTime) {
                this.waitFlag = false;
                this.nextTask();
            }
        }
    },
    "alert": function(app) {
        alert(this.activeTask.params.str);
        this.nextTask();
    },
    "position": function(app) {
        var params = this.activeTask.params;
        this.label.setPosition(params.x, params.y);
        this.nextTask();
    },
    image_new: function(app) {
        var params = this.activeTask.params;
        
        if (this.loadingFlag == false) {
            this.loadingFlag = true;
            var loader = tm.asset.Loader();
            loader.onload = function() {
                this.loadingFlag = false;
                this.nextTask();
            }.bind(this);
            loader.load(params.name, params.storage);
        }
    },
    image_show: function(app) {
        var params = this.activeTask.params;
        var sprite = tm.display.Sprite(params.name).addChildTo(this);
        
        sprite.x = params.x;
        sprite.y = params.y;
        this.nextTask();
    },
};

/**
 * 
 */
tm.define("tm.novel.Element", {
    
    superClass: "tm.display.CanvasElement",
    
    init: function(script) {
        this.superInit();
        
        if (typeof script == "string") {
            this.script = tm.asset.Manager.get("sample");
        }
        else {
            this.script = script;
        }
        
        this.waitFlag = false;
        this.loadingFlag = false;
        
        this.label = tm.display.Label().addChildTo(this);
        
        this.label.x = 10;
        this.label.y = 300;
        this.label.fontSize = 16;
        
        this.nextTask();
    },
    
    nextTask: function() {
        this.activeTask = this.script.tasks.shift();
        this.seek = 0;
    },
    
    update: function(app) {
        var task = this.activeTask;
        
        if (!task) return ;
        
        if (task.type == "text") {
            if (app.frame % 2 == 0) {
                var ch = task.value[this.seek++];
                if (ch !== undefined) {
                    this.label.text += ch;
                }
                else {
                    this.nextTask();
                }
                
                if (app.pointing.getPointingStart()) {
                    for (var i=this.seek,len=task.value.length; i<len; ++i) {
                        var ch = task.value[i];
                        this.label.text += ch;
                    }
                    this.nextTask();
                }
            }
        }
        else if (task.type == "tag") {
            var func = tm.novel.TAG_MAP[task.func];
            func.call(this, app);
        }
        else {
            alert();
        }
    },
    
});

