
[element_new name=rect type=tm.display.RectangleShape arg=200,100]

[set name=rect key=x value=200]
[set name=rect key=y value=200]
[set name=rect key=alpha value=0]

[anim name=rect x=400 y=300 rotation=360 time=500 alpha=1]

[wait time=1000]

[anim_by name=rect x=-200 y=-200 rotation=-360 time=1000]

[wait time=1000]

[s]

