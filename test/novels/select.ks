
*start

[select_start]
  [select_option tag=select1 text=選択肢１]
  [select_option tag=select2 text=選択肢２]
  [select_option tag=select3 text=選択肢３]
[select_end]

[s]

// 回答1
[macro name=select1]
  select1 を選択したよ.
[endmacro]

// 回答2
[macro name=select2]
  select2 を選択したよ.
[endmacro]


// 回答3
[macro name=select3]
  select3 を選択したよ.
[endmacro]
