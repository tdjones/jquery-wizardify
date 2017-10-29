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
                assert.expect(8);
                var wizard = $('#wizard').wizardify();
                var done = assert.async(2);

                wizard.registerStepEventHandler(0, $.fn.wizardify.events.NEXTSTEPSTARTED, function (event) {
                    assert.step('NEXTSTEPSTARTED');
                    return true;
                });

                wizard.registerStepEventHandler(1, $.fn.wizardify.events.BEFORELOADING, function () {
                    assert.step('BEFORELOADING');
                });
                var animationWrapperOut = function () {
                    assert.step('ANIMATIONOUT');
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('none', 1);
                        done();
                        return true;
                    });
                };
                var animationWrapperIn = function () {
                    assert.step('ANIMATIONIN');
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('block', 2);
                        done();
                        return true;
                    });
                };
                wizard.registerStepEventHandler(0, $.fn.wizardify.events.ANIMATIONOUT, animationWrapperOut);
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.ANIMATIONIN, animationWrapperIn);
                wizard.registerStepEventHandler(1, $.fn.wizardify.events.AFTERLOADING, function () {
                    assert.step('AFTERLOADING');
                    return true;
                });

                wizard.start();
                $('.nextButton').click();
                assert.verifySteps(['NEXTSTEPSTARTED', 'BEFORELOADING','ANIMATIONOUT', 'ANIMATIONIN','AFTERLOADING']);
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

                var animationWrapper = function () {
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('block', 1);
                        assert.sectionVisibility('none', 2);
                        assert.sectionVisibility('none', 3);
                        done();
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

                var animationWrapper = function () {
                    return $.fn.fadeToggle.call(this, function () {
                        assert.sectionVisibility('none', 1);
                        assert.sectionVisibility('none', 2);
                        assert.sectionVisibility('block', 3);
                        done();
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
