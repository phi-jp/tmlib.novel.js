*top

[image storage=../assets/bg01.jpg layer=base x=0 y=0 originX=0 originY=0 width=465 height=465]
[rect layer=2 x=232 y=380 width=440 height=120 color=rgba(0,0,0,0.8)]

[image_new name=tomapiyo storage=../assets/tomapiyo.png jname="とまピヨ"]
[image_new name=hiyoko storage=../assets/hiyoko.png jname="とまピヨ"]

*start

[image_show layer=1 name=tomapiyo x=100 y=250 width=200 height=200]

[position x=20 y=350]
吾輩わがはいは猫である。[delay speed=500]名前[delay speed=0]はまだ無い。[l][r]

どこで生れたかとんと見当けんとうがつかぬ。[l][cm]

[position x=20 y=380]

[image_show layer=0 name=hiyoko x=360 y=250 width=200 height=200]

何でも薄暗いじめじめした所でニャーニャー[r]泣いていた事だけは記憶している。[l][r]

吾輩はここで始めて人間というものを見た。[l][r]

[wait time=200 hoge='abc']

[alert str="finish!"]

[cm]

@jump target=*start
