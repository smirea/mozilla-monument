## Mozilla Monument Name Finder

This is a simple way of finding your name on the Mozilla Monument in San Francisco

Working example at [moz-relic.code4fun.de](http://moz-relic.code4fun.de)

The basic idea behind this is:
* Take the big rezolution photos from [here](http://people.mozilla.org/SF_Monument/IMAGES/)
* Run it through an OCR that can dump also the position of each word (I used `tesseract in-file out-file hocr`)
* Since it seldomly gives bad results, use [Levenshtein distance](http://en.wikipedia.org/wiki/Levenshtein_distance) for searching
