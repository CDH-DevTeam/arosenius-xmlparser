var Canvas = require('canvas');
var colorThief = require('thief');
var _ = require('underscore');
var fs = require('fs');

var colors = require('./arosenius.color_utils');
var config = require('./config');

var files = fs.readdirSync('output/gub');

_.each(files, function(file) {
    fs.readFile('output/gub/'+file, function(err, fileData) {
        var data = JSON.parse(fileData);
        var counter = 1;

        _.each(data.files, function(imagePack) {
            _.each(imagePack.images, function(imageItem) {
                var imageId = imageItem.id.replace('web', '');

                var imageData = fs.readFileSync(config.gub_path+'/'+data.meta.mets_ID+'/web/'+imageId+'.'+(config.read_png ? 'png' : 'jpg'));

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

                imageItem.colors = {
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

                imageItem.dominantColor = dominantColor;
            });

            console.log('imagePack '+counter+' of '+data.files.length)

            counter++;
        });

       fs.writeFile('output/gub/colorcoded-'+file, JSON.stringify(data, null, '\t'));
        console.log('writeFile: '+file);
    });
})
