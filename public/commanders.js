steal('can/control', 'can/model/list', 'can/view/ejs', 'can/observe/attributes',
	'can/model/cached', './bootstrap-cyborg.css', './style.css')
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
		votes : can.compute(function() {
			return this.attr('upvotes') - this.attr('downvotes');
		})
	});

	var Main = can.Control({
		init: function(el, ops) {
			this.favorites = new Commander.List();

			var self = this,
				deferred = Commander.findAll({});

			can.view('main.ejs', {
				commanders : deferred,
				favorites : this.favorites
			}).then(function(frag) {
				self.element.html(frag);
			});

			deferred.done(function(list) {
				self.on(list, 'change', 'reorder');
			});
		},

		reorder : function() {
			var columnsReverse = $(this.element.find('tr').get().reverse());
			columnsReverse.each(function() {
				var self = $(this),
					model = self.model(),
					prev = self.prev(),
					prevModel = prev.model();
				while(model && prevModel && model.votes() >= prevModel.votes()) {
					prev.before(self);
					prev = self.prev();
					prevModel = prev.model();
				}
			});
		},

		'.up click': function(el, ev) {
			var row = el.closest('tr'),
				commander = row.model();
			commander.attr('upvotes', commander.attr('upvotes') + 1).save();

			el.parent().find('.down').remove();
			el.remove();
		},

		'.down click': function(el, ev) {
			var commander = el.closest('tr').model();
			commander.attr('downvotes', commander.attr('downvotes') + 1).save();

			el.parent().find('.up').remove();
			el.remove();
		},

		'.favorite click' : function(el, ev) {
			this.favorites.push(el.closest('tr').model());
		},

		'.delete click' : function(el, ev) {
			el.closest('tr').model().destroy();
		}
	});

	new Main('#main');
});
