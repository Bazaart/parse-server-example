
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
      console.log(error)
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
      console.log(error)
    }
  })

});

Parse.Cloud.afterDelete("Stickers", function (request) {
  var query = new Parse.Query("StickerPacks");
  query.equalTo("stickers", request.object);
  query.find({
    success: function(results) {
      console.log('removing sticker from sticker packs')
      for (var i=0; i < results.length; i++) {
        results[i].remove("stickers", request.object)
        results[i].save()
      }
    },
    error: function(error) {
      console.log(error)
    }
  })  
});

Parse.Cloud.beforeSave("StickerPacks", function (request, response) {
  var attributes = request.object.attributes; 
  var changedAttributes = new Array(); 
  for (var attribute in attributes) {
    if (request.object.dirty(attribute)) {
      changedAttributes.push(attribute);
    }
  }
  if (changedAttributes.includes("artist")) {
      var artist = request.object.get("artist");
      var query = new Parse.Query("StickerPacks");
      query.include("stickers");
      query.include("stickers.artist")
      query.equalTo("objectId", request.object.id);
      query.find({
        success: function(results) {
          var stickers = results[0].get("stickers");
          for (var i = 0; i < stickers.length; i++) {
            var Artist = Parse.Object.extend("Artists");
            var pointer = new Artist();              
            pointer.id = artist.id;
            stickers[i].set("artist", pointer)
            stickers[i].save()
          }
          response.success();
        },
        error: function(error) {
          response.error(error);
        }
      })
  } else {
    response.success();
  }
});

Parse.Cloud.beforeSave("Collections", function (request, response) {
  var query = new Parse.Query("Collections");
  query.descending("order");
  query.first({
    success: function (firstObject) {
      var order = firstObject.get("order");
      request.object.set("order", order + 1);
      response.success();
    },
    error: function (error) {
      response.error(error);
    }
  })
});

Parse.Cloud.beforeSave("StickerPacks", function (request, response) {
  var query = new Parse.Query("StickerPacks");
  query.descending("order");
  query.first({
    success: function (firstObject) {
      var order = firstObject.get("order");
      request.object.set("order", order + 1);
      response.success();
    },
    error: function (error) {
      response.error(error);
    }
  })
});