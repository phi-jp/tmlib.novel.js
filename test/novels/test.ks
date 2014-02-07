*top

[load name=bgm path=../assets/bgm.mp3]
[music_play name=bgm]

[font color=red]

[load name=voice path=../assets/voice_title.m4a]
[load name=bg path=../assets/bg01.jpg]

[shape type=rect layer=2 x=232 y=380 width=440 height=120 color=rgba(0,0,0,0.8)]

[load name=tomapiyo path=../assets/tomapiyo.png jname="とまピヨ"]
[load name=hiyoko path=../assets/hiyoko.png jname="とまピヨ"]

*start

; 背景
[image_show name=bg layer=base x=0 y=0 originX=0 originY=0 width=465 height=465]
[wait time=1000]

; トマトひよこ表示
[image_show layer=1 name=tomapiyo x=100 y=250 width=200 height=200]
[wait time=1000]

[position x=20 y=330]

[trace exp=1+2]
;[call name=recordsound]

吾輩わがはいは猫である。[delay speed=500]名前[delay speed=0]はまだ無い。[l][r]
[sound_play name=voice]

どこで生れたかとんと見当けんとうがつかぬ。[l][cm]
[sound_play name=voice]

[position x=20 y=360]

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
