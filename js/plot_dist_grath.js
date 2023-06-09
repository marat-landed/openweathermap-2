// 02-05-2022 Версия для МК NodeMCU
// 20-07-2022 Загрузка архива прогнозов на страницу Архив
// 04-04-2023 Построение графиков распределения ошибок прогнозов

var all_dist_, Chart_title_arr_, param_name_str_, param_scale_;
var chartEr_distr = []; // 'chart-distribution-errors'

function plot_dist_grath(all_dist, openweathermap_place, Chart_title_arr, param_name_str, param_scale, yAxis_title_arr) {
  // Запоминаем
  all_dist_ = all_dist;
  Chart_title_arr_ = Chart_title_arr;
  param_name_str_ = param_name_str;
  param_scale_ = param_scale;
  yAxis_title_arr_ = yAxis_title_arr;
  
  // Создаем Radiogroup с названиями места
  // Таблица для размещения названий мест
  let table = document.createElement('table');
  let tbody = document.createElement('tbody');
  table.classList.add("table_place");
  table.appendChild(tbody);
  document.getElementById('place-graph-dist').appendChild(table);
  
  let row;
  for(let i=0; i < openweathermap_place.length; i++) {
	let place_value = i;
	let place_name = openweathermap_place[i][3];
	let output = '<input type="radio" id="place_dist_graph_radioButton_' + i + '" name="place_dist_graph" value="' + place_value + '" onclick="data_dist_graph_update(value);">';
	output+= ' &nbsp; <label for="' + place_value + '">' + place_name + '</label> &nbsp;';
	
	if (i%2 == 0) {
	  row = document.createElement('tr');
	  tbody.appendChild(row);
	}
	let td = document.createElement('td');
	td.innerHTML = output;
	row.appendChild(td);
  }
  
  // Создаем графики распределения ошибок по дням прогноза
  for (let i = 0; i < param_name_str_.length-1; i++) {
	let param_name = param_name_str_[i][0];
	if (param_name_str_[i].length == 2)
	  param_name += "/" + param_name_str_[i][1];
    //console.log(dist);
	//console.log(param_name);
	//let param = dist[param_name];
	
	// Создаем div для графика
	let div = document.createElement('div');
	div.setAttribute("id", param_name);
	//div.classList.add("table_arch");
	document.getElementById('div_dist_grath').appendChild(div);
	
	// Подпись параметра
	const Chart_title = Chart_title_arr_[i];
	
	// Категории оси x
	var xAxis_categories = [];
	for (let j=0; j<10; j++) {
	  let str = (param_scale_[i]*j).toString() + "-" + (param_scale_[i]*(j+1)).toString();
	  xAxis_categories.push(str);
	}
	let str = ">" + (param_scale_[i]*10).toString();
	xAxis_categories.push(str);
	//xAxis.setCategories(newCategories);
	
	// Создаем графики распределения ошибок по дням прогноза
	const xAxis_title = yAxis_title_arr_[i];
	create_chart_error_distr(param_name, Chart_title, xAxis_title, xAxis_categories);
	
	for (let j=0; j<7; j++) {
	  let series_name = (j+1).toString();
	  chartEr_distr[i].addSeries({
        name: series_name
      });
	  let series = chartEr_distr[i].series[j];
	  series.setVisible(j==0);
	  series.name = (j+1).toString(); // Пример: distribution/temp/min-6
	}
  }
  
  document.getElementById("place_dist_graph_radioButton_0").click();
}  
  
function data_dist_graph_update (place_index) {
  let dist = all_dist_[place_index];
  plotDistribution(dist);
}

function plotDistribution(dist) {
  // jsonValue - объект.
  // Key: distribution/temp/min, distribution/temp/max,..., distribution/snow
  // Каждый элемент объекта - массив из 7 значений - по дням прогноза.
  // Каждое значение - строка вида "6 1 0 2 0 0 0 0 0 0 0".
  // Каждое элемент в строке - количество ошибок, находящихся в соответствующем интервале.
  // Сколько дней ведется наблюдение
  let param1 = dist.pop;
  let str1 = param1[0];
  let arr = str1.split(" ").map(Number);
  let sum = 0;
  for(let i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  document.getElementById("stat_day").textContent = sum;
  document.getElementById("stat_day_err").textContent = sum;
  
  for (let i = 0; i < param_name_str_.length-1; i++){
	let param_name = param_name_str_[i][0];
	if (param_name_str_[i].length == 2)
	  param_name += "/" + param_name_str_[i][1];
    //console.log(dist);
	//console.log(param_name);
	let param = dist[param_name];
	
	/*
	// Создаем div для графика
	let div = document.createElement('div');
	div.setAttribute("id", param_name);
	document.getElementById('div_dist_grath').appendChild(div);
	// Подпись параметра
	const Chart_title = Chart_title_arr_[i];
	// Категории оси x
	var xAxis_categories = [];
	for (let j=0; j<10; j++) {
	  let str = (param_scale_[i]*j).toString() + "-" + (param_scale_[i]*(j+1)).toString();
	  xAxis_categories.push(str);
	}
	let str = ">" + (param_scale_[i]*10).toString();
	xAxis_categories.push(str);
	// Создаем графики распределения ошибок по дням прогноза
	const xAxis_title = yAxis_title_arr_[i];
	create_chart_error_distr(param_name, Chart_title, xAxis_title, xAxis_categories);
	
	for (let j=0; j<7; j++) {
	  let series_name = (j+1).toString();
	  chartEr_distr[i].addSeries({
        name: series_name
      });
	  let series = chartEr_distr[i].series[j];
	  series.setVisible(j==0);
	  series.name = (j+1).toString(); // Пример: distribution/temp/min-6
	}
    */
	// Создаем данные для графика
	for (let j=0; j<7; j++) {
	  let myString = param[j];
      let myArray = myString.split(" ").map(Number);
	  //chartEr_distr[i].series[j].setData(myArray);
	  chartEr_distr[i].series[j].update({
		//pointStart: pointStart_curr,
		data: myArray //data.data
	  })
	}	
  }
}

function create_chart_error_distr(renderTo, Chart_title, xAxis_title, xAxis_categories) {
  let chart = new Highcharts.Chart(renderTo,{
    chart: {
      type: 'column',
      width: 500,
      height: 300
    },	  
	title: {
	  text: Chart_title,
	  style: {
        fontWeight: 'bold'
      }
	},
    plotOptions: {
      series: {
        //pointWidth: 5,
		pointPadding: 0,
        groupPadding: 0.1,
        borderWidth: 0,
        shadow: false
      }
    },
	xAxis: {
        categories: xAxis_categories,
		labels: {
            align: 'center' // выравнивание подписей под серединой столбцов
        },
		title: {
          text: xAxis_title,
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
	    gridLineWidth: 1,
    },
	yAxis: [
	  { 
	    title: {
          text: 'Количество ошибок',
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
        labels: {
          style: {
            color: Highcharts.getOptions().colors[1]
          }
        },
		alignTicks: true,
      }
	 ],
	credits: {
	  enabled: false
	},
	legend: {
	  enabled: true,
	  itemStyle: {
	    fontWeight: 'normal'
	  }
    },
	tooltip: {
      xDateFormat: '%d-%m-%Y',
      shared: true,
	  crosshairs: true,
	  shadow: true,
      borderWidth: 0,
      backgroundColor: 'rgba(255,255,255,0.8)'
    }
  });
  chartEr_distr.push(chart);
}