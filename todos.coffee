$ ->

  class Todo extends Backbone.Model
    defaults: ->
      done: false
      order: Todos.nextOrder()

    toggle: ->
      done = @get('done')
      @save done: not done

    clear: ->
      @destroy()
      @view.remove()


   class TodoList extends Backbone.Collection
     model: Todo

     localStorage: new Store('todos')

     done: ->
       @filter((todo) -> todo.get 'done')

     remaining: ->
       @without.apply(this, @done())

     nextOrder: ->
       return 1 unless @length
       @last().get('order') + 1

     comparator: (todo) ->
       todo.get 'order'


  Todos = new TodoList


  class TodoView extends Backbone.View
    tagName: 'li'

    template: _.template $('#item-template').html()

    events:
      'click .check': 'toggleDone'
      'click .todo-destroy': 'clear'
      'dblclick .todo-text': 'edit'
      'keypress .todo-input': 'updateOnEnter'

    initialize: ->
      @model.bind 'change', @render
      @model.bind 'destroy', @remove

    render: =>
      $(@el).html @template(@model.toJSON())
      @setText()
      return this

    setText: ->
      text = @model.get('text')
      @$('.todo-text').text(text)
      @input = @$('.todo-input')
      @input.bind('blur', @close)
            .val(text)

    toggleDone: ->
      @model.toggle()

    edit: ->
      $(@el).addClass('editing')
      @input.focus()

    close: =>
      @model.save text: @input.val()
      $(@el).removeClass('editing')

    updateOnEnter: (event) ->
      if event.keyCode is 13 then @close()

    remove: =>
      $(@el).remove()

    clear: ->
      @model.destroy()


  class AppView extends Backbone.View
    el: $('#todoapp')

    statsTemplate: _.template $('#stats-template').html()

    events:
      'keypress #new-todo': 'createOnEnter'
      'keyup #new-todo': 'showTooltip'
      'click .todo-clear a': 'clearCompleted'

    initialize: ->
      @input = @$('#new-todo')
      Todos.bind('add', @addOne)
      Todos.bind('reset', @addAll)
      Todos.bind('all', @render)
      Todos.fetch()

    render: =>
      template = @statsTemplate
        total: Todos.length
        done: Todos.done().length
        remaining: Todos.remaining().length
      @$('#todo-stats').html(template)
      return this

    addOne: (todo) =>
      view = new TodoView(model: todo)
      @$('#todo-list').append view.render().el

    addAll: =>
      Todos.each(@addOne)

    createOnEnter: (event) ->
      text = @input.val()
      if text and event.keyCode is 13
        Todos.create(text: text)
        @input.val('')

    clearCompleted: ->
      _.each(Todos.done(), (todo) -> todo.destroy())
      false

    showTooltip: (event) ->
      val = @input.val()
      tooltip = @$('.ui-tooltip-top')
      tooltip.fadeOut()
      if @tooltipTimeout then clearTimeout(@tooltipTimeout)
      if val is '' or val is @input.attr('placeholder') then return
      show = -> tooltip.show().fadeIn()
      @tooltipTimeout = _.delay(show, 1000)


  window.App = new AppView
