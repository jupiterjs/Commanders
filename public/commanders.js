steal('can/control', 'can/model', 'can/view/ejs', './bootstrap-cyborg.css').then(function() {
	var Commander = can.Model({
		findAll : 'GET /commanders',
		findOne : 'GET /commanders/{id}',
		create  : 'POST /commanders',
		update  : 'PUT /commanders/{id}',
		destroy : 'DELETE /commanders/{id}'
	}, {});

	var list = new Commander.List([{
			name : 'Jean-Luc Picard',
			ship : 'USS Enterprise'
		}, {
			name : 'Han Solo',
			ship : 'Millennium Falcon'
		}, {
			name : 'William Adama',
			ship : 'Battlestar Galactica'
		}, {
			name : 'Malcom Reynolds',
			ship : 'Serenity'
		}, {
			name : 'Zapp Brannigan',
			ship : 'Nimbus'
		}
	]);

	var Main = can.Control({
		init : function(el, ops) {
			this.element.html(can.view('//commanders/view.ejs', { commanders : list }));
		}
	});

	new Main('#main');
});
