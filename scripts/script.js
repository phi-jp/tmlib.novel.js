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

