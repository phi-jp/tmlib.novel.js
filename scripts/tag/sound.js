
;(function() {
	tm.novel.Tag.set({
	    sound_play: function(app, params) {
	        var self = this;
	        var sound = tm.asset.Manager.get(params.name).clone();

	        if (params.wait === true) {
	            this.lock();
	            sound.onended = function() {
	                self.unlock();
	                self.next();
	            };
	        }
	        else {
	            this.next();
	        }

	        sound.play();
	    },
	    music_play: function(app, params) {
	        tm.asset.Manager.get(params.name).setLoop(true).play();
	        this.next();
	    },
	    music_stop: function(app, params) {
	        tm.asset.Manager.get(params.name).stop();
	    },
	});
})();
