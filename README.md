# 配置文件

## global
- processNumber：进程数量
- delay：每个请求的间隔时间（每个进程独立计算）

## Stream
- url：请求的链接（可以使用随机值）
- check：填写正则表达式，与body部分匹配，用于检测是否成功
- method：请求方式，填写POST或GET
- referer：对应Header中的referer
- data：POST提交的数据（可以使用随机值）

# 随机值
- [QQ] 随机QQ号
- [Phone] 随机手机号
- [String_10] 随机10位的字符串
- [String_12] 随机10位的字符串
- [String_16] 随机16位的字符串
- [String_20] 随机20位的字符串
