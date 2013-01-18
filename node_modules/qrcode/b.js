
var top = new Buffer("GyMzYWIK",'base64');
var bottom = new Buffer("GyM0YWIK",'base64');

console.log(top);
console.log(bottom);

process.stdout.write(top.toString());
process.stdout.write(bottom.toString()+"\n");
