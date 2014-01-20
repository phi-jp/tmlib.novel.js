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
        this.label.text += '\n';
        this.next();
    },
    "cm": function(app) {
        this.label.text = '';
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
        this.label.setPosition(params.x, params.y);
        this.next();
    },
    image: function(app) {
        var params = this.activeTask.params;

        if (this.loadingFlag == false) {
            this.loadingFlag = true;
            var loader = tm.asset.Loader();
            loader.onload = function() {
                var sprite = tm.display.Sprite(params.storage);
                this.layers[params.layer].addChild(sprite);
                sprite.x = params.x;
                sprite.y = params.y;
                sprite.originX = (params.originX !== undefined) ? params.originX : 0.5;
                sprite.originY = (params.originY !== undefined) ? params.originY : 0.5;
                if (params.width !== undefined) sprite.width = params.width;
                if (params.height !== undefined) sprite.height = params.height;
                this.loadingFlag = false;
                this.next();
            }.bind(this);
            loader.load(params.storage, params.storage);
        }
    },
    image_new: function(app) {
        var params = this.activeTask.params;
        
        if (this.loadingFlag == false) {
            this.loadingFlag = true;
            var loader = tm.asset.Loader();
            loader.onload = function() {
                this.loadingFlag = false;
                this.next();
            }.bind(this);
            loader.load(params.name, params.storage);
        }
    },
    image_show: function(app) {
        var params = this.activeTask.params;
        var sprite = tm.display.Sprite(params.name);
        this.layers[params.layer].addChild(sprite);
        
        sprite.x = params.x;
        sprite.y = params.y;
        if (params.width !== undefined) sprite.width = params.width;
        if (params.height !== undefined) sprite.height = params.height;
        this.next();
    },
    delay: function(app) {
        var params = this.activeTask.params;

        this.chSpeed = (params.speed*(app.fps/1000))|0;
        this.chSpeed = Math.max(this.chSpeed, 1);
        this.next();
    },
    rect: function(app) {
        var params = this.activeTask.params;
        var shape = tm.display.RectangleShape(params.width, params.height, {
            strokeStyle: "transparent",
            fillStyle: params.color,
        });
        this.layers[params.layer].addChild(shape);
        shape.x = params.x;
        shape.y = params.y;

        this.next();
    },
    jump: function(app) {
        var params = this.activeTask.params;
        this.jump(params.target);
    },
    reload: function() {
        // TODO: リロード機能
        this.script.reload();

        this.script.onload = function() {
            this.next();
        }.bind(this);
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
        
        this.layers = {
            "base": tm.display.CanvasElement().addChildTo(this),
            "0": tm.display.CanvasElement().addChildTo(this),
            "1": tm.display.CanvasElement().addChildTo(this),
            "2": tm.display.CanvasElement().addChildTo(this),
            "message0": tm.display.CanvasElement().addChildTo(this),
            "message1": tm.display.CanvasElement().addChildTo(this),
        };
        this.taskIndex = 0;
        this.waitFlag = false;
        this.loadingFlag = false;
        this.chSpeed = 1;
        
        this.label = tm.display.Label().addChildTo(this.layers.message0);
        
        this.label.x = 10;
        this.label.y = 300;
        this.label.fontSize = 16;

        this.next();
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
        var task = this.activeTask;
        
        if (!task) return ;
        
        if (task.type == "text") {
            if (app.frame % this.chSpeed == 0) {
                var ch = task.value[this.seek++];
                if (ch !== undefined) {
                    this.label.text += ch;
                }
                else {
                    this.next();
                }
                
                if (app.pointing.getPointingStart()) {
                    for (var i=this.seek,len=task.value.length; i<len; ++i) {
                        var ch = task.value[i];
                        this.label.text += ch;
                    }
                    this.next();
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

