
*start

[new name=rect type=tm.display.RectangleShape arg=200,100]

[set name=rect key=alpha value=0 x=200 y=200]
[anim name=rect x=400 y=300 rotation=360 time=500 alpha=1]

[wait time=1000]

@set name=rect width=100
@anim_by name=rect x=-200 y=-200 rotation=-360 time=1000 alpha=-0.5

[wait time=1000]

[delete name=rect]

タッチしてちょ♪
[l][cm]

[jump target=*start]


[s]

