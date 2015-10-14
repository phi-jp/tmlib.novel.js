tm.novel.Tag.set({
    select_start: function(app, params) {
        this.options = [];
        this.next();
    },
    select_option: function(app, params) {
        this.options.push({}.$extend(params));
        this.next();
    },
    select_end: function(app, params) {
        var app = this.getRoot().app;

        var scene = tm.novel.SelectScene({
            width: app.width,
            height: app.height,
            options: this.options,
        });
        scene.onselect = function(e) {
            this.unlock();

            var option = this.options[e.selectIndex];

            if (option.tag) {
                this.macro(option.tag);
            }
            else if (option.target) {
                this.call(option.target);
            }
            else {
                console.error('error!');
            }
        }.bind(this);

        app.pushScene(scene);
        this.lock();
    },
});


tm.define("tm.novel.SelectScene", {
    superClass: "tm.app.Scene",

    init: function(params) {
        this.superInit();

        this.fromJSON({
            children: {
                bg: {
                    type: "tm.display.RectangleShape",
                    init: [SCREEN_WIDTH, SCREEN_HEIGHT, {
                        fillStyle: "rgba(40, 40, 40, 0.5)",
                    }],
                    originX: 0,
                    originY: 0,
                },
            }
        });

        params.options.each(function(elm, i) {
            var b = tm.ui.FlatButton({
                text: elm.text,
                bgColor: 'hsl(220, 80%, 60%)',
                fontColor: "#555",
                fontSize: 27,
                width: 220,
                height: 70,
            }).addChildTo(this);

            b.x = params.width/2;
            b.y = params.height/2 + i*83;

            b.onpointingend = function() {
                this.bg.tweener
                    .clear()
                    .fadeOut(100)
                    .call(function() {
                        var e = tm.event.Event('select');
                        e.selectIndex = i;
                        this.fire(e);
                        this.app.popScene();
                    }, this);
            }.bind(this);
        }, this);

        this.bg.alpha = 0;
        this.bg.tweener.fadeIn(100);
    },

});
