(function() {
  var __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; },
    __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  $(function() {
    var AppView, Todo, TodoList, TodoView, Todos;
    Todo = (function(_super) {

      __extends(Todo, _super);

      function Todo() {
        Todo.__super__.constructor.apply(this, arguments);
      }

      Todo.prototype.defaults = function() {
        return {
          done: false,
          order: Todos.nextOrder()
        };
      };

      Todo.prototype.toggle = function() {
        var done;
        done = this.get('done');
        return this.save({
          done: !done
        });
      };

      return Todo;

    })(Backbone.Model);
    TodoList = (function(_super) {

      __extends(TodoList, _super);

      function TodoList() {
        TodoList.__super__.constructor.apply(this, arguments);
      }

      TodoList.prototype.model = Todo;

      TodoList.prototype.localStorage = new Store('todos');

      TodoList.prototype.done = function() {
        return this.filter(function(todo) {
          return todo.get('done');
        });
      };

      TodoList.prototype.remaining = function() {
        return this.without.apply(this, this.done());
      };

      TodoList.prototype.nextOrder = function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
      };

      TodoList.prototype.comparator = function(todo) {
        return todo.get('order');
      };

      return TodoList;

    })(Backbone.Collection);
    Todos = new TodoList;
    TodoView = (function(_super) {

      __extends(TodoView, _super);

      function TodoView() {
        this.remove = __bind(this.remove, this);
        this.close = __bind(this.close, this);
        this.render = __bind(this.render, this);
        TodoView.__super__.constructor.apply(this, arguments);
      }

      TodoView.prototype.tagName = 'li';

      TodoView.prototype.template = _.template($('#item-template').html());

      TodoView.prototype.events = {
        'click .check': 'toggleDone',
        'click .todo-destroy': 'clear',
        'dblclick .todo-text': 'edit',
        'keypress .todo-input': 'updateOnEnter'
      };

      TodoView.prototype.initialize = function() {
        this.model.bind('change', this.render);
        return this.model.bind('destroy', this.remove);
      };

      TodoView.prototype.render = function() {
        $(this.el).html(this.template(this.model.toJSON()));
        this.setText();
        return this;
      };

      TodoView.prototype.setText = function() {
        var text;
        text = this.model.get('text');
        this.$('.todo-text').text(text);
        this.input = this.$('.todo-input');
        return this.input.bind('blur', this.close).val(text);
      };

      TodoView.prototype.toggleDone = function() {
        return this.model.toggle();
      };

      TodoView.prototype.edit = function() {
        $(this.el).addClass('editing');
        return this.input.focus();
      };

      TodoView.prototype.close = function() {
        this.model.save({
          text: this.input.val()
        });
        return $(this.el).removeClass('editing');
      };

      TodoView.prototype.updateOnEnter = function(event) {
        if (event.keyCode === 13) return this.close();
      };

      TodoView.prototype.remove = function() {
        return $(this.el).remove();
      };

      TodoView.prototype.clear = function() {
        return this.model.destroy();
      };

      return TodoView;

    })(Backbone.View);
    AppView = (function(_super) {

      __extends(AppView, _super);

      function AppView() {
        this.addAll = __bind(this.addAll, this);
        this.addOne = __bind(this.addOne, this);
        this.render = __bind(this.render, this);
        AppView.__super__.constructor.apply(this, arguments);
      }

      AppView.prototype.el = $('#todoapp');

      AppView.prototype.statsTemplate = _.template($('#stats-template').html());

      AppView.prototype.events = {
        'keypress #new-todo': 'createOnEnter',
        'keyup #new-todo': 'showTooltip',
        'click .todo-clear a': 'clearCompleted'
      };

      AppView.prototype.initialize = function() {
        this.input = this.$('#new-todo');
        Todos.bind('add', this.addOne);
        Todos.bind('reset', this.addAll);
        Todos.bind('all', this.render);
        return Todos.fetch();
      };

      AppView.prototype.render = function() {
        var template;
        template = this.statsTemplate({
          total: Todos.length,
          done: Todos.done().length,
          remaining: Todos.remaining().length
        });
        this.$('#todo-stats').html(template);
        return this;
      };

      AppView.prototype.addOne = function(todo) {
        var view;
        view = new TodoView({
          model: todo
        });
        return $('#todo-list').append(view.render().el);
      };

      AppView.prototype.addAll = function() {
        return Todos.each(this.addOne);
      };

      AppView.prototype.createOnEnter = function(event) {
        var text;
        text = this.input.val();
        if (text && event.keyCode === 13) {
          Todos.create({
            text: text
          });
          return this.input.val('');
        }
      };

      AppView.prototype.clearCompleted = function() {
        _.each(Todos.done(), function(todo) {
          return todo.destroy();
        });
        return false;
      };

      AppView.prototype.showTooltip = function(event) {
        var show, tooltip, val;
        val = this.input.val();
        tooltip = this.$('.ui-tooltip-top');
        tooltip.fadeOut();
        if (this.tooltipTimeout) clearTimeout(this.tooltipTimeout);
        if (val === '' || val === this.input.attr('placeholder')) return;
        show = function() {
          return tooltip.show().fadeIn();
        };
        return this.tooltipTimeout = _.delay(show, 1000);
      };

      return AppView;

    })(Backbone.View);
    return window.App = new AppView;
  });

}).call(this);
