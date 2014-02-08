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
        this.tagTable = [];

        if (path) {
            this.load(path);
        }
    },
    
    load: function(path) {
        this.loaded = false;

        this.path = path;

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

    reload: function() {
        this.load(this.path);
    },
    
    parse: function(text) {
        var self = this;
        var tasks = this.tasks;
        var lines = text.split("\n");
        
        lines.each(function(line) {
            var first_char = line[0];
            if (first_char == "*") {
                var key = line.trim();
                var taskIndex = tasks.length;
                self.tagTable[key] = taskIndex;
            }
            else if (first_char == ";" || (line[0] == "/" && line[1] == "/")) {
                // コメント
            }
            else if (first_char == '@') {
                tasks.push( self._makeTag(line.substr(1)) );
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
                        tasks.push({
                            type: "text",
                            value: text
                        });
                        text = "";
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
                    text = "";
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
            else if (value === "true") {
                value = true;
            }
            else if (value === "false") {
                value = false;
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



/**
 * 
 */
tm.define("tm.novel.Layer", {
    
    superClass: "tm.display.CanvasElement",
    
    init: function(script) {
        this.superInit();
        
        this.images = {};
    },
    
    addImage: function(key, sprite) {
        this.images[key] = sprite;
        this.addChild(sprite);
    },
    
    getImage: function(key) {
        return this.images[key];
    },
    
    removeImage: function(key) {
        this.images[key].remove();
        this.images[key] = null;
    },
});
        


/*
 * 
 */

tm.novel.TAG_MAP = {
    // 入力待ち
    "l": function(app) {
        if (app.pointing.getPointingStart()) {
            this.next();
        }
    },
    "r": function(app) {
        this.labelArea.text += '\n';
        this.next();
    },
    "cm": function(app) {
        this.labelArea.text = '';
        this.next();
    },
    // 終了
    "s": function(app) {
        this.finish();
    },
    "base": function(app) {
        var params = this.activeTask.params;
        
        this.basePath = params.path;
        
        this.next();
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
                this.next();
            }
        }
    },
    "alert": function(app) {
        console.log(this.activeTask.params.str);
        this.next();
    },
    "position": function(app) {
        var params = this.activeTask.params;
        var la = this.labelArea;
        
        if (params.x !== undefined) la.x = params.x;
        if (params.y !== undefined) la.y = params.y;
        if (params.width !== undefined) la.width = params.width;
        if (params.height !== undefined) la.height = params.height;
        
        // 縦書き
        if (params.vertical === true) {
            la.mode = "vertical";
        }
        
        this.next();
    },
    font: function(app) {
        var params = this.activeTask.params;
        var la = this.labelArea;

        if (params.size !== undefined) la.fontSize = params.size;
        if (params.color !== undefined) la.fillStyle = params.color;
        if (params.face !== undefined) la.fontFamily = params.face;
        
        this.next();
    },
    load: function(app) {
        var params = this.activeTask.params;
        var type = params.type || params.path.split('.').last;
        
        this.lock();
        
        var loader = tm.asset.Loader();
        loader.onload = function() {
            this.unlock();
            this.next();
        }.bind(this);
        
        var data = {};
        data[params.name] = {
            path: this.basePath + "/" + params.path,
            type: type,
        };
        
        loader.load(data);
    },
    image_show: function(app) {
        var params = this.activeTask.params;
        var sprite = tm.display.Sprite(params.name);
        
        this.addNovelElement(params.name, sprite, params.layer);
        
        if (params.x !== undefined) sprite.x = params.x;
        if (params.y !== undefined) sprite.y = params.y;
        if (params.originX !== undefined) sprite.originX = params.originX;
        if (params.originY !== undefined) sprite.originY = params.originY;
        if (params.width !== undefined) sprite.width = params.width;
        if (params.height !== undefined) sprite.height = params.height;
        
        sprite.show();
        sprite.alpha = 0;
        sprite.tweener.clear().fadeIn(250).call(function() {
            
        });
        
        this.next();
    },
    image_hide: function(app) {
        var params = this.activeTask.params;
        var sprite = this.getNovelElement(params.name);
        
        this.lock();
        sprite.tweener.clear().fadeOut(250).call(function() {
            this.removeNovelElement(params.name);
            this.unlock();
            this.next();
        }.bind(this));
    },
    
    element_new: function(app) {
        var params = this.activeTask.params;
        var klass = tm.using(params.type);
        var args = tm.novel.TAG_MAP._argToArgs(params.arg);
        var element = klass.apply(null, args);
        
        this.addNovelElement(params.name, element, params.layer);
        
        this.next();
    },
    element_call: function(app) {
        var params = this.activeTask.params;
        var element = this.getNovelElement(params.name);
        var args = tm.novel.TAG_MAP._argToArgs(params.arg);
        
        element[params.method].apply(element, args);
        
        this.next();
    },
    element_remove: function(app) {
        var params = this.activeTask.params;
        var element = this.removeNovelElement(params.name);
        
        this.next();
    },
    
    delay: function(app) {
        var params = this.activeTask.params;

        this.chSpeed = (params.speed*(app.fps/1000))|0;
        this.chSpeed = Math.max(this.chSpeed, 1);
        this.next();
    },
    
    shape: function(app) {
        var params = this.activeTask.params;
        var type = params.type;
        var layer = this.layers[params.layer || 1];
        var shape = null;
        
        switch (type) {
            case "rect":
                shape = tm.display.RectangleShape(params.width, params.height, {
                    strokeStyle: "transparent",
                    fillStyle: params.color,
                });
                break;
            default :
                debugger;
                console.log("そんなタイプないよ!");
                break;
        }
        layer.addImage(params.name, shape);
        shape.x = params.x;
        shape.y = params.y;
        
        shape.alpha = 0;
        shape.tweener.clear().fadeIn(250);

        this.next();
    },
    jump: function(app) {
        var params = this.activeTask.params;
        this.jump(params.target);
    },
    call: function(app) {
        var params = this.activeTask.params;

        this.prevTaskIndex = this.taskIndex;
        this.jump(params.target);
    },
    return: function(app) {
        this.set(this.prevTaskIndex+1);
    },
    reload: function() {
        this.lock();
        this.script.reload();

        this.script.onload = function() {
            this.unlock();
            this.next();
        }.bind(this);
    },
    
    /*
     * TODO: 名前を変える
     */
    // call: function() {
    //     var params = this.activeTask.params;
    //     var e = tm.event.Event("novelcall");
    //     e.name = params.name;
        
    //     this.fire(e);
        
    //     this.next();
    // },
    
    trace: function() {
        var params = this.activeTask.params;
        console.log(eval(params.exp));
        this.next();
    },
    
    sound_play: function() {
        var params = this.activeTask.params;
        tm.asset.Manager.get(params.name).clone().play();
        this.next();
    },
    music_play: function() {
        var params = this.activeTask.params;
        tm.asset.Manager.get(params.name).setLoop(true).play();
        this.next();
    },
    music_stop: function() {
        var params = this.activeTask.params;
        tm.asset.Manager.get(params.name).stop();
    },
    
    _argToArgs: function(arg) {
        if (arg === undefined) return [];
        
        var args = arg.split(',');
        
        args.each(function(elm, index) {
            var value = elm;
            
            if (!value.match(/[^0-9]+/)) {
                value = Number(value);
            }
            else if (value === "true") {
                value = true;
            }
            else if (value === "false") {
                value = false;
            }
            
            args[index] = value;
        });
        
        return args;
    },
};

/**
 * 
 */
tm.define("tm.novel.Element", {
    
    superClass: "tm.display.CanvasElement",
    
    elementMap: null,
    
    init: function(script) {
        this.superInit();
        
        if (typeof script == "string") {
            this.script = tm.asset.Manager.get(script);
        }
        else {
            this.script = script;
        }
        
        this.layers = {
            "base": tm.novel.Layer().addChildTo(this),
            "0": tm.novel.Layer().addChildTo(this),
            "1": tm.novel.Layer().addChildTo(this),
            "2": tm.novel.Layer().addChildTo(this),
            "message0": tm.novel.Layer().addChildTo(this),
            "message1": tm.novel.Layer().addChildTo(this),
        };
        this.taskIndex = 0;
        this.waitFlag = false;
        this.lockFlag = false;
        this.chSpeed = 1;
        
        this.labelArea = tm.ui.LabelArea({
            text: "",
            width: 430,
            height: 200,
        }).addChildTo(this.layers.message0);
        
        this.labelArea.text = "";
        this.labelArea.origin.set(0, 0);
        
        this.labelArea.x = 20;
        this.labelArea.y = 330;
        this.labelArea.fontSize = 16;
        
        this.elementMap = {};
        this.basePath = ".";

        this.set(0);
    },
    
    lock: function() {
        this.lockFlag = true;
    },
    
    unlock: function() {
        this.lockFlag = false;
    },

    jump: function(tag) {
        var taskIndex = this.script.tagTable[tag];
        this.set(taskIndex);
    },

    set: function(index) {
        this.taskIndex = index;
        this.activeTask = this.script.tasks[this.taskIndex];
        this.seek = 0;
        
        if (!this.activeTask) {
            var e = tm.event.Event("taskfinish");
            this.fire(e);
        }
    },
    
    next: function() {
        this.set(this.taskIndex+1);
    },

    finish: function() {
        this.set(this.script.tasks.length);
    },
    
    addNovelElement: function(name, element, layerIndex) {
        if (layerIndex === undefined) layerIndex = 1;
        
        var layer = this.layers[layerIndex];
        layer.addChild(element);
        this.elementMap[name] = element;
        
        return this;
    },
    
    getNovelElement: function(name) {
        var element = this.elementMap[name];
        return element;
    },
    
    removeNovelElement: function(name) {
        var element = this.elementMap[name];
        element.remove();
        
        return this;
    },
    
    update: function(app) {
        if (this.lockFlag == true) return ;
        
        var task = this.activeTask;
        if (!task) return ;

        if (task.type == "text") {
            if (app.frame % this.chSpeed == 0) {
                var ch = task.value[this.seek++];
                if (ch !== undefined) {
                    this.labelArea.text += ch;
                    if (app.pointing.getPointingStart()) {
                        for (var i=this.seek,len=task.value.length; i<len; ++i) {
                            var ch = task.value[i];
                            this.labelArea.text += ch;
                        }
                        this.next();
                    }
                }
                else {
                    this.next();
                }
                
                var e = tm.event.Event("textupdate");
                this.fire(e);
            }
        }
        else if (task.type == "tag") {
            var func = tm.novel.TAG_MAP[task.func];
            console.assert(func, "don't define `{0}`!".format(task.func));
            func.call(this, app);
            
            var e = tm.event.Event("taskrun");
            e.task = task;
            this.fire(e);
        }
        else {
            alert();
        }
    },
    
});

