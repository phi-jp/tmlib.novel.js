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

// novel script
tm.asset.Loader.register("novel", function(path) {
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
        this.macros = {};

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
                this.extend(d, function(text) {
                    this.parse(text);
                    this.loaded = true;
                    this.fire(tm.event.Event("load"));
                }.bind(this));
            }.bind(this),
        });
    },

    reload: function() {
        this.load(this.path);
    },

    extend: function(text, fn) {
        var ma = text.match(/[@\[]import path=(.*)/mg);
        if (!ma || ma.length <= 0) {
            fn && fn(text);
            return ;
        }
        var query = this.path.split('?').last;
        var flow = tm.util.Flow(ma.length, function() {
            fn && fn(text);
        });

        ma.each(function(task) {
            var cmd = task.replace(/[@\[\]]/g, '');
            var filename = cmd.match(/path=(.*)/)[1];

            if (query) {
                filename += '?' + query;
            }

            var file = tm.util.File(filename);
            file.onload = function(e) {
                text = text.replace(task, this.data);
                flow.pass();
            };
        });
    },
    
    parse: function(text) {
        var self = this;
        var tasks = this.tasks;
        var lines = text.split("\n");
        
        lines.each(function(line) {
            line = line.trim();
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
                        if (text != "") {
                            tasks.push({
                                type: "text",
                                value: text.trim()
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
                        value: text.trim()
                    });
                    text = "";
                }
            }
        });
        
        return this;
    },
    
    _makeTag: function(value) {
        var paramsStr = value.split(' ');
        var func = paramsStr.shift();
        var params = {};
        
        paramsStr.each(function(elm, index) {
            var values = elm.split('=');
            var key = values[0];
            var value = elm.replace(key + '=', '');

            if (value.match(/^[+-]?[0-9]*[\.]?[0-9]+$/)) {
                value = Number(value);
            }
            else if (value === "true") {
                value = true;
            }
            else if (value === "false") {
                value = false;
            }
            // value = JSON.parse('"' + value + '"');
            
            return params[key] = value;
        });
        
        var tag = {
            type: "tag",
            func: func,
            params: params,
        };

        if (func == "macro") {
            this.macros[params.name] = tag;
        }
        
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


var BASIC_PROPS = ["x", "y", "width", "height", "rotation", "scaleX", "scaleY", "originX", "originY", "alpha"];

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
        this.variables = {};
        this.localVariablesStack = [];
        this.taskStack = [];
        this.endifStack = [];

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
        return this;
    },
    
    unlock: function() {
        this.lockFlag = false;
        return this;
    },

    jump: function(tag) {
        var taskIndex = (typeof tag == 'string') ?
            this.script.tagTable[tag] : tag;
        this.set(taskIndex);
        return this;
    },

    call: function(tag) {
        this.localVariablesStack.push(this.activeTask.params);
        this.taskStack.push(this.taskIndex);
        this.jump(tag);
        return this;
    },

    return: function() {
        this.localVariablesStack.pop();
        var index = this.taskStack.pop()+1;
        this.set(index);
    },

    set: function(index) {
        this.taskIndex = index;
        this.activeTask = this.script.tasks[this.taskIndex];
        this.seek = 0;
        
        if (!this.activeTask) {
            var e = tm.event.Event("taskfinish");
            this.fire(e);
            this.flare("finish");
        }
    },
    
    next: function() {
        this.set(this.taskIndex+1);
    },

    finish: function() {
        this.set(this.script.tasks.length);
    },

    format: function(value) {
        if (typeof value !== 'string') return value;
        var temp = value;

        var variables = {}.$extend(this.variables, this.localVariablesStack.last);
        value = value.format(variables);

        if (value.match(/^[+-]?[0-9]*[\.]?[0-9]+$/)) {
            value = Number(value);
        }
        else if (value === "true") {
            value = true;
        }
        else if (value === "false") {
            value = false;
        }

        if (/^[\[\(\{)]/.test(value)) {
            value = JSON.parse(value);
        }

        return value;
    },

    macro: function(name) {
        var macro = this.script.macros[name];
        var i = this.script.tasks.indexOf(macro);
        this.call(i).next();
    },

    setVariable: function(key, value) {
        this.variables[key] = value;
        return this;
    },

    getVariable: function(key) {
        return this.variables[key];
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
                // 変数展開
                if (this.seek == 0) {
                    task.value = this.format(task.value);
                }
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
            // タグ
            var func = tm.novel.Tag.get(task.func);
            var params = {};

            if (func) {
                for (var key in task.params) {
                    var param = task.params[key];
                    params[key] = this.format(param);
                }
                func.call(this, app, params);

                this.flare("taskrun", {
                    task: task,
                });
            }
            // 自作タグ(マクロ)
            else if (this.script.macros[task.func]) {
                this.macro(task.func);
            }
            else {
                console.assert(func, "don't define `{0}`!".format(task.func));
            }
            
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


/*
 *
 */



;(function() {

	tm.novel.Tag = {
		map: {},

		get: function(key) {
			return this.map[key];
		},

		set: function(key, fn) {
			if (arguments.length == 1) {
				var obj = arguments[0];
				for (var key in obj) {
					this.map[key] = obj[key];
				}
			}
			else {
				this.map[key] = fn;
			}
			return this;
		},
	};

	tm.novel.Tag.set({
	    
	    "log": function(app, params) {
	    	var message = params.message || params.msg;
	        console.log(message);
	        this.next();
	    },

	    "alert": function(app, params) {
	    	var message = params.message || params.msg;
	        alert(message);
	        this.next();
	    },

	    "debug": function(app, params) {
	    	var message = params.message || params.msg;
	        console.debug(message);
	        debugger;
	        this.next();
	    },

	    // TODO: 削除するかも
	    "trace": function(app, params) {
	        console.log(eval(params.exp));
	        this.next();
	    },

	    "var": function(app, params) {
	        var value = params.value;

	        this.variables[params.key] = value;
	        this.next();
	    },

	    "if": function(app, params) {
	        var exp = params.exp;
	        var rst = eval(exp);

	        if (!!rst == true) {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif") {
	                	this.endifStack.push(i);
	                    break;
	                }
	            }

	            this.next();
	        }
	        else {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif" || task.func == "elseif" || task.func == "else") {
	                    this.set(i);
	                    break;
	                }
	            }
	        }
	    },
	    "elseif": function(app, params) {
	    	if (this.endifStack.last) {
	            this.set(this.endifStack.last);
	            return ;
	    	}

	        var exp = params.exp;
	        var rst = eval(exp);

	        if (!!rst == true) {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif") {
	                	this.endifStack.push(i);
	                    break;
	                }
	            }

	            this.next();
	        }
	        else {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif" || task.func == "elseif" || task.func == "else") {
	                    this.set(i);
	                    break;
	                }
	            }
	        }
	    },
	    "else": function(app, params) {
	    	if (this.endifStack.last) {
	            this.set(this.endifStack.last);
	            return ;
	    	}
	    	
	        this.next();
	    },
	    "endif": function(app, params) {
	    	this.endifStack.pop();

	        this.next();
	    },

	    "macro": function(app, params) {
	        // 直近の endmacro を探す
	        var tasks = this.script.tasks;
	        for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	            var task = tasks[i];
	            if (task.func == "endmacro") {
	                this.set(i);
	                break;
	            }
	        }
	        this.next();
	    },
	    "endmacro": function(app, params) {
	        this['return']();
	    },

	    // 入力待ち
	    "l": function(app, params) {
	        this.lock();
	        this.onpointingstart = function() {
	            this.onpointingstart = null;
	            
	            this.unlock();
	            this.next();
	        }.bind(this);
	    },
	    "wait": function(app, params) {
	        this.lock();
	        this.timeline.clear();
	        this.timeline.call(params.time, function() {
	            this.unlock();
	            this.next();
	        }.bind(this));
	    },
	    
	    "delay": function(app, params) {
	        this.chSpeed = (params.speed*(app.fps/1000))|0;
	        this.chSpeed = Math.max(this.chSpeed, 1);
	        this.next();
	    },
	    
	    "jump": function(app, params) {
	        this.jump(params.target);
	    },
	    "call": function(app, params) {
	        this.call(params.target);
	    },
	    "return": function(app, params) {
	        this["return"]();
	    },
	    "reload": function(app, params) {
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
	    "event": function(app, params) {
	        var e = tm.event.Event("novelevent");
	        e.name = params.name;
	        e.params = params;
	        
	        this.fire(e);
	        
	        this.next();
	    },

	    // 終了
	    "s": function(app, params) {
	        this.finish();
	    },
	});


})();


;(function() {

	tm.novel.Tag.set({
	    "r": function(app, params) {
	        this.labelArea.text += '\n';
	        this.next();
	    },
	    "cm": function(app, params) {
	        this.labelArea.text = '';
	        this.next();
	    },
	    "position": function(app, params) {
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
	    "font": function(app, params) {
	        var la = this.labelArea;

	        if (params.size !== undefined) la.fontSize = params.size;
	        if (params.color !== undefined) la.fillStyle = params.color;
	        if (params.face !== undefined) la.fontFamily = params.face;
	        if (params.lineSpace !== undefined) la.lineSpace = params.lineSpace;
	        if (params.lineHeight !== undefined) la.lineHeight = params.lineHeight;
	        
	        this.next();
	    },
	});

})();


;(function() {
	tm.novel.Tag.set({
	    "base": function(app, params) {
	        this.basePath = params.path.format(this.variables);
	        
	        this.next();
	    },
	    "load": function(app, params) {
	        var path = params.path.format(this.variables);
	        var type = params.type || path.split('.').last;
	        
	        this.lock();
	        
	        var loader = tm.asset.Loader();
	        loader.onload = function() {
	            this.unlock();
	            this.next();
	        }.bind(this);
	        
	        var data = {};
	        var path = (this.basePath) ?
	            this.basePath + "/" + path : path;
	        
	        console.log(path);
	        data[params.name] = {
	            path: path,
	            type: type,
	        };
	        
	        loader.load(data);
	    },
	});

})();



;(function() {

	tm.novel.Tag.set({
	    new: function(app, params) {
	        var klass = tm.using(params.type);

            if (params.arg instanceof Array) {
                var element = klass.apply(null, params.arg);
            }
            else {
                var element = klass.call(null, params.arg);
            }
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
	    set: function(app, params) {
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
	    exec: function(app, params) {
	        var element = this.getNovelElement(params.name);

            if (params.arg instanceof Array) {
                element[params.method].apply(element, params.arg);
            }
            else {
                element[params.method].call(element, params.arg);
            }
	        
	        this.next();
	    },
	    delete: function(app, params) {
	        var element = this.removeNovelElement(params.name);
	        
	        this.next();
	    },

	    image_show: function(app, params) {
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
	    image_hide: function(app, params) {
	        var sprite = this.getNovelElement(params.name);
	        
	        this.lock();
	        sprite.tweener.clear().fadeOut(250).call(function() {
	            this.removeNovelElement(params.name);
	            this.unlock();
	            this.next();
	        }.bind(this));
	    },
	    shape: function(app, params) {
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

	    anim: function(app, params) {
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
	    
	    anim_by: function(app, params) {
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
	});

})();


;(function() {
	tm.novel.Tag.set({
	    sound_play: function(app, params) {
	        var self = this;
	        var sound = tm.asset.Manager.get(params.name).clone();

	        if (params.wait === true) {
	            this.lock();
	            sound.onended = function() {
	                self.unlock();
	                self.next();
	            };
	        }
	        else {
	            this.next();
	        }

	        sound.play();
	    },
	    music_play: function(app, params) {
	        tm.asset.Manager.get(params.name).setLoop(true).play();
	        this.next();
	    },
	    music_stop: function(app, params) {
	        tm.asset.Manager.get(params.name).stop();
	    },
	});
})();

tm.novel.Tag.set({
    select_start: function(app, params) {
        this.options = [];
        this.next();
    },
    select_option: function(app, params) {
        this.options.push({}.$extend(params));
        this.next();
    },
    select_end: function(app, params) {
        var app = this.getRoot().app;

        var scene = tm.novel.SelectScene({
            width: app.width,
            height: app.height,
            options: this.options,
        });
        scene.onselect = function(e) {
            this.unlock();

            var option = this.options[e.selectIndex];

            if (option.tag) {
                this.macro(option.tag);
            }
            else if (option.target) {
                this.call(option.target);
            }
            else {
                console.error('error!');
            }
        }.bind(this);

        app.pushScene(scene);
        this.lock();
    },
});


tm.define("tm.novel.SelectScene", {
    superClass: "tm.app.Scene",

    init: function(params) {
        this.superInit();

        this.fromJSON({
            children: {
                bg: {
                    type: "tm.display.RectangleShape",
                    init: [SCREEN_WIDTH, SCREEN_HEIGHT, {
                        fillStyle: "rgba(40, 40, 40, 0.5)",
                    }],
                    originX: 0,
                    originY: 0,
                },
            }
        });

        params.options.each(function(elm, i) {
            var b = tm.ui.FlatButton({
                text: elm.text,
                bgColor: 'hsl(220, 80%, 60%)',
                fontColor: "#555",
                fontSize: 27,
                width: 220,
                height: 70,
            }).addChildTo(this);

            b.x = params.width/2;
            b.y = params.height/2 + i*83;

            b.onpointingend = function() {
                this.bg.tweener
                    .clear()
                    .fadeOut(100)
                    .call(function() {
                        var e = tm.event.Event('select');
                        e.selectIndex = i;
                        this.fire(e);
                        this.app.popScene();
                    }, this);
            }.bind(this);
        }, this);

        this.bg.alpha = 0;
        this.bg.tweener.fadeIn(100);
    },

});
