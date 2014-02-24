/*
 * main.js
 */


var SCREEN_WIDTH    = 465;              // スクリーン幅
var SCREEN_HEIGHT   = 465;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分


/*
 * main
 */
tm.main(function() {
    var app = tm.display.CanvasApp("#world");
    app.resize(SCREEN_WIDTH, SCREEN_HEIGHT);
    app.fitWindow();
    app.background = "#444";
    
    var loader = tm.asset.Loader();
    loader.onload = function() {
        app.replaceScene(MainScene());
    };
    loader.load({
        "novel": "assets/about.novel",
    });
    
    app.run();
});


tm.define("MainScene", {
    superClass: "tm.app.Scene",
    
    init: function() {
        this.superInit();

        var elm = tm.novel.Element("novel").addChildTo(this);

        elm.ontaskfinish = function() {
            console.log("finish!");
        };
    },
});



