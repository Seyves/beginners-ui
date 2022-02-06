//Функция определяет какой это ребёнок по счёту
function getElemPlace(elem){
	let place = 1;
	for(let parentChild of elem.parentElement.children){
		if (parentChild == elem) break;
		place++;
	}
	return place;
}

//Класс для определения параметров "прыгающих" элементов
class JumpTarget{

	constructor(elem){

		this.target = elem;		
		//Ищем родителя элемента и его место в нём
		this.parent = elem.parentElement;		
		this.initialPlace = getElemPlace(elem);

		//Получаем наши данные из data в массив и чистим их от пробелов
		let dataArray = elem.dataset.jump.split(',');
		dataArray.forEach(function(item, index, array){
			array[index] = item.trim();
		});

		//Заполняем данные из data
		//Цель
		this.destination = document.querySelector('.' + dataArray[0]);	

		//Место в цели	
		this.finalPlace = dataArray[1];

		//Добавляем поддержку значений first и last
		if(dataArray[1] == 'first'){
			this.finalPlace = 1;
		}
		if(dataArray[1] == 'last'){
			this.finalPlace = this.destination.children.length + 1;
		}

		//Размер экрана, на котором будет происходить "прыжок"
		this.changeSize = matchMedia(`(max-width: ${dataArray[2]}px)`);
	}	

	//Прыжок
	jump(){
		this.destination.insertBefore(this.target, this.destination.children[this.finalPlace-1]);
	}

	//Прыжок обратно
	unjump(){
		this.parent.insertBefore(this.target, this.parent.children[this.initialPlace-1]);
	}	
}

//Ищем все элементы с data-jump
const targets = document.querySelectorAll('[data-jump]');
const jumpTargets = [];


for(let target of targets){
	//Создаём объект класса, он уже на этом этапе определил всё что нам нужно
	let jumpTarget = new JumpTarget(target);
	jumpTargets.push(jumpTarget);
}

for(let jumpTarget of jumpTargets){

	//Если экран при запуске меньше
	if(jumpTarget.changeSize.matches){
		//Прыгаем
		jumpTarget.jump();
	}
	
	//Если размер меняется
	jumpTarget.changeSize.onchange = (e) => {
		//На меньший
		if (e.matches){ 
			//Прыгаем
			jumpTarget.jump(); 
			
		}
		//На больший
		else{ 
			//Прыгает обратно
			jumpTarget.unjump(); 
			
		}
	}
}
