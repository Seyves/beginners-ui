acceptArrow = document.querySelector('.accept__arrow');
aboutSection = document.getElementById('about');

acceptArrow.addEventListener('click', function(event){
	event.preventDefault();
	aboutSection.scrollIntoView({behavior: "smooth"});
});