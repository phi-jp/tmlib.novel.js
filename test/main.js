
/*
 * contant
 */
var SCREEN_WIDTH    = 465;              // スクリーン幅
var SCREEN_HEIGHT   = 465;              // スクリーン高さ
var SCREEN_CENTER_X = SCREEN_WIDTH/2;   // スクリーン幅の半分
var SCREEN_CENTER_Y = SCREEN_HEIGHT/2;  // スクリーン高さの半分

var QUERY = tm.util.QueryString.parse(document.location.search.substr(1));

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
        "novel": QUERY.novel || "novels/test.ks",
    });
    
    app.run();
});


tm.define("MainScene", {
    superClass: "tm.app.Scene",
    
    init: function() {
        this.superInit();
        
        var novel = "novel";
        console.log("novel:", QUERY.novel);
        var elm = tm.novel.Element(novel).addChildTo(this);
        
        var label = tm.display.Label().addChildTo(this);
        label.$extend({
            x: 430,
            y: 420,
            fillStyle: "white",
            fontSize: 24,
        });
        
        elm.ontextupdate = function(e) {
            label.text = this.labelArea.text.length;
        };
        
        elm.ontaskrun = function(e) {
//           console.log(e.task.func);
        };
        
        elm.onnovelcall = function(e) {
            switch (e.name) {
                case "recordsound":
                    // 録音開始
                    console.log("レコード開始");
                    break;
            }
        };

        elm.ontaskfinish = function() {
            console.log("finish!");
        };
    },
    onext: function() {
        var loader = tm.asset.Loader();
        loader.onload = function() {
            app.replaceScene(NextScene());
        };
        loader.load();
    }
});



