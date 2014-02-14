
// 生成
[new name=rect type=tm.display.RectangleShape arg=200,100]
// メソッドを呼ぶ
[exec name=rect method=setPosition arg=100,100]

[wait time=500]

// メソッドを呼ぶ
[exec name=rect method=setPosition arg=200,200]

// プロパティをセット
[set name=rect scaleY=2]

[wait time=500]

[delete name=rect]

[wait time=500]


[s]
