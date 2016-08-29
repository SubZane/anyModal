anyModal v1.0.0
=======
anyModal is a responsive solution for modal windows written in javascript. This new version is written in vanilla JavaScript and has no other dependencies.

##Features
* Responsive modal windows. Works great on desktop computers as well on smart phones.
* Can be used for video, images and text
* Unlimited content possible inside modal window. Uses friendly simple scrollbars.

##Installation
```
bower install anyModal --save
```

###Setup
```html
<!-- You'll need to include anyModal of course! -->
<script src="anyModal.js"></script>

<!-- Some basic CSS is required of course -->
<link rel="stylesheet" href="css/anyModal.css">
```
##Usage
```javascript
document.addEventListener("DOMContentLoaded", function(event) {
  anyModal.init({
    transitiontime: 300,
    redrawOnResize: true
  });
});
```

###Settings and Defaults
```javascript
options: {
  transitiontime: 300,
  redrawOnResize: true
};
```
* `transitiontime`: Time in milliseconds to time transtions set in your CSS. Change this if you change your CSS
* `redrawOnResize`: Force a redraw if the viewport changes.


###Typical setup
This could be your typical script setup.

Add the following javscript to execute the script on load.
```javascript
document.addEventListener("DOMContentLoaded", function(event) {
  anyModal.init();
});
```

The following markup to launch the modal window. Use the `data-effect` attribute to change effects.
```html
  <a href="#" data-modal="mymodal" data-effect="rm-effect-1">Fade and zoom</a>
```
###Effects available
* `rm-effect-1`: Fade and zoom
* `rm-effect-2`: Slide from right
* `rm-effect-3`: Pop from bottom
* `rm-effect-4`: Newspaper
* `rm-effect-5`: Fall
* `rm-effect-6`: Side fall
* `rm-effect-7`: Sticky up
* `rm-effect-8`: Side flip
* `rm-effect-9`: Top flip
* `rm-effect-10`: 3D sign
* `rm-effect-11`: Scale
* `rm-effect-12`: 3D slit
* `rm-effect-13`: 3D rotate bottom
* `rm-effect-14`: 3D rotate in left

Add the following markup for the modal window itself. The ID of the modal window must match the `data-modal` attribute of the button
```html
  <div class="rm-modal" id="mymodal">
		<div class="rm-content">
			<div class="rm-header">
				<h3>Modal Dialog</h3>
				<a href="#" class="rm-cross">
          <img src="img/cross.svg" width="19" height="19" alt="" />
				</a>
			</div>
			<div class="rm-inner">
				<p>Sed posuere consectetur est at lobortis.</p>
			</div>
		</div>
	</div>  
```

##changelog
####1.0.0
* Initial release
