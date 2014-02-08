@trace exp="imageのテストだよ"

[load name=tomapiyo path=../assets/tomapiyo.png jname="とまピヨ"]
[load name=hiyoko path=../assets/hiyoko.png jname="とまピヨ"]

[image_show name=tomapiyo x=100 y=250 width=200 height=200]
[wait time=1000]
[image_hide name=tomapiyo]

[image_show name=hiyoko x=360 y=250 width=200 height=200]
[wait time=1000]
[image_hide name=hiyoko]

[s]