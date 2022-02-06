function setNumberRange(number, lowest, highest){	
	if(number < lowest){ return number = lowest; }
	if(highest){
		if(number > highest){ return number = highest; }
	}
	return number;
}

class Slider{

	//КОНСТРУКТОР
	//===================================================================================================================================================
	constructor(initialObj){		

		this.slider = initialObj.slider;		
		let sliderChildren = this.slider.children;

		for(let child of sliderChildren){			
			if (child.classList.contains('slider-band')){				
				this.band = child;
			}
			if (child.classList.contains('slider-arrows')){				
				this.arrows = child;
			}
		}		

		//т.к. коллекция детей живая, преобразуем её в массив
		this.elems = Array.from(this.band.children);
		this.elemsNumber = this.elems.length;		

		this.defaultElemsOnOneSlide = initialObj.elemsOnOneSlide;
		this.elemsOnOneSlide = initialObj.elemsOnOneSlide;
		this.slideNumber = Math.ceil(this.elemsNumber / this.elemsOnOneSlide);			
		this.sliderPosition = 0;
		
		//создаём шаблон слайда, внутри которого будут элементы
		this.slide = document.createElement('div');
		//this.slide.classList.add('slider-what-users-think__slide');
		this.slide.classList.add('slide');

		//расстояние между слайдами
		this.defaultGap = initialObj.gap;
		this.gap = initialObj.gap;
		this.band.style.gap = this.gap + 'px';	

		this.adaptiveArray = initialObj.breakpoints;
		this.isSliderInRest = true;
		this.restTimeout = 0;
		this.time = initialObj.time;

		//ОБРАБОТЧИКИ СОБЫТИЙ
		//===================================================================================================================================================

		//при загрузке страницы
		document.addEventListener("DOMContentLoaded",(event) => {
			//проверяем брейкпоинты
			this.breakpointsCheck();
			//создаём массив слайдов
			this.createSlidesArray();	
			//создаём структуру: слайды -> элементы
			this.distributeElemsBySlides();	
			//задаём размеры слайдам
			this.setSlidesWidth();
			//проверяем стрелочки
			this.arrowCheck();
		 });	

		//изменение размеров слайдов и проверка на брейкпоинты при ресайзе
		window.addEventListener('resize', () => {			
			this.band.style.transition = '0s'				
			this.breakpointsCheck();
			this.setSliderPosition();
			this.setSlidesWidth();
			this.arrowCheck();
		})

		//пролистывание слайдов стрелочками
		this.arrows.addEventListener('click', (event) => {
			let target = event.target.closest('a');
			if(target == null) return;
			event.preventDefault();		
			
			this.band.style.transition = this.time + 's';	
		
			let arrowDirection = target.dataset.arrowDirection;
		
			if(arrowDirection == 'left'){	this.sliderPosition -= 1; }
			if(arrowDirection == 'right'){ this.sliderPosition += 1; }

			this.swipe();
			this.arrowCheck();
		});

		//пролистывание слайдов свайпом
		document.addEventListener('pointerdown', (event) =>{
			if(event.target.closest('.slider-band') != this.band){
				return;
			}

			this.initialCursonPosition = event.pageX - this.slider.getBoundingClientRect().x;
			this.band.style.transition = '0s';
			event.preventDefault();
			
			document.addEventListener('pointermove', this.swipeMoveListener);
			document.addEventListener('pointerup', this.swipeUpListener);
		});		
	}	


	//МЕТОДЫ КЛАССА
	//===================================================================================================================================================

	//этот метод задаёт нужные размеры слайдам, в том числе при резайзе
	setSlidesWidth(){
		this.slidesArray.forEach((slide)=>{
			slide.style.width = this.slider.offsetWidth + 'px';			
		});
	}
	
	//этот метод вызывается при пролистываниях свайпом или стрелочками
	swipe(){
		this.isSliderInRest = false;
		if(this.restTimeout){
			clearTimeout(this.restTimeout);
		}
		this.restTimeout = setTimeout(this.setSliderInRest, this.time * 1000);

		this.sliderPosition = setNumberRange(this.sliderPosition, 0, this.slideNumber-1);		
		this.band.style.transform = `translateX(${-this.sliderPosition * (this.slider.offsetWidth + this.gap)}px)`;
	}
	setSliderInRest = () => {
		this.isSliderInRest = true;
	}

	//этот метод служебный, он ставит слайдер на место при изменении его параметров. Делает это незаметно - без анимаций
	setSliderPosition(){
		this.sliderPosition = setNumberRange(this.sliderPosition, 0, this.slideNumber-1);		
		this.band.style.transform = `translateX(${-this.sliderPosition * (this.slider.offsetWidth + this.gap)}px)`;
	}

	//этот метод проверяет стрелочки, если дальше некуда листать, то они гаснут
	arrowCheck(){
		if(this.sliderPosition == 0){this.arrows.children[0].classList.add('unactive');}
		else{this.arrows.children[0].classList.remove('unactive');}
	
		if(this.sliderPosition == this.slideNumber-1){this.arrows.children[1].classList.add('unactive');}
		else{this.arrows.children[1].classList.remove('unactive');}
	}

	//этот метод создаёт нужное кол-во слайдов и распределяет по ним элементы. Если до этого уже была создана структура, то удаляет её и переделывает
	distributeElemsBySlides(){	
		this.slideNumber = Math.ceil(this.elemsNumber / this.elemsOnOneSlide);		
		
		this.createSlidesArray();

		this.band.innerHTML = "";
		let elemCounter = 0;

		for(let slide of this.slidesArray){
			this.band.append(slide);

			for(let i = 0; i < this.elemsOnOneSlide; i++){
				slide.prepend(this.elems[elemCounter]);

				elemCounter++;				
				if(elemCounter >= this.elemsNumber){ break; }
			}

			if(this.elemsOnOneSlide - elemCounter > 2){
				slide.style.justifyContent = 'space-between';
			}
			else{
				slide.style.justifyContent = 'space-around';
			}
		}
	}

	//создаёт нужное кол-во слайдов
	createSlidesArray(){
		this.slidesArray = [];
		for(let i = 0; i < this.slideNumber; i++){
			this.slidesArray.push(this.slide.cloneNode(false));
		}
	}

	//этот метод вызывается при каждом движении указателем по слайдеру. Считает, достаточное ли расстояние было проведено для свайпа и немного смещает слады
	swipeMoveListener = (event) => {		
		event.preventDefault();
		this.currentCursonPosition = event.pageX - this.slider.getBoundingClientRect().x;
		this.cursorDelta = this.initialCursonPosition - this.currentCursonPosition;		

		if(this.isSliderInRest){
			this.band.style.transform = `translateX(${-this.sliderPosition * (this.slider.offsetWidth + this.gap) + this.cursorDelta/5}px)`;
		}
	}
	//этот метод вызывается при поднятии указателя. Совершает свайп, если расстояние достаточно и подтирает за собой эвенты
	swipeUpListener = (event) => {	
		this.band.style.transition = this.time + 's';

		if(Math.abs(this.cursorDelta) > 150){
			if(this.cursorDelta>0){
				this.sliderPosition += 1;
			}
			else{
				this.sliderPosition -= 1;
			}			
			this.swipe();
			this.arrowCheck();
		}
		else{
			this.setSliderPosition();
			this.arrowCheck();
		}

		//чистим за собой		
		this.initialCursonPosition = undefined; this.currentCursonPosition = undefined; this.cursorDelta = undefined;
		document.removeEventListener('pointermove', this.swipeMoveListener); 
		document.removeEventListener('pointerup', this.swipeUpListener);
	}

	//очень страшный метод для правильной работы брейкпоинтов (надо бы переписать вообще, очень ресурсоёмкий)
	breakpointsCheck(){
		let windowWidth = document.documentElement.offsetWidth;
		if(windowWidth == this.previousWindowWidth) return;		
		this.previousWindowWidth = windowWidth;
		
		for(let dataBlock in this.adaptiveArray){
			if(dataBlock == 0){
				if(windowWidth > this.adaptiveArray[dataBlock][0]){
					this.elemsOnOneSlide = this.defaultElemsOnOneSlide;
					this.gap = this.defaultGap;
				}
				else{
					this.elemsOnOneSlide = this.adaptiveArray[dataBlock][1];
					this.gap = this.adaptiveArray[dataBlock][2];
				}
			}	
			else if(dataBlock >= this.adaptiveArray.length - 1){
				if(windowWidth < this.adaptiveArray[dataBlock][0]){
					this.elemsOnOneSlide = this.adaptiveArray[dataBlock][1];
					this.gap = this.adaptiveArray[dataBlock][2];	
				}
			}					
			else if(windowWidth < this.adaptiveArray[dataBlock][0] && windowWidth > this.adaptiveArray[+dataBlock + 1][0]){
				this.elemsOnOneSlide = this.adaptiveArray[dataBlock][1];
				this.gap = this.adaptiveArray[dataBlock][2];
			}
		}
		this.band.style.gap = this.gap + 'px';	
		this.distributeElemsBySlides();
	}
}

//ИНИЦИАЛИЗАЦИЯ СЛАЙДЕРОВ
//==========================================================================================================================================================

const usersSliderElem = document.querySelector('.slider-what-users-think');
let usersSlider = new Slider({
	slider: usersSliderElem,
	elemsOnOneSlide: 3, 
	gap: 300, 
	time: 1,
	breakpoints: [
		[1000, 2, 300],
		[600, 1, 300],
	]
});

const introSliderElem = document.querySelector('.slider-intro');
let introSlider = new Slider({
	slider: introSliderElem, 
	elemsOnOneSlide: 1, 
	gap: 1000, 
	time: 0.8,
});

