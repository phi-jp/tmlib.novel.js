
[element_new name=rect type=tm.display.RectangleShape]
[element_call name=rect method=setPosition arg=100,100]

[wait time=500]

[element_call name=rect method=setPosition arg=200,200]

[wait time=500]

[element_remove name=rect]

