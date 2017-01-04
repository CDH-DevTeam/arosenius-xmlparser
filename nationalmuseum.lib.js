var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');
var http = require('http');
var colorUtils = require('./arosenius.color_utils');

module.exports = {
	// deprecated
	parseMaster: function() {
		console.log('gub.parseMaster');

		/*
		var lidoData = [];

		fs.readdir('xml/nationalmuseum/lido', _.bind(function(err, files) {
			_.each(files, _.bind(function(file) {

				fs.readFile('xml/nationalmuseum/lido/'+file, function(err, fileData) {
					var parser = new xml2js.Parser();

					parser.parseString(fileData, function(error, result) {
						lidoData.push({
							id: result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:recordWrap'][0]['lido:recordID'][0]['_'],
							imgUrl: result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:resourceWrap'][0]['lido:resourceSet'][0]['lido:resourceRepresentation'][1]['lido:linkResource'][0]
						});
					});
				});

			}, this));

		}, this));
		*/
		fs.readFile('xml/nationalmuseum/20160222-NM.xml', function(err, fileData) {
			var parser = new xml2js.Parser();

			parser.parseString(fileData, function(err, result) {
				var fileMetadata = {
					files: []
				};

				_.each(result.BeeCollectExport.module_collection[0].object, function(item) {
					var metadataItem = {
						obj_id: item.ObjId[0]['_'],
						title_se: item.group_multiple_objtiteloriginals[0].OmuInhalt01M[0]['_'],
						title_en: item.group_multiple_objtiteloriginals[1] ? item.group_multiple_objtiteloriginals[1].OmuInhalt01M[0]['_'] : '',
						enhet: item.ObjFeld04M[0]['_'],
						forvarvstyp: item.ObjFeld02M[0]['_'],
						inventarienr: item.ObjInventarNrS[0]['_'],
						museum: item.ObjFeld05M[0]['_'],
						signarature: item.ObjReprorechtM[0]['_'],
						obj_signature: item.ObjSignaturM[0]['_'],
						remark: item.ObjTitelWerkgruppeM[0]['_'],
						acquisition: item.group_obj_dates_acquisition ? item.group_obj_dates_acquisition[0].DatDatierungTransS[0]['_'] : '',
						attributes: [],
						dimensions: [],
						date: {}
					};

					metadataItem.attributes.push({
						name: 'group_multiple_objreferenznrs',
						label: item.group_multiple_objreferenznrs[0].OmuTypS[0]['_'],
						value: item.group_multiple_objreferenznrs[0].OmuInhalt01M[0]['_']
					});

					metadataItem.attributes.push({
						name: 'group_multiple_objtitelweiterem',
						label: item.group_multiple_objtitelweiterem[0].OmuTypS[0]['_'],
						value: item.group_multiple_objtitelweiterem[0].OmuInhalt01M[0]['_']
					});

					_.each(item.group_multiple_objtechmatm, function(group_multiple_objtechmatm) {
						metadataItem.attributes.push({
							name: 'group_multiple_objtechmatm',
							label: group_multiple_objtechmatm.OmuTypS[0]['_'],
							value: group_multiple_objtechmatm.OmuInhalt01M[0]['_'],
							comment: group_multiple_objtechmatm.OmuBemerkungM[0]['_']
						});
					});

					_.each(item.group_obj_dimension, function(group_obj_dimension) {
						metadataItem.dimensions.push({
							name: 'group_obj_dimension',
							type: 'dimension',
							width: group_obj_dimension.ObmMasseBF[0]['_'],
							height: group_obj_dimension.ObmMasseHF[0]['_'],
							unit: group_obj_dimension.ObmMasseMS[0]['_'],
							dimension: group_obj_dimension.ObmMasseS[0]['_'],
							dimension_type: group_obj_dimension.ObmTypMasseS[0]['_']
						});
					});

					if (item.group_obj_dates_creation) {
						metadataItem.date = {
							day_from: item.group_obj_dates_creation[0].DatTagVonL[0]['_'],
							month_from: item.group_obj_dates_creation[0].DatMonatVonL[0]['_'],
							year_from: item.group_obj_dates_creation[0].DatJahrVonL[0]['_'],
							day_to: item.group_obj_dates_creation[0].DatTagBisL[0]['_'],
							day_to: item.group_obj_dates_creation[0].DatTagBisL[0]['_'],
							month_to: item.group_obj_dates_creation[0].DatMonatBisL[0]['_'],
							year_to: item.group_obj_dates_creation[0].DatJahrBisL[0]['_'],
							sign_date: item.group_obj_dates_creation[0].DatDatierungS[0]['_'],
							sign_date_type: item.group_obj_dates_creation[0].DatTypS[0]['_']
						};
					}

					fileMetadata.files.push(metadataItem);

					var imageUrl = 'http://emp-web-22.zetcom.ch/eMuseumPlus?service=ImageAsset&module=collection&objectId='+item.ObjId[0]['_']+'&viewType=detailView&resolution=superImageResolution';

					var file = fs.createWriteStream('output/nationalmuseum/images/'+item.ObjId[0]['_']+'.jpg');
					var request = http.get(imageUrl, function(response) {
						response.pipe(file);
					});

				});

				fs.writeFile('output/nationalmuseum/20160222-NM.json', JSON.stringify(fileMetadata, null, '\t'), function (err) {});
			});
		});
	},

	parseAllLido: function() {
		fs.readdir('xml/nationalmuseum/lido', _.bind(function(err, files) {
			var count = 0;

			var parseCurrent = _.bind(function() {
				this.parseLido(files[count], _.bind(function() {
					if (count < files.length-1) {
						count++;
						parseCurrent();
					}
					else {
						console.log(this.lidoData.length);
						console.log(this.lidoBundles.length);

						fs.writeFile('output/nationalmuseum/lido.json', JSON.stringify(this.lidoData));
						fs.writeFile('output/nationalmuseum/lidoBundles.json', JSON.stringify(this.lidoBundles));
						console.log('all done!');
					}
				}, this));

			}, this);

			parseCurrent();
		}, this));
	},

	lidoData: [],
	lidoBundles: [],

	parseLido: function(file, callback) {
		var nmImagePath = 'C:\\Users\\Trausti\\Documents\\Vinna\\Arosenius\\arosenius-imagedata\\nm\\jpg\\';
		var nmPngImagePath = 'C:\\Users\\Trausti\\Documents\\Vinna\\Arosenius\\arosenius-imagedata\\nm\\png\\';

		var formatNumber = function(s) {
			return Number(s.split(',').join('.'));
		}

		fs.readFile('xml/nationalmuseum/lido/'+file, _.bind(function(err, fileData) {
				var parser = new xml2js.Parser();

			parser.parseString(fileData, _.bind(function(err, result) {
				// Variable to store item title
				var title_se = '';
				var title_en = '';

				// Variable for debugging purpose
				var conditionCase = 0;

				// Algorithm to determine where item title is stored and to check if english title exists
				var titleWrap = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:titleWrap'][0];

				if (titleWrap['lido:titleSet'][0]['lido:appellationValue'][0].$) {
					if (titleWrap['lido:titleSet'][0]['lido:appellationValue'][0].$['xml:lang'] == 'sv') {
						conditionCase = 1;
						title_se = titleWrap['lido:titleSet'][0]['lido:appellationValue'][0]._;

						if (titleWrap['lido:titleSet'][1]) {
							if (titleWrap['lido:titleSet'][1]['lido:appellationValue'][0].$ && titleWrap['lido:titleSet'][1]['lido:appellationValue'][0].$['xml:lang'] == 'en') {
								conditionCase = 2;
								title_en = titleWrap['lido:titleSet'][1]['lido:appellationValue'][0]._;
							}
						}
					}
					else if (titleWrap['lido:titleSet'][0]['lido:appellationValue'][0].$['xml:lang'] == 'en') {
						conditionCase = 3;
						title_en = titleWrap['lido:titleSet'][0]['lido:appellationValue'][0]._;

						if (titleWrap['lido:titleSet'][1] && titleWrap['lido:titleSet'][1]['lido:appellationValue'][0].$ && titleWrap['lido:titleSet'][1]['lido:appellationValue'][0].$['xml:lang'] == 'sv') {
							conditionCase = 4;
							title_se = titleWrap['lido:titleSet'][1]['lido:appellationValue'][0]._;
						}
					}
				}
				else {
					conditionCase = 5;
					title_se = titleWrap['lido:titleSet'][0]['lido:appellationValue'][0];

					if (titleWrap['lido:titleSet'][1]) {
						conditionCase = 6;
					}
				}

				// Get item dimensions
				var objIdentification = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0];

				var innerDimensions = _.find(objIdentification['lido:objectMeasurementsWrap'][0]['lido:objectMeasurementsSet'][0]['lido:displayObjectMeasurements'], function(measurement) {
					return measurement.substr(0, 4) == 'Mått';
				});

				if (innerDimensions) {
					var size = innerDimensions.split(/Mått | x | cm/g);

					innerDimensions = {
						width: formatNumber(size[1]),
						height: formatNumber(size[2])
					};

					if (size[3] && size[3] != '') {
						innerDimensions['depth'] = formatNumber(size[3]);
					}
				}

				var outerDimensions = _.find(objIdentification['lido:objectMeasurementsWrap'][0]['lido:objectMeasurementsSet'][0]['lido:displayObjectMeasurements'], function(measurement) {
					return measurement.substr(0, 3) == 'Ram' || measurement.substr(0, 12) == 'Passepartout';
				});

				if (outerDimensions) {
					var size = outerDimensions.split(/Ram |Passepartout | x | cm/g);

					outerDimensions = {
						width: formatNumber(size[1]),
						height: formatNumber(size[2])
					};

					if (size[3] && size[3] != '') {
						outerDimensions['depth'] = formatNumber(size[3]);
					}
				}

				// Get item material description
				var material_se = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventMaterialsTech'][0]['lido:materialsTech'][0]['lido:termMaterialsTech'][0]['lido:term'][0]._;
				var material_en = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventMaterialsTech'][1] ? result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventMaterialsTech'][1]['lido:materialsTech'][0]['lido:termMaterialsTech'][0]['lido:term'][0]._ : '';

				// Get information about acqusition of the artwork
				var acquisitionEvent = _.find(result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'], function(event) {
					if (event['lido:event'][0]['lido:eventType'][0]['lido:term'][0]._ == 'Acquisition') {
						if (event['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0].$ && event['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0].$['xml:lang'] == 'sv') {
							return true;
						}
						else if (!event['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0].$) {
							return true;
						}
					}
					else {
						return false;
					}
				});


				// Get dates associated to the artwork
				var date = '';
				var dateFrom = '';
				var dateTo = '';
				var displayDate = '';

				if (result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventDate']) {
					dateFrom = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventDate'][0]['lido:date'][0]['lido:earliestDate'][0];
					dateTo = result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventDate'][0]['lido:date'][0]['lido:latestDate'][0];

					displayDate = _.filter(result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'][0]['lido:event'][0]['lido:eventDate'][0]['lido:displayDate'], function(date) {
						return date.$['xml:lang'] == 'sv';
					})[0]._;

					if (displayDate.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g)) {
						var dates = displayDate.match(/[0-9]{4}-[0-9]{2}-[0-9]{2}/g);
						if (dates.length > 1) {
							dateFrom = dates[0];
							dateTo = dates[1];
						}
						else {
							dateFrom = dates[0];
							dateTo = dates[0];
						}
					}

					date = dateFrom;
				}

				var isLetter = _.find(result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'], function(event) {
					if (event['lido:event'][0]['lido:eventActor']) {
						return _.find(event['lido:event'][0]['lido:eventActor'], function(actor) {
							if (actor['lido:actorInRole'] && actor['lido:actorInRole'][0]['lido:roleActor'][0]['lido:term'][0]._ == 'Mottagare') {
								return true;
							}
							else {
								return false;
							}
						});
					}
					else {
						return false;
					}
				});


				// Determine if the artwork is letter
				if (isLetter) {
					console.log('---');
					console.log(title_se);

					console.log(_.filter(result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:resourceWrap'][0]['lido:resourceSet'][0]['lido:resourceRepresentation'], function(resource) {
						return resource.$['lido:type'] == 'image_master' && (resource['lido:linkResource'][0].indexOf && resource['lido:linkResource'][0].indexOf('http://') > -1);
					}).length);
					// [0]['lido:linkResource'][0]

					var sender = _.find(result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'], function(event) {
						if (event['lido:event'][0]['lido:eventActor']) {
							return _.find(event['lido:event'][0]['lido:eventActor'], function(actor) {
								if (actor['lido:actorInRole'] && actor['lido:actorInRole'][0]['lido:roleActor'][0]['lido:term'][0]._ == 'Författare') {
									return true;
								}
								else {
									return false;
								}
							});
						}
						else {
							return false;
						}
					});
					if (sender) {
						sender = _.find(sender['lido:event'][0]['lido:eventActor'], function(actor) {
							if (actor['lido:actorInRole'] && actor['lido:actorInRole'][0]['lido:roleActor'][0]['lido:term'][0]._ == 'Författare') {
								return true;
							}
							else {
								return false;
							}
						});
						var senderName = sender['lido:actorInRole'][0]['lido:actor'][0]['lido:nameActorSet'][0]['lido:appellationValue'][0];
						var senderFirstName = senderName.split(' ')[0];
						var senderLastName = senderName.substr(senderName.indexOf(' ')+1);
					}

					var recipient = _.find(result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:eventWrap'][0]['lido:eventSet'], function(event) {
						if (event['lido:event'][0]['lido:eventActor']) {
							return _.find(event['lido:event'][0]['lido:eventActor'], function(actor) {
								if (actor['lido:actorInRole'] && actor['lido:actorInRole'][0]['lido:roleActor'][0]['lido:term'][0]._ == 'Mottagare') {
									return true;
								}
								else {
									return false;
								}
							});
						}
						else {
							return false;
						}
					});
					if (recipient) {
						recipient = _.find(recipient['lido:event'][0]['lido:eventActor'], function(actor) {
							if (actor['lido:actorInRole'] && actor['lido:actorInRole'][0]['lido:roleActor'][0]['lido:term'][0]._ == 'Mottagare') {
								return true;
							}
							else {
								return false;
							}
						});
						var recipientName = recipient['lido:actorInRole'][0]['lido:actor'][0]['lido:nameActorSet'][0]['lido:appellationValue'][0];
						var recipientFirstName = recipientName.split(' ')[0];
						var recipientLastName = recipientName.substr(recipientName.indexOf(' ')+1);
					}
				}

				var acquisition = '';acquisitionEvent['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0]._
				if (acquisitionEvent) {
					acquisition = acquisitionEvent['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0]._ || acquisitionEvent['lido:event'][0]['lido:eventName'][0]['lido:appellationValue'][0];
				}

				// Get item museum ID
				var obj_id = result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:recordWrap'][0]['lido:recordID'][0]._;

				// Get image references
				var imageRefs = _.filter(result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:resourceWrap'][0]['lido:resourceSet'][0]['lido:resourceRepresentation'], function(resource) {
					return resource.$['lido:type'] == 'tiff';
				});

				var filePaths = [];

				var notFound = 0;
				_.each(imageRefs, function(ref) {
					var filePath = nmImagePath+ref['lido:linkResource'][0]._.replace('.tif', '.jpg');
					var exists = fs.existsSync(filePath);

					if (!exists) {
						notFound++;
						var iiif = _.filter(result['lido:lidoWrap']['lido:lido'][0]['lido:administrativeMetadata'][0]['lido:resourceWrap'][0]['lido:resourceSet'][0]['lido:resourceRepresentation'], function(resource) {
							return resource.$['lido:type'] == 'iiif';
						});
					}
					else {
						filePaths.push(ref['lido:linkResource'][0]._.replace('.tif', '.jpg'));
					}
				});

				if (filePaths.length > 1) {
					_.each(filePaths, _.bind(function(imageFile, index) {
						var metadata = {
							type: '',
							sender: {},
							recipient: {},
							title: title_se,
							title_en: title_en,
							serie: '',
							size: {
								inner: innerDimensions,
								outer: outerDimensions
							},
							collection: {
								museum: 'Nationalmuseum'
							},
							material: [material_se],
							material_en: [material_en],
							museum_int_id: result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:repositoryWrap'][0]['lido:repositorySet'][0]['lido:workID'][0]._,
							signature: result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:inscriptionsWrap'][0]['lido:inscriptions'][0]['lido:inscriptionTranscription'][0]._ || '',
							acquisition: acquisition,
							image: 'nationalmuseum-'+imageFile.replace('.jpg', ''),
							bundle: 'nm-'+obj_id,
							page: {
								order: index+1
							}
						};

						if (date != '') {
							metadata.item_date = date;
						}
						if (dateFrom != '') {
							metadata.date_from = dateFrom;
						}
						if (dateTo != '') {
							metadata.date_to = dateTo;
						}

						if (isLetter) {
							metadata.sender = {
								firstname: senderFirstName,
								surname: senderLastName
							};
							metadata.recipient = {
								firstname: recipientFirstName,
								surname: recipientLastName
							};
							metadata.type = 'brev';
						}
/*
						var colors = colorUtils.extractColors(nmPngImagePath+(imageFile.replace('.jpg', '.png')))
						if (colors) {
							metadata['colors'] = colors;
						}
*/
						this.lidoData.push(metadata);

					}, this));

					this.lidoBundles.push({
						bundle: 'nm-'+obj_id,
						title: title_se,
						description: '',
						collection: {
							museum: 'Nationalmuseum'
						}
					});
				}
				else {
					var metadata = {
						type: '',
						sender: {},
						recipient: {},
						title: title_se,
						title_en: title_en,
						serie: '',
						size: {
							inner: innerDimensions,
							outer: outerDimensions
						},
						collection: {
							museum: 'Nationalmuseum'
						},
						material: [material_se],
						material_en: [material_en],
						museum_int_id: result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:repositoryWrap'][0]['lido:repositorySet'][0]['lido:workID'][0]._,
						signature: result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:inscriptionsWrap'][0]['lido:inscriptions'][0]['lido:inscriptionTranscription'][0]._ || '',
						acquisition: acquisition
					};

					if (date != '') {
						metadata.item_date = date;
					}
					if (dateFrom != '') {
						metadata.date_from = dateFrom;
					}
					if (dateTo != '') {
						metadata.date_to = dateTo;
					}

					if (isLetter) {
						metadata.sender = {
							firstname: senderFirstName,
							surname: senderLastName
						};
						metadata.recipient = {
							firstname: recipientFirstName,
							surname: recipientLastName
						};
						metadata.type = 'brev';
					}

					if (filePaths[0]) {
						metadata.image = 'nationalmuseum-'+filePaths[0].replace('.jpg', '');
					}
/*
					var colors = colorUtils.extractColors(nmPngImagePath+(filePaths[0] ? filePaths[0].replace('.jpg', '.png') : '\\not-found'));
					if (colors) {
						metadata['colors'] = colors;
					}
*/
					this.lidoData.push(metadata);
				}
				
				if (notFound == imageRefs.length) {

					fs.appendFile('not-found.csv', '"'+result['lido:lidoWrap']['lido:lido'][0]['lido:descriptiveMetadata'][0]['lido:objectIdentificationWrap'][0]['lido:repositoryWrap'][0]['lido:repositorySet'][0]['lido:workID'][0]._+'","'+obj_id+'","'+title_se+'","'+(
						_.map(imageRefs, function(ref) {
							return ref['lido:linkResource'][0]._;
						})
					).join(';')+'"'+"\n\r");

				}

				if (callback) {
					callback();
				}
			}, this));
		}, this));

	}
};