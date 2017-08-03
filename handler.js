'use strict';

var aws = require("aws-sdk");
var dynamodb = require('serverless-dynamodb-client');
var tableName = process.env.TABLE_NAME;

module.exports.getItems = (event, context, callback) => {

  // console.log('starting');

  aws.config.update({
    region: 'us-west-2',
    maxRetries: 0
  });

  var db = dynamodb.doc;
  
  var user_uid = event.queryStringParameters.user_uid;

  // console.log('user_uid: ' + user_uid)

  var params = {
    TableName: tableName,
    FilterExpression:"user_uid = :user_uid",
    ExpressionAttributeValues:{":user_uid": user_uid }
  };

  db.scan(params, (err, data) => {
    // console.log('scan complete');
    if(err){
      console.error(err);
      callback(err, null);
    }
    else{
      respond(data.Items, callback);
    }
  });
}

module.exports.saveItem = (event, context, callback) => {
  
  aws.config.update({
    region: 'us-west-2',
    maxRetries: 0
  });

  function createGuid()
  {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
  }

  console.log(event.body);

  var item = JSON.parse(event.body);

  var db = dynamodb.doc;

  var uid = createGuid();
  var params = {
    TableName: tableName,
    Item: {
      title:item.title,
      completed:false,
      user_uid:item.user_uid,
      uid:uid
    }
  };

  db.put(params, (err, data) => {
    if(err){
      console.error(err);
      callback(err, null);
    }
    else{
      respond(uid, callback);
    }
  });
}

module.exports.deleteItem = (event, context, callback) => {
  
  aws.config.update({
    region: 'us-west-2',
    maxRetries: 0
  });

  var db = dynamodb.doc;

  var params = {
    TableName: tableName,
    Key:{
      uid:event.pathParameters.uid
    }
  };

  db.delete(params, (err, data) => {
    if(err){
      console.error(err);
      callback(err, null);
    }
    else{
      respond(data.Items, callback);
    }
  });
}

function respond (body, callback) {
  const response = {
    statusCode: 200,
    body: JSON.stringify(body)
  };
  callback(null, response);
}