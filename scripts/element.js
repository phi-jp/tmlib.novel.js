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

