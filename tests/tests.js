QUnit.module('General', function (hooks) {
    hooks.beforeEach(function (assert) {
        assert.sectionVisibility = function (visible, sectionNumber) {
            var value = $('section:nth-of-type(' + sectionNumber + ')').css('display');
            this.pushResult({
                result: value === visible,
                actual: value,
                expected: visible,
                message: 'section ' + sectionNumber + ' should have display:' + visible
            });
        };
    });
    QUnit.module('Wizard Initial State', function (hooks) {
        QUnit.module('with default options', function (hooks) {

            QUnit.test("should show none then show first", function (assert) {
                assert.expect(6);

                wizard = $('#wizard').wizardify();
                $('section').each(function (indx) {
                    assert.sectionVisibility('none', indx + 1);
                });
                wizard.start();
                assert.sectionVisibility('block', 1);
                assert.sectionVisibility('none', 2);
                assert.sectionVisibility('none', 3);
            });

            QUnit.test("next button goes to next step and runs all hooks in order", function (assert) {
                assert.expect(20);

                var wizard = $('#wizard').wizardify();
                var done = assert.async(5);

                wizard.registerStepEventHandler(0, $.fn.wizardify.events.NEXTSTEPSTARTED, function (event, complete) {
                    assert.step('NEXTSTEPSTARTED');
                    complete();
                });
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.BEFORELOADING, function (event, complete) {
                    assert.step('BEFORELOADING');
                    complete();
                });
                wizard.registerStepEventHandler(0, $.fn.wizardify.events.ANIMATIONOUT, function (event, complete) {
                    $(this).hide(function () {
                        assert.step('ANIMATIONOUT');
                        assert.sectionVisibility('none', 1);
                        complete();
                        done();
                    });
                });
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.ANIMATIONIN, function (event, complete) {
                    $(this).show(function () {
                        assert.step('ANIMATIONIN');
                        assert.sectionVisibility('block', 2);
                        complete();
                        done();
                    });
                });
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.AFTERLOADING, function (event, complete) {
                    assert.step('AFTERLOADING');
                    complete();
                    $('.nextButton').click();
                });

                // Transition second time

                wizard.registerStepEventHandler(1, $.fn.wizardify.events.NEXTSTEPSTARTED, function (event, complete) {
                    assert.step('NEXTSTEPSTARTED');
                    complete();
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.BEFORELOADING, function (event, complete) {
                    assert.step('BEFORELOADING');
                    complete();
                });
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.ANIMATIONOUT, function (event, complete) {
                    $(this).hide(function () {
                        assert.step('ANIMATIONOUT');
                        assert.sectionVisibility('none', 2);
                        done();
                        complete();
                    });
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.ANIMATIONIN, function (event, complete) {
                    $(this).show(function () {
                        assert.step('ANIMATIONIN');
                        assert.sectionVisibility('block', 3);
                        complete();
                        done();
                    });
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.AFTERLOADING, function (event, complete) {
                    assert.step('AFTERLOADING');
                    complete();
                    $('.nextButton').click();
                });

                // Final Step

                wizard.registerStepEventHandler(2, $.fn.wizardify.events.NEXTSTEPSTARTED, function (event, complete) {
                    assert.step('NEXTSTEPSTARTED');
                    complete();
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.FINISHING, function (event, complete) {
                    assert.step('FINISHING');
                    complete();
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.ANIMATIONOUT, function (event, complete) {
                    $(this).hide(function () {
                        assert.step('ANIMATIONOUT');
                        assert.sectionVisibility('none', 3);
                        complete();
                        done();
                    });
                });
                wizard.registerStepEventHandler(2, $.fn.wizardify.events.FINISHED, function (event, complete) {
                    assert.step('FINISHED');
                    complete();
                    assert.verifySteps(['NEXTSTEPSTARTED', 'BEFORELOADING', 'ANIMATIONOUT', 'ANIMATIONIN', 'AFTERLOADING',
                        'NEXTSTEPSTARTED', 'BEFORELOADING', 'ANIMATIONOUT', 'ANIMATIONIN', 'AFTERLOADING', 'NEXTSTEPSTARTED', 'FINISHING',
                        'ANIMATIONOUT', 'FINISHED']);
                });

                wizard.start();
                $('.nextButton').click();
            });
        });

        QUnit.module('with different options', function (hooks) {

            QUnit.test("startIndex: 1 shows second section by default", function (assert) {
                assert.expect(3);
                wizard = $('#wizard').wizardify({
                    startIndex: 1,
                });
                wizard.start();
                assert.sectionVisibility('none', 1);
                assert.sectionVisibility('block', 2);
                assert.sectionVisibility('none', 3);
            });

            QUnit.test("StartIndex: 1 back button goes to previous step", function (assert) {
                assert.expect(3);
                var done = assert.async();

                var animationWrapper = function (complete) {
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('block', 1);
                        assert.sectionVisibility('none', 2);
                        assert.sectionVisibility('none', 3);
                        done();
                        complete();
                    });
                };

                var wizard = $('#wizard').wizardify({
                    startIndex: 1,
                    animationIn: animationWrapper
                });

                wizard.start();
                $('.backButton').click();
            });

            QUnit.test("StartIndex: 1 next button goes to next step", function (assert) {
                assert.expect(3);
                var done = assert.async();

                var animationWrapper = function (complete) {
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('none', 1);
                        assert.sectionVisibility('none', 2);
                        assert.sectionVisibility('block', 3);
                        done();
                        complete();
                    });
                };

                var wizard = $('#wizard').wizardify({
                    startIndex: 1,
                    animationIn: animationWrapper
                });

                wizard.start();
                $('.nextButton').click();
            });
        });
    });
});
