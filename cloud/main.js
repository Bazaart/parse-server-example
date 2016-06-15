
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.define('featuredCollections', function(request, response) {
  var query = new Parse.Query("Collections");
  // query.equalTo("isActive", "true")
  // query.equalTo("movie", request.params.movie);
  query.get({
    success: function(results) {
      // for (var i = 0; i < results.length; ++i) {
      //   // sum += results[i].get("stars");
      // }
      response.success("Stas");
    },
    error: function() {
      response.error("no collections found");
    }
  });
});