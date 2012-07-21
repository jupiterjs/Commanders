steal('can/control', 'can/model/list', 'can/view/ejs', 'can/observe/attributes',
	'./bootstrap-cyborg.css', './style.css')
.then(function() {
	var Commander = can.Model({
		findAll : 'GET /api/commanders',
		findOne : 'GET /api/commanders/{id}',
		create  : 'POST /api/commanders',
		update  : 'PUT /api/commanders/{id}',
		destroy : 'DELETE /api/commanders/{id}',
		attributes : {
			upvotes : 'number',
			downvotes : 'number'
		}
	}, {
		votes : function() {
			return this.attr('upvotes') - this.attr('downvotes');
		}
	});

	var Main = can.Control({
		init: function(el, ops) {
			var self = this,
				deferred = Commander.findAll();

			can.view('main.ejs', {
				commanders : deferred
			}).then(function(frag) {
				self.element.html(frag);
			});

			deferred.done(function(list) {
				self.on(list, 'change', 'reorder')
			});
		},

		reorder : function() {
			this.element.find('tr').each(function() {

			});
		},

		'.up click': function(el, ev) {
			// TODO enable/disable vote buttons
			var row = el.closest('tr'),
				commander = row.model();
			commander.attr('upvotes', commander.attr('upvotes') + 1).save().done(function(response) {
				// TODO
			});
		},

		'.down click': function(el, ev) {
			// TODO enable/disable vote buttons
			var commander = el.closest('tr').model();
			commander.attr('downvotes', commander.attr('downvotes') + 1).save().done(function(repsonse) {
				// TODO
			});
		}
	});

	new Main('#main');
});