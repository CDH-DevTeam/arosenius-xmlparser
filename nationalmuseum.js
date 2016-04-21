var fs = require('fs');
var xml2js = require('xml2js');
var _ = require('underscore');

module.exports = {
	parseMaster: function() {
		console.log('gub.parseMaster');
		fs.readFile('xml/nationalmuseum/20160222-NM.xml', function(err, fileData) {
			var parser = new xml2js.Parser();

			parser.parseString(fileData, function (err, result) {
				var fileMetadata = {
					files: []
				};

				_.each(result.BeeCollectExport.module_collection[0].object, function(item) {
					var metadataItem = {
						obj_id: item.ObjId[0]['_'],
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

					metadataItem.attributes.push({
						name: 'group_multiple_objtiteloriginals',
						label: item.group_multiple_objtiteloriginals[0].OmuTypS[0]['_'],
						value: item.group_multiple_objtiteloriginals[0].OmuInhalt01M[0]['_']
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
				});

				fs.writeFile('output/nationalmuseum/20160222-NM.json', JSON.stringify(fileMetadata, null, '\t'), function (err) {});
			});
		});
	},

	parseAll: function() {
		console.log('gub.parseAll');
		fs.readdir('xml/gub', _.bind(function(err, directories) {
			_.each(directories, _.bind(function(directory) {
				this.parse(directory);
			}, this))
		}, this));

		return [];
	},

	parse: function(metsID) {
		console.log('gub.parse');
		var parser = new xml2js.Parser();

		fs.readFile('xml/gub/'+metsID+'/'+metsID+'_mets.xml', function(err, fileData) {
			parser.parseString(fileData, function (err, result) {
				fs.writeFile('output/nationalmuseum/'+metsID+'.json', JSON.stringify(imageMetadata, null, '\t'), function (err) {});
			});
		});
	}
};