
;(function() {

	tm.novel.Tag.set({
	    "r": function(app, params) {
	        this.labelArea.text += '\n';
	        this.next();
	    },
	    "cm": function(app, params) {
	        this.labelArea.text = '';
	        this.next();
	    },
	    "position": function(app, params) {
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
	    "font": function(app, params) {
	        var la = this.labelArea;

	        if (params.size !== undefined) la.fontSize = params.size;
	        if (params.color !== undefined) la.fillStyle = params.color;
	        if (params.face !== undefined) la.fontFamily = params.face;
	        if (params.lineSpace !== undefined) la.lineSpace = params.lineSpace;
	        if (params.lineHeight !== undefined) la.lineHeight = params.lineHeight;
	        
	        this.next();
	    },
	});

})();
