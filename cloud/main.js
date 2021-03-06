
Parse.Cloud.define('hello', function(req, res) {
  res.success('Hi');
});

Parse.Cloud.afterDelete("CartItems", function (request) {
  
  // delete product
  var product = request.object.get("product")
  product.destroy({
    success: function (pattern) {
      console.log('product deleted');
      // The object was deleted from the Parse Cloud.
    },
    error: function (pattern, error) {
      console.log(error);
      console.log('product could not be deleted');
      // The delete failed.
      // error is a Parse.Error with an error code and message.
    }
  });

  // Remove product from all Carts

  var query = new Parse.Query("Carts");
  query.equalTo("items", request.object);
  query.find({
    success: function(results) {
      console.log('removing cart items from carts')
      for (var i=0; i < results.length; i++) {
        results[i].remove("items", request.object)
        results[i].save()
      }
    },
    error: function(error) {
      console.log(error)
    }
  });
    
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
  var existingObject = request.object.get("createdAt") !== undefined
  var attributes = request.object.attributes; 
  var changedAttributes = new Array(); 
  for (var attribute in attributes) {
    if (request.object.dirty(attribute)) {
      changedAttributes.push(attribute);
    }
  }

  var artistIndex = changedAttributes.indexOf("artist");
  
  if (existingObject && artistIndex !== -1) {
    //updating existing sticker pack
    var artist = request.object.get("artist");
    var query = new Parse.Query("StickerPacks");
    query.include("stickers");
    query.include("stickers.artist")
    query.equalTo("objectId", request.object.id);
    query.find({
      success: function(results) {
        var stickers = results[0].get("stickers");
        if (stickers == undefined) {
          //no stickers found
          console.log("No Stickers!");
          response.success();
          return
        }
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
  } else if (!existingObject) {
    //adding new object
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
  } else {
    response.success();
  }
});

Parse.Cloud.beforeSave("Collections", function (request, response) {
  if (request.object.get("createdAt") !== undefined) {
    //Existing object
    response.success();
  }

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

Parse.Cloud.beforeSave("Banners", function (request, response) {
  if (request.object.get("createdAt") !== undefined) {
    //Existing object
    response.success();
  }

  var query = new Parse.Query("Banners");
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

Parse.Cloud.beforeSave("Artists", function (request, response) {
  if (request.object.get("createdAt") !== undefined) {
    //Existing object
    response.success()
  }
  
  var query = new Parse.Query("Artists");
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
