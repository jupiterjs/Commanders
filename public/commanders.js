(function() {
	Commander = can.Model({
		findAll : 'GET /api/commanders',
		findOne : 'GET /api/commanders/{id}',
		create  : 'POST /api/commanders',
		update  : 'PUT /api/commanders/{id}',
		destroy : 'DELETE /api/commanders/{id}',
		attributes : {
			upvotes : 'number',
			downvotes : 'number',
			like : 'boolean'
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

		'{Commander} updated' : function() {
			this.reorder();
		},

		'.up click': function(el, ev) {
			var commander = el.closest('tr').model();
			commander.attr('like', true).save();
			el.addClass('active').parent().find('.down').remove();
		},

		'.down click': function(el, ev) {
			var commander = el.closest('tr').model();
			commander.attr('like', false).save();
			el.addClass('active').parent().find('.up').remove();
		},

		'.favorite click' : function(el, ev) {
			this.favorites.push(el.closest('tr').model());
			el.remove();
		},

		'.delete click' : function(el, ev) {
			el.closest('tr').model().destroy();
			el.remove();
		},
		
		'.photo mouseenter': function(el, ev){
			var commander = el.closest('tr').model();

			new Tooltip($('<div class="tooltip alert"><div class="tooltip-arrow"></div>' +
				'<div class="tooltip-inner">' + commander.attr('name') + '</div></div>'), {
				anchor : el
			});
		}
	});

	var Tooltip = can.Control({
		init: function( el, options ) {
			var offset = $(options.anchor).offset();
			el.appendTo(document.body)
				.offset( {
					left: offset.left,
					top: offset.top - 32
				}).animate({ opacity : 1 });
		},
		'{anchor} mouseleave': function( el, ev ) {
			this.element.remove();
		}
	});

	new Main('#main');
})();
