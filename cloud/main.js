
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.afterDelete("Products", function (request) {

  // Delete pattern
  var pattern = request.object.get("pattern")
  pattern.destroy({
    success: function (pattern) {
      console.log('pattern deleted');
      // The object was deleted from the Parse Cloud.
    },
    error: function (pattern, error) {
      console.log('pattern could not be deleted');
      // The delete failed.
      // error is a Parse.Error with an error code and message.
    }
  });

  // Remove product from all collections

  var query = new Parse.Query("Collections");
  query.equalTo("products", request.object);
  query.find({
    success: function(results) {
      console.log('removing product from collections')
      for (var i=0; i < results.length; i++) {
        results[i].remove("products", request.object)
        results[i].save()
      }
    },
    error: function(error) {
      console.log('product was not found in any collection')
    }
  })

});