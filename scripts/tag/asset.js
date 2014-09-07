
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
