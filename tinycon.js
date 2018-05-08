/*!
 * Tinycon - A small library for manipulating the Favicon
 * Tom Moor, http://tommoor.com
 * Copyright (c) 2015 Tom Moor
 * @license MIT Licensed
 */

(function(){

  var Tinycon = {};
  var currentFavicon = null;
  var originalFavicon = null;
  var faviconImage = null;
  var canvas = null;
  var options = {};
  // Chrome browsers with nonstandard zoom report fractional devicePixelRatio.
  var r = Math.ceil(window.devicePixelRatio) || 1;
  var size = 32 * r;
  var defaults = {
    radius: 4,
    background: '#F03D25',
    fallback: true,
    crossOrigin: true,
    abbreviate: true
  };

  var ua = (function () {
    var agent = navigator.userAgent.toLowerCase();
    // New function has access to 'agent' via closure
    return function (browser) {
      return agent.indexOf(browser) !== -1;
    };
  }());

  var browser = {
    ie: ua('trident'),
    chrome: ua('chrome'),
    webkit: ua('chrome') || ua('safari'),
    safari: ua('safari') && !ua('chrome'),
    mozilla: ua('mozilla') && !ua('chrome') && !ua('safari')
  };

  // private methods
  var getFaviconTag = function(){

    var links = document.getElementsByTagName('link');

    for(var i=0, len=links.length; i < len; i++) {
      if ((links[i].getAttribute('rel') || '').match(/\bicon\b/i)) {
        return links[i];
      }
    }

    return false;
  };

  var removeFaviconTag = function(){

    var links = document.getElementsByTagName('link');

    for(var i=0, len=links.length; i < len; i++) {
      var exists = (typeof(links[i]) !== 'undefined');
      if (exists && (links[i].getAttribute('rel') || '').match(/\bicon\b/i)) {
        links[i].parentNode.removeChild(links[i]);
      }
    }
  };

  var getCurrentFavicon = function(){

    if (!originalFavicon || !currentFavicon) {
      var tag = getFaviconTag();
      currentFavicon = tag ? tag.getAttribute('href') : '/favicon.ico';
      if (!originalFavicon) {
        originalFavicon = currentFavicon;
      }
    }

    return currentFavicon;
  };

  var getCanvas = function (){

    if (!canvas) {
      canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
    }

    return canvas;
  };

  var setFaviconTag = function(url){
    if(url){
      removeFaviconTag();

      var link = document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      link.href = url;
      document.getElementsByTagName('head')[0].appendChild(link);
    }
  };

  var log = function(message){
    if (window.console) window.console.log(message);
  };

  var drawFavicon = function(label, color) {
    updateTitle(label);

    var context = getCanvas().getContext("2d");
    var color = color || '#000000';
    var src = getCurrentFavicon();

    faviconImage = document.createElement('img');
    faviconImage.onload = function() {
      // clear canvas
      context.clearRect(0, 0, size, size);

      if ((label + '').length > 0) {
        context.drawImage(
          faviconImage,
          0, 4 * r,
          size - 4 * r, size - 4 * r
        );
        drawBubble(context, color);
      } else {
        context.drawImage(
          faviconImage,
          0, 0,
          faviconImage.width / 2 * r, faviconImage.height / 2 * r
        );
      }

      // refresh tag in page
      refreshFavicon();
    };

    // allow cross origin resource requests if the image is not a data:uri
    // as detailed here: https://github.com/mrdoob/three.js/issues/1305
    if (!src.match(/^data/) && options.crossOrigin) {
      faviconImage.crossOrigin = 'anonymous';
    }

    faviconImage.src = src;
  };

  var updateTitle = function(label) {
    // Grab the current title that we can prefix with the label
    var originalTitle = document.title;

    // Strip out the old label if there is one
    if (originalTitle[0] === '(') {
      originalTitle = originalTitle.slice(originalTitle.indexOf(' '));
    }

    if ((label + '').length > 0) {
      document.title = '(' + label + ') ' + originalTitle;
    } else {
      document.title = originalTitle;
    }
  };

  var drawBubble = function(context, color) {
    var radius = options.radius * r * 2;

    var top = radius + 1 * r;
    var left = size - radius - 1 * r;

    context.fillStyle = options.background;
    context.strokeStyle = '#fff';
    context.lineWidth = r * 2;
    context.arc(left, top, radius, 0, Math.PI * 2, true);
    context.stroke();
    context.fill();
  };

  var refreshFavicon = function(){
    // check support
    if (!getCanvas().getContext) return;

    setFaviconTag(getCanvas().toDataURL());
  };

  var abbreviateNumber = function(label) {
    var metricPrefixes = [
      ['G', 1000000000],
      ['M',    1000000],
      ['k',       1000]
    ];

    for(var i = 0; i < metricPrefixes.length; ++i) {
      if (label >= metricPrefixes[i][1]) {
        label = round(label / metricPrefixes[i][1]) + metricPrefixes[i][0];
        break;
      }
    }

    return label;
  };

  var round = function (value, precision) {
    var number = new Number(value);
    return number.toFixed(precision);
  };

  // public methods
  Tinycon.setOptions = function(custom){
    options = {};

    // account for deprecated UK English spelling
    if (custom.colour) {
      custom.color = custom.colour;
    }

    for(var key in defaults){
      options[key] = custom.hasOwnProperty(key) ? custom[key] : defaults[key];
    }
    return this;
  };

  Tinycon.setImage = function(url){
    currentFavicon = url;
    refreshFavicon();
    return this;
  };

  Tinycon.setBubble = function(label, color) {
    label = label || '';
    drawFavicon(label, color);
    return this;
  };

  Tinycon.reset = function(){
    currentFavicon = originalFavicon;
    setFaviconTag(originalFavicon);
  };

  Tinycon.setOptions(defaults);

  if(typeof define === 'function' && define.amd) {
    define(Tinycon);
  } else if (typeof module !== 'undefined') {
    module.exports = Tinycon;
  } else {
    window.Tinycon = Tinycon;
  }
})();
