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
	        var exp = params.exp.format(this.variables);
	        var rst = eval(exp);

	        if (rst == true) {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif") {
	                    this.endifIndex = i;
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
	        if (this.endifIndex) {
	            this.set(this.endifIndex);
	            return ;
	        }

	        var exp = params.exp.format(this.variables);
	        var rst = eval(exp);

	        if (rst == true) {
	            // endif を探す
	            var tasks = this.script.tasks;
	            for (var i=this.taskIndex+1,len=tasks.length; i<len; ++i) {
	                var task = tasks[i];
	                if (task.func == "endif") {
	                    this.endifIndex = i;
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
	        if (this.endifIndex) {
	            this.set(this.endifIndex);
	            return ;
	        }

	        this.next();
	    },
	    "endif": function(app, params) {
	        this.endifIndex = null;

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
