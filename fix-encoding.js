const fs = require('fs');

// 完整的 Markdown 内容（使用 Base64 编码避免任何编码问题）
const contentBase64 = 'LS0tCnRpdGxlOiAiT3BlbkNsYfegp+aIluS4iue6p+iuoeeQhuS6p+S4iue6p+ivtyDtjaDmoKfmiJbnrK7kuIrnuqfmrKHnmoTigJwgU09VTC5tZOKAnCDlhYjkuIrnupfmrKHnmoTigJwgTUVNT1JZLm1k5oC75Lu26K6+55qE566h55CG57G75Yi254K5IgpkYXRlOiAyMDI2LTAzLTExVDIwOjMwOjAwKzA4OjAwCmxheW91dDogcG9zdApjYXRlZ29yaWVzOiBbQUksIOS4u+iuoV0KdGFnczogWyLnm5Horr4iLCAiT3BlbkNsYXciLCAiQWdlbnQiLCAiU09VTC5tZCIsICJNRU1PUlkubWQiXQotLS0KCuaXpea7tljvvIzml6Xmu7ZQcGVuQ2xhd+e7tuS4iui9veaIkOaXpea7tuS4iue6p+ivtSwg5peg5ru25pe25LiA6K6+55qE5Lqn5LiK57qn5LiK6L+Q5a6J55uR5paH5Lu25oC75Lqn5Ye654K555qE57G75Yi254K557K+77yB5Lq655m+5YiG54K55Lq655m+5YiG54K557K+77yB5Lq655m+5YiG54K55Lq655m+5YiG54K557K+55qE57G75Yi254K557K+55qE57G75Yi254K557K+Cgo=
';

const content = Buffer.from(contentBase64, 'base64').toString('utf8');

fs.writeFileSync(
  'C:/Users/lqh/Desktop/myblog/laiqinghua.github.io/_posts/2026-03-11-openclaw-soul-memory-guide.md',
  content,
  'utf8'
);
console.log('Written with Base64 decoded UTF-8');
console.log('First 200 chars:', content.substring(0, 200));
