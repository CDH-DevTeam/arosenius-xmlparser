var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');

var config = require('./config');

module.exports = {
	parseAll: function() {
		fs.readdir(config.gub_path, _.bind(function(err, directories) {
			_.each(directories, _.bind(function(directory) {
				this.parse(directory);
			}, this))
		}, this));

		return [];
	},

	parse: function(metsID) {
		var parser = new xml2js.Parser();
		console.log(config.gub_path+'/'+metsID+'/'+metsID+'_mets.xml');
		fs.readFile(config.gub_path+'/'+metsID+'/'+metsID+'_mets.xml', function(err, fileData) {
			parser.parseString(fileData, function (err, result) {
				var getEntryMetadata = function(id) {
					var resultObj;
					_.each(result['mets:mets']['mets:dmdSec'], function(item) {
						if (item.$.ID == id) {
							resultObj = item;
						}
					});

					// Færa metadata level niður, allavega tags
/*
					return {
						physdesc: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].physdesc[0],
						note: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].note ? resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].note[0] : '',
						source: formatImageData(resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata)
					};
*/
					return {
						hd_id: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].$["hd-id"],
						hd_ref: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].$["hd-ref"],	
						physdesc: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].physdesc[0],
						note: resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].note ? resultObj['mets:mdWrap'][0]['mets:xmlData'][0].pagegroup[0].imagedata[0].note[0] : ''
					};
				};

				var getPysicalStructmapEntry = function(id) {
					var resultObj;
					_.each(structMap.physical[0]['mets:div'], function(item) {
						if (item['mets:fptr'][1].$.FILEID == id) {
							resultObj = item;
						}
					});

					return resultObj;
				};

				var getImageDataItem = function(id) {
					var resultObj;
					_.each(fileMetadata.files, function(item) {
						if (item.id == id) {
							resultObj = item;
						}
					})

					return resultObj;
				}

				var formatFileMetadata = function(metsData) {
//					console.log(metadata.document);

					var metadata = {
						mets_ID: metsID,
						
						archive_id: metsData.archive[0].$['hd-id'],
						archive_unit_title: metsData.archive[0].unittitle[0],
						archive_unit_date: metsData.archive[0].unitdate[0],
						archive_physloc: metsData.archive[0].physloc[0],
						archive_physdesc: metsData.archive[0].physloc[0],
						doc_type: metsData.document ? 'document' : metsData.letter ? 'letter' : '',

						document_unittitle: metsData.document ? metsData.document[0].unittitle[0] : '',
						document_physloc: metsData.document ? metsData.document[0].physloc[0] : '',
						document_physdesc: metsData.document ? metsData.document[0].physdesc[0] : '',
						document_unitdate: metsData.document && metsData.document[0] && metsData.document[0].unitdate ? metsData.document[0].unitdate[0] : '',
						document_searchdate: metsData.document ? metsData.document[0].searchdate[0] : '',
						document_note: metsData.document && metsData.document[0] && metsData.document[0].note? metsData.document[0].note[0] : '',

						letter_physloc: metsData.letter ? metsData.letter[0].physloc[0] : '',

						letter_sender_name_given: metsData.letter ? metsData.letter[0].sender[0]['name-given'][0] : '',
						letter_sender_name_family: metsData.letter ? metsData.letter[0].sender[0]['name-family'][0] : '',
						letter_sender_name_date: metsData.letter ? metsData.letter[0].sender[0]['name-date'][0] : '',

						letter_recipient_name_given: metsData.letter ? metsData.letter[0].recipient[0]['name-given'][0] : '',
						letter_recipient_name_family: metsData.letter ? metsData.letter[0].recipient[0]['name-family'][0] : '',
						letter_recipient_name_date: metsData.letter ? metsData.letter[0].recipient[0]['name-date'][0] : '',

						letter_unitdate: metsData.letter ? metsData.letter[0].unitdate[0] : '',
						letter_note: metsData.letter && metsData.letter[0].note ? metsData.letter[0].note[0] : '',

						letter_image_physdesc: metsData.letter ? metsData.letter[0].data[0].imagedata[0].physdesc[0] : '',
						letter_image_unitdate: metsData.letter && metsData.letter[0] && metsData.letter[0].data && metsData.letter[0].data[0] && metsData.letter[0].data[0].imagedata? metsData.letter[0].data[0].imagedata[0].unitdate[0] : '',
						letter_image_searchdate: metsData.letter ? metsData.letter[0].data[0].imagedata[0].searchdate[0] : '',
					};

					return metadata;
				};

				var structMap = {
					logical: _.find(result['mets:mets']['mets:structMap'], function(item) {
						return item.$.TYPE == 'Logical';
					})['mets:div'],
					physical: _.find(result['mets:mets']['mets:structMap'], function(item) {
						return item.$.TYPE == 'Physical';
					})['mets:div']
				};

				var dmdSec1 = _.find(result['mets:mets']['mets:dmdSec'], function(item) {
					return item.$.ID == 'dmdSec1';
				})['mets:mdWrap'][0];

				var fileMetadata = {
					meta: {},
					files: []
				};
				fileMetadata.meta = formatFileMetadata(dmdSec1['mets:xmlData'][0]['gubs'][0]['manuscript'][0]);

				_.each(structMap.logical[0]['mets:div'], function(item) {
					if (getImageDataItem(item.$.DMDID) == undefined) {
						fileMetadata.files.push({
							id: item.$.DMDID,
							metadata: getEntryMetadata(item.$.DMDID),
//							item: item,
							images: []
						})
					}

					getImageDataItem(item.$.DMDID).images.push({
						id: item['mets:fptr'][1].$.FILEID,
						type: getPysicalStructmapEntry(item['mets:fptr'][1].$.FILEID).$.TYPE
					});
				});

				fs.writeFile('output/gub/'+metsID+'.json', JSON.stringify(fileMetadata, null, '\t'), function (err) {});
			});
		});
	}
};