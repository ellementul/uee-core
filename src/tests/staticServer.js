import Http from 'http'
import StaticFiles from 'node-static'
 
const staticFiles = new StaticFiles.Server('./static')
function connectStaticServer(request, response) {
  request.addListener('end', function () {
    staticFiles.serve(request, response);
  }).resume();
}

export default Http.createServer(connectStaticServer)