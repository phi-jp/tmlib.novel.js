*top

[image_new name=bg layer=base storage=../assets/bg01.jpg]
[rect layer=2 x=232 y=380 width=440 height=120 color=rgba(0,0,0,0.8)]

[image_new name=tomapiyo layer=1 storage=../assets/tomapiyo.png jname="とまピヨ"]
[image_new name=hiyoko layer=0 storage=../assets/hiyoko.png jname="とまピヨ"]

*start

; 背景
[image_show name=bg layer=base x=0 y=0 originX=0 originY=0 width=465 height=465]
[wait time=1000]

; トマトひよこ表示
[image_show layer=1 name=tomapiyo x=100 y=250 width=200 height=200]
[wait time=1000]

[position x=20 y=350]
吾輩わがはいは猫である。[delay speed=500]名前[delay speed=0]はまだ無い。[l][r]

どこで生れたかとんと見当けんとうがつかぬ。[l][cm]

[position x=20 y=380]

; パプリカひよこ表示
[image_show layer=0 name=hiyoko x=360 y=250 width=200 height=200]
[wait time=1000]

何でも薄暗いじめじめした所でニャーニャー[r]泣いていた事だけは記憶している。[l][r]

吾輩はここで始めて人間というものを見た。[l][r]

[image_hide layer=1 name=tomapiyo]
[image_hide layer=0 name=hiyoko]
[wait time=1000 hoge='abc']

[alert str="finish!"]

[cm]

@jump target=*start
