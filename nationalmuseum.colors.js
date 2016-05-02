var Canvas = require('canvas');
var colorThief = require('thief');
var _ = require('underscore');
var fs = require('fs');

var componentToHex = function(c) {
	var hex = c.toString(16);
	return hex.length == 1 ? "0" + hex : hex;
}

var rgbToHex = function(rgb) {
	return "#" + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
}

var colorObject = function(color) {
	return {
		rgb: color,
		hex: rgbToHex(color)
	};
};

var fileData = fs.readFileSync('output/nationalmuseum/20160222-NM.json');
var data = JSON.parse(fileData);

_.each(data.files, function(file) {
	var imageData = fs.readFileSync('output/nationalmuseum/images/png/'+file.obj_id+'.png');

	var image = new Canvas.Image;
	image.src = imageData;

	var canvas = new Canvas(image.width, image.height);
	var ctx = canvas.getContext('2d');
	ctx.drawImage(image, 0, 0, image.width, image.height);

	var imageColors = _.map(colorThief.createPalette(canvas, 5), function(color) {
			return colorObject(color);
	});
	var dominantColor = colorObject(colorThief.getDominantColor(canvas));

	file.colors = imageColors;
	file.dominantColor = dominantColor;

	console.log(imageColors);
});

fs.writeFile('output/nationalmuseum/20160222-NM.json', JSON.stringify(data, null, '\t'));