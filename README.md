# jquery-wizardify [![Build Status](https://travis-ci.org/tdjones/jquery-wizardify.svg?branch=master)](https://travis-ci.org/tdjones/jquery-wizardify)

A simple but flexible wizard/workflow jQuery plugin.

Wizardify doesn't impose any style choices it simply implements the transitions
between content and connects elements by jQuery selectors

## To get started:
```html
<body>
  <div id='mycontentcontainer'>
    <section>
      Section 1 Content
    </section>
    <section>
      Section 2 Content
    </section>
    <section>
      Section 2 Content
    </section>
    <button class='nextButton'>Next</button>
    <button class='backButton'>Back</button>
  </div>
</body>
```
```javascript
var wizard = $('#mycontentcontainer').wizardify();
wizard.start();
```
Each 'section tag' (default) will be imported as a step in the workflow. 
By default the first section will be visible and clicking 'Next' will cause the content to transition to the next step using the hide/show animation (default).
You're not restricted to a single button for each action, any clickable (jQuery .click()) element with the appropriate class will trigger the step transition. A valid alternate is the following for example:
```html
<body>
  <div id='mycontentcontainer'>
    <section>
      Section 1 Content
      <button class='nextButton'>Next</button>
    </section>
    <section>
      Section 2 Content
      <button class='nextButton'>Next</button>
      <button class='backButton'>Back</button>
    </section>
    <section>
      Section 2 Content
      <button class='nextButton'>Finish</button>
      <button class='backButton'>Back</button>

    </section>
  </div>
</body>
```

## Events

There are events triggered throughout the step transitions.
```javascript
$.fn.wizardify.events = {
        NEXTSTEPSTARTED: 'nextStepStarted',
        BACKSTEPSTARTED: 'backStepStarted',
        FINISHING: 'finishing',
        FINISHED: 'finished',
        BEFORELOADING: 'beforeLoading',
        AFTERLOADING: 'afterLoading',
        ANIMATIONIN: 'animationIn',
        ANIMATIONOUT: 'animationOut'
}
```

You can register event handlers for each event:
```javascript
wizard.registerStepEventHandler(1, $.fn.wizardify.events.NEXTSTEPSTARTED, function (event, complete) {
   complete();
});
wizard.registerStepEventHandler(1, $.fn.wizardify.events.BEFORELOADING, function (event, complete) {
    complete();
});
wizard.registerStepEventHandler(1, $.fn.wizardify.events.ANIMATIONOUT, function (event, complete) {
    $(this).fadeIn(function () {
        complete();
    });
});
wizard.registerStepEventHandler(1, $.fn.wizardify.events.ANIMATIONIN, function (event, complete) {
    $(this).show(function () {
        complete();
    });
});
wizard.registerStepEventHandler(1, $.fn.wizardify.events.AFTERLOADING, function (event, complete) {
    complete();
});
```

The registerStepEventHandler method takes a numeric index (starting at 0) specifying the step.
The callback function must call complete before it completes in order to allow the transition
to progress past this part of the transition.

If you have validation tasks they should ideally sit in the $.fn.wizardify.events.NEXTSTEPSTARTED and
$.fn.wizardify.events.BEFORELOADING as these occur prior to the step animation transitions.
In each callback 'this' is the jQuery dom element of that section eg: $('#mycontentcontainer section:nth-of-type(n)')


