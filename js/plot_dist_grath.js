// 02-05-2022 Версия для МК NodeMCU
// 20-07-2022 Загрузка архива прогнозов на страницу Архив
// 04-04-2023 Построение графиков распределения ошибок прогнозов

//import {Chart_title_arr} from "/js/myconst.js";
//import {yAxis_title_arr} from "/js/myconst.js";

//import {Chart_title_arr} from "./js/myconst.js";
//import {yAxis_title_arr} from "./js/myconst.js";

import {Chart_title_arr, yAxis_title_arr} from "myconst.js";

//var chartT, // 'chart-temperature'
//    chartClPr; // 'chart-clouds-precipitation'
function plot_dist_grath(all_dist) {
  //var statistics = last_statistics[0]; // Массив last_statistics имеет один единственный элемент
  //plotChart(statistics);
  plotDistribution(all_dist);
}

var chartEr_distr = []; // 'chart-distribution-errors'
var error_statistics_mem = [];

function plotDistribution(jsonValue) {
  // jsonValue - объект.
  // Key: distribution/temp/min, distribution/temp/max,..., distribution/snow
  // Каждый элемент объекта - массив из 7 значений - по дням прогноза.
  // Каждое значение - строка вида "6 1 0 2 0 0 0 0 0 0 0".
  // Каждое элемент в строке - количество ошибок, находящихся в соответствующем интервале.
  
  var keys = Object.keys(jsonValue);
  // Сколько дней ведется наблюдение
  let param1 = jsonValue[keys[0]];
  let str1 = param1[0];
  let arr = str1.split(" ").map(Number);
  let sum = 0;
  for(let i = 0; i < arr.length; i++){
    sum += arr[i];
  }
  document.getElementById("stat_day").textContent = sum;
  document.getElementById("stat_day_err").textContent = sum;
  
  for (var key = 0; key < keys.length; key++){
	var param = jsonValue[keys[key]];
	
	// Создаем div для графика
	let div = document.createElement('div');
	div.setAttribute("id", keys[key]);
	//div.classList.add("table_arch");
	document.getElementById('div_dist_grath').appendChild(div);
	
	// Подпись параметра
	const Chart_title = Chart_title_arr[key];
	
	// Категории оси x
	var xAxis_categories = [];
	for (let i=0; i<10; i++) {
	  let str = (param_scale[key]*i).toString() + "-" + (param_scale[key]*(i+1)).toString();
	  xAxis_categories.push(str);
	}
	let str = ">" + (param_scale[key]*10).toString();
	xAxis_categories.push(str);
	//xAxis.setCategories(newCategories);
	
	// Создаем графики распределения ошибок по дням прогноза
	const xAxis_title = yAxis_title_arr[key];
	create_chart_error_distr(keys[key], Chart_title, xAxis_title, xAxis_categories);
	
	for (let j=0; j<7; j++) {
	  let series_name = (j+1).toString();
	  chartEr_distr[key].addSeries({
        name: series_name
      });
	  let series = chartEr_distr[key].series[j];
	  series.setVisible(j==0);
	  series.name = (j+1).toString(); // Пример: distribution/temp/min-6
	}

	// Создаем данные для графика
	for (let j=0; j<7; j++) {
	  let myString = param[j];
      let myArray = myString.split(" ").map(Number);
	  chartEr_distr[key].series[j].setData(myArray);
	}	
  }
}

function myListener() {
  // this.name = 0-6, 3-2,...
  let myArray = this.name.split("-");
  let series = chartEr_distr[0].series[2];
  let series_name = series.name;
  
  series = chartEr_distr[myArray[0]].series[myArray[1]];
  series_name = series.name;
  
  if (this.checked) {
    //console.log('Checkbox отмечен');
	series.setVisible(true);
  } else {
    //console.log('Checkbox не отмечен');
	series.setVisible(false);
  }
}

function create_chart_error_distr(renderTo, Chart_title, xAxis_title, xAxis_categories) {
  let chart = new Highcharts.chart(renderTo,{
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