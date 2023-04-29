// 02-05-2022 Версия для МК NodeMCU
// 20-07-2022 Загрузка архива прогнозов на страницу Архив
// 15-02-2023 Усовершенствование создания таблиц

//import {Chart_title_arr} from "./myconst.js";

var all_forecasts_, Chart_title_arr_;

function plot_all_forecasts(all_forecasts, Chart_title_arr, openweathermap_place) {
// "forecast/clouds": Array(8) [ "1678352400 64.00 100.00 100.00 100.00 9.00 79.00 100.00 99.00",
// "1678352400 68.00 100.00 100.00 100.00 7.00 75.00 18.00 95.00", "1678352400 67.00 100.00 100.00 100.00 7.00 75.00 18.00 95.00", … ]
// "forecast/wind_speed": Array(8) [ "1678352400 6.85 7.24 8.12 7.38 4.09 5.14 4.51 2.59",
// "1678352400 6.46 6.44 8.14 8.43 6.37 6.93 4.95 2.99", "1678352400 6.46 6.44 8.14 8.43 6.37 6.93 4.95 2.99", … ]
//console.log(jsonValue);

  // Запоминаем
  all_forecasts_ = all_forecasts;
  Chart_title_arr_ = Chart_title_arr;
  
  // Создаем Radiogroup с названиями места
  // Таблица для размещения названий мест
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  table.classList.add("table_place");
  table.appendChild(tbody);
  document.getElementById('place-table-arch').appendChild(table);
  let row;
	
  for(let i=0; i < openweathermap_place.length; i++) {
	let place_value = i;
	let place_name = openweathermap_place[i][3];
	let output = '<input type="radio" id="place_arch_radioButton_' + i + '" name="place_arch" value="' + place_value + '" onclick="data_arch_update(value);">';
	output+= ' &nbsp; <label for="' + place_value + '">' + place_name + '</label> &nbsp;';
	
	if (i%2 == 0) {
	  row = document.createElement('tr');
	  tbody.appendChild(row);
	}
	let td = document.createElement('td');
	td.innerHTML = output;
	row.appendChild(td);
  }
  document.getElementById("place_arch_radioButton_0").click();
}

function data_arch_update (place_index) {
  // console.log(all_forecasts_);
  const forecasts = all_forecasts_[place_index];
  // console.log(forecasts);
  var keys = Object.keys(forecasts);
  for (var key = 1; key < keys.length; key++){
	var param = forecasts[keys[key]];
	console.log(param);
	//console.log("key:",keys[key]);
	//console.log("param",param);
	
	// Создаем подпись параметра
	var parag = document.createElement('p');
	parag.style.cssText += 'font-size: 14px; padding: 10px; font-weight: bold;';
	parag.innerText = Chart_title_arr_[key];
	document.getElementById('div_table_archive').appendChild(parag);
	
	let table = document.createElement('table');
	let thead = document.createElement('thead');
	let tbody = document.createElement('tbody');
	table.classList.add("table_arch");
	table.appendChild(thead);
	table.appendChild(tbody);
	document.getElementById('div_table_archive').appendChild(table);
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
	  td.innerHTML = index;
	  row.appendChild(td);
	  myArray.forEach((element2, index2) => {
		let td = document.createElement('td');
		td.innerHTML = element2;
		row.appendChild(td);
		// Если это время UTC, преобразуем в дату
		if (index2==0) {
		  var date = new Date(element2*1000);
		  var day = date.getDate();
		  var month = date.getMonth()+1;
		  var year = date.getFullYear();
		  //document.getElementById("forecast_date").textContent = day + '-' + month + '-' + year;
		  var today_utc_txt = day + '-' + month + '-' + year;
		  let td = document.createElement('td');
		  td.innerHTML = today_utc_txt;
		  row.appendChild(td);
		}
	  })
	})
  }	
}