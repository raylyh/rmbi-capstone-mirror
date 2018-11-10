var http = require("http");
var qs = require("querystring");
var PythonShell = require("python-shell");


var StringBuilder = require("stringbuilder");

var port = 80;

function getHome(req, resp) {
  resp.writeHead(200,{"Content-Type":"text/html"});
  resp.write("<html><head><title>Home Page</title></head><body> Want to do some calcuation? Click <a href='/calc'>here</a></body></html>");
  resp.end();
}

function getCalchtml(req, resp,data) {
  var sb = new StringBuilder({newline: "\r\n"});
  sb.appendLine("<html>");
  sb.appendLine("<body>");
  sb.appendLine("   <form method='post'>");
  sb.appendLine("     <table>");

  sb.appendLine("      <tr>");
  sb.appendLine("       <td> Enter First No: </td>");

  if (data && data.txtfirstNo){
    sb.appendLine("        <td><input type ='text' id = 'txtfirstNo' name = 'txtfirstNo' value  = '{0}'/></td>",data.txtfirstNo);
  }
  else{
  sb.appendLine("        <td><input type ='text' id = 'txtfirstNo' name = 'txtfirstNo' value  = ''/></td>");
  }

  sb.appendLine("      </tr>");

  sb.appendLine("      <tr>");
  sb.appendLine("       <td> Enter Second No: </td>");

  if (data && data.txtsecondNo){
    sb.appendLine("        <td><input type ='text' id = 'txtsecondNo' name = 'txtsecondNo' value  = '{0}'/></td>",data.txtsecondNo);
  }
  else{
    sb.appendLine("        <td><input type ='text' id = 'txtsecondNo' name = 'txtsecondNo' value  = ''/></td>");
    }
    sb.appendLine("      </tr>");

  sb.appendLine("      <tr>");
  sb.appendLine("        <td><input type='submit' value = 'Calculate'/></td>");
  sb.appendLine("      </tr>");

  if (data && data.txtfirstNo && data.txtsecondNo){
    var sum = parseInt(data.txtfirstNo) + parseInt(data.txtsecondNo);
    sb.appendLine("      <tr>");
    sb.appendLine("        <td>Sum= {0}</td>",sum);
    sb.appendLine("      </tr>");
  }

  sb.appendLine("     </table>");
  sb.appendLine("   </form>");
  sb.appendLine("</body>");
  sb.appendLine("</html>");
  sb.build(function(err, result){
    resp.write(result);
    resp.end();
  });
}

function getCalcForm(req, resp,formData){
  resp.writeHead(200,{"Content-Type" : "text/html"});
  getCalchtml(req,resp,formData);

}

function get404(req, resp) {
  resp.writeHead(404,"Resource Not Found",{"Content-Type":"text/html"});
  resp.write("<html><head><title>Error 404</title></head> <body> 404: Resource Not Found. Go back to <a href='/'>Home Page</a></html>");
  resp.end();
}

http.createServer(function(req, resp) {
  // console.log(req.url);
  switch (req.method) {
    case "GET":
      if(req.url === "/") {
        getHome(req,resp);
      }
      else if (req.url === "/calc"){
        getCalcForm(req,resp);
      }
      else {
        get404(req,resp);
      }
      break;
    case "POST":
      if(req.url === "/calc") {
        var reqBody = '';
        req.on('data',function(data){
          reqBody += data;
          if (reqBody.length > 1e7){
              resp.writeHead(413, "Request Entity Too Large", {"Context-Type":"text.html"});
              resp.write('Error');
              resp.end();
          }
        });
        req.on('end',function(data){
          var formData = qs.parse(reqBody);
          getCalcForm(req,resp,formData);

        });
      }
      else {
        get404(req,resp);
      }
      break;
    default:
      break;
  }
  // resp.writeHead(200,{"Content-Type":"text/html"});
  // resp.write("<html><body>Hello <strong><i> World!</i></strong></body></html>");
  // resp.end();

 }).listen(port);
