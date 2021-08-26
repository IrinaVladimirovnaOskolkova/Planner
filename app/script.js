let usersJSON = '[{"id":1,"username":"user1","surname":"Петров","firstName":"Иван","secondName":""},{"id":2,"username":"user2","surname":"Иванов","firstName":"Пётр","secondName":""},{"id":3,"username":"user3","surname":"Васильев","firstName":"Артём","secondName":""},{"id":4,"username":"user4","surname":"Кузнецов","firstName":"Сергей","secondName":""},{"id":5,"username":"user5","surname":"Некрасов","firstName":"Артём","secondName":""}]';
let tasksJson = '[{"id":"068b8ccc-e260-46d6-85bc-bf76f60c33ed","subject":"Анализ","description":"","creationAuthor":1,"executor":1,"creationDate":"2021-08-23","planStartDate":"2021-08-23","planEndDate":"2021-08-25","endDate":"2021-08-23","status":1,"order":1},{"id":"f16b611c-54fd-4138-89b5-b7e0b68ef548","subject":"Планирование","description":"","creationAuthor":1,"executor":1,"creationDate":"2021-08-23","planStartDate":"2021-08-24","planEndDate":"2021-08-25","endDate":"2021-08-23","status":1,"order":1},{"id":"00d54b57-a344-4235-ad87-a81c07b7c7a4","subject":"Проектирование","description":"","creationAuthor":1,"executor":2,"creationDate":"2021-08-23","planStartDate":"2021-08-25","planEndDate":"2021-08-26","endDate":"2021-08-23","status":1,"order":1},{"id":"c2358382-14ee-43ec-918e-c682b465cdaa","subject":"Разработка","description":"","creationAuthor":1,"executor":3,"creationDate":"2021-08-23","planStartDate":"2021-08-25","planEndDate":"2021-08-30","endDate":"2021-08-23","status":1,"order":1},{"id":"58684039-92fd-4d3d-9de2-d7cece04af30","subject":"Тестирование","description":"","creationAuthor":1,"executor":null,"creationDate":"2021-08-23","planStartDate":"2021-08-27","planEndDate":"2021-08-30","endDate":"2021-08-23","status":1,"order":1}]';

let usersArray = JSON.parse(usersJSON);
let tasksArray = JSON.parse(tasksJson);

let lastDate = new Date();
let tableBody = document.getElementById('tableBody');
let taskBacklog = document.getElementById('taskBacklog');
const btnDateBack = document.getElementById('btnDateBack');
const btnDateNext = document.getElementById('btnDateNext');
let tdHeadArray;
let trTaskArray;

const DebugNameTask = "Jira(Example)"; // т.к в заданиях нет аттрибута, указывающего откуда поступило задание

initCalendar();
initUsersStringTable();

taskFill();

// ************************* Прокрутка недель **************
btnDateBack.onclick = function (){
	changeWeek(false);
	clear();
	taskFill();
}

btnDateNext.onclick = function(){
	changeWeek(true);
	clear();
	taskFill();
}

// ************************* Поиск в BackLog**************
document.getElementById('search').oninput = function(){
	let val = this.value.trim();
	let currentTrueDiv;
	let pArray = document.querySelectorAll('#taskBacklog p');

	if(val !== ''){
		pArray.forEach(function(elem){
			if (currentTrueDiv != elem.parentNode){
				if(elem.innerText.search(RegExp(val,"gi")) != -1){
					elem.parentNode.classList.remove('hide');
					currentTrueDiv = elem.parentNode;
				} else
					elem.parentNode.classList.add('hide');
			}
		});
	} else{
		pArray.forEach(function(elem){
			elem.parentNode.classList.remove('hide');
		});
	}
};

// ************************* Делает задачи из Backlog перемещаемыми **************
function initBacklogTaskDragAndDrop(){

	let taskTextArr = document.querySelectorAll('.taskText');

	for (let taskTextDiv of taskTextArr){
		taskTextDiv.onmousedown = function (event){
			let shiftX = event.clientX - taskTextDiv.getBoundingClientRect().left;
		  	let shiftY = event.clientY - taskTextDiv.getBoundingClientRect().top;

			taskTextDiv.className = 'shift';
			taskTextDiv.innerHTML = 'Задача';
		  	document.body.append(taskTextDiv);

		  	moveAt(event.pageX, event.pageY);

		  	function moveAt(pageX, pageY) {
		    	taskTextDiv.style.left = pageX - taskTextDiv.offsetWidth / 2 + 'px';
		    	taskTextDiv.style.top = pageY - taskTextDiv.offsetHeight / 2 + 'px';
		  	}

		  	function onMouseMove(event) {
		    	moveAt(event.pageX, event.pageY);
		  	}

		  	document.addEventListener('mousemove', onMouseMove);

		  	taskTextDiv.onmouseup = function() {
			    document.removeEventListener('mousemove', onMouseMove);
			    taskTextDiv.onmouseup = null;

			    let x = taskTextDiv.getBoundingClientRect().left;
			    let y = taskTextDiv.getBoundingClientRect().top;

			    let element = document.elementFromPoint(x, y);

			    if (element != null && element.id !== ''){

					if((element.id >= 1) && (element.id <=7)) {
						for(let taskIndex in tasksArray){
							if(taskIndex == taskTextDiv.id) {
								element.innerHTML += '<p data-tooltip="' + tasksArray[taskIndex].subject + '">Задача</p>';
								taskTextDiv.style.display = 'none';
							}
						}
						return;
			    	} 
			    } 

			    taskTextDiv.style.display = 'none'
			    for(let taskIndex in tasksArray){
					if(taskIndex == taskTextDiv.id) {
			    		taskBacklog.innerHTML += '<div class="taskText" id="' + taskIndex + '"><p id="taskTitle">' + DebugNameTask + '</p><p id="message">' +  tasksArray[taskIndex].subject + '</p><br>' + tasksArray[taskIndex].planStartDate + '</div>'
			    		initBacklogTaskDragAndDrop();
			    	}
				}
		  	};

		};
	}
}

// ************************* Создание строк и заполнение пользователями **************
function initUsersStringTable(){

	for(let user of usersArray)
		tableBody.innerHTML += '<tr id="' + user.id + '"><td class="name">' + user.firstName + ' ' + user.surname + '</td><td id="1"></td><td id="2"></td><td id="3"></td><td id="4"></td><td id="5"></td><td id="6"></td><td id="7"></td>';
	

	trTaskArray = document.querySelectorAll('#tableBody tr');
	tdHeadArray = document.querySelectorAll('.tableTitle td');
}

// ************************* Функциая для смещения недель **************
// next = true - смещение на 7 дней вперед
// next = false - смещение на 7 дней назад
function changeWeek(next){
	let tdDate = document.getElementsByClassName('date');

	if (!next) // смещение назад
		lastDate.setDate(lastDate.getDate() - 14);

	for(let i = 0; i < 7; ++i){
		let month = lastDate.getMonth()+1;
		let date = lastDate.getDate();
		tdDate[i].innerHTML = date;

		if(month >= 10)
			tdDate[i].innerHTML += '.' + month;
		else
			tdDate[i].innerHTML += '.0' + month;
		lastDate.setDate(date + 1);
	}
};

// ************************* Инициалиация календаря (обёртка для changeWeek) **************
function initCalendar(){
	changeWeek(true);
}

// ************************* Очистка BackLog и задач **************
function clear(){
	taskBacklog.innerHTML = '';
	for(let trTask in trTaskArray){
		for(let rTd in trTaskArray[trTask].cells){
		if(trTaskArray[trTask].cells[rTd].id !== '')
			trTaskArray[trTask].cells[rTd].innerHTML = '';
		}
	}
}

// ************************* Заполнение таблицы задачами **************
function taskFill(){

	for(let taskIndex in tasksArray){
		if(tasksArray[taskIndex].executor == null)
			taskBacklog.innerHTML += '<div class="taskText" id="' + taskIndex + '"><p id="taskTitle">' + DebugNameTask + '</p><p id="message">' +  tasksArray[taskIndex].subject + '</p><br>' + tasksArray[taskIndex].planStartDate + '</div>';
		else{
			for(let user of usersArray){
				if(tasksArray[taskIndex].executor === user.id){
					
					let timeParse = Date.parse(tasksArray[taskIndex].planStartDate);
					let dateTime = new Date(timeParse);
					let month = dateTime.getMonth()+1;
					let strdate = dateTime.getDate();

					if(month >= 10)
						strdate += '.' + month;
					else
						strdate += '.0' + month;

					for(let tdHeadIndex in tdHeadArray){
						if(tdHeadArray[tdHeadIndex].innerText == strdate){
							for(let trTask of trTaskArray){
								if(tasksArray[taskIndex].executor == trTask.id){
									for(let tdT of trTask.cells){
										if(tdT.id == tdHeadIndex)
											tdT.innerHTML = '<p data-tooltip="' + tasksArray[taskIndex].subject + '">Задача</p>'
									}
								}
							}	
						}
					}
				}
			}
		}	
	}
	initBacklogTaskDragAndDrop();	
} 
