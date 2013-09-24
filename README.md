# spark

Spark is an instant-feedback sketch coding environment for Javascript that has been heavily inspired by Processing. It was designed for use in the classroom, the core idea being that students should code along during each lesson and benefit from the ability to immediately try out new material and experiment with the effects of small changes.

Here's a screenshot:

<img src="https://raw.github.com/jaz303/spark/master/screenshot.jpg">

## Obligatory

Alpha software! Dungeons! Dragons! Raaaaaa!

## Usage Notes

Use `Cmd + Enter` on Mac (or `Ctrl + Enter` on Windows) to evaluate either the current selection, or all code (if none is selected).

Code in textarea and console all runs in a separate, sandboxed, Javascript context.

If you declare a function called `setup()` it will be called whenever code in the textarea is evaluated, or when `Reset` is clicked (this behaviour will probably change in the future once we have implemented global variable plucking).

Similarly, a function called `loop()` will be called at a rate of approximately 60FPS after the `Start` button is clicked.

The canvas context is available via the variable `ctx`. The canvas size can be retrieved using `width` and `height`.

There are a bunch of other Processing-style functions added to sandbox context. Many of these are [documented here](http://jasonframe.co.uk/teaching/gsa-dc/api.php).

## Download

  * [Mac](http://jasonframe.co.uk/teaching/gsa-dc/Spark.zip)

## Hacking

First, install `node-webkit` - [instructions here](https://github.com/rogerwang/node-webkit).

Next, check out the repo:

    $ git clone https://github.com/jaz303/spark.git

Then the modules:

    $ cd spark
    $ npm install

Finally, open the current directory in `node-webkit` by dragging the folder onto it, or by invoking it from the command line:

    $ /Applications/node-webkit.app/Contents/MacOS/node-webkit .

## Packaging

Packaging is only supported on Mac for now - if you have some spare time scripts for other systems would be much appreciated!

### Mac

  * Download a version of `node-webkit` and move its `.app` file to the `res` directory underneath the Spark project root. The version I am currently using is [toxygen's 10.6-compatible build](https://github.com/toxygen/10.6-node-webkit).
  * Then in the shell: `$ make clean osx`
  * Packaged app version should be in the `pkg` dir.

## Contribute

Besides code, there are other ways to help out!

### Packaging

We need packaging scripts for Windows and Linux. Nothing tricky here, just a bit of time required.

### Interface design

The keen-eyed amongst you may have noticed I borrowed the UI theme wholesale from Ableton, a high-end audio pakcage. I'm not proud of this but it in the absence of design skills it was the easiest way to get something decent looking. If anyone has some time to spare to make the UI unique please ping me.

### Icon design

We need an icon!

## TODO

Immediate things to fix/improve:

  * optional long loop detection/cancellation (via syntax tree modification)
  * typing a command into the console causes something funky to happen with the `setup()`/`loop()` stuff - must investigate further.
  * animation is SLOW. must switch to requestAnimationFrame().

Beyond this, there are a ton of other more interesting features planned; this early demo is just laying the groundwork for some much more interesting/awesome features.

## Author & License

Spark is written by Jason Frame ([@jaz303](http://twitter.com/jaz303)).

Released under the MIT License.