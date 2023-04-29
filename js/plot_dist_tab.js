// 02-05-2022 Версия для МК NodeMCU
// 20-07-2022 Загрузка архива прогнозов на страницу Архив
// 15-02-2023 Усовершенствование создания таблиц
//import {Chart_title_arr} from "./myconst.js";

var all_dist_, Chart_title_arr_, param_name_str_;

function plot_dist_tab(all_dist, Chart_title_arr, openweathermap_place, param_name_str) {
/*
Array(6) [ {…}, {…}, {…}, {…}, {…}, {…} ]

​0: Object { place_name: "Песочин, Украина, Харьковская область", "temp/min": (7) […], "temp/max": (7) […], … }
​​clouds: Array(7) [ "5 1 1 0 0 0 0 0 0 0 0", "4 1 0 1 0 0 0 0 0 0 0", "4 0 0 0 1 0 0 0 0 0 0", … ]
​​humidity: Array(7) [ "6 0 0 0 0 1 0 0 0 0 0", "3 1 0 2 0 0 0 0 0 0 0", "2 2 0 0 1 0 0 0 0 0 0", … ]
​​place_name: "Песочин, Украина, Харьковская область"
​​pop: Array(7) [ "3 2 2 0 0 0 0 0 0 0 0", "5 0 0 0 0 0 0 0 1 0 0", "3 1 1 0 0 0 0 0 0 0 0", … ]
​​pressure: Array(7) [ "7 0 0 0 0 0 0 0 0 0 0", "5 1 0 0 0 0 0 0 0 0 0", "4 0 1 0 0 0 0 0 0 0 0", … ]
​​rain: Array(7) [ "4 0 1 2 0 0 0 0 0 0 0", "3 1 2 0 0 0 0 0 0 0 0", "2 2 0 1 0 0 0 0 0 0 0", … ]
​​snow: Array(7) [ "7 0 0 0 0 0 0 0 0 0 0", "6 0 0 0 0 0 0 0 0 0 0", "5 0 0 0 0 0 0 0 0 0 0", … ]
​​"temp/max": Array(7) [ "6 0 1 0 0 0 0 0 0 0 0", "3 0 2 1 0 0 0 0 0 0 0", "4 0 1 0 0 0 0 0 0 0 0", … ]
​​"temp/min": Array(7) [ "6 1 0 0 0 0 0 0 0 0 0", "3 3 0 0 0 0 0 0 0 0 0", "3 2 0 0 0 0 0 0 0 0 0", … ]
​​wind_deg: Array(7) [ "3 2 1 0 0 0 0 0 0 0 1", "4 1 0 0 0 0 0 0 0 0 1", "1 2 0 1 0 0 0 0 0 0 1", … ]
​​wind_speed: Array(7) [ "5 1 0 1 0 0 0 0 0 0 0", "3 1 2 0 0 0 0 0 0 0 0", "2 2 1 0 0 0 0 0 0 0 0", … ]

​1: Object { place_name: "Анкоридж, США, Аляска", "temp/min": (7) […], "temp/max": (7) […], … }
​2: Object { place_name: "Ушуая, Аргентина, Огненная Земля", "temp/min": (7) […], "temp/max": (7) […], … }
​3: Object { place_name: "Аддис-Абеба, Эфиопия", "temp/min": (7) […], "temp/max": (7) […], … }
​4: Object { place_name: "Оймякон, Россия", "temp/min": (7) […], "temp/max": (7) […], … }
​5: Object { place_name: "Станция Мак-Мердо, США", "temp/min": (7) […], "temp/max": (7) […], … }
*/
//  console.log(all_dist);
  // Запоминаем
  all_dist_ = all_dist;
  Chart_title_arr_ = Chart_title_arr;
  param_name_str_ = param_name_str;
  
  // Создаем Radiogroup с названиями места
  // Таблица для размещения названий мест
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  table.classList.add("table_place");
  table.appendChild(tbody);
  document.getElementById('place-table-dist').appendChild(table);
  let row;
	
  for(let i=0; i < openweathermap_place.length; i++) {
	let place_value = i;
	let place_name = openweathermap_place[i][3];
	let output = '<input type="radio" id="place_dist_radioButton_' + i + '" name="place_dist" value="' + place_value + '" onclick="data_dist_update(value);">';
	output+= ' &nbsp; <label for="' + place_value + '">' + place_name + '</label> &nbsp;';
	
	if (i%2 == 0) {
	  row = document.createElement('tr');
	  tbody.appendChild(row);
	}
	let td = document.createElement('td');
	td.innerHTML = output;
	row.appendChild(td);
  }
  document.getElementById("place_dist_radioButton_0").click();
}  
  
function data_dist_update (place_index) {
  // console.log(all_forecasts_);
  let dist = all_dist_[place_index];
  // console.log(forecasts);
  // Очищаем место для таблиц
  document.getElementById('div_dist_tab').innerHTML = ''; 
  
  for (let i = 0; i < param_name_str_.length; i++){
	let param_name = param_name_str_[i][0];
	if (param_name_str_[i].length == 2)
	  param_name += "/" + param_name_str_[i][1];
    console.log(dist);
	console.log(param_name);
	let param = dist[param_name];
	console.log(param);
	
    // Создаем подпись параметра
	var parag = document.createElement('p');
	parag.style.cssText += 'font-size: 14px; padding: 10px; font-weight: bold;';
	parag.innerText = Chart_title_arr_[i];
	document.getElementById('div_dist_tab').appendChild(parag);
	
	let table = document.createElement('table');
	let thead = document.createElement('thead');
	let tbody = document.createElement('tbody');
	table.classList.add("table_arch");
	table.appendChild(thead);
	table.appendChild(tbody);
	document.getElementById('div_dist_tab').appendChild(table);
	// Цикл по дням для одного параметра
	//param.slice().reverse().forEach((element, index) => {	
	param.forEach((element, index) => {	
	  //console.log(element);
	  // Строку превращаем в массив: один прогноз по одному параметру (дата и 8 значений)
	  const myArray = element.split(" ");
	  //console.log(myArray);
	  let row = document.createElement('tr');
	  tbody.appendChild(row);
	  let td = document.createElement('td');
	  td.innerHTML = (index + 1).toString() + " д.";
	  row.appendChild(td);
	  myArray.forEach((element2, index2) => {
		let td = document.createElement('td');
		td.innerHTML = element2;
		row.appendChild(td);
	  })
	})
  }
}