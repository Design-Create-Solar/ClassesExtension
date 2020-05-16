const es = require("elasticsearch");
const esClient = new es.Client({
  host: "localhost:9200",
  log: "trace",
});

const createIndex = async function (indexName) {
  return await esClient.indices.create({
    index: indexName,
  });
};
exports.createIndex = createIndex;

const putMapping = async function (indexName) {
  return await esClient.indices.putMapping({
    index: indexName,
    body: {
      properties: {
        times: {
          type: "nested",
          properties: {
            time: {
              type: "integer_range",
            },
          },
        },
      },
    },
  });
};
exports.putMapping = putMapping;

const deleteIndex = async function (indexName) {
  esClient.indices.delete({ index: indexName }, function (error, response) {
    console.log("delete", response);
  });
};
exports.deleteIndex = deleteIndex;

const insertDoc = async function (indexName, _id, mappingType, data) {
  return await esClient.index({
    index: indexName,
    type: mappingType,
    id: _id,
    body: data,
  });
};
exports.insertDoc = insertDoc;

var indexall = function (bigJson, index, type, callback) {
  esClient.bulk(
    {
      maxRetries: 5,
      index: index,
      type: type,
      body: bigJson,
    },
    function (err, res) {
      if (err) {
        console.log(err);
      } else {
        callback(res.items);
      }
    }
  );
};
exports.indexall = indexall;

const searchDoc = async function (payload) {
  return await esClient.search({
    index: payload.index,
    body: payload.body,
  });
};
exports.searchDoc = searchDoc;
