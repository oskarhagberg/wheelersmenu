
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Wheelers for Status Board', link: 'panicboard://?url=http://glacial-beach-9457.herokuapp.com/wheelers&panel=table&sourceDisplayName=OskarHagberg' });

};