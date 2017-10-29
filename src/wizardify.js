(function ($, undefined) {

    var uniqueId = 0;

    $.fn.wizardify = function (myoptions) {

        /**
         * Private Instance Methods
         */


        var buildSteps = function () {
            this.find(options.stepSelector).each(function () {
                addStep($(this));
            });
        }.bind(this);

        var hideAllSteps = function () {
            this.find(options.stepSelector).hide();
        }.bind(this);

        var incrementStepBy = function (val) {
            if (isValidStep(state.currentIndex + val)) {
                return state.currentIndex += val;
            }
            throw new Error('Attepting to increment out of bounds of number of steps');
        };

        var currentStep = function () {
            return getStep(state.currentIndex);
        };

        var nextStep = function () {
            return getStep(state.currentIndex + 1);
        };

        var previousStep = function () {
            return getStep(state.currentIndex - 1);
        };

        /**
         * Adds the new element to the list at index if specified or end otherwise
         * @param {*} domEl 
         * @param {*} index 
         * @returns {number} index of the new step
         */
        var addStep = function (domEl, index) {
            if (index === undefined) {
                index = steps.push(domEl) - 1;
            } else {
                steps.splice(index, 0, domEl);
            }
            registerDefaultHandlers(index);
            return index;
        };

        var getStep = function (index) {
            if (isValidStep(index)) {
                return steps[index];
            }
            throw new Error('index is out of bounds on steps object');
        };

        var isLastStep = function () {
            return state.currentIndex === steps.length - 1;
        };

        var removeStep = function (index) {
            if (isValidStep(index)) {
                steps.slice(index);
            }
            throw new Error('index is out of bounds on steps object');
        };

        var isValidStep = function (index) {
            return index >= 0 && index < steps.length;
        };

        var eventName = function (name) {
            return options.namespace + state.uniqueId + '.' + name;
        };

        /**
         * Adds default event handlers for all events to a step
         * This allows transitions to occur without the user registering their own
         * 
         * @param {number} index Index of the step to add the handlers to.
         */
        var registerDefaultHandlers = function (index) {
            defaultTransitionHandler = function (e, complete) {
                complete();
            };
            defaultAnimationInHandler = function (e, complete) {
                options.animationIn.call(this, function () {
                    complete();
                });
            };
            defaultAnimationOutHandler = function (e, complete) {
                options.animationOut.call(this, function () {
                    complete();
                });
            };
            var that = this;
            [events.NEXTSTEPSTARTED, events.BEFORELOADING, events.AFTERLOADING,
            events.FINISHED, events.FINISHING, events.BACKSTEPSTARTED].map(function (eventype) {
                that.registerStepEventHandler(index, eventype, defaultTransitionHandler);
            });
            this.registerStepEventHandler(index, events.ANIMATIONIN, defaultAnimationInHandler);
            this.registerStepEventHandler(index, events.ANIMATIONOUT, defaultAnimationOutHandler);
        }.bind(this);

        var registerTransitionHandlers = function () {

            $(options.nextStepButtonSelector).click(function (e) {
                e.preventDefault();
                // triggerHandler will return undefined if no handler is registered and return val of handler otherwise
                if (isLastStep()) {
                    currentStep().triggerHandler(eventName(events.NEXTSTEPSTARTED), function() {
                        currentStep().triggerHandler(eventName(events.FINISHING), function() {
                            currentStep().triggerHandler(eventName(events.ANIMATIONOUT), function() {
                                currentStep().triggerHandler(eventName(events.FINISHED), function() {
                                    
                                });
                            });
                        });
                    });
                } else {
                    currentStep().triggerHandler(eventName(events.NEXTSTEPSTARTED), function () {
                        nextStep().triggerHandler(eventName(events.BEFORELOADING), function () {
                            currentStep().triggerHandler(eventName(events.ANIMATIONOUT), function () {
                                nextStep().triggerHandler(eventName(events.ANIMATIONIN), function () {
                                    nextStep().triggerHandler(eventName(events.AFTERLOADING), function () {
                                        incrementStepBy(1);
                                    });
                                });
                            });
                        });
                    });
                }
            });

            $(options.backStepButtonSelector).click(function (e) {
                e.preventDefault();
                currentStep().triggerHandler(eventName(events.BACKSTEPSTARTED), function () {
                    currentStep().triggerHandler(eventName(events.ANIMATIONOUT), function () {
                        previousStep().triggerHandler(eventName(events.ANIMATIONIN), function () {
                            incrementStepBy(-1);
                        });
                    });
                });
            });
        };



        /**
         * Public instance methods
         */

        /**
         * Registers a new event handler for the step
         * All event handlers must accept two params (event, complete)
         * and must call complete when done.
         * @param {number} index Index of the step
         * @param {string} event Event name (see $.fn.wizardify.events)
         * @param {function} func Event handler function that takes parameters (event, complete)
         */
        this.registerStepEventHandler = function (index, event, func) {
            if (isValidStep(index) && isValidEvent(event)) {
                //Unregister any previously registered event handlers for this type.
                getStep(index).off(eventName(event));
                //Register the new event handler
                getStep(index).on(eventName(event), func.bind(getStep(index)));
            } else if (!isValidStep(index)) {
                throw new Error('Invalid index');
            } else {
                throw new Error('Invalid event name');
            }
        };

        this.start = function () {
            currentStep().show();
        };

        /**
         * Instance Variables
         */
        var steps = [];
        var options = $.extend({}, defaults, myoptions);
        var state = {
            uniqueId: uniqueId++,
            currentIndex: options.startIndex
        };

        /**
         * Init tasks
         */
        buildSteps();
        hideAllSteps();
        registerTransitionHandlers();
        return this;
    };

    function isValidEvent(name) {
        return Object.keys($.fn.wizardify.events).some(function (k) {
            return $.fn.wizardify.events[k] === name;
        });
    }

    var events = $.fn.wizardify.events = {
        NEXTSTEPSTARTED: 'nextStepStarted',
        BACKSTEPSTARTED: 'backStepStarted',
        FINISHING: 'finishing',
        FINISHED: 'finished',
        BEFORELOADING: 'beforeLoading',
        AFTERLOADING: 'afterLoading',
        ANIMATIONIN: 'animationIn',
        ANIMATIONOUT: 'animationOut'
    };

    var defaults = $.fn.wizardify.defaults = {
        stepSelector: 'section',
        startIndex: 0,
        nextStepButtonSelector: '.nextButton',
        backStepButtonSelector: '.backButton',
        namespace: 'wizardify',
        animationIn: $.fn.show,
        animationOut: $.fn.hide
    };

}(jQuery));