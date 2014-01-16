
var max_results = 20;

// All matches with Levenshtein distance more than 3
//  will be removed after every iteration.
var max_difference = 4;


var dir = {
  photos: 'photos/',
};

var all_names = dir.photos + 'all-names-html.json';
var photos = 'back_bottom.jpg back_top.jpg front_bottom.jpg front_top.jpg left_bottom.jpg left_top.jpg main.jpg right_bottom.jpg right_top.jpg'.split(' ');

var image = dir.photos + 'front_bottom.jpg';
// special tesseract html file
var hocr = image + '.html';
var layout = null;

// Map of photo_name -> all names on the photo
var names = null;

// DOM elements defined on page load.
var elems = {
  search: null,
  results: null,
  photo_container: null,
};

var current_face = {
  img: null,
  // original width of the image
  width: null,
  // original height of the image
  height: null,
};

/**
 * Should be called on DOM loaded
 */
function init () {
  // Define elems.
  elems.search = $('#search');
  elems.results = $('#results');
  elems.photo_container = $('#photo-container');

  set_face(image);

  // Load meta-data
  $.getJSON(all_names, function (json) {
    names = {};
    for (var file in json) {
      names[file] = jq_element('div').html(json[file]).find('*[title^="bbox "]');
      names[file].each(function () {
        this.innerHTML = this.innerHTML.toLowerCase();
      });
    }

    if (window.location.hash && window.location.hash.length > 1) {
      var hash = window.location.hash.slice(1);
      elems.search.val(hash);
      find_name(hash);
    }
  });
};

function find_name (str) {
  str = str.trim().replace(/\s+/g, ' ');
  if (str.length <= 1) {
    elems.results.empty();
    return;
  }

  location.hash = str;
  elems.results.empty();

  var words = str.split(/\s+/);

  // Find the first match
  var hashes = [];
  var tokens = {};
  for (var file in names) {
    tokens[file] = [];
    for (var i=0; i<names[file].length; ++i) {
      tokens[file].push(names[file][i].textContent);
      hashes.push({
        dist: 0,
        str: [],
        file: file,
        index: i,
        elem: names[file].get(i),
      });
    }
  }

  // For every word, exclude weak matches (with distance > max_difference)
  (function _iterate (pos) {
    if (pos >= words.length) { return; }

    hashes = hashes.filter(function (h) {
      var str = tokens[h.file][h.index + pos];
      if (str === undefined) { return false; }

      var dist = levDist(str, words[pos]);
      h.dist += dist;
      h.str.push(str);
      return dist <= max_difference;
    });

    _iterate(pos + 1);
  })(0);


  hashes.sort(function (a, b) { return a.dist - b.dist; });
  hashes = hashes.slice(0, max_results);

  show_tags(hashes[0]);

  // Add all matches to the list
  hashes.forEach(function (hash) {
    elems.results.append(
      jq_element('li').
        append(
          jq_element('a').
            attr({href:'javascript:void(0)'}).
            addClass('result').
            html(hash.str.join(' ')).
            on('mouseenter', function () { show_tags(hash); })
        )
    );
  });
}

/**
 * Fectches all the tags that need to be highlighted and calls highlight() on them.
 * @param  {Object}   hash
 * @param  {Function} callback
 */
function show_tags (hash, callback) {
  set_face(dir.photos + hash.file, function () {
    var tags = $();
    for (var i=0; i<hash.str.length; ++i) {
      tags = tags.add(names[hash.file][hash.index + i]);
    }
    highlight(tags);
    (callback || function () {})(hash);
  });
}

/**
 * Highlights all the tags in the given hash
 * @param  {jQuery}   tags
 */
function highlight (tags) {
  var ratio = {
    width: current_face.img.width() / current_face.width,
    height: current_face.img.height() / current_face.height,
  };
  var overlays = $();

  elems.photo_container.find('.overlay').remove();
  tags.each(function () {
    var pos = this.getAttribute('title').split(' ').slice(1).map(function (s) { return +s; });

    overlays = overlays.add(
      jq_element('div').
        addClass('overlay').
        appendTo(elems.photo_container).
        css({
          position: 'absolute',
          left: pos[0] * ratio.width,
          top: pos[1] * ratio.height,
          width: (pos[2] - pos[0]) * ratio.width,
          height: (pos[3] - pos[1]) * ratio.height,
        })
    );
  });

  overlays.eq(0).addClass('arrow');

  return overlays;
}

/**
 * Sets the image in the DOM to the given url.
 * @param {String}   image    [description]
 * @param {Function} callback [description]
 */
var set_face = (function () {
  var load_no = 0;

  return function (image, callback) {
    var no = ++load_no;
    var img = jq_element('img');
    img.on('load', function () {
      if (no !== load_no) { return; }

      img.appendTo(document.documentElement);
      current_face = {
        img: img,
        width: img[0].width,
        height: img[0].height,
      };
      img.remove();

      elems.photo_container.html(img).removeClass('loading');

      img.zoome({
        defaultZoom: 4,
        showZoomState: true,
        magnifierSize: [220, 125]
      });

      (callback || function () {})(img);
    }).attr('src', image);

    elems.photo_container.addClass('loading');
  };
})();

/**
 * Create a new jQuery element of specified type
 * @param {string} type
 * @return {jQuery}
 */
function jq_element (type) {
  return $(document.createElement(type));
}


// INIT
$(init);