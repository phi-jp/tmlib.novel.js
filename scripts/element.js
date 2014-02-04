/*
 * 
 */

tm.novel.TAG_MAP = {
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
            path: params.path,
            type: type,
        };
        
        loader.load(data);
    },
    image_show: function(app) {
        var params = this.activeTask.params;
        var sprite = tm.display.Sprite(params.name);
        var layer = this.layers[params.layer];
        
        layer.addImage(params.name, sprite);
        
        if (params.x !== undefined) sprite.x = params.x;
        if (params.y !== undefined) sprite.y = params.y;
        if (params.originX !== undefined) sprite.originX = params.originX;
        if (params.originY !== undefined) sprite.originY = params.originY;
        if (params.width !== undefined) sprite.width = params.width;
        if (params.height !== undefined) sprite.height = params.height;
        
        sprite.show();
        sprite.alpha = 0;
        sprite.tweener.clear().fadeIn(250);
        
        this.next();
    },
    image_hide: function(app) {
        var params = this.activeTask.params;
        var layer = this.layers[params.layer];
        var sprite = layer.getImage(params.name);
        
        sprite.tweener.clear().fadeOut(250).call(function() {
            sprite.hide();
            layer.removeImage(params.name);
        }.bind(this));
        
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
        var layer = this.layers[params.layer];
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
    reload: function() {
        this.lock();
        this.script.reload();

        this.script.onload = function() {
            this.unlock();
            this.next();
        }.bind(this);
    },
    
    call: function() {
        var params = this.activeTask.params;
        var e = tm.event.Event("novelcall");
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
};

/**
 * 
 */
tm.define("tm.novel.Element", {
    
    superClass: "tm.display.CanvasElement",
    
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
        
        this.labelArea = this.labelArea;
        
        this.labelArea.x = 10;
        this.labelArea.y = 300;
        this.labelArea.fontSize = 16;

        this.next();
    },
    
    lock: function() {
        this.lockFlag = true;
    },
    
    unlock: function() {
        this.lockFlag = false;
    },

    jump: function(tag) {
        this.taskIndex = this.script.tagTable[tag];
        this.next();
    },
    
    next: function() {
        this.activeTask = this.script.tasks[this.taskIndex++];
        this.seek = 0;
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

