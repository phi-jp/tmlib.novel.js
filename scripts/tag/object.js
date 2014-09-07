

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
