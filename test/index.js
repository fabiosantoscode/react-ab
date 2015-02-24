var getRandomValues = require("get-random-values");
global.document = require("jsdom").jsdom("");
global.window = document.parentWindow;
global.navigator = window.navigator;

var defineGetRandomValues = function () {
  global.window.crypto = {
    getRandomValues: getRandomValues
  };
};

var assert = require("assert");

var React = require("react/addons")
  , TestUtils = React.addons.TestUtils;

var Experiment = require("../react-ab").Experiment
  , Variant = require("../react-ab").Variant;

describe("Experiment", function () {
  var createExperiment = function (name, choice, variants) {
    var variantNodes = variants.map(function (variant) {
      return React.createElement(Variant, { key: variant, name: variant }, React.createElement("span", null, variant));
    });

    return TestUtils.renderIntoDocument(React.createElement(Experiment, { name: name, onChoice: choice }, variantNodes));
  };

  it("should choose a variant", function (done) {
    var variants = ["one", "two", "three"];

    var count1 = 3;
    var choice1 = function (experiment, variant, index, ret) {
      count1 -= 1;
      assert.equal(variants[index], variant);
      assert.ok(variants.indexOf(variant) !== -1);
      assert.equal(count1 == 1, ret);
    };

    var ex1 = createExperiment("test1", choice1, variants)
      , span1 = TestUtils.findRenderedDOMComponentWithTag(ex1, "span")
      , variant1 = span1.getDOMNode().textContent;

    assert.ok(variants.indexOf(variant1) !== -1);

    var ex2 = createExperiment("test1", choice1, variants)
      , span2 = TestUtils.findRenderedDOMComponentWithTag(ex2, "span")
      , variant2 = span2.getDOMNode().textContent;

    assert.equal(variant1, variant2); // variants should be the same as the cookie was not cleared

    assert.equal(ex1.getVariant(), ex2.getVariant()); // get variant should also work as intended.

    defineGetRandomValues(); // define random values here to test it

    ex1.clearCookie();

    var ex3 = createExperiment("test1", choice1, variants)
      , span3 = TestUtils.findRenderedDOMComponentWithTag(ex3, "span")
      , variant3 = span3.getDOMNode().textContent;

    assert.ok(variants.indexOf(variant3) !== -1);

    // test another cookie
    var count2 = 2;
    var choice2 = function (experiment, variant, index, ret) {
      count2 -= 1;
      assert.equal(experiment, " test2");
      assert.equal(variants[index], variant);
      assert.ok(variants.indexOf(variant) !== -1);
      if (count2 === 0) { done(); }
    };

    var ex4 = createExperiment(" test2", choice2, variants)
      , span4 = TestUtils.findRenderedDOMComponentWithTag(ex4, "span")
      , variant4 = span4.getDOMNode().textContent;

    assert.ok(variants.indexOf(variant4) !== -1);

    var ex5 = createExperiment(" test2", choice2, variants)
      , span5 = TestUtils.findRenderedDOMComponentWithTag(ex5, "span")
      , variant5 = span5.getDOMNode().textContent;

    assert.ok(variants.indexOf(variant5) !== -1);

    assert.equal(variant4, variant5);

    assert.equal(ex4.getVariant(), ex5.getVariant());
  });
});
