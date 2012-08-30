module.exports = function(grunt) {
	grunt.initConfig({
		concat : {
			css : {
				src: ['public/styles/bootstrap-cyborg.css', 'public/styles/responsive.css', 'public/styles/style.css'],
				dest: 'public/styles/production.css'
			},
			js : {
				src: ['public/resources/jquery-1.7.2.js', 'public/resources/can.jquery-1.0.7.js',
					'public/resources/can.observe.attributes.js', 'public/resources/can.model.elements.js',
					'public/commanders.js'],
				dest: 'public/resources/production.js'
			}
		},
		min: {
			production : {
				src: ['public/resources/production.js'],
				dest: 'public/resources/production.min.js'
			}
		}
	});

	grunt.registerTask('default', 'concat min');
}