(function ($, undefined) {
    
        var uniqueId = 0;
    
        $.fn.wizardify = function (myoptions) {
    
            /**
             * Private Instance Methods
             */
            var buildSteps = function(){
                this.find(options.stepSelector).each(function(){
                    addStep($(this));
                });
            }.bind(this);
    
            var hideAllSteps = function(){
                this.find(options.stepSelector).hide();
            }.bind(this);
            
            var incrementStepBy = function(val) {
                if (isValidStep(state.currentIndex + val)) {
                    return state.currentIndex += val;
                }
                throw new Error('Attepting to increment out of bounds of number of steps');
            };
    
            var currentStep = function() {
                return getStep(state.currentIndex);
            };
    
            var nextStep = function() {
                return getStep(state.currentIndex + 1);
            };
    
            var previousStep = function() {
                return getStep(state.currentIndex - 1);
            };
            
            var addStep = function (domEl, index) {
                if (index === undefined) {
                    steps.push(domEl);
                } else {
                    steps.splice(index, 0, domEl);
                }
            };
    
            var getStep = function (index) {
                if (isValidStep(index)) {
                    return steps[index];
                }
                throw new Error('index is out of bounds on steps object');
            };
    
            var isLastStep = function() {
                return state.currentIndex === steps.length -1;
            };
            
            var removeStep = function (index) {
                if (isValidStep(index)) {
                    steps.slice(index);
                }
                throw new Error('index is out of bounds on steps object');
            };
    
            var isValidStep = function(index) {
                return index >= 0 && index < steps.length;
            };
    
            var eventName = function(name) {
                return options.namespace + state.uniqueId + '.' + name;
            };
    
            var registerHandlers = function() {
    
                $(options.nextStepButtonSelector).click(function(e){
                    e.preventDefault();
                    // triggerHandler will return undefined if no handler is registered and return val of handler otherwise
                    if(isLastStep()) {
                        if (currentStep().triggerHandler(eventName(events.NEXTSTEPSTARTED)) !== false) {
                            if (currentStep().triggerHandler(eventName(events.FINISHING)) !== false) {
                                if (currentStep().triggerHandler(eventName(events.ANIMATIONOUT)) === undefined) {
                                    options.animationOut.call(currentStep());
                                }
                                currentStep().triggerHandler(eventName(events.FINISHED));
                            }
                        }
                    } else {
                        if (currentStep().triggerHandler(eventName(events.NEXTSTEPSTARTED)) !== false) {
    
                            nextStep().triggerHandler(eventName(events.BEFORELOADING));
                            
                            if (currentStep().triggerHandler(eventName(events.ANIMATIONOUT)) === undefined) {
                                options.animationOut.call(currentStep());
                            }
    
                            if (nextStep().triggerHandler(eventName(events.ANIMATIONIN)) === undefined) {
                                options.animationIn.call(nextStep());
                            }
                            nextStep().triggerHandler(eventName(events.AFTERLOADING));
                            incrementStepBy(1);
                        }
                    }
                });
    
                $(options.backStepButtonSelector).click(function(e){
                    e.preventDefault();
                    if (currentStep().triggerHandler(eventName(events.BACKSTEPSTARTED)) !== false) {
                        if (currentStep().triggerHandler(eventName(events.ANIMATIONOUT)) === undefined) {
                            options.animationOut.call(currentStep());
                        }
                        if (previousStep().triggerHandler(eventName(events.ANIMATIONIN)) === undefined) {
                            options.animationIn.call(previousStep());
                        }
                        incrementStepBy(-1);
                    }
                });
            };
    
            /**
             * Public instance methods
             */ 
            this.registerStepEventHandler = function(index, event, func){
                if(isValidStep(index) && isValidEvent(event)){
                    getStep(index).on(eventName(event), func.bind(getStep(index)));
                } else if(!isValidStep(index)) {
                    throw new Error('Invalid index');
                } else {
                    throw new Error('Invalid event name');
                }
            };
    
            this.start = function(){
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
            registerHandlers();
            return this;
        };
    
        /**
         * Private
         * Checks if the event name is valid
         * @param {*} name 
         */
        function isValidEvent(name) {
            return Object.keys($.fn.wizardify.events).some(function(k) {
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