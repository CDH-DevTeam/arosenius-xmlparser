var Canvas = require('canvas');
var colorThief = require('thief');
var _ = require('underscore');
var fs = require('fs');

var colors = require('./arosenius.color_utils');

var fileData = fs.readFileSync('output/nationalmuseum/20160222-NM.json');
var data = JSON.parse(fileData);

_.each(data.files, function(file) {
	var imageData = fs.readFileSync('output/nationalmuseum/images/png/'+file.obj_id+'.png');

	var image = new Canvas.Image;
	image.src = imageData;

	var canvas = new Canvas(image.width, image.height);
	var ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, image.width, image.height);

	var imageColors3 = _.map(colorThief.createPalette(canvas, 3), function(color) {
			return colors.colorObject(color);
	});
	var imageColors5 = _.map(colorThief.createPalette(canvas, 5), function(color) {
			return colors.colorObject(color);
	});
	var imageColors10 = _.map(colorThief.createPalette(canvas, 10), function(color) {
			return colors.colorObject(color);
	});
	var dominantColor = colors.colorObject(colorThief.getDominantColor(canvas));

	file.colors = {
		three: imageColors3,
		five: imageColors5,
		five_mapped: _.map(imageColors5, function(color) {
			var mappedColor = colors.mapColorToPalette(color.rgb);

			return colors.colorObject(mappedColor);
		}),
		ten: imageColors10,
		ten_mapped: _.map(imageColors10, function(color) {
			var mappedColor = colors.mapColorToPalette(color.rgb);

			return colors.colorObject(mappedColor);
		})
	};

	file.dominantColor = dominantColor;
;
});

fs.writeFile('output/nationalmuseum/20160222-NM.json', JSON.stringify(data, null, '\t'));