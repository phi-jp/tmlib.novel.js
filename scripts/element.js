/*
 * 
 */


var BASIC_PROPS = ["x", "y", "width", "height", "rotation", "scaleX", "scaleY", "alpha"];
tm.novel.TAG_MAP = {
    // 入力待ち
    "l": function(app) {
        this.lock();
        this.onpointingstart = function() {
            this.onpointingstart = null;
            
            this.unlock();
            this.next();
        }.bind(this);
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
        this.lock();
        
        this.timeline.clear();
        this.timeline.call(function() {
            this.unlock();
            this.next();
        }.bind(this), this.activeTask.params.time);
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
        var path = (this.basePath) ?
            this.basePath + "/" + params.path : params.path;
        
        console.log(path);
        data[params.name] = {
            path: path,
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
     * 
     */
    event: function() {
        var params = this.activeTask.params;
        var e = tm.event.Event("novelevent");
        e.name = params.name;
        
        this.fire(e);
        
        this.next();
    },
    
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
    
    anim: function() {
        var params = this.activeTask.params;
        var time   = params.time || 1000;
        var easing = params.easing;
        var elm    = this.getNovelElement(params.name);
        var tweener= elm.tweener;
        var props  = {};
        
        
        BASIC_PROPS.each(function(key) {
            if (params[key] !== undefined) {
                props[key] = params[key];
            }
        });
        
        tweener.clear().to(props, time, easing);
        
        this.next();
    },
    
    anim_by: function() {
        var params = this.activeTask.params;
        var time   = params.time || 1000;
        var easing = params.easing;
        var elm    = this.getNovelElement(params.name);
        var tweener= elm.tweener;
        var props  = {};
        
        
        BASIC_PROPS.each(function(key) {
            if (params[key] !== undefined) {
                props[key] = params[key];
            }
        });
        
        tweener.clear().by(props, time, easing);
        
        this.next();
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


tm.novel.TAG_MAP.$extend({
    new: function(app) {
        var params = this.activeTask.params;
        var klass = tm.using(params.type);
        var args = tm.novel.TAG_MAP._argToArgs(params.arg);
        var element = klass.apply(null, args);
        
        this.addNovelElement(params.name, element, params.layer);

        // by basic props
        BASIC_PROPS.each(function(key) {
            var value = params[key];
            if (value !== undefined) {
                element[key] = value;
            }
        });
        
        this.next();
    },
    set: function() {
        var params  = this.activeTask.params;
        var element = this.getNovelElement(params.name);
        
        // set by key and value
        var key    = params.key;
        var value  = params.value;
        if (key) {
            element[key] = value;
        }

        // set by basic props
        BASIC_PROPS.each(function(key) {
            var value = params[key];
            if (value !== undefined) {
                element[key] = value;
            }
        });
        
        this.next();
    },
    call: function(app) {
        var params = this.activeTask.params;
        var element = this.getNovelElement(params.name);
        var args = tm.novel.TAG_MAP._argToArgs(params.arg);
        
        element[params.method].apply(element, args);
        
        this.next();
    },
    delete: function(app) {
        var params = this.activeTask.params;
        var element = this.removeNovelElement(params.name);
        
        this.next();
    },
    
});

// 後方互換
tm.novel.TAG_MAP.element_new    = tm.novel.TAG_MAP.new;
tm.novel.TAG_MAP.element_call   = tm.novel.TAG_MAP.call;
tm.novel.TAG_MAP.element_remove = tm.novel.TAG_MAP.delete;


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
        this.basePath = "";

        this.set(0);
        
        this.setInteractive(true);
        this.setBoundingType("all");
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
    
    updateTask: function(app) {
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
            
            // 次のタスクへ
            this.updateTask(app);
        }
        else {
            alert();
        }
    },
        
    update: function(app) {
        this.updateTask(app);
    },
    
});

