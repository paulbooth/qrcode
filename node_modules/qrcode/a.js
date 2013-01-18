
var bufs = [];
process.stdin.on('data',function(buf){
  bufs.push(buf);
});

process.stdin.resume();

process.on('exit',function(){
 process.stdout.write(Buffer.concat(bufs).toString('base64'));
});
