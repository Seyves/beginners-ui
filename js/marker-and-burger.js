const menu = document.querySelector('.menu');
const menuMarker = document.querySelector('.menu__marker');
let menuMarkerTarget = document.querySelector('.menu__home');
let syncTimeout;

function getRelativeCoords(parent, child){
	return{
		left: child.getBoundingClientRect().x - parent.getBoundingClientRect().x,	
		top: child.getBoundingClientRect().y - parent.getBoundingClientRect().y,
	}
}

function setMarkerPosition(marker, markerTarget, parent){	
	marker.style.left = getRelativeCoords(parent, markerTarget).left + 'px';
	marker.style.top = `calc(${getRelativeCoords(parent, markerTarget).top + markerTarget.offsetHeight + 'px'} + ${0.3 + 'em'} + ${0.3 + 'vh'})`;
	marker.style.width = markerTarget.offsetWidth + 'px';
}

function getCurrentPageSection(pageYOffset){
	if(window.pageYOffset < 500){ return '0'; }
	if(window.pageYOffset >= 500 && window.pageYOffset < 2200){ return '1'; }
	if(window.pageYOffset >= 2200 && window.pageYOffset < 5700){ return '2'; }
	return '3';
}

setMarkerPosition(menuMarker, menuMarkerTarget, menu);

menu.addEventListener('click', function(event){	
	if(event.target.tagName != 'A') return;
	menuMarkerTarget = event.target;

	clearTimeout(syncTimeout);
	window.removeEventListener('scroll', markerAndPageSync);
	syncTimeout = setTimeout(SyncListener, 800);
	event.preventDefault();

	setMarkerPosition(menuMarker, menuMarkerTarget, menu);
	menuMarkerLink = menuMarkerTarget.getAttribute('href').replace('#', '');
	pageSection = document.getElementById(menuMarkerLink);

	pageSection.scrollIntoView({behavior: "smooth"});	
});

menu.addEventListener('pointerover', function(event){
	if(event.target.tagName != 'A') return;	
	menuMarker.classList.add('exited');
	console.log('овер')
});

menu.addEventListener('pointerout', function(event){
	if(event.target.tagName != 'A') return;	
	menuMarker.classList.remove('exited');
	console.log('аут')
});

window.addEventListener('resize', function(event){
	setMarkerPosition(menuMarker, menuMarkerTarget, menu);
})

SyncListener();
function SyncListener(){
	window.addEventListener('scroll', markerAndPageSync);
}

function markerAndPageSync(){
	setMarkerPosition(menuMarker, menu.children[getCurrentPageSection(window.pageYOffset)], menu);
	menuMarkerTarget = menu.children[getCurrentPageSection(window.pageYOffset)];
}

//==========================================================================================================================================================

const burger = document.querySelector('.burger');
const menuBurger = document.querySelector('.burger-menu__body');

burger.addEventListener('click', function(){
	burger.classList.toggle('active');
	menuBurger.classList.toggle('active');
	setMarkerPosition(menuMarker, menuMarkerTarget, menu);
});

window.addEventListener('scroll', function(event){
	if(burger.classList.contains('active')){
		burgerCloseDelay = setTimeout(closeBurger, 200);
	}
});

function closeBurger(){	
	burger.classList.remove('active');
	menuBurger.classList.remove('active');
}
