/*
 * 
 */


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
            }
        }
        else if (task.type == "tag") {
            if (task.value == "l") {
                if (app.pointing.getPointingStart()) {
                    this.nextTask();
                }
            }
            else if (task.value == "r") {
                this.label.text += '\n';
                this.nextTask();
            }
            else if (task.value == "cm") {
                this.label.text = '';
                this.nextTask();
            }
        }
        else {
            alert();
        }
    },
    
});

