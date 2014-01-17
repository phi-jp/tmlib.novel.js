/*
 * 
 */


/**
 * 
 */
tm.define("tm.kag.Element", {
    
    superClass: "tm.display.CanvasElement",
    
    init: function(text) {
        this.superInit();
        
        this.label = tm.display.Label().addChildTo(this);
        
        this.label.x = 10;
        this.label.y = 300;
        this.label.fontSize = 16;
        
        this.tasks = this.parse(text);
        this.nextTask();
    },
    
    nextTask: function() {
        this.activeTask = this.tasks.shift();
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
    
    parse: function(text) {
        var tasks = [];
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
                            tasks.push({
                                type: "tag",
                                value: tag_str,
                            });
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
        
        return tasks;
    },
    
    _makeTag: function(tag) {
        
    },
});

