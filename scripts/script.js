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

