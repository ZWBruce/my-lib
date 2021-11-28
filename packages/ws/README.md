参考：https://github.com/JinJieTan/my-websocket

响应头各字段含义 https://jayqiu.github.io/blog/2017/05/blog_05_11_17.html

[RFC 6455](https://datatracker.ietf.org/doc/html/rfc6455)

响应头组成：
```
0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
F|R|R|R|opcode |M|Payload leng |   Extend payload length
I|S|S|S|  (4)  |A|     (7)     |          (16/64)
N|V|V|V|       |S|             |   (if payload len==126/127)
 |1|2|3|       |K|             |
```

实现更完整的 github 地址 [https://github.com/daipeng7/websocket](https://github.com/daipeng7/websocket)